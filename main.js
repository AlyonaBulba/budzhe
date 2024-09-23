const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

// Создаем базу данных
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS phrases (id INTEGER PRIMARY KEY, phrase TEXT)');
});

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL('https://budzhe.netlify.app/'); // Замените на нужный URL

    // Закрытие базы данных при закрытии окна
    mainWindow.on('closed', () => {
        db.close();
        mainWindow = null;
    });
}

// Обработчик для сохранения фразы в базу данных
ipcMain.on('save-phrase', (event, phrase) => {
    db.run('INSERT INTO phrases (phrase) VALUES (?)', [phrase], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Saved: ${phrase}`);
        }
    });
});

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
