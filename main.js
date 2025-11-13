const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        autoHideMenuBar: true,  
		webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    
    // Open DevTools in development (comment out for production)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ========================================
// IPC HANDLERS FOR FILE SYSTEM OPERATIONS
// ========================================

// Get list of pack folders
ipcMain.handle('get-packs', async () => {
    try {
        const packsDir = path.join(__dirname, 'packs');
        
        // Ensure packs directory exists
        try {
            await fs.access(packsDir);
        } catch {
            await fs.mkdir(packsDir, { recursive: true });
            return [];
        }
        
        const entries = await fs.readdir(packsDir, { withFileTypes: true });
        const packs = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
        
        return packs;
    } catch (error) {
        console.error('Error reading packs directory:', error);
        return [];
    }
});

// Get intake files from a specific pack
ipcMain.handle('get-intakes', async (event, packFolder) => {
    try {
        const intakesDir = path.join(__dirname, 'packs', packFolder, 'intakes');
        
        try {
            await fs.access(intakesDir);
        } catch {
            console.log(`Intakes directory not found for pack: ${packFolder}`);
            return [];
        }
        
        const files = await fs.readdir(intakesDir);
        return files.filter(file => file.endsWith('.json'));
    } catch (error) {
        console.error(`Error reading intakes for pack ${packFolder}:`, error);
        return [];
    }
});

// Get "other" intake files from a specific pack
ipcMain.handle('get-other-intakes', async (event, packFolder) => {
    try {
        const otherIntakesDir = path.join(__dirname, 'packs', packFolder, 'otherintakes');
        
        try {
            await fs.access(otherIntakesDir);
        } catch {
            console.log(`Other intakes directory not found for pack: ${packFolder}`);
            return [];
        }
        
        const files = await fs.readdir(otherIntakesDir);
        return files.filter(file => file.endsWith('.json'));
    } catch (error) {
        console.error(`Error reading other intakes for pack ${packFolder}:`, error);
        return [];
    }
});

// Read a specific intake JSON file
ipcMain.handle('read-intake', async (event, intakePath) => {
    try {
        // Remove leading slash if present
        const cleanPath = intakePath.startsWith('/') ? intakePath.slice(1) : intakePath;
        const fullPath = path.join(__dirname, cleanPath);
        
        const content = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading intake file ${intakePath}:`, error);
        throw error;
    }
});

// Read a template file
ipcMain.handle('read-template', async (event, templatePath) => {
    try {
        const cleanPath = templatePath.startsWith('/') ? templatePath.slice(1) : templatePath;
        const fullPath = path.join(__dirname, cleanPath);
        
        const content = await fs.readFile(fullPath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`Error reading template file ${templatePath}:`, error);
        throw error;
    }
});

// Save a generated document
ipcMain.handle('save-document', async (event, { filename, content, customerName }) => {
    try {
        console.log('=== SAVE DOCUMENT CALLED ===');
        console.log('Filename:', filename);
        console.log('Customer Name:', customerName);
        console.log('Content length:', content?.length);
        console.log('__dirname:', __dirname);
        
        // Create a customers directory in the app folder
        const customersDir = path.join(__dirname, 'customers');
        console.log('Customers directory:', customersDir);
        
        try {
            await fs.access(customersDir);
            console.log('Customers directory exists');
        } catch {
            console.log('Creating customers directory...');
            await fs.mkdir(customersDir, { recursive: true });
            console.log('Customers directory created');
        }
        
        // Create customer-specific subfolder
        let customerFolder = customersDir;
        if (customerName) {
            // Sanitize customer name for use in folder name
            const sanitizedName = customerName.replace(/[^a-z0-9_-]/gi, '_');
            customerFolder = path.join(customersDir, sanitizedName);
            console.log('Customer folder:', customerFolder);
            
            try {
                await fs.access(customerFolder);
                console.log('Customer folder exists');
            } catch {
                console.log('Creating customer folder...');
                await fs.mkdir(customerFolder, { recursive: true });
                console.log('Customer folder created');
            }
        }
        
        // Handle duplicate filenames
        let finalFilename = filename;
        let filePath = path.join(customerFolder, finalFilename);
        let counter = 1;
        
        // Parse filename into name and extension
        const ext = path.extname(filename);
        const nameWithoutExt = filename.slice(0, -ext.length);
        
        // Check if file exists and increment counter
        while (fsSync.existsSync(filePath)) {
            finalFilename = `${nameWithoutExt}_${counter}${ext}`;
            filePath = path.join(customerFolder, finalFilename);
            counter++;
        }
        
        if (counter > 1) {
            console.log(`File exists, using versioned name: ${finalFilename}`);
        }
        
        console.log('Full file path:', filePath);
        
        await fs.writeFile(filePath, content, 'utf-8');
        console.log('File written successfully!');
        
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Error saving document:', error);
        return { success: false, error: error.message };
    }
});

// Open the customers folder in file explorer
ipcMain.handle('open-customers-folder', async () => {
    try {
        const customersDir = path.join(__dirname, 'customers');
        
        // Create the directory if it doesn't exist
        if (!fsSync.existsSync(customersDir)) {
            await fs.mkdir(customersDir, { recursive: true });
        }
        
        // Open the folder in the system's file explorer
        await shell.openPath(customersDir);
        return { success: true };
    } catch (error) {
        console.error('Error opening customers folder:', error);
        return { success: false, error: error.message };
    }
});

// Storage operations (replacing localStorage)
const storageDir = path.join(app.getPath('userData'), 'customer-data');

// Initialize storage directory if it doesn't exist
function initStorage() {
    if (!fsSync.existsSync(storageDir)) {
        fsSync.mkdirSync(storageDir, { recursive: true });
    }
}

// Helper function to get file path for a storage key
function getStorageFilePath(key) {
    // Sanitize the key to create a safe filename
    const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
    return path.join(storageDir, `${safeKey}.json`);
}

ipcMain.handle('storage-get', async (event, key) => {
    try {
        initStorage();
        const filePath = getStorageFilePath(key);
        
        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return null; // File doesn't exist
        }
        
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (error) {
        console.error('Error reading storage:', error);
        return null;
    }
});

ipcMain.handle('storage-set', async (event, key, value) => {
    try {
        initStorage();
        const filePath = getStorageFilePath(key);
        await fs.writeFile(filePath, value, 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing storage:', error);
        return false;
    }
});

ipcMain.handle('storage-remove', async (event, key) => {
    try {
        initStorage();
        const filePath = getStorageFilePath(key);
        
        // Check if file exists before trying to delete
        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        } catch {
            // File doesn't exist, which is fine
        }
        
        return true;
    } catch (error) {
        console.error('Error removing from storage:', error);
        return false;
    }
});

ipcMain.handle('storage-get-all-keys', async () => {
    try {
        initStorage();
        const files = await fs.readdir(storageDir);
        
        // Convert filenames back to keys (remove .json extension)
        const keys = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        
        return keys;
    } catch (error) {
        console.error('Error getting all storage keys:', error);
        return [];
    }
});

ipcMain.handle('storage-clear', async () => {
    try {
        initStorage();
        const files = await fs.readdir(storageDir);
        
        // Delete all JSON files
        for (const file of files) {
            if (file.endsWith('.json')) {
                await fs.unlink(path.join(storageDir, file));
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
});
