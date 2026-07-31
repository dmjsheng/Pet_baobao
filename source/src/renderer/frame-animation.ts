import type { FrameActionId } from '../shared/types';

export interface FrameAnimation {
  frameCount: number;
  frameDurationMs: number;
  frameDurationsMs?: number[];
  loop: boolean;
}

export const FRAME_ANIMATIONS: Record<FrameActionId, FrameAnimation> = {
  'idle-look': { frameCount: 4, frameDurationMs: 0, frameDurationsMs: [3_600, 90, 110, 90], loop: true },
  'pet-nuzzle': { frameCount: 6, frameDurationMs: 115, loop: false },
  'eat-treat': { frameCount: 8, frameDurationMs: 150, loop: false },
  'yarn-chase': { frameCount: 8, frameDurationMs: 110, loop: false },
  'companion-sit': { frameCount: 4, frameDurationMs: 0, frameDurationsMs: [3_600, 90, 110, 90], loop: true },
  'sleep-curl': { frameCount: 4, frameDurationMs: 1_400, loop: true },
};

export function frameIndexFor(animation: FrameAnimation, elapsedMs: number): number {
  if (animation.frameDurationsMs) {
    const totalDurationMs = animation.frameDurationsMs.reduce((total, duration) => total + duration, 0);
    let remainingMs = Math.max(0, elapsedMs);

    if (animation.loop) {
      remainingMs %= totalDurationMs;
    } else if (remainingMs >= totalDurationMs) {
      return animation.frameCount - 1;
    }

    for (let index = 0; index < animation.frameDurationsMs.length; index += 1) {
      const duration = animation.frameDurationsMs[index];
      if (remainingMs < duration) return index;
      remainingMs -= duration;
    }

    return animation.frameCount - 1;
  }

  const rawIndex = Math.floor(Math.max(0, elapsedMs) / animation.frameDurationMs);
  return animation.loop ? rawIndex % animation.frameCount : Math.min(rawIndex, animation.frameCount - 1);
}

export function isFinished(animation: FrameAnimation, elapsedMs: number): boolean {
  const durationMs = animation.frameDurationsMs
    ? animation.frameDurationsMs.reduce((total, duration) => total + duration, 0)
    : animation.frameCount * animation.frameDurationMs;
  return !animation.loop && elapsedMs >= durationMs;
}
