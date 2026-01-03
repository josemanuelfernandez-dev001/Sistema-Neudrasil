import { writable } from 'svelte/store';

function createMessagesStore() {
  const { subscribe, set, update } = writable({
    messages: [],
    conversations: [],
    unreadCount: 0,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    async loadMessages() {
      update(state => ({ ...state, loading: true }));
      
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getMessages();
          
          if (result.success) {
            update(state => ({
              ...state,
              messages: result.data,
              loading: false
            }));
          }
        }
      } catch (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
      }
    },
    
    async sendMessage(messageData) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.sendMessage(messageData);
          
          if (result.success) {
            update(state => ({
              ...state,
              messages: [...state.messages, result.data]
            }));
            return result.data;
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    
    async markAsRead(messageId) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.markAsRead(messageId);
          
          update(state => ({
            ...state,
            messages: state.messages.map(m =>
              m.id === messageId ? { ...m, read: true } : m
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };
}

export const messagesStore = createMessagesStore();
