# 爆爆踩奶互动实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the former yarn interaction with a quiet, affectionate, fixed-body kneading-paws interaction.

**Architecture:** Rename the user action and frame action from yarn to knead throughout the typed state machine and renderer. Remove the yarn-only effect sequence, generate four seated kneading key poses, normalize them using the existing alpha alignment script, and expand them into one eight-frame one-shot animation.

**Tech Stack:** Electron 38, TypeScript, Vitest, PowerShell/System.Drawing, built-in image generation, chroma-key removal helper.

## Global Constraints

- Button text: `踩奶`; bubble text: `给你踩踩奶～`.
- Typed action: `knead`; typed frame action: `knead-paws`; state mode: `kneading`.
- Eight transparent 512 × 512 frames: `[0, 1, 2, 3, 0, 1, 2, 3]`, 170 ms each, one-shot.
- No yarn-ball, chase, pounce, or look effect sequence or CSS remains active.
- Keep feeding, companion, sleeping, petting, idle, the warm Q-style cat identity, and alpha layout constraints unchanged.
- No Git write command of any kind.

---

## File Structure

- `source/src/shared/types.ts`: mode and `FrameActionId` vocabulary.
- `source/src/shared/pet-machine.ts`: `PetAction`, frame mapping, and kneading response.
- `source/src/shared/effect-sequence.ts`: feed-only effect API.
- `source/src/renderer/main.ts`: invoke effects only for feeding.
- `source/src/renderer/index.html`: action button label/data attribute.
- `source/src/renderer/styles.css`: remove unused yarn effect styling.
- `source/src/renderer/frame-animation.ts`: kneading timing entry.
- `source/tests/pet-machine.test.ts`, `effect-sequence.test.ts`, `animation-profile.test.ts`, `frame-animation.test.ts`, `frame-assets.test.ts`: executable behavior/resource contract.
- `assets/baobao/sheets/knead-paws-sheet.png`, `assets/baobao/frames/knead-paws/*.png`: generated and aligned visual assets.
- `source/scripts/align-interaction-frames.ps1`, `verify-frame-layout.ps1`, `verify-frame-assets.cjs`: deterministic frame build and checks.

### Task 1: Replace yarn semantics with kneading semantics

**Files:**
- Modify: `source/tests/pet-machine.test.ts`
- Modify: `source/tests/effect-sequence.test.ts`
- Modify: `source/tests/animation-profile.test.ts`
- Modify: `source/src/shared/types.ts`
- Modify: `source/src/shared/pet-machine.ts`
- Modify: `source/src/shared/effect-sequence.ts`
- Modify: `source/src/renderer/main.ts`
- Modify: `source/src/renderer/index.html`
- Modify: `source/src/renderer/styles.css`

**Interfaces:**
- Produces `PetAction = ... | 'knead'`, `PetMode = ... | 'kneading'`, and `FrameActionId = ... | 'knead-paws'`.
- `frameActionForPetAction('knead')` returns `'knead-paws'`.
- `interact(..., 'knead', ...)` returns `{ mode: 'kneading', bubble: '给你踩踩奶～', affectionGain: 2 }`.
- `effectsFor` accepts only `'feed'` and returns treat/hearts.

- [ ] **Step 1: Write failing semantic tests**

```ts
expect(interact(initialPetState(1), 'knead', 2)).toMatchObject({
  mode: 'kneading', bubble: '给你踩踩奶～', affection: 2,
});
expect(frameActionForPetAction('knead')).toBe('knead-paws');
expect(effectsFor('feed').map(({ kind }) => kind)).toEqual(['treat', 'hearts']);
```

- [ ] **Step 2: Run the focused suites and verify failure**

Run: `node node_modules/vitest/vitest.mjs run tests/pet-machine.test.ts tests/effect-sequence.test.ts`

Expected: FAIL because `knead` and `knead-paws` do not exist.

- [ ] **Step 3: Implement the typed replacement**

