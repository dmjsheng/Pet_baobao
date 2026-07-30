# 爆爆桌面宠物

暖色 Q 版暹罗猫「爆爆」的 Windows 透明悬浮桌面宠物。可拖动、始终置顶；点击抚摸，悬停后可喂食、玩毛线球、陪伴或睡觉。

**版本：V1.1** · 安静陪伴 · 全程静音 · 本地运行 · 不联网 · 不上传数据 · 不自动开机启动

仓库：[github.com/dmjsheng/Pet_baobao](https://github.com/dmjsheng/Pet_baobao)

## 功能

- 透明无边框窗口，默认靠屏幕右下，始终置顶，可拖动；拖动后位置会保存
- 点击本体抚摸；鼠标悬停显示「喂食 / 玩毛线球 / 陪伴 / 睡觉」
- 右键菜单：重置位置、退出
- 中文气泡随互动变化
- 窗口位置与亲密度等状态保存在当前 Windows 用户本地目录；旧版本状态自动兼容

### V1.1 新增

- **喂食**：零食出现 → 开心跳跃 → 两颗爱心
- **玩毛线球**：毛线球滚入 → 追逐 → 扑跃 → 回头看你
- **安静陪伴**：互动后 15 分钟不主动打扰；自主动作间隔至少 8 分钟
- **自动睡觉**：20 分钟未互动会自动睡觉；点击或主动互动会醒来
- **全程静音**：无猫叫、提示音或系统通知

## 快速开始（便携版）

1. 在 [Releases · V1.1](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.1) 下载 `Baobao-Desktop-Pet-V1.1.exe`
2. 双击运行（也可复制到其他 Windows 10/11 电脑直接用）
3. 右键宠物 → 退出

无需安装 Node.js，也无需安装包。

本地重新构建后，产物文件名为 `release\爆爆桌面宠物.exe`。

历史版本：[V1.0](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.0)

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
| `assets/baobao/` | 角色主视觉与 `pet.json` |
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
