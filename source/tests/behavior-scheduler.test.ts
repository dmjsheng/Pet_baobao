import { describe, expect, it } from 'vitest';
import { MINUTE, scheduleAutonomousBehavior } from '../src/shared/behavior-scheduler';

describe('scheduleAutonomousBehavior', () => {
  it('puts 爆爆 to sleep after twenty inactive minutes', () => {
    expect(scheduleAutonomousBehavior({
      now: 20 * MINUTE,
      lastInteractionAt: 0,
      lastAutonomousAt: 0,
      sleeping: false,
      roll: 0.1,
    })).toEqual({ kind: 'sleep', mode: 'sleeping', bubble: '' });
  });

  it('keeps quiet during the fifteen-minute post-interaction window', () => {
    expect(scheduleAutonomousBehavior({
      now: 14 * MINUTE + 59_999,
      lastInteractionAt: 0,
      lastAutonomousAt: 0,
      sleeping: false,
      roll: 0.1,
    }).kind).toBe('none');
  });

  it('keeps quiet until eight minutes have passed since her last autonomous action', () => {
    expect(scheduleAutonomousBehavior({
      now: 17 * MINUTE,
      lastInteractionAt: 0,
      lastAutonomousAt: 10 * MINUTE,
      sleeping: false,
      roll: 0.1,
    }).kind).toBe('none');
  });

  it('chooses a low-frequency ask-for-pets action from the final random range', () => {
    expect(scheduleAutonomousBehavior({
      now: 17 * MINUTE,
      lastInteractionAt: 0,
      lastAutonomousAt: 0,
      sleeping: false,
      roll: 0.9,
    })).toEqual({ kind: 'waiting', mode: 'waiting', bubble: '陪我一小会儿嘛' });
  });
});
