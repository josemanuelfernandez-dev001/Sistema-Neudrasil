/**
 * Messages API Module
 */

export const messagesAPI = {
  async getAll() {
    if (window.electronAPI) {
      return await window.electronAPI.getMessages();
    }
    return { success: false, error: 'Electron API not available' };
  },

  async getConversation(userId) {
    if (window.electronAPI) {
      return await window.electronAPI.getConversation(userId);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async send(messageData) {
    if (window.electronAPI) {
      return await window.electronAPI.sendMessage(messageData);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async markAsRead(messageId) {
    if (window.electronAPI) {
      return await window.electronAPI.markAsRead(messageId);
    }
    return { success: false, error: 'Electron API not available' };
  }
};
