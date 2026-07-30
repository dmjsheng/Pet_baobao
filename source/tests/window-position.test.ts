import { describe, expect, it } from 'vitest';
import { withSavedWindowPosition } from '../src/shared/window-position';

describe('withSavedWindowPosition', () => {
  it('stores a rounded native-window position without changing pet history', () => {
    const state = { x: -1, y: -1, affection: 3, lastInteractionAt: 4, lastAutonomousAt: 5, sleeping: false };
    expect(withSavedWindowPosition(state, [10.6, 20.2])).toEqual({ ...state, x: 11, y: 20 });
  });
});
