export type PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting' | 'stretch' | 'groom' | 'chasing' | 'pouncing';

export interface PersistedPetState {
  x: number;
  y: number;
  affection: number;
  lastInteractionAt: number;
  lastAutonomousAt: number;
  sleeping: boolean;
}
