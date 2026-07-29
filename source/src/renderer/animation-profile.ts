import type { PetMode } from '../shared/types';

export interface AnimationProfile {
  name: 'look-around' | 'nuzzle' | 'happy-bounce' | 'listen' | 'sleep' | 'wait';
  durationMs: number;
}

const profiles: Record<PetMode, AnimationProfile> = {
  idle: { name: 'look-around', durationMs: 2600 },
  petted: { name: 'nuzzle', durationMs: 900 },
  fed: { name: 'happy-bounce', durationMs: 1000 },
  companion: { name: 'listen', durationMs: 1800 },
  sleeping: { name: 'sleep', durationMs: 3200 },
  waiting: { name: 'wait', durationMs: 1600 },
};

export function animationForMode(mode: PetMode): AnimationProfile {
  return profiles[mode];
}
