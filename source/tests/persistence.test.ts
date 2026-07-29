import { describe, expect, it } from 'vitest';
import { sanitizePersistedState } from '../src/shared/persistence';

describe('sanitizePersistedState', () => {
  it('keeps a complete persisted state', () => {
    expect(sanitizePersistedState({ x: 10, y: 20, affection: 3, lastInteractionAt: 4, sleeping: false }))
      .toEqual({ x: 10, y: 20, affection: 3, lastInteractionAt: 4, sleeping: false });
  });

  it('rejects corrupt values', () => {
    expect(sanitizePersistedState({ x: '10' })).toBeNull();
  });
});
