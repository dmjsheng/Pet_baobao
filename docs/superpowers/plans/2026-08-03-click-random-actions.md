# Click-Random Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two high-quality, stable animated click interactions and randomly choose among them and the existing pet response without consecutive repeats.

**Architecture:** Keep random action choice as a small pure shared module, so it can be deterministic under tests and has no renderer DOM dependency. Extend the existing pet state machine and frame registry for `stretch-paws` and `groom-face`; the renderer only stores the previous click action and delegates its selected action to the existing `apply()` path. Build new transparent PNG sequences from two four-pose source sheets, using the same alpha alignment and layout validation workflow as the existing actions.

**Tech Stack:** Electron 38, TypeScript 5.8, Vitest 3.2, Node.js asset verifier, PowerShell/System.Drawing frame alignment, built-in ImageGen plus local chroma-key removal.

## Global Constraints

- Scope is limited to clicks on the pet body; do not change autonomous/idle behavior, button behavior, sound, persistence schema, or window behavior.
- Clicks randomly choose `pet`, `stretch`, or `groom`; immediately repeating the preceding click action is forbidden.
- Use 512×512 transparent PNG frames; preserve the cat's aspect ratio and keep face/shoulders centered. Do not scale, squash, or shift the whole cat between frames.
- `stretch-paws` and `groom-face` are six-frame one-shot actions: `0,1,2,3,2,1` from four source poses.
- Use the existing warm Q-style Siamese visual language and no text/watermark in generated art.
- User manages Git; do not create commits, change Git configuration, or modify unrelated existing assets.

---

### Task 1: Deterministic click-action selector

**Files:**
- Create: `source/src/shared/click-interaction.ts`
- Create: `source/tests/click-interaction.test.ts`

**Interfaces:**
- Produces: `export type ClickInteractionAction = 'pet' | 'stretch' | 'groom'`
- Produces: `export function selectClickInteraction(previous: ClickInteractionAction | null, roll: number): ClickInteractionAction`
- Consumes: a caller-provided `roll` in the range `[0, 1)`; no global randomness inside the selector.

- [ ] **Step 1: Write the failing selector tests**

```ts
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
```

- [ ] **Step 2: Run the focused test and verify it fails because the module does not exist**

Run: `npm.cmd test -- --run tests/click-interaction.test.ts`

Expected: FAIL with a module-resolution error for `click-interaction`.

- [ ] **Step 3: Implement the pure selector**

```ts
export type ClickInteractionAction = 'pet' | 'stretch' | 'groom';

const CLICK_ACTIONS: readonly ClickInteractionAction[] = ['pet', 'stretch', 'groom'];

export function selectClickInteraction(previous: ClickInteractionAction | null, roll: number): ClickInteractionAction {
  const candidates = previous === null ? CLICK_ACTIONS : CLICK_ACTIONS.filter((action) => action !== previous);
  return candidates[Math.min(candidates.length - 1, Math.floor(Math.max(0, roll) * candidates.length))];
}
```

- [ ] **Step 4: Run the focused selector test and verify it passes**

Run: `npm.cmd test -- --run tests/click-interaction.test.ts`

Expected: PASS with six tests.

### Task 2: State-machine and renderer integration

**Files:**
- Modify: `source/src/shared/types.ts`
- Modify: `source/src/shared/pet-machine.ts`
- Modify: `source/src/renderer/frame-animation.ts`
- Modify: `source/src/renderer/animation-profile.ts`
- Modify: `source/src/renderer/main.ts`
- Modify: `source/tests/pet-machine.test.ts`
- Modify: `source/tests/frame-animation.test.ts`

**Interfaces:**
- Consumes: `ClickInteractionAction` and `selectClickInteraction()` from Task 1.
- Produces: `PetAction` values `stretch` and `groom`; frame identifiers `stretch-paws` and `groom-face`.
- Produces: one-shot frame specifications: `stretch-paws` six frames at 190 ms; `groom-face` six frames at 180 ms.

- [ ] **Step 1: Add failing state and timing expectations**

Add the following cases to `tests/pet-machine.test.ts`:

```ts
['stretch', 'stretch', '伸个懒腰给你看～'],
['groom', 'groom', '洗洗脸，继续陪你～'],
```

Add the following frame mappings:

```ts
['stretch', 'stretch-paws'],
['groom', 'groom-face'],
```

Add timing assertions to `tests/frame-animation.test.ts`:

```ts
expect(isFinished(FRAME_ANIMATIONS['stretch-paws'], 1_139)).toBe(false);
expect(isFinished(FRAME_ANIMATIONS['stretch-paws'], 1_140)).toBe(true);
expect(isFinished(FRAME_ANIMATIONS['groom-face'], 1_079)).toBe(false);
expect(isFinished(FRAME_ANIMATIONS['groom-face'], 1_080)).toBe(true);
```

