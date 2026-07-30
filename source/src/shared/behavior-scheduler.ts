import type { PetMode } from './types';

export const MINUTE = 60_000;
export const USER_QUIET_WINDOW_MS = 15 * MINUTE;
export const AUTONOMOUS_COOLDOWN_MS = 8 * MINUTE;
export const SLEEP_AFTER_IDLE_MS = 20 * MINUTE;

export type AutonomousKind = 'none' | 'sleep' | 'stretch' | 'groom' | 'waiting';

export interface SchedulerInput {
  now: number;
  lastInteractionAt: number;
  lastAutonomousAt: number;
  sleeping: boolean;
  roll: number;
}

export interface AutonomousDecision {
  kind: AutonomousKind;
  mode: PetMode;
  bubble: string;
}

const quiet: AutonomousDecision = { kind: 'none', mode: 'idle', bubble: '' };
const sleep: AutonomousDecision = { kind: 'sleep', mode: 'sleeping', bubble: '' };

export function scheduleAutonomousBehavior(input: SchedulerInput): AutonomousDecision {
  if (input.sleeping) return quiet;
  if (input.now - input.lastInteractionAt >= SLEEP_AFTER_IDLE_MS) return sleep;
  if (input.now - input.lastInteractionAt < USER_QUIET_WINDOW_MS) return quiet;
  if (input.now - input.lastAutonomousAt < AUTONOMOUS_COOLDOWN_MS) return quiet;
  if (input.roll < 0.34) return { kind: 'stretch', mode: 'stretch', bubble: '' };
  if (input.roll < 0.67) return { kind: 'groom', mode: 'groom', bubble: '' };
  return { kind: 'waiting', mode: 'waiting', bubble: '陪我一小会儿嘛' };
}
