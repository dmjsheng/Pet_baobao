export type PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting' | 'stretch' | 'groom' | 'kneading';
export type FrameActionId = 'idle-look' | 'pet-nuzzle' | 'eat-treat' | 'knead-paws' | 'companion-sit' | 'sleep-curl';

export interface PersistedPetState {
  x: number;
  y: number;
  affection: number;
  lastInteractionAt: number;
  lastAutonomousAt: number;
  sleeping: boolean;
}
