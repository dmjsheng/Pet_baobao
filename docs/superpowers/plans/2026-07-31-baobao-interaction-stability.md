# 爆爆互动帧稳定性修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace unstable petting, feeding, and yarn action frames with anchored, fixed-size Q-style frame sequences that retain gentle interaction cues.

**Architecture:** Keep the existing action IDs and renderer player. Rebuild each action from a four-pose 2×2 source sheet, then construct a longer forward-and-return sequence by copying the aligned key poses into the existing six- or eight-frame numbering. A PowerShell alpha-boundary verifier provides a reproducible guard against frame position and size drift that PNG header checks cannot detect.

**Tech Stack:** Electron 38, TypeScript, Vitest, Node.js, PowerShell/System.Drawing, built-in image generation and its chroma-key removal helper.

## Global Constraints

- Preserve the existing warm Q-style Siamese cat art, Chinese bubbles, silent behavior, interaction buttons, and DOM treat/hearts/yarn-ball effects.
- Keep `pet-nuzzle` and `eat-treat` at six numbered `512 × 512` transparent PNGs and `yarn-chase` at eight.
- Each repaired group has a common baseline, horizontal center difference at most 3 px, and width/height variation at most 2%.
- The cat remains inside the same visual footprint; only expression, head, forepaw, or tail changes.
- `pet[data-animation="frame"]` remains `animation: none`; no CSS transform may compensate for a bad frame.
- Do not commit, push, reset, or alter Git configuration; the user manages Git.

---

## File Structure

- `assets/baobao/sheets/pet-nuzzle-stable-sheet.png`, `eat-treat-stable-sheet.png`, `yarn-chase-stable-sheet.png`: generated 2×2 source sheets retained for provenance.
- `assets/baobao/frames/pet-nuzzle/*.png`, `eat-treat/*.png`, `yarn-chase/*.png`: replacement final numbered frames.
- `source/scripts/slice-pose-sheet.ps1`: generalized to slice a 2×2 source sheet while preserving aspect ratio inside the `512 × 512` canvas.
- `source/scripts/align-interaction-frames.ps1`: aligns four key frames, creates the six/eight forward-return sequences, and replaces only the three affected groups.
- `source/scripts/verify-frame-layout.ps1`: reads alpha values and fails when a group's component bounds violate its fixed-size tolerance.
- `source/tests/frame-animation.test.ts`: verifies the revised timing entries remain continuous and retain their frame counts.
- `source/src/renderer/frame-animation.ts`: reduced but readable per-frame durations for the replaced action sequences.

### Task 1: Specify stable action timing before changing assets

**Files:**
- Modify: `source/tests/frame-animation.test.ts`
- Modify: `source/src/renderer/frame-animation.ts`

**Interfaces:**
- Consumes: `FRAME_ANIMATIONS[action]`, `frameIndexFor(animation, elapsedMs)`.
- Produces: six-frame `pet-nuzzle` at 140 ms, six-frame `eat-treat` at 150 ms, and eight-frame `yarn-chase` at 130 ms, all one-shot.

- [ ] **Step 1: Add failing action-duration tests**

```ts
it('holds petting on its sixth stable frame', () => {
  expect(frameIndexFor(FRAME_ANIMATIONS['pet-nuzzle'], 700)).toBe(5);
});

it('uses a complete eight-frame yarn sequence before returning to idle', () => {
  expect(frameIndexFor(FRAME_ANIMATIONS['yarn-chase'], 1_039)).toBe(7);
  expect(isFinished(FRAME_ANIMATIONS['yarn-chase'], 1_040)).toBe(true);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: FAIL because petting uses 115 ms and yarn uses 110 ms per frame.

- [ ] **Step 3: Update only the three action timing entries**

```ts
'pet-nuzzle': { frameCount: 6, frameDurationMs: 140, loop: false },
'eat-treat': { frameCount: 6, frameDurationMs: 150, loop: false },
'yarn-chase': { frameCount: 8, frameDurationMs: 130, loop: false },
```

- [ ] **Step 4: Run the focused test and verify pass**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: PASS, with idle, companion, and sleeping timings unchanged.

- [ ] **Step 5: Leave files unstaged**

Do not run Git write commands.

### Task 2: Generate and assemble the anchored key poses

**Files:**
- Create: `assets/baobao/sheets/pet-nuzzle-stable-sheet.png`
- Create: `assets/baobao/sheets/eat-treat-stable-sheet.png`
- Create: `assets/baobao/sheets/yarn-chase-stable-sheet.png`
- Modify: `assets/baobao/frames/pet-nuzzle/000.png` through `005.png`
- Modify: `assets/baobao/frames/eat-treat/000.png` through `005.png`
- Modify: `assets/baobao/frames/yarn-chase/000.png` through `007.png`
- Modify: `source/scripts/slice-pose-sheet.ps1`
- Create: `source/scripts/align-interaction-frames.ps1`

**Interfaces:**
- Consumes: `assets/baobao/baobao.png` for character/style; source sheet input; output directories for the three action IDs.
- Produces: stable numbered action PNGs, using these exact sequence maps: `pet-nuzzle = [0,1,2,3,2,1]`, `eat-treat = [0,1,2,3,2,1]`, `yarn-chase = [0,1,2,3,2,1,0,1]`.

- [ ] **Step 1: Write a failing frame-layout check command**

Create `source/scripts/verify-frame-layout.ps1` with these required action limits:

```powershell
$limits = @{
  'pet-nuzzle' = @{ CenterTolerance = 3; SizeTolerance = 0.02 }
  'eat-treat' = @{ CenterTolerance = 3; SizeTolerance = 0.02 }
  'yarn-chase' = @{ CenterTolerance = 3; SizeTolerance = 0.02 }
}
```

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames`

