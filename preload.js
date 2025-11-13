const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Get list of pack folders
    getPacks: () => ipcRenderer.invoke('get-packs'),
    
    // Get intake files from a specific pack
    getIntakes: (packFolder) => ipcRenderer.invoke('get-intakes', packFolder),
    
    // Get "other" intake files from a specific pack
    getOtherIntakes: (packFolder) => ipcRenderer.invoke('get-other-intakes', packFolder),
    
    // Read a specific intake JSON file
    readIntake: (intakePath) => ipcRenderer.invoke('read-intake', intakePath),
    
    // Read a template file
    readTemplate: (templatePath) => ipcRenderer.invoke('read-template', templatePath),
    
    // Save a generated document - UPDATED to pass customerName
    saveDocument: (filename, content, customerName) => 
        ipcRenderer.invoke('save-document', { filename, content, customerName }),
    
    // Open the customers folder in file explorer
    openCustomersFolder: () => ipcRenderer.invoke('open-customers-folder'),
    
    // Storage operations (replacing localStorage)
    storageGet: (key) => ipcRenderer.invoke('storage-get', key),
    storageSet: (key, value) => ipcRenderer.invoke('storage-set', key, value),
    storageRemove: (key) => ipcRenderer.invoke('storage-remove', key),
    storageGetAllKeys: () => ipcRenderer.invoke('storage-get-all-keys'),
    storageClear: () => ipcRenderer.invoke('storage-clear')
});
