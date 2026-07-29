import type { PersistedPetState } from './types';

export function sanitizePersistedState(value: unknown): PersistedPetState | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const numericKeys = ['x', 'y', 'affection', 'lastInteractionAt'] as const;
  if (!numericKeys.every((key) => typeof raw[key] === 'number' && Number.isFinite(raw[key]))) return null;
  if (typeof raw.sleeping !== 'boolean') return null;

  return {
    x: raw.x as number,
    y: raw.y as number,
    affection: Math.max(0, raw.affection as number),
    lastInteractionAt: raw.lastInteractionAt as number,
    sleeping: raw.sleeping,
  };
}
