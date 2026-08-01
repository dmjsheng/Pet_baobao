import { describe, expect, it } from 'vitest';
import { FRAME_ANIMATIONS, frameIndexFor, isFinished } from '../src/renderer/frame-animation';

describe('frameIndexFor', () => {
  it('keeps the idle body still before its short blink sequence', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 3_599)).toBe(0);
  });

  it('plays the blink frames only after the long idle hold', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 3_600)).toBe(1);
    expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 3_690)).toBe(2);
    expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 3_800)).toBe(3);
  });

  it('loops the idle look after its complete variable-duration cycle', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 3_890)).toBe(0);
  });

  it('holds the companion pose before its slow blink', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['companion-sit'], 3_599)).toBe(0);
    expect(frameIndexFor(FRAME_ANIMATIONS['companion-sit'], 3_600)).toBe(1);
  });

  it('loops four sleeping breathing frames every 5.6 seconds', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['sleep-curl'], 1_400)).toBe(1);
    expect(frameIndexFor(FRAME_ANIMATIONS['sleep-curl'], 5_600)).toBe(0);
  });

  it('holds petting on its sixth stable frame', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['pet-nuzzle'], 699)).toBe(4);
  });

  it('takes 1.84 seconds to complete eight unhurried kneading beats', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['knead-paws'], 1_839)).toBe(7);
    expect(isFinished(FRAME_ANIMATIONS['knead-paws'], 1_839)).toBe(false);
    expect(isFinished(FRAME_ANIMATIONS['knead-paws'], 1_840)).toBe(true);
  });

  it('holds a one-shot nuzzle on its final frame', () => {
    expect(frameIndexFor(FRAME_ANIMATIONS['pet-nuzzle'], 840)).toBe(5);
  });
});

describe('isFinished', () => {
  it('finishes a one-shot nuzzle after its six frames', () => {
    expect(isFinished(FRAME_ANIMATIONS['pet-nuzzle'], 840)).toBe(true);
  });

  it('never finishes the idle loop', () => {
    expect(isFinished(FRAME_ANIMATIONS['idle-look'], 99_999)).toBe(false);
  });
});
