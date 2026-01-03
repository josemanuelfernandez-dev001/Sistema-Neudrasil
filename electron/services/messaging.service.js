const databaseService = require('./database.service');
const logger = require('../utils/logger');

class MessagingService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize messaging service
   */
  async init() {
    try {
      logger.info('Initializing messaging service...');
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize messaging service:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { data, error } = await supabase
        .from('Message')
        .insert({
          senderId,
          receiverId,
          content,
          read: false
        })
        .select()
        .single();

      if (error) {
        logger.error('Error sending message:', error);
        throw error;
      }

      logger.info(`Message sent from ${senderId} to ${receiverId}`);
      return data;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Get all messages for a user
   */
  async getMessages(userId) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { data, error } = await supabase
        .from('Message')
        .select(`
          *,
          sender:senderId(*),
          receiver:receiverId(*)
        `)
        .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
        .order('createdAt', { ascending: false });

      if (error) {
        logger.error('Error fetching messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * Get conversation between two users
   */
  async getConversation(user1Id, user2Id) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { data, error } = await supabase
        .from('Message')
        .select('*')
        .or(`and(senderId.eq.${user1Id},receiverId.eq.${user2Id}),and(senderId.eq.${user2Id},receiverId.eq.${user1Id})`)
        .order('createdAt', { ascending: true });

      if (error) {
        logger.error('Error fetching conversation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get conversation error:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { data, error } = await supabase
        .from('Message')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiverId', userId)
        .select()
        .single();

      if (error) {
        logger.error('Error marking message as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { count, error } = await supabase
        .from('Message')
        .select('*', { count: 'exact', head: true })
        .eq('receiverId', userId)
        .eq('read', false);

      if (error) {
        logger.error('Error getting unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    try {
      const supabase = databaseService.getSupabase();
      
      // Only allow deletion if user is sender
      const { error } = await supabase
        .from('Message')
        .delete()
        .eq('id', messageId)
        .eq('senderId', userId);

      if (error) {
        logger.error('Error deleting message:', error);
        throw error;
      }

      logger.info(`Message deleted: ${messageId}`);
      return true;
    } catch (error) {
      logger.error('Delete message error:', error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(userId, query) {
    try {
      const supabase = databaseService.getSupabase();
      
      const { data, error } = await supabase
        .from('Message')
        .select('*')
        .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
        .ilike('content', `%${query}%`)
        .order('createdAt', { ascending: false });

      if (error) {
        logger.error('Error searching messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Search messages error:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new MessagingService();
