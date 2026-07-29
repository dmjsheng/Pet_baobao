# 爆爆桌面宠物

暖色 Q 版暹罗猫「爆爆」的 Windows 透明悬浮桌面宠物。可拖动、始终置顶；点击抚摸，悬停后可喂食、陪伴或睡觉。

**版本：V1.0** · 本地运行 · 不联网 · 不上传数据 · 不自动开机启动

仓库：[github.com/dmjsheng/Pet_baobao](https://github.com/dmjsheng/Pet_baobao)

## 功能

- 透明无边框窗口，默认靠屏幕右下，始终置顶，可拖动
- 点击本体抚摸；鼠标悬停显示「喂食 / 陪伴 / 睡觉」
- 右键菜单：重置位置、退出
- 中文气泡随互动变化
- 窗口位置与亲密度等状态保存在当前 Windows 用户本地目录

## 快速开始（便携版）

1. 在 [Releases · V1.0](https://github.com/dmjsheng/Pet_baobao/releases/tag/V1.0) 下载 `爆爆桌面宠物.exe`
2. 双击运行（也可复制到其他 Windows 10/11 电脑直接用）
3. 右键宠物 → 退出

无需安装 Node.js，也无需安装包。

若你本地已有构建产物，也可进入 `release` 目录双击同名 EXE。

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

## 范围（V1.0）

本期不包含：联网同步、语音/摄像头、真实喂食提醒、多宠物、开机自启动、手机端。

## License

个人项目。素材与角色形象仅供本仓库用途；请勿擅自商用他人宠物形象。
