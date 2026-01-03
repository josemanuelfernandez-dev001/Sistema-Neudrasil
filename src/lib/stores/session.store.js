import { writable } from 'svelte/store';

function createSessionStore() {
  const { subscribe, set, update } = writable({
    currentSession: null,
    sessions: [],
    vrData: [],
    aiAnalyses: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    async createSession(sessionData) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.createSession(sessionData);
          
          if (result.success) {
            update(state => ({
              ...state,
              currentSession: result.data,
              sessions: [...state.sessions, result.data]
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error creating session:', error);
        throw error;
      }
    },
    
    async endSession(id, summary) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.endSession(id, summary);
          
          if (result.success) {
            update(state => ({
              ...state,
              currentSession: null,
              sessions: state.sessions.map(s => 
                s.id === id ? result.data : s
              )
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error ending session:', error);
        throw error;
      }
    },
    
    async loadSessions(patientId) {
      update(state => ({ ...state, loading: true }));
      
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getSessions(patientId);
          
          if (result.success) {
            update(state => ({
              ...state,
              sessions: result.data,
              loading: false
            }));
          }
        }
      } catch (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
      }
    },
    
    addVRData(data) {
      update(state => ({
        ...state,
        vrData: [...state.vrData, data]
      }));
    },
    
    addAIAnalysis(analysis) {
      update(state => ({
        ...state,
        aiAnalyses: [...state.aiAnalyses, analysis]
      }));
    },
    
    clearCurrentSession() {
      update(state => ({
        ...state,
        currentSession: null,
        vrData: [],
        aiAnalyses: []
      }));
    }
  };
}

export const sessionStore = createSessionStore();