Expected: FAIL against current frames because their alpha bounding boxes have large size and center differences.

- [ ] **Step 2: Generate three 2×2 key-pose sheets and visually inspect them**

Generate one sheet per action on a flat `#ff00ff` chroma-key background. Every sheet uses the same standing full-body reference pose and generous per-cell padding.

```text
pet-nuzzle: open/soft eye contact -> slight head tilt -> content half blink -> gentle return.
eat-treat: notice treat -> eager eyes -> happy soft blink -> satisfied look.
yarn-chase: watch left -> lift left forepaw -> watch right -> lift right forepaw with small tail response.
```

Reject a sheet when cats overlap grid cells, body pose changes, an ear/paw is cropped, or extra limbs appear.

- [ ] **Step 3: Slice and remove chroma key without aspect-ratio distortion**

Make `slice-pose-sheet.ps1` accept `-Columns` and `-Rows`, calculate `scale = min(512/cellWidth, 512/cellHeight)`, and center the scaled cell in a transparent `512 × 512` frame. Run it with `-Columns 2 -Rows 2` for every source sheet. Use the imagegen chroma-key helper with explicit `#ff00ff`, soft matte, and despill to create alpha PNG key poses.

- [ ] **Step 4: Implement deterministic alignment and sequence expansion**

`align-interaction-frames.ps1` must load all four key pose images into memory before overwriting output files, translate each to a shared center and bottom baseline, then write the mapped sequence by drawing the selected aligned key pose into each numbered frame.

```powershell
$sequenceMaps = @{
  'pet-nuzzle' = @(0, 1, 2, 3, 2, 1)
  'eat-treat' = @(0, 1, 2, 3, 2, 1)
  'yarn-chase' = @(0, 1, 2, 3, 2, 1, 0, 1)
}
```

- [ ] **Step 5: Run the layout verifier and resource test**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames && npm.cmd test -- --run tests/frame-assets.test.ts && node scripts/verify-frame-assets.cjs`

Expected: layout verifier PASS; resource tests PASS; all six action groups retain their original continuous numbering and dimensions.

- [ ] **Step 6: Leave generated assets unstaged**

Do not commit, amend, or push.

### Task 3: Package and smoke-check the repaired interactions

**Files:**
- Output: `release/爆爆桌面宠物.exe`

**Interfaces:**
- Consumes: repaired assets and timing declarations; existing `dist:portable` script.
- Produces: portable EXE whose unpacked resources contain repaired action groups.

- [ ] **Step 1: Run the final automated verification**

Run: `npm.cmd test -- --run && npm.cmd run build && node scripts/verify-frame-assets.cjs && powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames`

Expected: all Vitest suites pass, build exits 0, frame resource check reports 32 frames, and layout check reports the three repaired groups within tolerance.

- [ ] **Step 2: Package a portable executable**

Run: `npm.cmd run dist:portable`

Expected: exit code 0 and refreshed `release/爆爆桌面宠物.exe`.

- [ ] **Step 3: Inspect packed action assets**

Verify the following exact paths exist:

```text
release/win-unpacked/resources/assets/baobao/frames/pet-nuzzle/005.png
release/win-unpacked/resources/assets/baobao/frames/eat-treat/005.png
release/win-unpacked/resources/assets/baobao/frames/yarn-chase/007.png
```

- [ ] **Step 4: Perform user-facing smoke checks**

1. Click the cat: stable body, only a gentle petting response.
2. Click 喂食: stable body plus the existing treat/hearts feedback.
3. Click 玩毛线球: stable body plus head/paw/tail response and rolling yarn effect.
4. Verify 陪伴、睡觉、闲置眨眼 remain unchanged.

- [ ] **Step 5: Leave delivery changes unstaged**

Report the executable path and verification evidence without Git mutations.
