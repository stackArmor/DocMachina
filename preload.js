const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Pack operations
    getPacks: () => ipcRenderer.invoke('get-packs'),
    getIntakes: (packFolder) => ipcRenderer.invoke('get-intakes', packFolder),
    getOtherIntakes: (packFolder) => ipcRenderer.invoke('get-other-intakes', packFolder),
    
    // File reading operations
    readIntake: (intakePath) => ipcRenderer.invoke('read-intake', intakePath),
    readTemplate: (templatePath) => ipcRenderer.invoke('read-template', templatePath),
    
    // Document saving
    saveDocument: (filename, content) => ipcRenderer.invoke('save-document', { filename, content }),
    
    // Folder operations
    openCustomersFolder: () => ipcRenderer.invoke('open-customers-folder'),
    
    // Storage operations (replacing localStorage)
    storageGet: (key) => ipcRenderer.invoke('storage-get', key),
    storageSet: (key, value) => ipcRenderer.invoke('storage-set', key, value),
    storageRemove: (key) => ipcRenderer.invoke('storage-remove', key),
    storageGetAllKeys: () => ipcRenderer.invoke('storage-get-all-keys'),
    storageClear: () => ipcRenderer.invoke('storage-clear')
});
