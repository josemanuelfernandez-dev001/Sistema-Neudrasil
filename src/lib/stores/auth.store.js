import { writable } from 'svelte/store';

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    async login(email, password) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.login({ email, password });
          
          if (result.success) {
            set({
              user: result.data.user,
              token: result.data.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
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
        throw error;
      }
    },
    
    async logout() {
      if (window.electronAPI) {
        await window.electronAPI.logout();
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    },
    
    async checkAuth() {
      if (window.electronAPI) {
        const result = await window.electronAPI.getCurrentUser();
        if (result.success && result.data) {
          set({
            user: result.data,
            token: null,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        }
      }
    }
  };
}

export const authStore = createAuthStore();
