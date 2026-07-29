# 爆爆桌面宠物 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portable Windows desktop pet called 爆爆 with a transparent floating window, Q-style Siamese-cat animation, Chinese interaction bubbles, and local-only state.

**Architecture:** Electron main process owns the transparent always-on-top window, native context menu, asset lookup, and persistence. A renderer owns pet state transitions, frame playback, controls, bubbles, and drag gestures. Pure TypeScript modules define state transitions and persistence validation so they are testable without Electron.

**Tech Stack:** Electron, TypeScript, Vite, Vitest, Canvas/DOM, electron-builder portable target, hatch-pet v2 spritesheet assets.

## Global Constraints

- Target Windows 10/11 and provide a portable build that runs without Node.js installed.
- Keep the application offline; store only coordinates, interaction score, last interaction, and sleep preference locally.
- Preserve 爆爆's blue eyes, seal-brown mask/ears/limbs/tail, cream body, and warm Q-style proportions in every animation.
- Do not add startup registration, telemetry, auto-update, camera, microphone, network calls, or real pet-care claims.
- Output every implementation artifact and release build under `E:\Pet_baobao`; the user owns all Git actions.

---

## File Structure

```text
E:\Pet_baobao/
  source/
    package.json                    # scripts, dependencies, portable build metadata
    tsconfig.json                   # strict TypeScript settings
    vite.config.ts                  # renderer build and test configuration
    src/main.ts                     # BrowserWindow, IPC and native context menu
    src/preload.ts                  # narrow, typed renderer bridge
    src/shared/types.ts             # PetMode, PersistedPetState, IPC types
    src/shared/pet-machine.ts       # pure state transition and bubble selection
    src/shared/persistence.ts       # schema validation and default fallback
    src/renderer/index.html         # pet root and accessible action controls
    src/renderer/main.ts            # rendering, frame player, events, drag
    src/renderer/styles.css         # transparent window and warm controls
    src/renderer/sprite-player.ts   # spritesheet frame selection/playback
    assets/baobao/spritesheet.webp  # validated hatch-pet v2 atlas
    assets/baobao/pet.json          # atlas metadata
    tests/pet-machine.test.ts       # interaction transition tests
    tests/persistence.test.ts       # corrupt-state fallback tests
    tests/sprite-player.test.ts     # state-to-row/frame mapping tests
  qa/                               # hatch-pet and app validation artifacts
  release/                          # portable Windows output
  README-运行说明.md
```

### Task 1: Establish the Electron project and test harness

**Files:**
- Create: `E:\Pet_baobao\source\package.json`
- Create: `E:\Pet_baobao\source\tsconfig.json`
- Create: `E:\Pet_baobao\source\vite.config.ts`
- Create: `E:\Pet_baobao\source\src\shared\types.ts`
- Create: `E:\Pet_baobao\source\tests\pet-machine.test.ts`

**Interfaces:**
- Produces `PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting'`.
- Produces `PersistedPetState = { x: number; y: number; affection: number; lastInteractionAt: number; sleeping: boolean }`.

- [ ] **Step 1: Write the failing state-type test**

```ts
import { describe, expect, it } from 'vitest';
import { initialPetState } from '../src/shared/pet-machine';

describe('initialPetState', () => {
  it('starts awake and idle', () => {
    expect(initialPetState().mode).toBe('idle');
    expect(initialPetState().sleeping).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/pet-machine.test.ts`

Expected: fail because `pet-machine` does not exist.

- [ ] **Step 3: Add the smallest project configuration and shared interfaces**

```ts
export type PetMode = 'idle' | 'petted' | 'fed' | 'companion' | 'sleeping' | 'waiting';

export interface PersistedPetState {
  x: number;
  y: number;
  affection: number;
  lastInteractionAt: number;
  sleeping: boolean;
}
```

