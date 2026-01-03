const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

const databaseService = require('./services/database.service');
const websocketService = require('./services/websocket.service');
const authService = require('./services/auth.service');
const logger = require('./utils/logger');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services...');
    
    await databaseService.init();
    logger.info('Database service initialized');
    
    await websocketService.init(mainWindow);
    logger.info('WebSocket service initialized');
    
    await authService.init();
    logger.info('Auth service initialized');
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
}

app.whenReady().then(async () => {
  await initializeServices();
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

app.on('before-quit', async () => {
  logger.info('Application closing, cleaning up...');
  await websocketService.shutdown();
  await databaseService.shutdown();
});

// Export mainWindow for use in services
module.exports = { getMainWindow: () => mainWindow };
