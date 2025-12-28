const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const contextMenu = require('electron-context-menu');
const windowStateManager = require('electron-window-state');
const serve = require('electron-serve');

const dev = !app.isPackaged;
const serveURL = serve({ directory: '.' });

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
    kiosk: false, // Set to true to enable kiosk mode
    frame: true, // Set to false for a frameless window
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
    //mainWindow.webContents.openDevTools();
  } else {
    serveURL(mainWindow);
    //mainWindow.webContents.openDevTools();
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

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs'); // You have this in package.json

// Initialize DB in a writable location
const dbPath = path.join(app.getPath('userData'), 'library.db');
const db = new Database(dbPath);

// Ensure Table exists
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password_hash TEXT,
        verified INTEGER DEFAULT 0,
        admin INTEGER DEFAULT 0
    );
`);

// 1. Handle Registration
ipcMain.handle('auth:register', async (event, { name, email, password }) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Check if this is the first user (make them admin)
        const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
        const isAdmin = userCount === 0 ? 1 : 0;
        const isVerified = isAdmin; // Auto-verify the first admin

        const stmt = db.prepare('INSERT INTO users (name, email, password_hash, admin, verified) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(name, email, hashedPassword, isAdmin, isVerified);
        
        return { success: true, admin: isAdmin, verified: isVerified };
    } catch (err) {
        return { success: false, error: err.message.includes('UNIQUE') ? 'Email already exists' : err.message };
    }
});

// 2. Handle Login
ipcMain.handle('auth:login', async (event, { email, password }) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return { success: false, error: 'User not found' };

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return { success: false, error: 'Incorrect password' };

        return { 
            success: true, 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            verified: user.verified, 
            admin: user.admin 
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Lifecycle
app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
