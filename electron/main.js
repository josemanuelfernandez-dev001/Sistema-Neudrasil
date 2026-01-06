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
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow loading from localhost in development
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
          "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co;"
        ]
      }
    });
  });

  // Load the app
  const isDevelopment = process.env.NODE_ENV === 'development';
  console.log('Loading URL:  http://localhost:5173');
  console.log('Is development:', isDevelopment);

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully! ');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services.. .');

    await databaseService.init();

    await websocketService.init(mainWindow);

    await authService.init();

    // Register IPC handlers
    registerIPCHandlers();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
}

// Register all IPC handlers
function registerIPCHandlers() {
  // ============ AUTH HANDLERS ============
  ipcMain.handle('auth:login', async (event, credentials) => {
    try {
      logger.info(`Login attempt for:  ${credentials.email}`);
      const result = await authService.login(credentials. email, credentials.password);
      return { success: true, data: result };
    } catch (error) {
      logger.error('Error during login:', error. message);
      return { success:  false, error: error.message };
    }
  });

  ipcMain.handle('auth:logout',async (event) => {
    try {
      await authService.logout();
      return { success: true };
    } catch (error) {
      logger.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('auth:getCurrentUser', async(event) => {
    try {
      const user = authService.getCurrentUser();
      // Serializa el usuario para evitar errores de clonación
      return {
        success: true,
        data: user ?  JSON.parse(JSON.stringify(user)) : null
      };
    } catch (error) {
      logger.error('Error getting current user:', error);
      return { success: false, error: error. message };
    }
  });

  // ============ PATIENTS HANDLERS ============
  ipcMain.handle('patients:getAll', async (event) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .order('name', { ascending: true });

      if (error) throw error;
      return { success:  true, data };
    } catch (error) {
      logger.error('Error getting patients:', error);
      return { success: false, error: error. message };
    }
  });

  ipcMain.handle('patients:getById', async (event, id) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .eq('id', id)
          .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error getting patient:', error);
      return { success: false, error: error. message };
    }
  });

  ipcMain.handle('patients:create', async (event, patientData) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Patient')
          .insert(patientData)
          .select()
          .single();

      if (error) throw error;
      logger.info(`Patient created: ${data.id}`);
      return { success: true, data };
    } catch (error) {
      logger.error('Error creating patient:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('patients:update', async (event, { id, data:  patientData }) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Patient')
          .update(patientData)
          .eq('id', id)
          .select()
          .single();

      if (error) throw error;
      logger.info(`Patient updated: ${id}`);
      return { success: true, data };
    } catch (error) {
      logger.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('patients:delete', async (event, id) => {
    try {
      const supabase = databaseService. getSupabase();
      const { error } = await supabase
          .from('Patient')
          .delete()
          .eq('id', id);

      if (error) throw error;
      logger.info(`Patient deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
  });

  // ============ SESSIONS HANDLERS ============
  ipcMain.handle('sessions:getByPatient', async (event, patientId) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          . from('TherapySession')
          .select('*')
          .eq('patientId', patientId)
          .order('startTime', { ascending: false });

      if (error) throw error;
      return { success:  true, data };
    } catch (error) {
      logger.error('Error getting sessions:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('sessions:getById', async (event, id) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('TherapySession')
          .select('*')
          .eq('id', id)
          .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error getting session:', error);
      return { success:  false, error: error.message };
    }
  });

  ipcMain.handle('sessions:create', async (event, sessionData) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('TherapySession')
          .insert(sessionData)
          .select()
          .single();

      if (error) throw error;
      logger.info(`Session created: ${data.id}`);
      return { success: true, data };
    } catch (error) {
      logger.error('Error creating session:', error);
      return { success: false, error:  error.message };
    }
  });

  ipcMain.handle('sessions:end', async (event, { id, summary }) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('TherapySession')
          .update({
            endTime: new Date().toISOString(),
            summary,
            status: 'COMPLETED'
          })
          .eq('id', id)
          .select()
          .single();

      if (error) throw error;
      logger.info(`Session ended: ${id}`);
      return { success: true, data };
    } catch (error) {
      logger.error('Error ending session:', error);
      return { success: false, error: error.message };
    }
  });

  // ============ MESSAGES HANDLERS ============
  ipcMain.handle('messages:getAll', async (event) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Message')
          .select('*')
          .order('timestamp', { ascending: false });

      if (error) throw error;
      return { success:  true, data };
    } catch (error) {
      logger.error('Error getting messages:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('messages:send', async (event, messageData) => {
    try {
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          . from('Message')
          .insert(messageData)
          .select()
          .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      logger.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  });

  // ============ FILE UPLOAD HANDLER ============
  ipcMain.handle('documents:upload', async (event, fileData) => {
    try {
      logger.info(`Uploading file: ${fileData.fileName}`);

      // Por ahora, solo guardamos metadata sin el archivo real
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
          .from('Document')
          .insert({
            patientId: fileData.patientId,
            fileName: fileData.fileName,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize || 0,
            fileUrl: 'local://pending',
            storageLocation: 'LOCAL',
            uploadedById: fileData.uploadedById || 1
          })
          .select()
          .single();

      if (error) throw error;
      logger.info(`Document uploaded:  ${data. id}`);
      return { success: true, data };
    } catch (error) {
      logger.error('Error uploading document:', error);
      return { success: false, error: error.message };
    }
  });

  logger.info('IPC handlers registered');
}

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
  await databaseService. shutdown();
});

module.exports = { getMainWindow:  () => mainWindow };