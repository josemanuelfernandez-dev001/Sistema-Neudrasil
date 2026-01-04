const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

const databaseService = require('./services/database.service');
const websocketService = require('./services/websocket.service');
const authService = require('./services/auth.service');
const logger = require('./utils/logger');

let mainWindow;

function createWindow() {
  console.log('Creating window...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:  false,
      contextIsolation: true,
      webSecurity: true,
    }
  });

// Configurar CSP
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ... details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "connect-src 'self' http://localhost:* ws://localhost:* https://qcnzpifxzuqpuxsszxjx.supabase.co;"
        ]
      }
    });
  });


  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  const url = isDev ? 'http://localhost:5173' : path.join(__dirname, '../build/index.html');

  console.log(`Loading URL: ${url}`);
  console.log(`Is development: ${isDev}`);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully! ');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services.. .');

    await databaseService. init();
    await websocketService.init(mainWindow);
    await authService.init();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
}

// ============================================
// IPC HANDLERS
// ============================================

// Auth handlers
ipcMain.handle('auth:getCurrentUser', async () => {
  try {
    const user = await authService.getCurrentUser();
    return { success: true, data: user };
  } catch (error) {
    logger.error('Error getting current user:', error);
    return { success:  false, error: error.message };
  }
});

ipcMain.handle('auth:login', async (event, credentials) => {
  try {
    const result = await authService.login(credentials);
    return { success: true, data: result };
  } catch (error) {
    logger.error('Error during login:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:logout', async () => {
  try {
    await authService.logout();
    return { success: true };
  } catch (error) {
    logger.error('Error during logout:', error);
    return { success: false, error: error.message };
  }
});

// Patient handlers
ipcMain.handle('patients:getAll', async () => {
  try {
    const patients = await databaseService.supabase
        .from('Patient')
        .select('*')
        .order('createdAt', { ascending: false });
    return { success: true, data: patients. data };
  } catch (error) {
    logger.error('Error getting patients:', error);
    return { success: false, error:  error.message };
  }
});

ipcMain.handle('patients:getById', async (event, id) => {
  try {
    const patient = await databaseService. supabase
        .from('Patient')
        .select('*')
        .eq('id', id)
        .single();
    return { success: true, data: patient. data };
  } catch (error) {
    logger.error('Error getting patient:', error);
    return { success: false, error:  error.message };
  }
});

ipcMain.handle('patients:create', async (event, data) => {
  try {
    const patient = await databaseService.supabase
        .from('Patient')
        .insert(data)
        .select()
        .single();
    return { success: true, data: patient.data };
  } catch (error) {
    logger.error('Error creating patient:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('patients:update', async (event, { id, data }) => {
  try {
    const patient = await databaseService.supabase
        .from('Patient')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    return { success:  true, data: patient.data };
  } catch (error) {
    logger.error('Error updating patient:', error);
    return { success: false, error: error. message };
  }
});

ipcMain.handle('patients:delete', async (event, id) => {
  try {
    await databaseService.supabase
        .from('Patient')
        .delete()
        .eq('id', id);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting patient:', error);
    return { success:  false, error: error.message };
  }
});

// Session handlers
ipcMain.handle('sessions:getByPatient', async (event, patientId) => {
  try {
    const sessions = await databaseService.supabase
        .from('TherapySession')
        .select('*')
        .eq('patientId', patientId)
        .order('startTime', { ascending: false });
    return { success: true, data:  sessions.data };
  } catch (error) {
    logger.error('Error getting sessions:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sessions:getById', async (event, id) => {
  try {
    const session = await databaseService.supabase
        .from('TherapySession')
        .select('*')
        .eq('id', id)
        .single();
    return { success: true, data: session.data };
  } catch (error) {
    logger.error('Error getting session:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sessions:create', async (event, data) => {
  try {
    const session = await databaseService.supabase
        .from('TherapySession')
        .insert(data)
        .select()
        .single();
    return { success: true, data: session.data };
  } catch (error) {
    logger.error('Error creating session:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sessions:end', async (event, { id, summary }) => {
  try {
    const session = await databaseService.supabase
        .from('TherapySession')
        .update({
          endTime: new Date().toISOString(),
          summary:  summary
        })
        .eq('id', id)
        .select()
        .single();
    return { success:  true, data: session.data };
  } catch (error) {
    logger.error('Error ending session:', error);
    return { success: false, error: error. message };
  }
});

// Message handlers
ipcMain.handle('messages:getAll', async () => {
  try {
    const messages = await databaseService. supabase
        .from('Message')
        .select('*')
        .order('timestamp', { ascending: false });
    return { success: true, data:  messages.data };
  } catch (error) {
    logger.error('Error getting messages:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('messages:getConversation', async (event, userId) => {
  try {
    const messages = await databaseService.supabase
        .from('Message')
        .select('*')
        .or(`senderId. eq.${userId},receiverId.eq.${userId}`)
        .order('timestamp', { ascending: true });
    return { success: true, data: messages.data };
  } catch (error) {
    logger.error('Error getting conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('messages:send', async (event, data) => {
  try {
    const message = await databaseService.supabase
        .from('Message')
        .insert(data)
        .select()
        .single();
    return { success: true, data: message. data };
  } catch (error) {
    logger.error('Error sending message:', error);
    return { success: false, error:  error.message };
  }
});

ipcMain.handle('messages:markAsRead', async (event, messageId) => {
  try {
    const message = await databaseService.supabase
        .from('Message')
        .update({ read: true })
        .eq('id', messageId)
        .select()
        .single();
    return { success:  true, data: message.data };
  } catch (error) {
    logger.error('Error marking message as read:', error);
    return { success: false, error:  error.message };
  }
});

// Document handlers
ipcMain.handle('documents:upload', async (event, data) => {
  try {
    const document = await databaseService.supabase
        .from('Document')
        .insert(data)
        .select()
        .single();
    return { success: true, data: document.data };
  } catch (error) {
    logger.error('Error uploading document:', error);
    return { success: false, error: error. message };
  }
});

ipcMain.handle('documents:getByPatient', async (event, patientId) => {
  try {
    const documents = await databaseService.supabase
        . from('Document')
        .select('*')
        .eq('patientId', patientId)
        .order('uploadedAt', { ascending: false });
    return { success: true, data: documents.data };
  } catch (error) {
    logger.error('Error getting documents:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('documents:delete', async (event, id) => {
  try {
    await databaseService.supabase
        .from('Document')
        .delete()
        .eq('id', id);
    return { success: true };
  } catch (error) {
    logger.error('Error deleting document:', error);
    return { success: false, error: error.message };
  }
});

// Database handlers (genérico)
ipcMain.handle('db:query', async (event, { table, method, data }) => {
  try {
    const result = await databaseService[method](table, data);
    return { success: true, data: result };
  } catch (error) {
    logger.error('Database query error:', error);
    return { success: false, error: error. message };
  }
});

// WebSocket handlers
ipcMain.handle('websocket:getStatus', async () => {
  try {
    const status = websocketService.getStatus();
    return { success: true, data:  status };
  } catch (error) {
    return { success:  false, error: error.message };
  }
});

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(async () => {
  await initializeServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow. getAllWindows().length === 0) {
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