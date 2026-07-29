import { describe, expect, it } from 'vitest';
import { initialPetState, interact } from '../src/shared/pet-machine';

describe('initialPetState', () => {
  it('starts awake and idle', () => {
    expect(initialPetState().mode).toBe('idle');
    expect(initialPetState().sleeping).toBe(false);
  });
});

describe('interact', () => {
  it.each([
    ['pet', 'petted', '摸摸就不困啦'],
    ['feed', 'fed', '零食收到！'],
    ['companion', 'companion', '我在这儿陪你'],
  ] as const)('maps %s to the expected mode and bubble', (action, mode, bubble) => {
    const next = interact(initialPetState(1), action, 2);
    expect(next.mode).toBe(mode);
    expect(next.bubble).toBe(bubble);
    expect(next.affection).toBeGreaterThan(0);
  });

  it('toggles sleep on and off', () => {
    const asleep = interact(initialPetState(1), 'sleep', 2);
    expect(asleep.mode).toBe('sleeping');
    expect(interact(asleep, 'sleep', 3).mode).toBe('idle');
  });
});
