import { animationForMode } from './animation-profile';
import { frameActionForPetAction, initialPetState, interact, persistentFrameActionForState, type PetAction, type PetState } from '../shared/pet-machine';
import type { FrameActionId, PersistedPetState } from '../shared/types';
import { effectsFor, type EffectKind } from '../shared/effect-sequence';
import { scheduleAutonomousBehavior } from '../shared/behavior-scheduler';
import { FRAME_ANIMATIONS, frameIndexFor, isFinished } from './frame-animation';

declare global {
  interface Window {
    baobao: {
      load(): Promise<PersistedPetState>;
      assetUrl(): Promise<string>;
      save(state: PersistedPetState): void;
      drag(delta: { x: number; y: number }): void;
      menu(): void;
      onToggleControls(listener: () => void): void;
    };
  }
}

const appRoot = document.querySelector<HTMLElement>('#pet-app')!;
const pet = document.querySelector<HTMLButtonElement>('#pet')!;
const image = document.querySelector<HTMLImageElement>('#pet-image')!;
const bubble = document.querySelector<HTMLParagraphElement>('#bubble')!;
const actions = document.querySelector<HTMLElement>('#actions')!;
const effects = document.querySelector<HTMLElement>('#effects')!;
let state: PetState = initialPetState();
let persisted: PersistedPetState = { x: -1, y: -1, affection: 0, lastInteractionAt: Date.now(), lastAutonomousAt: Date.now(), sleeping: false };
let bubbleTimer: number | undefined;
let dragStart: { x: number; y: number; moved: boolean } | null = null;
let ignoreNextClick = false;
let baseImageUrl = '';
let activeFrameAction: FrameActionId | null = null;
let frameStartedAt = 0;
let frameTimer: number | undefined;

function save(): void {
  persisted = { ...persisted, affection: state.affection, lastInteractionAt: state.lastInteractionAt, sleeping: state.sleeping };
  window.baobao.save(persisted);
}

function render(showBubble = true): void {
  const profile = animationForMode(state.mode);
  pet.dataset.animation = activeFrameAction ? 'frame' : profile.name;
  pet.style.setProperty('--animation-duration', `${profile.durationMs}ms`);
  if (!showBubble) return;
  bubble.textContent = state.bubble;
  bubble.classList.add('visible');
  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => bubble.classList.remove('visible'), 3600);
}

function apply(action: PetAction): void {
  state = interact(state, action, Date.now());
  const frameAction = persistentFrameActionForState(state) ?? frameActionForPetAction(action);
  if (frameAction) startFrameAnimation(frameAction);
  else if (action === 'sleep' && !state.sleeping) startFrameAnimation('idle-look');
  else stopFrameAnimation();
  render();
  if (action === 'feed' || action === 'yarn') runEffects(action);
  save();
}

function frameUrl(action: FrameActionId, index: number): string {
  return new URL(`frames/${action}/${String(index).padStart(3, '0')}.png`, baseImageUrl).toString();
}

function startFrameAnimation(action: FrameActionId): void {
  activeFrameAction = action;
  frameStartedAt = performance.now();
  refreshFrame();
}

function stopFrameAnimation(): void {
  activeFrameAction = null;
  if (baseImageUrl) image.src = baseImageUrl;
}

function refreshFrame(): void {
  if (!activeFrameAction || !baseImageUrl) return;
  const animation = FRAME_ANIMATIONS[activeFrameAction];
  const elapsedMs = performance.now() - frameStartedAt;
  const index = frameIndexFor(animation, elapsedMs);
  const url = frameUrl(activeFrameAction, index);
  if (image.src !== url) image.src = url;
  if (isFinished(animation, elapsedMs)) {
    activeFrameAction = 'idle-look';
    frameStartedAt = performance.now();
  }
}

function effectLabel(kind: EffectKind): string {
  if (kind === 'treat') return '🍪';
  if (kind === 'hearts') return '♥ ♥';
  if (kind === 'yarn-ball') return '🧶';
  return '';
}

function applyEffectMode(kind: EffectKind): void {
  if (kind === 'chase') state = { ...state, mode: 'chasing' };
  if (kind === 'pounce') state = { ...state, mode: 'pouncing' };
  if (kind === 'look') state = { ...state, mode: 'idle' };
  if (kind === 'chase' || kind === 'pounce' || kind === 'look') render(false);
}

function runEffects(action: 'feed' | 'yarn'): void {
  for (const effect of effectsFor(action)) {
    window.setTimeout(() => {
      applyEffectMode(effect.kind);
      const label = effectLabel(effect.kind);
      if (!label) return;
      const node = document.createElement('span');
      node.className = `effect effect-${effect.kind}`;
      node.textContent = label;
      effects.append(node);
      window.setTimeout(() => node.remove(), effect.durationMs);
    }, effect.delayMs);
  }
}

function checkAutonomousBehavior(): void {
  const now = Date.now();
  const baseInput = { now, lastInteractionAt: state.lastInteractionAt, lastAutonomousAt: persisted.lastAutonomousAt, sleeping: state.sleeping };
  const eligibility = scheduleAutonomousBehavior({ ...baseInput, roll: 0.5 });
  if (eligibility.kind === 'none') return;
  const decision = eligibility.kind === 'sleep' ? eligibility : scheduleAutonomousBehavior({ ...baseInput, roll: Math.random() });
  state = { ...state, mode: decision.mode, sleeping: decision.mode === 'sleeping', bubble: decision.bubble };
  const frameAction = persistentFrameActionForState(state);
  if (frameAction) startFrameAnimation(frameAction);
  else stopFrameAnimation();
  persisted = { ...persisted, lastAutonomousAt: now };
  render(decision.bubble.length > 0);
  save();
}

async function boot(): Promise<void> {
  persisted = await window.baobao.load();
  state = { ...initialPetState(persisted.lastInteractionAt), sleeping: persisted.sleeping, affection: persisted.affection, mode: persisted.sleeping ? 'sleeping' : 'idle', bubble: persisted.sleeping ? '爆爆先眯一会儿' : '我在看你呀' };
  baseImageUrl = await window.baobao.assetUrl();
  image.src = baseImageUrl;
  startFrameAnimation(persistentFrameActionForState(state) ?? 'idle-look');
  render(false);
  frameTimer = window.setInterval(refreshFrame, 40);
}

pet.addEventListener('click', () => {
  if (ignoreNextClick) { ignoreNextClick = false; return; }
  apply('pet');
});
actions.addEventListener('click', (event) => {
  const action = (event.target as HTMLButtonElement).dataset.action as PetAction | undefined;
  if (action) apply(action);
});
appRoot.addEventListener('contextmenu', (event) => { event.preventDefault(); window.baobao.menu(); });
pet.addEventListener('pointerdown', (event) => { dragStart = { x: event.screenX, y: event.screenY, moved: false }; pet.setPointerCapture(event.pointerId); });
pet.addEventListener('pointermove', (event) => {
  if (!dragStart) return;
  const x = event.screenX - dragStart.x;
  const y = event.screenY - dragStart.y;
  if (Math.abs(x) + Math.abs(y) > 4) dragStart.moved = true;
  window.baobao.drag({ x, y });
  dragStart = { x: event.screenX, y: event.screenY, moved: dragStart.moved };
});
pet.addEventListener('pointerup', () => { ignoreNextClick = dragStart?.moved ?? false; dragStart = null; });
window.baobao.onToggleControls(() => actions.classList.toggle('forced-visible'));
void boot();
window.setInterval(checkAutonomousBehavior, 30_000);
