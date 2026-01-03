import { writable } from 'svelte/store';

function createPatientsStore() {
  const { subscribe, set, update } = writable({
    patients: [],
    currentPatient: null,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    async loadPatients() {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getPatients();
          
          if (result.success) {
            update(state => ({
              ...state,
              patients: result.data,
              loading: false
            }));
          } else {
            throw new Error(result.error);
          }
        }
      } catch (error) {
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message 
        }));
      }
    },
    
    async getPatient(id) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getPatient(id);
          
          if (result.success) {
            update(state => ({
              ...state,
              currentPatient: result.data
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error getting patient:', error);
      }
      return null;
    },
    
    async createPatient(patientData) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.createPatient(patientData);
          
          if (result.success) {
            update(state => ({
              ...state,
              patients: [...state.patients, result.data]
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
      }
    },
    
    async updatePatient(id, patientData) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.updatePatient(id, patientData);
          
          if (result.success) {
            update(state => ({
              ...state,
              patients: state.patients.map(p => 
                p.id === id ? result.data : p
              )
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error updating patient:', error);
        throw error;
      }
    },
    
    async deletePatient(id) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.deletePatient(id);
          
          if (result.success) {
            update(state => ({
              ...state,
              patients: state.patients.filter(p => p.id !== id)
            }));
          }
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
      }
    }
  };
}

export const patientsStore = createPatientsStore();
