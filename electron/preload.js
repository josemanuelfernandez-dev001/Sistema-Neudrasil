const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),

  // Patients
  getPatients: () => ipcRenderer.invoke('patients:getAll'),
  getPatient: (id) => ipcRenderer.invoke('patients:getById', id),
  createPatient: (data) => ipcRenderer.invoke('patients:create', data),
  updatePatient: (id, data) => ipcRenderer.invoke('patients:update', { id, data }),
  deletePatient: (id) => ipcRenderer.invoke('patients:delete', id),

  // Sessions
  getSessions: (patientId) => ipcRenderer.invoke('sessions:getByPatient', patientId),
  getSession: (id) => ipcRenderer.invoke('sessions:getById', id),
  createSession: (data) => ipcRenderer.invoke('sessions:create', data),
  endSession: (id, summary) => ipcRenderer.invoke('sessions:end', { id, summary }),

  // Messages
  getMessages: () => ipcRenderer.invoke('messages:getAll'),
  getConversation: (userId) => ipcRenderer.invoke('messages:getConversation', userId),
  sendMessage: (data) => ipcRenderer.invoke('messages:send', data),
  markAsRead: (messageId) => ipcRenderer.invoke('messages:markAsRead', messageId),

  // Documents
  uploadDocument: (data) => ipcRenderer.invoke('documents:upload', data),
  getDocuments: (patientId) => ipcRenderer.invoke('documents:getByPatient', patientId),
  deleteDocument: (id) => ipcRenderer.invoke('documents:delete', id),

  // WebSocket events from Unity
  onVRData: (callback) => {
    ipcRenderer.on('vr-data-received', (event, data) => callback(data));
  },
  onVRDataProcessed: (callback) => {
    ipcRenderer.on('vr-data-processed', (event, data) => callback(data));
  },
  onSessionUpdate: (callback) => {
    ipcRenderer.on('session-update', (event, data) => callback(data));
  },
  onUnityConnected: (callback) => {
    ipcRenderer.on('unity-connected', (event, data) => callback(data));
  },
  onUnityDisconnected: (callback) => {
    ipcRenderer.on('unity-disconnected', (event, data) => callback(data));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
