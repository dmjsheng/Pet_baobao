import { describe, expect, it } from 'vitest';
import { animationForMode } from '../src/renderer/animation-profile';

describe('animationForMode', () => {
  it.each([
    ['idle', 'look-around'],
    ['petted', 'nuzzle'],
    ['fed', 'happy-bounce'],
    ['companion', 'listen'],
    ['sleeping', 'sleep'],
    ['waiting', 'wait'],
  ] as const)('maps %s to a visual animation', (mode, animation) => {
    expect(animationForMode(mode).name).toBe(animation);
  });
});
