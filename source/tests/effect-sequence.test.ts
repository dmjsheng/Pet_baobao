import { describe, expect, it } from 'vitest';
import { effectsFor } from '../src/shared/effect-sequence';

describe('effectsFor', () => {
  it('shows a treat before the pair of hearts after feeding', () => {
    expect(effectsFor('feed').map(({ kind }) => kind)).toEqual(['treat', 'hearts']);
  });

});
