const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const contextMenu = require('electron-context-menu');
const windowStateManager = require('electron-window-state');
const serve = require('electron-serve');

const dev = !app.isPackaged;
const serveURL = serve({ directory: 'build' });

let mainWindow;

// Disable context menu features
contextMenu({
  showInspectElement: false,
  showSaveImageAs: false,
  showCopyImage: false,
  showSearchWithGoogle: false,
});

function createWindow() {
  const windowState = windowStateManager({
    defaultWidth: 1280,
    defaultHeight: 720,
  });

  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    backgroundColor: 'whitesmoke',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: dev,
    },
  });

  windowState.manage(mainWindow);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer crashed. Restarting...');
    if (!mainWindow.isDestroyed()) mainWindow.destroy();
    createWindow();
  });

  // Block common exit shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      (input.key === 'F4' && input.alt) ||
      (input.key === 'W' && input.control) ||
      (input.key === 'Q' && input.meta)
    ) {
      event.preventDefault();
    }
  });

  if (dev) {
    loadVite(5173);
  } else {
    serveURL(mainWindow);
  }
}

function loadVite(port) {
  mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
    setTimeout(() => loadVite(port), 200);
  });
}

// IPC
ipcMain.on('to-main', (event, count) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('from-main', count + 1);
});

// Lifecycle
app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
