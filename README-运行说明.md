# 爆爆桌面宠物

这是爆爆的 Windows 桌面宠物工程。它是透明悬浮窗口：可拖动、始终置顶，点击爆爆可抚摸；悬停后可喂食、陪伴、玩毛线球或睡觉；右键可重置位置或退出。所有互动状态仅保存在当前 Windows 用户的本地应用数据目录，不联网、不上传照片、不自动开机启动。

## 安静陪伴行为

- 全程静音，不播放猫叫、提示音或系统通知。
- 喂食后会出现小零食、开心跳跃和两颗小爱心。
- 玩毛线球时会依次追球、扑跃，再回头看你。
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
- `work\hatch-run`：动画精灵图生成工作目录；不随应用运行。
- `docs`：设计与实现计划。
- `qa`：完整动画精灵图完成后会存放校验产物。

## 版本

当前发布版为 **V1.1**。完整说明与下载见根目录 [README.md](./README.md) 与 [GitHub Releases](https://github.com/dmjsheng/Pet_baobao/releases)。
