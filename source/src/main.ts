import { app, BrowserWindow, Menu, ipcMain, screen } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sanitizePersistedState } from './shared/persistence';
import type { PersistedPetState } from './shared/types';

const defaultState = (): PersistedPetState => ({ x: -1, y: -1, affection: 0, lastInteractionAt: Date.now(), sleeping: false });
const stateFile = () => join(app.getPath('userData'), 'baobao-state.json');
const loadState = (): PersistedPetState => {
  try {
    if (!existsSync(stateFile())) return defaultState();
    return sanitizePersistedState(JSON.parse(readFileSync(stateFile(), 'utf8'))) ?? defaultState();
  } catch {
    return defaultState();
  }
};
const saveState = (state: PersistedPetState) => writeFileSync(stateFile(), JSON.stringify(state), 'utf8');

let windowRef: BrowserWindow | null = null;
let petState = defaultState();

function initialPosition(): [number, number] {
  const area = screen.getPrimaryDisplay().workArea;
  if (petState.x >= 0 && petState.y >= 0) return [petState.x, petState.y];
  return [area.x + area.width - 390, area.y + area.height - 430];
}

function createWindow(): void {
  petState = loadState();
  const [x, y] = initialPosition();
  windowRef = new BrowserWindow({
    width: 360,
    height: 410,
    x,
    y,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: { preload: join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  windowRef.setMenuBarVisibility(false);
  void windowRef.loadFile(join(__dirname, 'renderer', 'index.html'));
  windowRef.on('closed', () => { windowRef = null; });
}

app.whenReady().then(() => {
  ipcMain.handle('baobao:load', () => petState);
  ipcMain.handle('baobao:asset-url', () => {
    const root = app.isPackaged ? join(process.resourcesPath, 'assets') : join(__dirname, '..', '..', 'assets');
    return pathToFileURL(join(root, 'baobao', 'baobao.png')).toString();
  });
  ipcMain.on('baobao:save', (_event, candidate: unknown) => {
    const safe = sanitizePersistedState(candidate);
    if (!safe) return;
    petState = safe;
    saveState(safe);
  });
  ipcMain.on('baobao:drag', (_event, delta: { x: number; y: number }) => {
    if (!windowRef || !Number.isFinite(delta?.x) || !Number.isFinite(delta?.y)) return;
    const [x, y] = windowRef.getPosition();
    windowRef.setPosition(Math.round(x + delta.x), Math.round(y + delta.y));
  });
  ipcMain.on('baobao:menu', () => {
    const menu = Menu.buildFromTemplate([
      { label: '显示/隐藏操作条', click: () => windowRef?.webContents.send('baobao:toggle-controls') },
      { label: '重置位置', click: () => { petState = { ...petState, x: -1, y: -1 }; saveState(petState); windowRef?.setPosition(...initialPosition()); } },
      { type: 'separator' },
      { label: '退出爆爆', click: () => app.quit() },
    ]);
    menu.popup({ window: windowRef ?? undefined });
  });
  createWindow();
});

app.on('window-all-closed', () => app.quit());
