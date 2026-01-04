import { writable } from 'svelte/store';

function createWebSocketStore() {
  const { subscribe, set, update } = writable({
    isConnected: false,
    clients: [],
    lastMessage: null,
    error: null
  });

  return {
    subscribe,
    
    setConnected(connected) {
      update(state => ({
        ...state,
        isConnected: connected
      }));
    },
    
    setClients(clients) {
      update(state => ({
        ...state,
        clients
      }));
    },
    
    setLastMessage(message) {
      update(state => ({
        ...state,
        lastMessage: message
      }));
    },
    
    setError(error) {
      update(state => ({
        ...state,
        error
      }));
    }
  };
}

export const websocketStore = createWebSocketStore();
