# 爆爆毛线球眼神追踪实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current low-expression yarn action with an eight-frame, fixed-body sequence whose eyes visibly track the ball from left to right.

**Architecture:** Retain the existing `yarn-chase` action, DOM yarn effects, alpha layout verifier, and frame player. Generate four eye-focused key poses on a chroma-key sheet, normalize them to one common visual footprint, then expand them deterministically into eight numbered PNGs.

**Tech Stack:** Electron 38, TypeScript, Vitest, PowerShell/System.Drawing, built-in image generation, chroma-key removal helper.

## Global Constraints

- Keep the warm Q-style Siamese identity and the current stable body footprint.
- Preserve the existing yarn-ball DOM effect sequence; do not alter feeding, companion, sleeping, or idle frames.
- Use 8 transparent `512 × 512` `yarn-chase` frames with sequence `[0, 1, 0, 2, 3, 2, 0, 1]`.
- Run the yarn action at 160 ms per frame (1.28 seconds total).
- Require alpha-bound center/baseline error at most 3 px and width/height variation at most 2%.
- Do not commit, push, reset, or alter Git configuration; the user manages Git.

---

## File Structure

- `assets/baobao/sheets/yarn-chase-eye-tracking-sheet.png`: generated four-pose source sheet retained for provenance.
- `assets/baobao/frames/yarn-chase/*.png`: final expanded stable action frames.
- `source/src/renderer/frame-animation.ts`: one yarn timing entry.
- `source/tests/frame-animation.test.ts`: timing regression proof.
- `source/scripts/align-interaction-frames.ps1`: adjusted source map used for deterministic frame expansion.

### Task 1: Specify the readable slower chase timing

**Files:**
- Modify: `source/tests/frame-animation.test.ts`
- Modify: `source/src/renderer/frame-animation.ts`

**Interfaces:**
- Consumes: `FRAME_ANIMATIONS['yarn-chase']`, `frameIndexFor`, and `isFinished`.
- Produces: a one-shot 8-frame yarn animation at 160 ms per frame.

- [ ] **Step 1: Write the failing timing expectation**

```ts
expect(frameIndexFor(FRAME_ANIMATIONS['yarn-chase'], 959)).toBe(5);
expect(isFinished(FRAME_ANIMATIONS['yarn-chase'], 1_279)).toBe(false);
expect(isFinished(FRAME_ANIMATIONS['yarn-chase'], 1_280)).toBe(true);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node node_modules/vitest/vitest.mjs run tests/frame-animation.test.ts`

Expected: FAIL because the existing 130 ms duration ends at 1,040 ms.

- [ ] **Step 3: Update the one timing entry**

```ts
'yarn-chase': { frameCount: 8, frameDurationMs: 160, loop: false },
```

- [ ] **Step 4: Re-run the focused test**

Run: `node node_modules/vitest/vitest.mjs run tests/frame-animation.test.ts`

Expected: PASS.

### Task 2: Generate, normalize, and validate eye-tracking frames

**Files:**
- Create: `assets/baobao/sheets/yarn-chase-eye-tracking-sheet.png`
- Modify: `assets/baobao/frames/yarn-chase/000.png` through `007.png`
- Modify: `source/scripts/align-interaction-frames.ps1`

**Interfaces:**
- Consumes: `assets/baobao/baobao.png`, a 2 × 2 eye-pose source sheet, the chroma-key helper, and existing layout verifier.
- Produces: the exact final frame sequence `[0, 1, 0, 2, 3, 2, 0, 1]`, whose eyes visibly look left and right while the body remains stationary.

- [ ] **Step 1: Generate one four-pose source sheet**

Require bright blue iris and black pupil visibly shifted to the left in frames 0/1 and to the right in frames 2/3; frame 3 adds a half blink. Require one standing body pose with unchanged paws, torso, tail footprint, scale, center, and padding. Use a flat `#ff00ff` background with no props, shadows, text, or grid lines.

- [ ] **Step 2: Slice and remove chroma key**

Run `slice-pose-sheet.ps1` with `-Columns 2 -Rows 2`, then run `remove_chroma_key.py` with `--key-color '#ff00ff' --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill --force` into a temporary key-frame directory.

- [ ] **Step 3: Update the yarn sequence map and run deterministic alignment**

```powershell
'yarn-chase' = @(0, 1, 0, 2, 3, 2, 0, 1)
```

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/align-interaction-frames.ps1 -KeyFrameRoot ..\assets\baobao\key-frames -OutputRoot ..\assets\baobao\frames`

- [ ] **Step 4: Run visual and layout QA**

Inspect a generated contact sheet, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames
node scripts/verify-frame-assets.cjs
```

Expected: the yarn group has exactly eight 512 × 512 transparent PNGs and passes center/baseline/size limits.

### Task 3: Integrate and package

**Files:**
- Output: `release/爆爆桌面宠物.exe`

**Interfaces:**
- Consumes: revised yarn assets and timing, existing build process.
- Produces: a portable Windows executable including `yarn-chase/007.png`.

- [ ] **Step 1: Copy only the revised files into `E:\Pet_baobao`**

Copy the timing source/test, alignment script, new source sheet, and eight yarn PNGs. Do not touch unrelated interaction groups or Git metadata.

- [ ] **Step 2: Run final automated verification**

Run: `npm.cmd test -- --run && npm.cmd run build && node scripts/verify-frame-assets.cjs && powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames`

Expected: all tests pass, build exits 0, and resource/layout checks pass.

- [ ] **Step 3: Build and inspect the portable executable**

Run: `npm.cmd run dist:portable`

Verify: `release/win-unpacked/resources/assets/baobao/frames/yarn-chase/007.png` and `release/爆爆桌面宠物.exe` exist.
