# 爆爆桌面宠物

这是爆爆的 Windows 桌面宠物工程。完整说明见根目录 [README.md](./README.md)。

## 日常运行（便携版）

进入 `release` 目录双击 `爆爆桌面宠物.exe`，或从 GitHub Releases（V1.0）下载同名 EXE。单文件 portable，复制到其他 Windows 电脑即可运行。

## 重新构建

```powershell
cd source
npm.cmd install
npm.cmd run dist:portable
```

产物会覆盖 `release\爆爆桌面宠物.exe`。

## 开发验证

```powershell
cd source
npm.cmd test -- --run
npm.cmd run typecheck
npm.cmd run build
```
