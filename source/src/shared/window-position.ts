import type { PersistedPetState } from './types';

export function withSavedWindowPosition(state: PersistedPetState, [x, y]: [number, number]): PersistedPetState {
  return { ...state, x: Math.round(x), y: Math.round(y) };
}
