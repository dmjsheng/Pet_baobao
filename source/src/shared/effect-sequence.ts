export type EffectKind = 'treat' | 'hearts';

export interface TimedEffect {
  kind: EffectKind;
  delayMs: number;
  durationMs: number;
}

const feedEffects: TimedEffect[] = [
  { kind: 'treat', delayMs: 0, durationMs: 640 },
  { kind: 'hearts', delayMs: 640, durationMs: 1350 },
];

export function effectsFor(action: 'feed'): TimedEffect[] {
  return action === 'feed' ? feedEffects : [];
}
