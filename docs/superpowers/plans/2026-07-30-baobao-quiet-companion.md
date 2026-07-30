# 爆爆安静陪伴互动 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有爆爆桌面宠物中实现静音、低打扰而富有反馈的自主行为和喂食/毛线球互动。

**Architecture:** 新增纯函数行为调度器和效果队列，让时间条件与动画步骤可被 Vitest 独立测试。渲染器每 30 秒向调度器询问一次，并通过临时 DOM 覆盖层展示零食、爱心、毛线球；主进程继续只负责窗口、存储和 IPC。

**Tech Stack:** Electron 38、TypeScript、Vitest、esbuild、CSS keyframes、DOM overlay。

## Global Constraints

- 全程静音；不接入音效、系统通知、网络、摄像头或键盘读取。
- 用户互动后 15 分钟内不触发自主动作；自主动作之间至少相隔 8 分钟。
- 用户 20 分钟未互动时自动睡觉，点击或任何主动操作会醒来。
- 喂食必须依序展示零食、开心跳跃、两颗爱心；毛线球必须依序展示滚入、追逐、扑跃、回看。
- 仅使用现有主视觉和 CSS/DOM 组合动画，不改动 Git 历史，也不生成完整精灵图。

---

### Task 1: 建立可测试的行为与效果领域模型

**Files:**
- Create: `src/shared/behavior-scheduler.ts`
- Create: `src/shared/effect-sequence.ts`
- Modify: `src/shared/types.ts`
- Modify: `src/shared/pet-machine.ts`
- Modify: `src/shared/persistence.ts`
- Create: `tests/behavior-scheduler.test.ts`
- Create: `tests/effect-sequence.test.ts`
- Modify: `tests/pet-machine.test.ts`
- Modify: `tests/persistence.test.ts`

**Interfaces:**
- Consumes: `PetState`, `PetMode`, `PersistedPetState`.
- Produces: `scheduleAutonomousBehavior(input): AutonomousDecision`, `effectsFor(action): TimedEffect[]`, and `PetAction` including `yarn`.

- [x] **Step 1: 写入会失败的调度器与效果测试**

```ts
expect(scheduleAutonomousBehavior({ now: 21 * MINUTE, lastInteractionAt: 0, lastAutonomousAt: 0, sleeping: false, roll: 0.1 }))
  .toEqual({ kind: 'sleep', mode: 'sleeping', bubble: '' });
expect(effectsFor('feed').map(({ kind }) => kind)).toEqual(['treat', 'hearts']);
expect(effectsFor('yarn').map(({ kind }) => kind)).toEqual(['yarn-ball', 'chase', 'pounce', 'look']);
```

- [x] **Step 2: 运行新测试，确认因模块尚不存在而失败**

Run: `npm test -- tests/behavior-scheduler.test.ts tests/effect-sequence.test.ts`

Expected: FAIL with module-not-found/import error for the two new modules.

- [x] **Step 3: 实现最小的纯函数领域模型**

```ts
export const MINUTE = 60_000;
export type AutonomousKind = 'none' | 'sleep' | 'stretch' | 'groom' | 'waiting';
export function scheduleAutonomousBehavior(input: SchedulerInput): AutonomousDecision {
  if (input.sleeping) return none;
  if (input.now - input.lastInteractionAt >= 20 * MINUTE) return sleep;
  if (input.now - input.lastInteractionAt < 15 * MINUTE || input.now - input.lastAutonomousAt < 8 * MINUTE) return none;
  return input.roll < .34 ? stretch : input.roll < .67 ? groom : waiting;
}
```

Define `TimedEffect` as `{ kind: 'treat' | 'hearts' | 'yarn-ball' | 'chase' | 'pounce' | 'look'; delayMs: number; durationMs: number }`, preserving the exact order in the test. Extend `PersistedPetState` with `lastAutonomousAt`; sanitize it as a finite number. Make `feed` and `yarn` award two affection points, all other awake active actions one point.

- [x] **Step 4: 运行领域测试并确认通过**

Run: `npm test -- tests/behavior-scheduler.test.ts tests/effect-sequence.test.ts tests/pet-machine.test.ts tests/persistence.test.ts`

Expected: PASS with all listed tests green.

- [x] **Step 5: 在绿灯后整理重复常量**

Extract minute and cooldown constants only into `behavior-scheduler.ts`; keep all tests green.

