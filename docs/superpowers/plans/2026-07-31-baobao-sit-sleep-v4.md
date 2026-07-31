# 爆爆端坐陪伴与蜷睡姿势 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stable, pose-specific frame animations for the companion and sleep interactions so 爆爆 truly sits attentively and curls up to sleep.

**Architecture:** Keep the existing renderer-owned frame player. Extend the frame-action vocabulary with two looped actions: `companion-sit` for the companion mode and `sleep-curl` for every sleeping state. The state machine remains the source of truth for whether 爆爆 is asleep; the renderer derives which persistent frame loop to play when a user action, autonomous behavior, or restored state changes that truth.

**Tech Stack:** Electron 38, TypeScript, Vitest, Node.js scripts, PowerShell/System.Drawing for deterministic frame slicing and alignment, built-in image generation for Q-style raster art.

## Global Constraints

- Preserve the existing warm, cute Q-style Siamese cat character and Chinese interaction bubbles.
- New frame assets are transparent `512 × 512` PNG files with continuous three-digit names.
- `companion-sit` uses four anchored blink frames: 3600 ms, 90 ms, 110 ms, 90 ms.
- `sleep-curl` uses four anchored closed-eye breathing frames at 1400 ms each.
- No CSS translate, scale, or rotation may be used to imitate sitting or sleeping poses.
- A second sleep click wakes 爆爆; any other interaction also wakes her before its own response.
- Autonomous sleep and restored persisted sleep use the same `sleep-curl` animation.
- Do not commit, push, or alter Git configuration; the user manages Git history.

---

## File Structure

- `assets/baobao/frames/companion-sit/*.png`: four generated, aligned companion frames.
- `assets/baobao/frames/sleep-curl/*.png`: four generated, aligned sleep frames.
- `assets/baobao/sheets/companion-sit-sheet.png` and `sleep-curl-sheet.png`: retained generated source sheets for asset provenance and regeneration.
- `source/src/shared/types.ts`: the complete `FrameActionId` union.
- `source/src/shared/pet-machine.ts`: action-to-frame mapping for companion; keeps sleep truth in `PetState.sleeping`.
- `source/src/renderer/frame-animation.ts`: timing declarations for all frame groups.
- `source/src/renderer/main.ts`: starts a persistent sleeping loop for click/autonomous/restored sleep and returns to idle on wake.
- `source/scripts/verify-frame-assets.cjs`: expected frame counts for all six frame groups.
- `source/tests/pet-machine.test.ts`: action-to-frame behavior coverage.
- `source/tests/frame-animation.test.ts`: per-frame timing coverage.
- `source/tests/frame-assets.test.ts`: source asset-count and canvas-size coverage.

### Task 1: Define the two persistent frame actions

**Files:**
- Modify: `source/src/shared/types.ts`
- Modify: `source/src/shared/pet-machine.ts`
- Modify: `source/tests/pet-machine.test.ts`

**Interfaces:**
- Consumes: `PetAction = 'pet' | 'feed' | 'companion' | 'sleep' | 'yarn'`.
- Produces: `FrameActionId` including `'companion-sit'` and `'sleep-curl'`; `frameActionForPetAction('companion')` returns `'companion-sit'`.

- [ ] **Step 1: Write the failing state-machine expectation**

```ts
it.each([
  ['companion', 'companion-sit'],
  ['sleep', null],
] as const)('maps %s to its available frame animation', (action, animation) => {
  expect(frameActionForPetAction(action)).toBe(animation);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts`

Expected: FAIL because `'companion-sit'` is not part of `FrameActionId` and `companion` still maps to `null`.

- [ ] **Step 3: Implement the smallest type and mapping change**

```ts
export type FrameActionId =
  | 'idle-look'
  | 'pet-nuzzle'
  | 'eat-treat'
  | 'yarn-chase'
  | 'companion-sit'
  | 'sleep-curl';

export function frameActionForPetAction(action: PetAction): FrameActionId | null {
  if (action === 'companion') return 'companion-sit';
  // retain the existing pet, feed, yarn mappings; sleep returns null
}
```

