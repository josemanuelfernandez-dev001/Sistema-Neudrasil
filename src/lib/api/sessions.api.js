/**
 * Sessions API Module
 */

export const sessionsAPI = {
  async getByPatient(patientId) {
    if (window.electronAPI) {
      return await window.electronAPI.getSessions(patientId);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async getById(id) {
    if (window.electronAPI) {
      return await window.electronAPI.getSession(id);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async create(sessionData) {
    if (window.electronAPI) {
      return await window.electronAPI.createSession(sessionData);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async end(id, summary) {
    if (window.electronAPI) {
      return await window.electronAPI.endSession(id, summary);
    }
    return { success: false, error: 'Electron API not available' };
  }
};
