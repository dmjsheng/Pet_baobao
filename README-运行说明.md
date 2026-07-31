# 爆爆桌面宠物

这是爆爆的 Windows 桌面宠物工程。它是透明悬浮窗口：可拖动、始终置顶，点击爆爆可抚摸；悬停后可喂食、陪伴、玩毛线球或睡觉；右键可重置位置或退出。所有互动状态仅保存在当前 Windows 用户的本地应用数据目录，不联网、不上传照片、不自动开机启动。

## 安静陪伴行为

- 全程静音，不播放猫叫、提示音或系统通知。
- 第三版起提供多组透明逐帧动画；第四版新增端坐陪伴与蜷睡姿势。
- 点击「陪伴」会切换端正坐姿并缓慢眨眼；点击「睡觉」会蜷成一团闭眼，再点一次醒来。
- 睡着时抚摸、喂食、陪伴或玩毛线球，会先唤醒再响应互动；自主睡眠与重启后恢复睡眠也会显示蜷睡姿势。
- 喂食时爆爆会完整地看零食、伸爪、低头吃、满足眯眼，再出现两颗小爱心。
- 玩毛线球时爆爆会按帧追球、扑跃，再回头看你。
- 用户互动后的 15 分钟内保持安静；自主小动作之间至少相隔 8 分钟。
- 20 分钟没有互动会自动睡觉；点击爆爆或选择任意互动即可唤醒。
- 拖动后的桌面位置、亲密度和睡眠/冷却状态会保存到当前 Windows 用户的本地应用数据目录。

## 日常运行（便携版）

进入 `release` 目录双击 `爆爆桌面宠物.exe`。它是单文件 portable 版本，复制这个 EXE 到笔记本或另一台台式机即可运行。

## 重新构建

在 `source` 目录运行：

```powershell
npm.cmd install
npm.cmd run dist:portable
```

产物会覆盖 `release\爆爆桌面宠物.exe`。

## 开发验证

```powershell
cd E:\Pet_baobao\source
npm.cmd test -- --run
npm.cmd run typecheck
npm.cmd run build
```

## 目录说明

- `source`：Electron + TypeScript 源码、单元测试与构建配置。
- `assets\baobao\baobao.png`：从爆爆照片生成并抠图后的透明主视觉。
- `assets\baobao\frames`：逐帧动画资源（含端坐、蜷睡等）；随便携版一同复制，移植时不需要额外下载。
- `assets\baobao\sheets`：生成帧的原始序列图，便于后续重新裁切或调整。
- `work\hatch-run`：动画精灵图生成工作目录；不随应用运行。
- `docs`：设计与实现计划。
- `qa`：完整动画精灵图完成后会存放校验产物。

## 版本

当前发布版为 **V1.4**。完整说明与下载见根目录 [README.md](./README.md) 与 [GitHub Releases](https://github.com/dmjsheng/Pet_baobao/releases)。