- [ ] **Step 4: Run the focused test and verify pass**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts`

Expected: PASS, including the new companion mapping and existing sleep-toggle expectations.

- [ ] **Step 5: Leave changes unstaged**

Do not run Git commands that change repository state; the user will inspect and commit the tested files.

### Task 2: Make frame timing explicit for sitting and sleeping

**Files:**
- Modify: `source/src/renderer/frame-animation.ts`
- Modify: `source/tests/frame-animation.test.ts`

**Interfaces:**
- Consumes: `FRAME_ANIMATIONS: Record<FrameActionId, FrameAnimation>` and `frameIndexFor(animation, elapsedMs)`.
- Produces: looped `companion-sit` and `sleep-curl` timing entries without changing existing action timing.

- [ ] **Step 1: Write failing timing tests**

```ts
it('holds the companion pose before its slow blink', () => {
  expect(frameIndexFor(FRAME_ANIMATIONS['companion-sit'], 3_599)).toBe(0);
  expect(frameIndexFor(FRAME_ANIMATIONS['companion-sit'], 3_600)).toBe(1);
});

it('loops four sleeping breathing frames every 5.6 seconds', () => {
  expect(frameIndexFor(FRAME_ANIMATIONS['sleep-curl'], 1_400)).toBe(1);
  expect(frameIndexFor(FRAME_ANIMATIONS['sleep-curl'], 5_600)).toBe(0);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: FAIL because the two animation keys do not exist.

- [ ] **Step 3: Add the two loop declarations**

```ts
'companion-sit': {
  frameCount: 4,
  frameDurationMs: 0,
  frameDurationsMs: [3_600, 90, 110, 90],
  loop: true,
},
'sleep-curl': { frameCount: 4, frameDurationMs: 1_400, loop: true },
```

- [ ] **Step 4: Run the focused test and verify pass**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: PASS with current idle and one-shot animation tests unchanged.

- [ ] **Step 5: Leave changes unstaged**

Do not commit; retain test output for the final verification report.

### Task 3: Generate, slice, align, and validate the two pose asset groups

**Files:**
- Create: `assets/baobao/sheets/companion-sit-sheet.png`
- Create: `assets/baobao/sheets/sleep-curl-sheet.png`
- Create: `assets/baobao/frames/companion-sit/000.png` through `003.png`
- Create: `assets/baobao/frames/sleep-curl/000.png` through `003.png`
- Modify: `source/scripts/verify-frame-assets.cjs`
- Modify: `source/tests/frame-assets.test.ts`

**Interfaces:**
- Consumes: user reference photos for upright sitting and curled sleep; `source/scripts/slice-animation-sheet.ps1`; `FrameActionId` and counts from Tasks 1-2.
- Produces: eight RGBA frame assets on fixed canvases and a validator that expects all six groups.

- [ ] **Step 1: Write failing frame-manifest expectations**

```ts
const expectedFrames = {
  'idle-look': 4,
  'pet-nuzzle': 6,
  'eat-treat': 8,
  'yarn-chase': 8,
  'companion-sit': 4,
  'sleep-curl': 4,
} as const;
```

- [ ] **Step 2: Run the focused resource test and verify failure**

Run: `npm.cmd test -- --run tests/frame-assets.test.ts`

Expected: FAIL because the two directories and their numbered PNGs are absent.

- [ ] **Step 3: Create and inspect source sheets**

Use built-in image generation with the user photos as pose references and the existing `assets/baobao/baobao.png` as the Q-style visual reference. Each source sheet must use a flat magenta chroma-key background, four non-overlapping pose cells with generous padding, no text, no props, no shadows, and no watermark. Inspect each sheet before slicing; reject any sheet with overlapping cats or altered colors.

- [ ] **Step 4: Slice and normalize the frames**

Run the existing slicer for each four-cell sheet, remove the magenta background with the installed chroma-key helper, and align the main cat component to a common baseline and horizontal center. Keep only `000.png` through `003.png`, verify transparent corners, and reject any detached component above the head or beyond the intended silhouette.

- [ ] **Step 5: Update the resource validator and run all resource checks**

```js
const expected = {
  'idle-look': 4,
  'pet-nuzzle': 6,
  'eat-treat': 8,
  'yarn-chase': 8,
  'companion-sit': 4,
  'sleep-curl': 4,
};
```

Run: `npm.cmd test -- --run tests/frame-assets.test.ts && node scripts/verify-frame-assets.cjs`

Expected: PASS; exactly 34 frame files across six groups, all `512x512` PNGs.

- [ ] **Step 6: Leave generated assets unstaged**

Do not commit generated PNGs or scripts; the user will review them in Git.

### Task 4: Drive persistent poses from user, autonomous, and restored state

**Files:**
- Modify: `source/src/renderer/main.ts`
- Modify: `source/tests/pet-machine.test.ts`

**Interfaces:**
- Consumes: `state.sleeping`, `frameActionForPetAction(action)`, `startFrameAnimation(action)`, `stopFrameAnimation()`.
- Produces: sleeping state always runs `'sleep-curl'`; companion action runs `'companion-sit'`; wake paths restore `'idle-look'` or start the newly requested action.

- [ ] **Step 1: Add a pure action-selection helper and failing tests**

Add this exported helper in `source/src/shared/pet-machine.ts` so its behavior remains unit-testable:

```ts
export function persistentFrameActionForState(state: Pick<PetState, 'sleeping'>): FrameActionId | null {
  return state.sleeping ? 'sleep-curl' : null;
}
```

Test it in `source/tests/pet-machine.test.ts`:

```ts
it('uses the curled sleeping frames only while asleep', () => {
  expect(persistentFrameActionForState({ sleeping: true })).toBe('sleep-curl');
  expect(persistentFrameActionForState({ sleeping: false })).toBeNull();
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts`

Expected: FAIL because `persistentFrameActionForState` is not exported.

- [ ] **Step 3: Implement state-derived frame selection and renderer calls**

```ts
const persistentFrameAction = persistentFrameActionForState(state);
const frameAction = persistentFrameAction ?? frameActionForPetAction(action);

if (frameAction) startFrameAnimation(frameAction);
else if (action === 'sleep') startFrameAnimation('idle-look');
else stopFrameAnimation();
```

In `checkAutonomousBehavior()` and `boot()`, replace sleep-related `stopFrameAnimation()` calls with `startFrameAnimation('sleep-curl')` whenever `state.sleeping` is true. Keep non-sleep autonomous behavior unchanged.

- [ ] **Step 4: Run focused tests and TypeScript compilation**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts tests/frame-animation.test.ts && npx tsc --noEmit`

Expected: PASS; no unresolved `FrameActionId` exhaustiveness errors.

- [ ] **Step 5: Leave changes unstaged**

Do not commit; user-owned Git history remains untouched.

### Task 5: Integrate, package, and perform visual acceptance

**Files:**
- Modify only if verification exposes a specific defect: `source/src/renderer/styles.css`, `source/src/renderer/main.ts`, or the new frame assets.
- Output: `release/爆爆桌面宠物.exe`

**Interfaces:**
- Consumes: all prior tasks and the existing `dist:portable` package script.
- Produces: a portable Windows executable containing all six frame groups.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm.cmd test -- --run && npm.cmd run build && node scripts/verify-frame-assets.cjs`

Expected: PASS; resource verifier reports 34 `512x512` frames across six groups.

- [ ] **Step 2: Build the portable executable**

Run: `npm.cmd run dist:portable`

Expected: exit code 0 and an updated `release/爆爆桌面宠物.exe`.

- [ ] **Step 3: Inspect package contents**

Verify these exact files exist under `release/win-unpacked/resources/assets/baobao/frames/`:

```text
companion-sit/000.png
companion-sit/003.png
sleep-curl/000.png
sleep-curl/003.png
```

- [ ] **Step 4: Perform user-facing smoke checks**

1. Click “陪伴”; verify the upright pose remains fixed and blinks after about four seconds.
2. Click “睡觉”; verify the curled closed-eye pose remains fixed except for gentle breathing.
3. Click “睡觉” again; verify standing idle returns.
4. Sleep, then click each of 抚摸、喂食、陪伴、毛线球; verify the chosen response appears.
5. Restart while sleeping; verify the curled pose is restored.

- [ ] **Step 5: Leave release and source changes unstaged**

Report the executable path and checks performed; do not commit or push.
