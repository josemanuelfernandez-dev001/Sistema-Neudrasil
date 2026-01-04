/**
 * IPC Renderer utility
 * Provides type-safe access to Electron IPC
 */

export const ipcRenderer = {
  // Check if Electron API is available
  isAvailable() {
    return typeof window !== 'undefined' && window.electronAPI;
  },

  // Auth methods
  auth: {
    login: (credentials) => window.electronAPI?.login(credentials),
    logout: () => window.electronAPI?.logout(),
    getCurrentUser: () => window.electronAPI?.getCurrentUser()
  },

  // Patient methods
  patients: {
    getAll: () => window.electronAPI?.getPatients(),
    getById: (id) => window.electronAPI?.getPatient(id),
    create: (data) => window.electronAPI?.createPatient(data),
    update: (id, data) => window.electronAPI?.updatePatient(id, data),
    delete: (id) => window.electronAPI?.deletePatient(id)
  },

  // Session methods
  sessions: {
    getByPatient: (patientId) => window.electronAPI?.getSessions(patientId),
    getById: (id) => window.electronAPI?.getSession(id),
    create: (data) => window.electronAPI?.createSession(data),
    end: (id, summary) => window.electronAPI?.endSession(id, summary)
  },

  // Message methods
  messages: {
    getAll: () => window.electronAPI?.getMessages(),
    getConversation: (userId) => window.electronAPI?.getConversation(userId),
    send: (data) => window.electronAPI?.sendMessage(data),
    markAsRead: (messageId) => window.electronAPI?.markAsRead(messageId)
  },

  // Document methods
  documents: {
    upload: (data) => window.electronAPI?.uploadDocument(data),
    getByPatient: (patientId) => window.electronAPI?.getDocuments(patientId),
    delete: (id) => window.electronAPI?.deleteDocument(id)
  },

  // Event listeners
  on: {
    vrData: (callback) => window.electronAPI?.onVRData(callback),
    vrDataProcessed: (callback) => window.electronAPI?.onVRDataProcessed(callback),
    sessionUpdate: (callback) => window.electronAPI?.onSessionUpdate(callback),
    unityConnected: (callback) => window.electronAPI?.onUnityConnected(callback),
    unityDisconnected: (callback) => window.electronAPI?.onUnityDisconnected(callback)
  },

  // Remove listeners
  removeAllListeners: (channel) => window.electronAPI?.removeAllListeners(channel)
};
