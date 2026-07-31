# 爆爆第三版逐帧动画 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用四组透明、逐帧的 Q 版爆爆动作替换主要互动中的 CSS 位移动画，并重新生成 Windows 便携版。

**Architecture:** 每组动作先生成一张固定网格的序列图，再机械裁切为连续编号 PNG。新的纯函数帧播放器根据动作配置、开始时间和当前时间给出帧索引；渲染器每次刷新仅切换现有 `<img>` 的本地帧 URL，主进程权限与保存模型保持不变。

**Tech Stack:** Electron 38、TypeScript、Vitest、esbuild、OpenAI built-in image generation、Windows .NET `System.Drawing`（只用于无损网格裁切）。

## Global Constraints

- 保持第二版暖色 Q 版爆爆视觉、蓝眼睛、深色面罩/耳朵/四肢/尾巴与奶油色身体。
- 只制作：`idle-look` 6 帧、`pet-nuzzle` 6 帧、`eat-treat` 8 帧、`yarn-chase` 8 帧。
- 帧图为透明 PNG、统一尺寸、完整猫身与底部对齐；全程静音。
- 不添加完整精灵图、16 朝向、视频/GIF 文件、联网、音效或额外动作。
- 不创建 Git 提交或修改 Git 配置；用户自行管理 Git。

---

### Task 1: 设计并验证纯函数帧播放器

**Files:**
- Create: `src/renderer/frame-animation.ts`
- Create: `tests/frame-animation.test.ts`

**Interfaces:**
- Produces: `FRAME_ANIMATIONS`, `frameIndexFor(animation, elapsedMs)`, `isFinished(animation, elapsedMs)`.
- Consumes: action IDs `idle-look`, `pet-nuzzle`, `eat-treat`, `yarn-chase`.

- [x] **Step 1: 写入会失败的播放器测试**

```ts
expect(frameIndexFor(FRAME_ANIMATIONS['idle-look'], 1_020)).toBe(0);
expect(frameIndexFor(FRAME_ANIMATIONS['pet-nuzzle'], 690)).toBe(5);
expect(isFinished(FRAME_ANIMATIONS['pet-nuzzle'], 691)).toBe(true);
```

- [x] **Step 2: 运行测试，确认模块缺失导致失败**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: FAIL with module-not-found for `frame-animation`.

- [x] **Step 3: 最小化实现帧配置与时间计算**

```ts
export interface FrameAnimation { frameCount: number; frameDurationMs: number; loop: boolean; }
export function frameIndexFor(animation: FrameAnimation, elapsedMs: number): number {
  const raw = Math.floor(Math.max(0, elapsedMs) / animation.frameDurationMs);
  return animation.loop ? raw % animation.frameCount : Math.min(raw, animation.frameCount - 1);
}
```

Configure idle at 6×170 ms looping, nuzzle at 6×115 ms, eat at 8×150 ms, and yarn at 8×110 ms. `isFinished` is true only for non-looping animations after their full duration.

- [x] **Step 4: 运行播放器测试，确认通过**

Run: `npm.cmd test -- --run tests/frame-animation.test.ts`

Expected: PASS.

### Task 2: 制作并验证四组透明帧资源

**Files:**
- Create: `assets/baobao/sheets/idle-look-sheet.png`
- Create: `assets/baobao/sheets/pet-nuzzle-sheet.png`
- Create: `assets/baobao/sheets/eat-treat-sheet.png`
- Create: `assets/baobao/sheets/yarn-chase-sheet.png`
- Create: `assets/baobao/frames/<action>/000.png` through final frame
- Create: `scripts/slice-animation-sheet.ps1`
- Create: `scripts/verify-frame-assets.cjs`
- Create: `tests/frame-assets.test.ts`

**Interfaces:**
- Consumes: `assets/baobao/baobao.png` as the visual reference and a 3×2 or 4×2 chroma-key animation sheet.
- Produces: continuous numbered transparent PNG frames at `assets/baobao/frames/<action>/`.

- [x] **Step 1: 先写资源完整性测试**

```ts
expect(verifyFrameAssets(assetRoot)).toEqual([]);
```

- [x] **Step 2: 运行测试，确认四组帧尚未存在时失败**

