import { contextBridge, ipcRenderer } from 'electron';
import type { PersistedPetState } from './shared/types';

contextBridge.exposeInMainWorld('baobao', {
  load: (): Promise<PersistedPetState> => ipcRenderer.invoke('baobao:load'),
  assetUrl: (): Promise<string> => ipcRenderer.invoke('baobao:asset-url'),
  save: (state: PersistedPetState): void => ipcRenderer.send('baobao:save', state),
  drag: (delta: { x: number; y: number }): void => ipcRenderer.send('baobao:drag', delta),
  menu: (): void => ipcRenderer.send('baobao:menu'),
  onToggleControls: (listener: () => void): void => { ipcRenderer.on('baobao:toggle-controls', listener); },
});