Configure `npm test` to run Vitest and `npm run build` to compile renderer/main outputs.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run tests/pet-machine.test.ts`

Expected: pass.

- [ ] **Step 5: Record the setup as complete without Git actions**

The user owns Git management; do not stage, commit, reset, or alter Git settings.

### Task 2: Implement and test the interaction state machine

**Files:**
- Create: `E:\Pet_baobao\source\src\shared\pet-machine.ts`
- Modify: `E:\Pet_baobao\source\tests\pet-machine.test.ts`

**Interfaces:**
- Consumes `PetMode` and `PersistedPetState` from `types.ts`.
- Produces `initialPetState(now?: number): PetState` and `interact(state: PetState, action: 'pet' | 'feed' | 'companion' | 'sleep', now: number): PetState`.

- [ ] **Step 1: Extend failing tests for every user interaction**

```ts
it.each([
  ['pet', 'petted', '摸摸就不困啦'],
  ['feed', 'fed', '零食收到！'],
  ['companion', 'companion', '我在这儿陪你'],
] as const)('maps %s to the expected mode and bubble', (action, mode, bubble) => {
  const next = interact(initialPetState(1), action, 2);
  expect(next.mode).toBe(mode);
  expect(next.bubble).toBe(bubble);
  expect(next.affection).toBeGreaterThan(0);
});