### Task 2: 接入渲染器交互、短暂效果与自主调度

**Files:**
- Modify: `src/renderer/index.html`
- Modify: `src/renderer/styles.css`
- Modify: `src/renderer/main.ts`
- Modify: `src/renderer/animation-profile.ts`
- Modify: `tests/animation-profile.test.ts`
- Modify: `tests/renderer-bundle.test.ts`

**Interfaces:**
- Consumes: `scheduleAutonomousBehavior`, `effectsFor`, expanded `PetAction`, persisted `lastAutonomousAt`.
- Produces: a `玩毛线球` action button, temporary `.effect` nodes, and 30-second quiet behavior checks.

- [x] **Step 1: 先补会失败的渲染静态测试**

```ts
expect(animationForMode('stretch').name).toBe('stretch');
expect(animationForMode('pouncing').name).toBe('pounce');
```

- [x] **Step 2: 运行测试，确认新 mode 和按钮不存在导致失败**

Run: `npm test -- tests/animation-profile.test.ts tests/renderer-bundle.test.ts`

Expected: FAIL because `stretch` and `pouncing` have no visual mapping yet.

- [x] **Step 3: 最小化实现视觉接入**

Add modes `stretch`, `groom`, `chasing`, and `pouncing` to the type and animation profile. Add a `玩毛线球` button and an `#effects` overlay container. In `main.ts`, render each `TimedEffect` by adding a DOM node after `delayMs`, removing it after `durationMs`; for `chase` and `pounce`, update state mode at their delay. Install one `setInterval(checkAutonomousBehavior, 30_000)` after boot. The interval must call the scheduler with `Math.random()` only when an autonomous action is eligible, save `lastAutonomousAt` when an actual autonomous action occurs, and render automatic sleep without a bubble.

- [x] **Step 4: 用 CSS 实现安静、无声且不拦截鼠标的效果**

```css
#effects { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.effect.heart { animation: heart-rise 1.35s ease-out both; }
.effect.yarn-ball { animation: yarn-roll 1.5s ease-in-out both; }
```

Implement stretch, groom, chase, pounce, treat and heart keyframes. Every effect layer has `pointer-events: none`; action buttons retain existing hover-only visibility.

- [x] **Step 5: 运行渲染相关测试，确认通过**

Run: `npm test -- tests/animation-profile.test.ts tests/renderer-bundle.test.ts`

Expected: PASS and generated renderer bundle contains no `require(`.

The yarn button and temporary overlay are browser DOM behavior, so validate their visible sequence in Task 3's packaged-app manual checklist rather than coupling a unit test to the source text.

### Task 3: 保存拖动位置、完整回归与便携版打包

**Files:**
- Modify: `src/main.ts`
- Create: `src/shared/window-position.ts`
- Create: `tests/window-position.test.ts`
- Modify: `README-运行说明.md`

**Interfaces:**
- Consumes: extended persisted state, renderer's existing `save` IPC, and Electron's current window position.
- Produces: `withSavedWindowPosition(state, [x, y])`, saved window position after drag, and updated run instructions.

- [x] **Step 1: 先写会失败的位置保存测试**

```ts
expect(withSavedWindowPosition(state, [10.6, 20.2])).toMatchObject({ x: 11, y: 20 });
```

- [x] **Step 2: 运行位置测试，确认导入缺失时失败**

Run: `npm test -- tests/window-position.test.ts`

Expected: FAIL because `window-position.ts` does not yet export the requested function.

- [x] **Step 3: 实现位置纯函数并在主进程拖动后保存**

Implement `withSavedWindowPosition(state, [x, y])` by returning `{ ...state, x: Math.round(x), y: Math.round(y) }`. After `windowRef.setPosition`, call `windowRef.getPosition()`, assign `petState = withSavedWindowPosition(petState, position)`, then call `saveState(petState)`. Ensure reset position also persists the calculated reset position.

- [x] **Step 4: 更新运行说明并运行全量验证**

Document the silent behavior and all five active interactions. Run:

```powershell
npm.cmd test -- --run
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dist:portable
```

Expected: all tests, TypeScript compilation, bundle and portable Windows EXE build complete successfully.

- [ ] **Step 5: 人工验收清单**

Launch `release\\爆爆桌面宠物.exe`: hover for the four controls; verify feed shows treat then hearts, yarn runs its sequence, sleep wakes on click, drag then restart retains its position, and no sound plays.
