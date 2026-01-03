/**
 * Patients API Module
 */

export const patientsAPI = {
  async getAll() {
    if (window.electronAPI) {
      return await window.electronAPI.getPatients();
    }
    return { success: false, error: 'Electron API not available' };
  },

  async getById(id) {
    if (window.electronAPI) {
      return await window.electronAPI.getPatient(id);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async create(patientData) {
    if (window.electronAPI) {
      return await window.electronAPI.createPatient(patientData);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async update(id, patientData) {
    if (window.electronAPI) {
      return await window.electronAPI.updatePatient(id, patientData);
    }
    return { success: false, error: 'Electron API not available' };
  },

  async delete(id) {
    if (window.electronAPI) {
      return await window.electronAPI.deletePatient(id);
    }
    return { success: false, error: 'Electron API not available' };
  }
};
