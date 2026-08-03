# 爆爆桌面宠物

暖色 Q 版暹罗猫「爆爆」的 Windows 透明悬浮桌面宠物。可拖动、始终置顶；点击抚摸（可随机伸懒腰 / 洗脸），悬停后可喂食、踩奶、陪伴或睡觉。

**版本：V1.6** · 点击互动丰富 · 分段变速节奏 · 踩奶 · 端坐陪伴 · 蜷睡 · 全程静音

仓库：[github.com/dmjsheng/Pet_baobao](https://github.com/dmjsheng/Pet_baobao)

## 功能

- 透明无边框窗口，默认靠屏幕右下，始终置顶，可拖动；拖动后位置会保存
- 点击本体可触发摇头蹭蹭、伸懒腰或洗脸；鼠标悬停显示「喂食 / 踩奶 / 陪伴 / 睡觉」
- 右键菜单：重置位置、退出
- 中文气泡随互动变化
- 窗口位置与亲密度等状态保存在当前 Windows 用户本地目录；旧版本状态自动兼容
- 全程静音；互动后 15 分钟不主动打扰；自主动作间隔至少 8 分钟；20 分钟未互动自动睡觉

### V1.6 更新

点击宠物时增加伸懒腰与洗脸两种互动；并优化现有动作帧播放节奏，让互动更从容、自然：

- 摇头互动由约 0.84 秒调整为约 1.6 秒
- 伸展动作约 1.9 秒，关键姿势停留更自然
- 洗脸动作约 1.85 秒，减少过快切换的突兀感
- 踩奶动作约 2.42 秒，节奏更轻柔
- 四组动作改用「分段变速」：起止更缓，中间关键帧适度停留
- 保持第二版暖色 Q 版视觉与现有帧画面风格

### 近期版本

- **V1.5**：踩奶互动替换毛线球，稳定动作帧比例
- **V1.4**：端坐陪伴、蜷睡姿势与唤醒逻辑
- **V1.3**：修复闲置眨眼晃动与头顶碎片

## 快速开始（便携版）

1. 在 [Releases · V1.6](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.6) 下载 `Baobao-Desktop-Pet-V1.6.exe`
2. 双击运行（也可复制到其他 Windows 10/11 电脑直接用）
3. 右键宠物 → 退出

无需安装 Node.js，也无需安装包。

本地重新构建后，产物文件名为 `release\爆爆桌面宠物.exe`。

历史版本：[V1.5](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.5) · [V1.4](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.4) · [V1.3](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.3) · [V1.1](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.1) · [V1.0](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.0)

## 从源码构建

环境：Windows + Node.js（建议 18+）

```powershell
cd source
npm.cmd install
npm.cmd run dist:portable
```

产物输出为 `release\爆爆桌面宠物.exe`。

### 开发验证

```powershell
cd source
npm.cmd test -- --run
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `source/` | Electron + TypeScript 源码、测试与构建配置 |
| `assets/baobao/frames/` | 逐帧动画 PNG（含伸懒腰、洗脸、踩奶、端坐、蜷睡等） |
| `assets/baobao/sheets/` | 序列图源，便于重新裁切 |
| `docs/` | 设计与实现计划 |
| `release/` | 本地构建输出（便携 EXE；仓库内通常不提交） |
| `work/` | 素材/动画生成等工作目录（不随应用运行，不提交） |

## 技术栈

- Electron（透明置顶窗口）
- TypeScript
- 本地 HTML / CSS / Canvas 渲染
- electron-builder（Windows portable）

## 隐私

互动状态仅写入当前用户的本地应用数据目录。应用不联网、不上传照片、不采集遥测。

## 范围

不包含：联网同步、语音/摄像头、真实喂食提醒、多宠物、开机自启动、手机端、音效。

## License

个人项目。素材与角色形象仅供本仓库用途；请勿擅自商用他人宠物形象。
