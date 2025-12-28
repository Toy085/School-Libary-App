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
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      pin_hash TEXT,
      verified INTEGER DEFAULT 0,
      admin INTEGER DEFAULT 0,
      library_card_number TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      ISBN TEXT UNIQUE NOT NULL,
      borrowed_at TEXT,
      returned_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
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

// --- ADMIN: USER MANAGEMENT ---

// Fetch all users
ipcMain.handle('admin:get-users', async () => {
    return db.prepare('SELECT id, name, email, verified, admin FROM users').all();
});

// Verify a user
ipcMain.handle('admin:verify-user', async (event, userId) => {
    db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(userId);
    return { success: true };
});

// Make user an admin
ipcMain.handle('admin:make-admin', async (event, userId) => {
    db.prepare('UPDATE users SET admin = 1 WHERE id = ?').run(userId);
    return { success: true };
});

// Delete a user
ipcMain.handle('admin:delete-user', async (event, userId) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return { success: true };
});

// --- ADMIN: BOOK MANAGEMENT ---

// Fetch all books (with borrower info if joined)
ipcMain.handle('admin:get-books', async () => {
    // Adjust table/column names if they differ in your DB
    return db.prepare(`
        SELECT b.*, u.name as user_name, u.email as user_email 
        FROM books b 
        LEFT JOIN users u ON b.user_id = u.id
    `).all();
});

// Return a book
ipcMain.handle('admin:return-book', async (event, bookId) => {
    db.prepare('UPDATE books SET user_id = NULL, borrowed_at = NULL WHERE id = ?').run(bookId);
    return { success: true };
});

// Delete a book
ipcMain.handle('admin:delete-book', async (event, bookId) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);
    return { success: true };
});

// --- EXTERNAL API: OpenLibrary ---
ipcMain.handle('api:openlibrary', async (event, query) => {
    try {
        // We add the 'fields' parameter back in to ensure 'isbn' is included in the response
        const fields = "title,author_name,publisher,first_publish_year,cover_i,isbn";
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=${fields}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return { error: 'Open Library API error' };
        }
        
        return await response.json();
    } catch (err) {
        return { error: err.message };
    }
});

// --- LOCAL DB: Borrow & Return ---
ipcMain.handle('db:get-books', async () => {
    return db.prepare('SELECT * FROM books').all();
});

ipcMain.handle('db:borrow-book', async (event, { bookId, userId, userName }) => {
    try {
        const now = new Date().toISOString();
        db.prepare(`
            UPDATE books 
            SET user_id = ?, user_name = ?, borrowed_at = ?, returned_at = NULL 
            WHERE id = ?
        `).run(userId, userName, now, bookId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('db:return-book', async (event, bookId) => {
    try {
        const now = new Date().toISOString();
        db.prepare(`
            UPDATE books 
            SET user_id = NULL, returned_at = ? 
            WHERE id = ?
        `).run(now, bookId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('db:borrow-new-book', async (event, { title, author, year, ISBN, userId, userName }) => {
    try {
        const now = new Date().toISOString();
        
        // 1. Check if the book already exists in our library
        let book = db.prepare('SELECT id FROM books WHERE ISBN = ?').get(ISBN);
        
        if (!book) {
            // 2. If it's a new book from OpenLibrary, insert it first
            const info = db.prepare(`
                INSERT INTO books (title, author, year, ISBN, user_id, borrowed_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(title, author, year, ISBN, userId, now);
            
            return { success: true };
        } else {
            // 3. If book exists, check if it's already borrowed
            const existing = db.prepare('SELECT user_id FROM books WHERE ISBN = ?').get(ISBN);
            if (existing.user_id) {
                return { success: false, error: "This book is already borrowed by someone else." };
            }

            // 4. Update existing book to be borrowed
            db.prepare(`
                UPDATE books 
                SET user_id = ?, borrowed_at = ?, returned_at = NULL 
                WHERE ISBN = ?
            `).run(userId, now, ISBN);
            
            return { success: true };
        }
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