Run: `npm.cmd test -- --run tests/frame-assets.test.ts`

Expected: FAIL with missing action directories and frames.

- [x] **Step 3: 生成四张网格动作序列图**

Use the built-in image generator four times, one action per request, with `baobao.png` as the identity/style reference. Every prompt requires an exact 3×2 grid for 6 frames or 4×2 grid for 8 frames, a perfectly flat `#ff00ff` chroma-key background, fixed front-facing character scale, no captions, no borders, and no duplicate poses.

- [x] **Step 4: 裁切与抠图**

Use `scripts/slice-animation-sheet.ps1` with Windows .NET `System.Drawing.Bitmap.Clone` to split each uniform grid without resizing. Run the supplied chroma-key removal helper for each cell with auto-key, soft matte and despill. Name frames with zero-padded, continuous three-digit filenames beginning at `000.png`.

- [x] **Step 5: 运行资源测试与透明度检查**

Run: `npm.cmd test -- --run tests/frame-assets.test.ts` and `node scripts/verify-frame-assets.cjs`.

Expected: PASS; each group has exactly 6/6/8/8 PNG files, equal canvas dimensions, and transparent corners.

### Task 3: 接入动画播放器和互动切换

**Files:**
- Modify: `src/renderer/main.ts`
- Modify: `src/renderer/styles.css`
- Modify: `src/shared/pet-machine.ts`
- Modify: `tests/pet-machine.test.ts`
- Modify: `tests/renderer-bundle.test.ts`

**Interfaces:**
- Consumes: `FRAME_ANIMATIONS`, `frameIndexFor`, `isFinished`, and `assets/baobao/frames` URL root.
- Produces: `startFrameAnimation(action)` and a single frame timer that returns to idle after an action completes.

- [x] **Step 1: 写入会失败的互动动作映射测试**

```ts
expect(frameActionForPetAction('pet')).toBe('pet-nuzzle');
expect(frameActionForPetAction('feed')).toBe('eat-treat');
expect(frameActionForPetAction('yarn')).toBe('yarn-chase');
```

- [x] **Step 2: 运行测试，确认互动映射模块尚未导出导致失败**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts`

Expected: FAIL with missing `frameActionForPetAction` export.

- [x] **Step 3: 实现动作映射与帧刷新**

Export `frameActionForPetAction` from `pet-machine.ts`, returning the three one-shot action IDs or `null`. In the renderer, retain a current frame action/start time and one 40 ms timer. Each tick computes a frame index and swaps the pet image to `frames/<action>/<index>.png`. When a non-looping action finishes, start `idle-look` immediately. A new pet/feed/yarn action resets its start time to zero, interrupting any prior one-shot action.

- [x] **Step 4: 保留第二版的附加效果与非范围状态**

Feed continues to show the treat and heart overlays; yarn continues to show its yarn-ball overlay. Sleeping, companion, stretch, groom and waiting preserve their existing CSS behavior and use the base still image rather than a missing frame folder.

- [x] **Step 5: 运行相关测试与浏览器打包检查**

Run: `npm.cmd test -- --run tests/pet-machine.test.ts tests/renderer-bundle.test.ts`.

Expected: PASS and renderer bundle contains no `require(`.

### Task 4: 完整验证、便携版打包和使用说明

**Files:**
- Modify: `README-运行说明.md`
- Modify: `docs/superpowers/plans/2026-07-30-baobao-frame-animation-v3.md`

**Interfaces:**
- Consumes: completed resource frames and renderer implementation.
- Produces: `release/爆爆桌面宠物.exe` with V3 frame assets.

- [x] **Step 1: 更新运行说明**

State that V3 ships four frame animations and keeps the other quiet behaviors from V2. Include the frame asset location so the project remains portable.

- [x] **Step 2: 运行完整自动验证**

```powershell
npm.cmd test -- --run
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dist:portable
```

Expected: tests, typecheck, build and portable package all succeed.

- [ ] **Step 3: 校验打包内容与人工验收**

Inspect `release/win-unpacked/resources/app.asar` for all 28 `assets/baobao/frames` images and browser-safe renderer bundle. Then launch the portable EXE and check idle loop, pet, feed and yarn in sequence, rapid interruption, drag, silent operation and restart persistence.