Replace every user-facing/internal yarn action branch with knead. Keep feed effect behavior intact, remove yarn effect branches and CSS, and use `<button data-action="knead">踩奶</button>`.
Replace the retired `chasing`/`pouncing` animation-profile test cases with `['kneading', 'listen']`.

- [ ] **Step 4: Re-run focused suites**

Run: `node node_modules/vitest/vitest.mjs run tests/pet-machine.test.ts tests/effect-sequence.test.ts`

Expected: PASS.

### Task 2: Specify and create stable kneading frames

**Files:**
- Modify: `source/tests/frame-animation.test.ts`
- Modify: `source/tests/frame-assets.test.ts`
- Modify: `source/src/renderer/frame-animation.ts`
- Modify: `source/scripts/align-interaction-frames.ps1`
- Modify: `source/scripts/verify-frame-layout.ps1`
- Modify: `source/scripts/verify-frame-assets.cjs`
- Create: `assets/baobao/sheets/knead-paws-sheet.png`
- Create: `assets/baobao/frames/knead-paws/000.png` through `007.png`

**Interfaces:**
- `FRAME_ANIMATIONS['knead-paws']` is `{ frameCount: 8, frameDurationMs: 170, loop: false }`.
- `frameIndexFor(..., 1_359) === 7`; `isFinished(..., 1_359) === false`; `isFinished(..., 1_360) === true`.
- Asset scripts expect `knead-paws: 8` and inspect its alpha bounds.

- [ ] **Step 1: Write failing timing/resource expectations**

```ts
expect(frameIndexFor(FRAME_ANIMATIONS['knead-paws'], 1_359)).toBe(7);
expect(isFinished(FRAME_ANIMATIONS['knead-paws'], 1_360)).toBe(true);
```

Replace `'yarn-chase': 8` with `'knead-paws': 8` in the frame resource test.

- [ ] **Step 2: Run focused suites and verify failure**

Run: `node node_modules/vitest/vitest.mjs run tests/frame-animation.test.ts tests/frame-assets.test.ts`

Expected: FAIL because the kneading action and assets are not present.

- [ ] **Step 3: Generate four seated key poses**

Use a flat `#ff00ff` background and a 2 × 2 sheet. Require same seated body, ears, tail, frame, center, and baseline; key poses are left paw press, right paw press, left press with slow blink, right press with content expression. No props/text/shadows.

- [ ] **Step 4: Slice, remove chroma key, and expand**

Slice with `slice-pose-sheet.ps1`, remove the chroma key with `remove_chroma_key.py`, then set:

```powershell
'knead-paws' = @(0, 1, 2, 3, 0, 1, 2, 3)
```

Run the alignment script to write `knead-paws/000.png` through `007.png`.

- [ ] **Step 5: Extend checks and run visual/layout QA**

Update `$limits` and expected resource groups from yarn to knead, then run the alpha verifier and resource verifier. Inspect an eight-frame contact sheet before integration.

### Task 3: Integrate and package

**Files:**
- Output: `release/爆爆桌面宠物.exe`

**Interfaces:**
- Consumes the renamed TypeScript action and `knead-paws` assets.
- Produces a portable EXE containing `frames/knead-paws/007.png` and no code path that launches yarn effects.

- [ ] **Step 1: Copy only revised files to `E:\Pet_baobao`**

Copy source/tests/scripts and the new sheet/frame directory. Preserve prior yarn assets as unreferenced project history; do not delete them.

- [ ] **Step 2: Run full verification**

Run: `npm.cmd test -- --run`, `npm.cmd run build`, `node scripts/verify-frame-assets.cjs`, and `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/verify-frame-layout.ps1 -FrameRoot ..\assets\baobao\frames`.

Expected: all suites pass, all active groups use continuous 512 × 512 frames, and knead bounds pass.

- [ ] **Step 3: Package and inspect output**

Run: `npm.cmd run dist:portable`.

Verify `release/爆爆桌面宠物.exe` and `release/win-unpacked/resources/assets/baobao/frames/knead-paws/007.png` exist.
