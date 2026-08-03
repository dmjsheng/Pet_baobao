import { describe, expect, it } from 'vitest';
import { frameActionForPetAction, initialPetState, interact, persistentFrameActionForState } from '../src/shared/pet-machine';

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
    ['knead', 'kneading', '给你踩踩奶～'],
    ['stretch', 'stretch', '伸个懒腰给你看～'],
    ['groom', 'groom', '洗洗脸，继续陪你～'],
  ] as const)('maps %s to the expected mode and bubble', (action, mode, bubble) => {
    const next = interact(initialPetState(1), action, 2);
    expect(next.mode).toBe(mode);
    expect(next.bubble).toBe(bubble);
    expect(next.affection).toBeGreaterThan(0);
  });

  it.each(['feed', 'knead'] as const)('%s builds two points of affection', (action) => {
    expect(interact(initialPetState(1), action, 2).affection).toBe(2);
  });

  it('toggles sleep on and off', () => {
    const asleep = interact(initialPetState(1), 'sleep', 2);
    expect(asleep.mode).toBe('sleeping');
    expect(interact(asleep, 'sleep', 3).mode).toBe('idle');
  });
});

describe('frameActionForPetAction', () => {
  it.each([
    ['pet', 'pet-nuzzle'],
    ['feed', 'eat-treat'],
    ['knead', 'knead-paws'],
    ['stretch', 'stretch-paws'],
    ['groom', 'groom-face'],
    ['companion', 'companion-sit'],
    ['sleep', null],
  ] as const)('maps %s to its available frame animation', (action, animation) => {
    expect(frameActionForPetAction(action)).toBe(animation);
  });
});

describe('persistentFrameActionForState', () => {
  it('uses the curled sleeping frames only while asleep', () => {
    expect(persistentFrameActionForState({ sleeping: true })).toBe('sleep-curl');
    expect(persistentFrameActionForState({ sleeping: false })).toBeNull();
  });
});
