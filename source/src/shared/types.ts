export type PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting';

export interface PersistedPetState {
  x: number;
  y: number;
  affection: number;
  lastInteractionAt: number;
  sleeping: boolean;
}