- [ ] **Step 2: Run the focused state and animation tests to verify they fail for missing action/frame identifiers**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts tests/frame-animation.test.ts`

Expected: FAIL because `stretch`/`groom` and their frame identifiers are not yet defined.

- [ ] **Step 3: Extend the state and frame registries**

1. Add `stretch-paws` and `groom-face` to `FrameActionId` in `src/shared/types.ts`.
2. Add `stretch` and `groom` to `PetAction` in `src/shared/pet-machine.ts`.
3. Map the actions to their new frame IDs and map their responses to the exact Chinese bubbles from Step 1 with `affectionGain: 1`.
4. Add the two six-frame animation entries to `FRAME_ANIMATIONS` with the durations from this task's interface.
5. Set the corresponding CSS-profile durations to 1,140 ms and 1,080 ms in `animation-profile.ts`.

- [ ] **Step 4: Route clicks through the selector without altering buttons**

In `src/renderer/main.ts`, add:

```ts
let previousClickAction: ClickInteractionAction | null = null;

function applyRandomClickInteraction(): void {
  const action = selectClickInteraction(previousClickAction, Math.random());
  previousClickAction = action;
  apply(action);
}
```

Replace only `apply('pet')` inside the `pet` click handler with `applyRandomClickInteraction()`. Keep the `actions` button handler unchanged.

- [ ] **Step 5: Run focused state and animation tests and verify they pass**

Run: `npm.cmd test -- --run tests/click-interaction.test.ts tests/pet-machine.test.ts tests/frame-animation.test.ts`

Expected: PASS with all selector, state, and frame-timing tests.

### Task 3: Generate and validate four-pose source sheets

**Files:**
- Create: `assets/baobao/sheets/stretch-paws-sheet.png`
- Create: `assets/baobao/sheets/groom-face-sheet.png`
- Create: `assets/baobao/key-frames/stretch-paws/000.png` through `003.png`
- Create: `assets/baobao/key-frames/groom-face/000.png` through `003.png`

**Interfaces:**
- Produces: two 2×2 source sheets on a flat `#00ff00` chroma-key background, each with four complete, separated cat poses.
- Produces: four alpha PNG key frames per action, all on 512×512 canvases.

- [ ] **Step 1: Generate the stretch sheet with built-in ImageGen**

Use built-in ImageGen, with the existing warm Q-style pet image as the **style/identity reference**. Use this prompt:

```text
Use case: stylized-concept
Asset type: 2x2 source sprite sheet for a Windows desktop pet animation
Primary request: Create four consistent key poses of the same cute warm Q-style female Siamese cat named 爆爆 in a gentle small forepaw stretch. Pose 1: seated neutral, blue eyes open. Pose 2: seated with both front paws a little forward, body and head unchanged. Pose 3: forepaws extended modestly forward, a tiny upward chin lift, relaxed half-closed eyes. Pose 4: paws returning, calm open eyes. Keep her face, blue eyes, dark mask, cream body, proportions, camera angle, lighting, and body scale identical across all four cells.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background; no floor, shadow, gradient, reflection, prop, text, or watermark.
Composition/framing: a clean 2x2 grid with one full cat centered in each cell, generous padding, no cell overlap, no crop.
Style/medium: polished warm-color Q-style game pet illustration with soft fur detail.
Constraints: only the front paws and very small head/eye expression may change; do not make the whole cat bounce, resize, rotate, lean, stretch horizontally, or change viewpoint.
Avoid: accessories, yarn, food, furniture, duplicate cats within one cell, captions, signatures.
```

- [ ] **Step 2: Generate the grooming sheet with built-in ImageGen**

Use built-in ImageGen with the same style/identity reference. Use this prompt:

```text
Use case: stylized-concept
Asset type: 2x2 source sprite sheet for a Windows desktop pet animation
Primary request: Create four consistent key poses of the same cute warm Q-style female Siamese cat named 爆爆 gently washing her face. Pose 1: seated neutral, blue eyes open. Pose 2: one front paw rising toward her cheek, body and head fixed. Pose 3: paw softly touching the cheek, slow blink. Pose 4: paw lowering, eyes open. Keep her face, blue eyes, dark mask, cream body, proportions, camera angle, lighting, and body scale identical across all four cells.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background; no floor, shadow, gradient, reflection, prop, text, or watermark.
Composition/framing: a clean 2x2 grid with one full cat centered in each cell, generous padding, no cell overlap, no crop.
Style/medium: polished warm-color Q-style game pet illustration with soft fur detail.
Constraints: only one forepaw, eyelids, and a very small head tilt may change; do not make the whole cat bounce, resize, rotate, lean, or change viewpoint.
Avoid: accessories, yarn, food, furniture, duplicate cats within one cell, captions, signatures.
```

- [ ] **Step 3: Inspect both generated sheets before accepting them**

Use `view_image` and reject/regenerate any sheet where a cat is cropped, a cell has a different body size, the body shifts between cells, green leaks onto fur, or a pose does not match the four requested stages.

