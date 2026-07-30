export type EffectKind = 'treat' | 'hearts' | 'yarn-ball' | 'chase' | 'pounce' | 'look';

export interface TimedEffect {
  kind: EffectKind;
  delayMs: number;
  durationMs: number;
}

const feedEffects: TimedEffect[] = [
  { kind: 'treat', delayMs: 0, durationMs: 640 },
  { kind: 'hearts', delayMs: 640, durationMs: 1350 },
];

const yarnEffects: TimedEffect[] = [
  { kind: 'yarn-ball', delayMs: 0, durationMs: 1150 },
  { kind: 'chase', delayMs: 900, durationMs: 900 },
  { kind: 'pounce', delayMs: 1800, durationMs: 650 },
  { kind: 'look', delayMs: 2500, durationMs: 700 },
];

export function effectsFor(action: 'feed' | 'yarn'): TimedEffect[] {
  return action === 'feed' ? feedEffects : yarnEffects;
}