it('toggles sleep on and off', () => {
  const asleep = interact(initialPetState(1), 'sleep', 2);
  expect(asleep.mode).toBe('sleeping');
  expect(interact(asleep, 'sleep', 3).mode).toBe('idle');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/pet-machine.test.ts`

Expected: fail because `interact` is not exported.

- [ ] **Step 3: Implement deterministic interaction transitions**

```ts
export function interact(state: PetState, action: PetAction, now: number): PetState {
  if (action === 'sleep') {
    return state.sleeping
      ? { ...state, sleeping: false, mode: 'idle', bubble: '我醒啦' }
      : { ...state, sleeping: true, mode: 'sleeping', bubble: '爆爆先眯一会儿' };
  }
  const result = action === 'pet'
    ? { mode: 'petted' as const, bubble: '摸摸就不困啦' }
    : action === 'feed'
      ? { mode: 'fed' as const, bubble: '零食收到！' }
      : { mode: 'companion' as const, bubble: '我在这儿陪你' };
  return { ...state, ...result, sleeping: false, affection: state.affection + 1, lastInteractionAt: now };
}
```

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- --run tests/pet-machine.test.ts`

Expected: pass.

- [ ] **Step 5: Run the complete TypeScript test suite**

Run: `npm test -- --run`

Expected: pass.

### Task 3: Implement and test safe local persistence

**Files:**
- Create: `E:\Pet_baobao\source\src\shared\persistence.ts`
- Create: `E:\Pet_baobao\source\tests\persistence.test.ts`

**Interfaces:**
- Consumes `PersistedPetState` from `types.ts`.
- Produces `sanitizePersistedState(value: unknown): PersistedPetState | null`.

- [ ] **Step 1: Write failing validation tests**

```ts
import { describe, expect, it } from 'vitest';
import { sanitizePersistedState } from '../src/shared/persistence';

describe('sanitizePersistedState', () => {
  it('keeps a complete persisted state', () => {
    expect(sanitizePersistedState({ x: 10, y: 20, affection: 3, lastInteractionAt: 4, sleeping: false }))
      .toEqual({ x: 10, y: 20, affection: 3, lastInteractionAt: 4, sleeping: false });
  });
  it('rejects corrupt values', () => {
    expect(sanitizePersistedState({ x: '10' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/persistence.test.ts`

Expected: fail because `persistence` does not exist.

- [ ] **Step 3: Implement strict numeric and boolean validation**

```ts
export function sanitizePersistedState(value: unknown): PersistedPetState | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (![raw.x, raw.y, raw.affection, raw.lastInteractionAt].every((entry) => typeof entry === 'number' && Number.isFinite(entry)) || typeof raw.sleeping !== 'boolean') return null;
  return { x: raw.x as number, y: raw.y as number, affection: Math.max(0, raw.affection as number), lastInteractionAt: raw.lastInteractionAt as number, sleeping: raw.sleeping };
}
```

- [ ] **Step 4: Run the focused persistence tests**

Run: `npm test -- --run tests/persistence.test.ts`

Expected: pass.

- [ ] **Step 5: Run all tests**

Run: `npm test -- --run`

Expected: pass.

### Task 4: Generate and validate the 爆爆 v2 animation atlas

**Files:**
- Create: `E:\Pet_baobao\assets\baobao\spritesheet.webp`
- Create: `E:\Pet_baobao\assets\baobao\pet.json`
- Create: `E:\Pet_baobao\qa\contact-sheet-extended.png`
- Create: `E:\Pet_baobao\qa\look-directions.png`
- Create: `E:\Pet_baobao\qa\direction-semantics.json`
- Create: `E:\Pet_baobao\qa\direction-blind-validation.json`
- Create: `E:\Pet_baobao\qa\look-continuity.json`
- Create: `E:\Pet_baobao\qa\run-summary.json`
- Create: `E:\Pet_baobao\qa\previews\idle.gif`

**Interfaces:**
- Produces a 1536×2288 WebP spritesheet, with 192×208 cells and `spriteVersionNumber: 2`.
- Consumes `assets/baobao/spritesheet.webp` and `assets/baobao/pet.json` in Task 5.

- [ ] **Step 1: Prepare the pet run from all six reference photos**

Run `prepare_pet_run.py` using display name `爆爆`, style preset `auto`, notes requiring the photographed blue eyes, dark points, cream coat, warm Q-style, whole body, and clean chroma key background.

- [ ] **Step 2: Generate the canonical base visual and test its extraction**

Generate one centered, full-body visual through `$imagegen`; copy it to the prepared decoded path. Run `inspect_frames.py` after the first idle-row output and repair any actual clipping or component errors.

- [ ] **Step 3: Generate and incrementally validate rows 0–8**

For every state, use the generated canonical base and matching layout guide: idle, running-right, running-left, waving, jumping, failed, waiting, running, review. Run extraction and `inspect_frames.py --require-components` immediately after each source strip. Generate a distinct running-left strip unless a visual review confirms the directional run can safely use the supplied mirroring script.

- [ ] **Step 4: Verify the intermediate atlas and motion previews**

Compose the 8×9 atlas, create its contact sheet and row GIFs, then check: idle visibly varies, directional running faces the requested direction and alternates gait, no crop/overlap/identity drift exists, and non-directional running looks focused rather than like literal sprinting.

- [ ] **Step 5: Generate, validate and review all 16 look directions**

Write the cat-specific look mechanics: torso/paws remain anchored, head and blue eyes lead gaze, ears turn subtly, tail follows; never rotate the full sprite. Generate four cardinal anchors, validate their screen coordinates, then create coherent row 9 and row 10. Run row registration, edge checks, direction semantic review, continuity checks, and three independent blind pair classifications.

- [ ] **Step 6: Assemble, despill, validate and stage the asset**

Assemble the v2 atlas, run its single despill pass, `validate_atlas.py --require-v2`, extended contact sheet, direction sheet, and visual QA. Copy only the passing `spritesheet.webp` and `pet.json` to `assets/baobao/`; retain all required QA evidence under `qa/`.

### Task 5: Implement native window ownership and renderer bridge

**Files:**
- Create: `E:\Pet_baobao\source\src\main.ts`
- Create: `E:\Pet_baobao\source\src\preload.ts`
- Modify: `E:\Pet_baobao\source\src\shared\types.ts`

**Interfaces:**
- Main exposes `windowState.get()`, `windowState.save(position)`, `windowState.reset()`, and `app.quit()` through `window.baobao`.
- Renderer receives `{ x, y, affection, lastInteractionAt, sleeping }` and writes only validated values.

- [ ] **Step 1: Write a failing pure test for a saved window position**

```ts
it('accepts an on-screen numeric window position', () => {
  expect(sanitizePersistedState({ x: 100, y: 200, affection: 0, lastInteractionAt: 0, sleeping: false })?.x).toBe(100);
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- --run tests/persistence.test.ts`

Expected: pass after Task 3; it is the regression guard for main-process input handling.

- [ ] **Step 3: Implement the transparent BrowserWindow and narrowed IPC bridge**

Create a 360×420 transparent, frameless, always-on-top window with no Node integration in renderer. Persist state under `app.getPath('userData')`, create a context menu for controls/reset/quit, and expose only documented IPC functions through `contextBridge`.

- [ ] **Step 4: Type-check main and preload**

Run: `npm run typecheck`

Expected: pass with strict TypeScript settings.

- [ ] **Step 5: Perform a development smoke start**

Run: `npm run dev`

Expected: a transparent window opens at the saved/default position, and right-click displays the native menu.

### Task 6: Implement the animated renderer and portable package

**Files:**
- Create: `E:\Pet_baobao\source\src\renderer\index.html`
- Create: `E:\Pet_baobao\source\src\renderer\main.ts`
- Create: `E:\Pet_baobao\source\src\renderer\sprite-player.ts`
- Create: `E:\Pet_baobao\source\src\renderer\styles.css`
- Create: `E:\Pet_baobao\source\tests\sprite-player.test.ts`
- Create: `E:\Pet_baobao\README-运行说明.md`
- Create: `E:\Pet_baobao\release\爆爆桌面宠物.exe` portable build output

**Interfaces:**
- Consumes `PetState`, `interact`, `window.baobao`, and `assets/baobao/pet.json`.
- `rowForMode(mode: PetMode): number` maps `idle=0`, `petted=3`, `fed=4`, `companion=8`, `sleeping=6`, `waiting=6`.

- [ ] **Step 1: Write failing sprite row tests**

```ts
import { describe, expect, it } from 'vitest';
import { rowForMode } from '../src/renderer/sprite-player';

describe('rowForMode', () => {
  it.each([
    ['idle', 0], ['petted', 3], ['fed', 4], ['companion', 8], ['sleeping', 6], ['waiting', 6],
  ] as const)('maps %s to row %i', (mode, row) => expect(rowForMode(mode)).toBe(row));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/sprite-player.test.ts`

Expected: fail because `sprite-player` does not exist.

- [ ] **Step 3: Implement the frame player and renderer**

Render the atlas in a clipped sprite viewport using `background-size: 800% 1100%` and advance the 8 frame columns on a timer. Map interactions through `interact`, display the Chinese bubble for four seconds, use pointer drag on the pet viewport, and provide buttons only while hovering. Ensure button clicks do not initiate drag.

- [ ] **Step 4: Run renderer tests and all static checks**

Run: `npm test -- --run && npm run typecheck && npm run build`

Expected: all pass and a production directory exists.

- [ ] **Step 5: Build and manually verify portable release**

Run: `npm run dist:portable`

Expected: a release folder contains `爆爆桌面宠物.exe` and its runtime files. Launch it from `release/`, test each interaction, restart to verify state restoration, copy the release folder to a sibling temporary directory, and confirm that copy starts without Node.js or source paths.

- [ ] **Step 6: Write concise user instructions**

Document exact run location, portable-copy rule, controls, reset behavior, build command, and the fact that the app never uploads data or enables automatic startup.

## Plan Self-Review

- Spec coverage: Tasks 1–3 cover local-only state, interaction text, and corrupt-state recovery. Task 4 covers the full visual/animation acceptance contract. Tasks 5–6 cover transparent window, drag/right-click behavior, packaging, portability, and manual acceptance checks.
- Placeholder scan: no TBD/TODO or deferred implementation language is used.
- Type consistency: all renderer modes are defined in Task 1 and mapped in Task 6; persisted data uses the same `PersistedPetState` structure in Tasks 1, 3, and 5.
