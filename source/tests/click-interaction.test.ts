import { describe, expect, it } from 'vitest';
import { selectClickInteraction } from '../src/shared/click-interaction';

describe('selectClickInteraction', () => {
  it.each([
    [null, 0, 'pet'],
    [null, 0.34, 'stretch'],
    [null, 0.67, 'groom'],
    ['pet', 0, 'stretch'],
    ['stretch', 0.99, 'groom'],
    ['groom', 0.99, 'stretch'],
  ] as const)('selects %s with roll %s as %s', (previous, roll, expected) => {
    expect(selectClickInteraction(previous, roll)).toBe(expected);
  });
});
