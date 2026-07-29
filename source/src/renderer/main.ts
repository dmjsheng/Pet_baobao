import { animationForMode } from './animation-profile';
import { initialPetState, interact, type PetAction, type PetState } from '../shared/pet-machine';
import type { PersistedPetState } from '../shared/types';

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
let state: PetState = initialPetState();
let persisted: PersistedPetState = { x: -1, y: -1, affection: 0, lastInteractionAt: Date.now(), sleeping: false };
let bubbleTimer: number | undefined;
let dragStart: { x: number; y: number } | null = null;

function save(): void {
  persisted = { ...persisted, affection: state.affection, lastInteractionAt: state.lastInteractionAt, sleeping: state.sleeping };
  window.baobao.save(persisted);
}

function render(showBubble = true): void {
  const profile = animationForMode(state.mode);
  pet.dataset.animation = profile.name;
  pet.style.setProperty('--animation-duration', `${profile.durationMs}ms`);
  if (!showBubble) return;
  bubble.textContent = state.bubble;
  bubble.classList.add('visible');
  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => bubble.classList.remove('visible'), 3600);
}

function apply(action: PetAction): void {
  state = interact(state, action, Date.now());
  render();
  save();
}

async function boot(): Promise<void> {
  persisted = await window.baobao.load();
  state = { ...initialPetState(persisted.lastInteractionAt), sleeping: persisted.sleeping, affection: persisted.affection, mode: persisted.sleeping ? 'sleeping' : 'idle', bubble: persisted.sleeping ? '爆爆先眯一会儿' : '我在看你呀' };
  image.src = await window.baobao.assetUrl();
  render(false);
}

pet.addEventListener('click', () => apply('pet'));
actions.addEventListener('click', (event) => {
  const action = (event.target as HTMLButtonElement).dataset.action as PetAction | undefined;
  if (action) apply(action);
});
appRoot.addEventListener('contextmenu', (event) => { event.preventDefault(); window.baobao.menu(); });
pet.addEventListener('pointerdown', (event) => { dragStart = { x: event.screenX, y: event.screenY }; pet.setPointerCapture(event.pointerId); });
pet.addEventListener('pointermove', (event) => {
  if (!dragStart) return;
  window.baobao.drag({ x: event.screenX - dragStart.x, y: event.screenY - dragStart.y });
  dragStart = { x: event.screenX, y: event.screenY };
});
pet.addEventListener('pointerup', () => { dragStart = null; });
window.baobao.onToggleControls(() => actions.classList.toggle('forced-visible'));
void boot();
