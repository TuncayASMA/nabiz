const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('kota', {
  get: () => ipcRenderer.invoke('kota:get'),
  refresh: () => ipcRenderer.invoke('kota:refresh'),
  settings: patch => ipcRenderer.invoke('kota:settings', patch),
  hide: () => ipcRenderer.invoke('kota:hide'),
  quit: () => ipcRenderer.invoke('kota:quit'),
  open: id => ipcRenderer.invoke('kota:open', id),
  login: id => ipcRenderer.invoke('kota:login', id),
  elevenKey: key => ipcRenderer.invoke('kota:eleven-key', key),
  onState: callback => { const listener = (_event, value) => callback(value); ipcRenderer.on('kota:state', listener); return () => ipcRenderer.removeListener('kota:state', listener); },
});