- [ ] **Step 4: Remove chroma key, split sheets, and validate alpha key frames**

1. Copy each accepted ImageGen output into the project asset workspace.
2. Run `remove_chroma_key.py` with `--auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill` for each sheet.
3. Split the 2×2 cells into four 512×512 PNGs per action with no resizing.
4. Verify alpha is present, all four corners are transparent, and each frame contains one complete cat with no green fringe.

### Task 4: Assemble stable animation frames and resource checks

**Files:**
- Modify: `source/scripts/align-interaction-frames.ps1`
- Modify: `source/scripts/verify-frame-layout.ps1`
- Modify: `source/scripts/verify-frame-aspect.ps1`
- Modify: `source/scripts/verify-frame-assets.cjs`
- Modify: `source/tests/frame-assets.test.ts`
- Create: `assets/baobao/frames/stretch-paws/000.png` through `005.png`
- Create: `assets/baobao/frames/groom-face/000.png` through `005.png`

**Interfaces:**
- Consumes: Task 3's four transparent key frames per action.
- Produces: six continuous final PNG frames per action using `0,1,2,3,2,1`.
- Produces: alignment checks that anchor the top/face region for these two local-paw actions, with center ≤ 3 px, width ≤ 2%, height ≤ 3%.

- [ ] **Step 1: Extend frame-asset expectations before generating final frames**

Add the exact entries to both `expected` objects:

```ts
'stretch-paws': 6,
'groom-face': 6,
```

Run: `npm.cmd test -- --run tests/frame-assets.test.ts`

Expected: FAIL because the two asset directories and their numbered frames do not exist.

- [ ] **Step 2: Extend the alignment sequence map**

Add the following exact mappings to `$sequenceMaps` in `align-interaction-frames.ps1`:

```powershell
'stretch-paws' = @(0, 1, 2, 3, 2, 1)
'groom-face' = @(0, 1, 2, 3, 2, 1)
```

Pass `$true` for `PreserveNaturalProportions` for `knead-paws`, `stretch-paws`, and `groom-face`, so these actions use a top anchor and never stretch a source crop.

- [ ] **Step 3: Extend the layout and aspect checks**

Add entries to `$limits` in `verify-frame-layout.ps1`:

```powershell
'stretch-paws' = @{ CenterTolerance = 3; WidthTolerance = 0.02; HeightTolerance = 0.03; VerticalAnchor = 'top' }
'groom-face' = @{ CenterTolerance = 3; WidthTolerance = 0.02; HeightTolerance = 0.03; VerticalAnchor = 'top' }
```

Update `verify-frame-aspect.ps1` to accept `-Action` and use the four key frames for that action, then run it independently for `knead-paws`, `stretch-paws`, and `groom-face` with a 3% aspect-ratio limit.

- [ ] **Step 4: Assemble and verify the final action frames**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\align-interaction-frames.ps1 -KeyFrameRoot ..\assets\baobao\key-frames -OutputRoot ..\assets\baobao\frames
node scripts\verify-frame-assets.cjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\verify-frame-aspect.ps1 -Action stretch-paws -KeyFrameDirectory ..\assets\baobao\key-frames\stretch-paws -FrameDirectory ..\assets\baobao\frames\stretch-paws
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\verify-frame-aspect.ps1 -Action groom-face -KeyFrameDirectory ..\assets\baobao\key-frames\groom-face -FrameDirectory ..\assets\baobao\frames\groom-face
```

Expected: all checks pass, with no whole-body aspect change, center/face-anchor drift, missing frame, non-PNG frame, or non-512×512 frame.

### Task 5: Full verification and portable packaging

**Files:**
- Modify: the source and assets from Tasks 1–4 only.
- Output: `release/爆爆桌面宠物.exe`

**Interfaces:**
- Consumes: all source tests and final static frame directories.
- Produces: a portable Windows EXE whose `resources/assets/baobao/frames` contains both new action sequences.

- [ ] **Step 1: Run the full test suite and type check**

Run:

```powershell
npm.cmd test -- --run
npm.cmd run typecheck
```

Expected: all tests pass and TypeScript reports no errors.

- [ ] **Step 2: Build and run all resource checks**

Run:

```powershell
npm.cmd run build
node scripts\verify-frame-assets.cjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames
```

Expected: build succeeds and every generated action frame is verified.

- [ ] **Step 3: Package the portable EXE and verify packaged assets**

Run:

```powershell
npm.cmd run dist:portable
Get-FileHash ..\assets\baobao\frames\stretch-paws\002.png
Get-FileHash ..\release\win-unpacked\resources\assets\baobao\frames\stretch-paws\002.png
Get-FileHash ..\assets\baobao\frames\groom-face\002.png
Get-FileHash ..\release\win-unpacked\resources\assets\baobao\frames\groom-face\002.png
```

Expected: `release/爆爆桌面宠物.exe` exists and each source/packaged hash pair matches.
