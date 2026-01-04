/**
 * Auth API Module
 * Wrapper around Electron IPC for authentication operations
 */

export const authAPI = {
  async login(credentials) {
    if (window.electronAPI) {
      return await window.electronAPI.login(credentials);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async logout() {
    if (window.electronAPI) {
      return await window.electronAPI.logout();
    }
    return { success: false, error: 'Electron API not available' };
  },

  async getCurrentUser() {
    if (window.electronAPI) {
      return await window.electronAPI.getCurrentUser();
    }
    return { success: false, error: 'Electron API not available' };
  }
};
