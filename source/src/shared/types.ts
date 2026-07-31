export type PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting' | 'stretch' | 'groom' | 'chasing' | 'pouncing';
export type FrameActionId = 'idle-look' | 'pet-nuzzle' | 'eat-treat' | 'yarn-chase';

export interface PersistedPetState {
  x: number;
  y: number;
  affection: number;
  lastInteractionAt: number;
  lastAutonomousAt: number;
  sleeping: boolean;
}
