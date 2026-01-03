/**
 * Documents API Module
 */

export const documentsAPI = {
  async upload(fileData) {
    if (window.electronAPI) {
      return await window.electronAPI.uploadDocument(fileData);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async getByPatient(patientId) {
    if (window.electronAPI) {
      return await window.electronAPI.getDocuments(patientId);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async delete(id) {
    if (window.electronAPI) {
      return await window.electronAPI.deleteDocument(id);
    }
    return { success: false, error: 'Electron API not available' };
  }
};
