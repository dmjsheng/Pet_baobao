export type ClickInteractionAction = 'pet' | 'stretch' | 'groom';

const CLICK_ACTIONS: readonly ClickInteractionAction[] = ['pet', 'stretch', 'groom'];

export function selectClickInteraction(previous: ClickInteractionAction | null, roll: number): ClickInteractionAction {
  const candidates = previous === null ? CLICK_ACTIONS : CLICK_ACTIONS.filter((action) => action !== previous);
  return candidates[Math.min(candidates.length - 1, Math.floor(Math.max(0, roll) * candidates.length))];
}
