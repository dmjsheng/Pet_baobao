import type { PetMode } from './types';

export interface PetState {
  mode: PetMode;
  sleeping: boolean;
  affection: number;
  lastInteractionAt: number;
  bubble: string;
}

export type PetAction = 'pet' | 'feed' | 'companion' | 'sleep';

export function initialPetState(now = Date.now()): PetState {
  return {
    mode: 'idle',
    sleeping: false,
    affection: 0,
    lastInteractionAt: now,
    bubble: '我在看你呀',
  };
}

export function interact(state: PetState, action: PetAction, now: number): PetState {
  if (action === 'sleep') {
    return state.sleeping
      ? { ...state, sleeping: false, mode: 'idle', bubble: '我醒啦', lastInteractionAt: now }
      : { ...state, sleeping: true, mode: 'sleeping', bubble: '爆爆先眯一会儿', lastInteractionAt: now };
  }

  const response = action === 'pet'
    ? { mode: 'petted' as const, bubble: '摸摸就不困啦' }
    : action === 'feed'
      ? { mode: 'fed' as const, bubble: '零食收到！' }
      : { mode: 'companion' as const, bubble: '我在这儿陪你' };

  return {
    ...state,
    ...response,
    sleeping: false,
    affection: state.affection + 1,
    lastInteractionAt: now,
  };
}
