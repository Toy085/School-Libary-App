// electron.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const contextMenu = require('electron-context-menu');
const windowStateManager = require('electron-window-state');
const serve = require('electron-serve');

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;

let mainWindow; // global reference

// Disable context menu features for kiosk
contextMenu({
    showInspectElement: false,
    showSaveImageAs: false,
    showCopyImage: false,
    showSearchWithGoogle: false,
});

// Create the main window
function createWindow() {
    const windowState = windowStateManager({
        defaultWidth: 1280,
        defaultHeight: 720,
    });

    // Assign to global mainWindow
    mainWindow = new BrowserWindow({
        fullscreen: true,
        kiosk: true,
        frame: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        backgroundColor: 'whitesmoke',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            devTools: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },/*
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,*/
    });;
    windowState.manage(mainWindow);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
		mainWindow.maximize();
		mainWindow.setFullScreen(true);
    });

    // Auto-restart if renderer crashes
    mainWindow.webContents.on('crashed', () => {
        console.error('Renderer crashed. Restarting...');
        mainWindow.destroy();
        createWindow();
    });

    // Prevent manual closing
    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.show();
    });

    // Load URL
    if (dev) {
        loadVite(port);
    } else {
        serveURL(mainWindow);
    }
}

// Load Vite dev server (with retry if not ready)
function loadVite(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
        console.log('Error loading URL, retrying...', e);
        setTimeout(() => loadVite(port), 200);
    });
}

// Safe IPC handling
ipcMain.on('to-main', (event, count) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
        console.error('Main window not ready.');
        return;
    }
    mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});

// Disable common keyboard shortcuts to prevent exit
app.on('browser-window-focus', () => {
    if (!mainWindow) return;
    mainWindow.webContents.on('before-input-event', (event, input) => {
        // Block Alt+F4, Ctrl+W, Cmd+Q
        if ((input.key === 'F4' && input.alt) ||
            (input.key === 'W' && input.control) ||
            (input.key === 'Q' && input.meta)) {
            event.preventDefault();
        }
    });
});

// App lifecycle
app.on('ready', createWindow);

app.on('activate', () => {
    if (!mainWindow) createWindow();
});

app.on('window-all-closed', () => {
    // In kiosk mode, this should never happen
    if (process.platform !== 'darwin') app.quit();
});
