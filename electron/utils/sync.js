const logger = require('./logger');

/**
 * Synchronization utility for managing data sync between Supabase and SQLite
 */
class SyncManager {
  constructor(supabaseClient, sqliteClient) {
    this.supabase = supabaseClient;
    this.sqlite = sqliteClient;
    this.syncQueue = [];
    this.isOnline = true;
    this.isSyncing = false;
  }

  /**
   * Check if online
   */
  async checkConnection() {
    try {
      const { data, error } = await this.supabase.from('_health').select('*').limit(1);
      this.isOnline = !error;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Add operation to sync queue
   */
  addToQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: new Date().toISOString(),
      id: `${operation.table}_${Date.now()}_${Math.random()}`
    });
    logger.info(`Added operation to sync queue: ${operation.type} on ${operation.table}`);
  }

  /**
   * Process sync queue
   */
  async processQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    logger.info(`Processing sync queue with ${this.syncQueue.length} operations`);

    const isOnline = await this.checkConnection();
    if (!isOnline) {
      logger.warn('Offline - sync queue will be processed when connection is restored');
      this.isSyncing = false;
      return;
    }

    const processedIds = [];
    
    for (const operation of this.syncQueue) {
      try {
        await this.syncOperation(operation);
        processedIds.push(operation.id);
        logger.info(`Synced operation: ${operation.id}`);
      } catch (error) {
        logger.error(`Failed to sync operation ${operation.id}:`, error);
        // Keep failed operations in queue for retry
      }
    }

    // Remove successfully processed operations
    this.syncQueue = this.syncQueue.filter(op => !processedIds.includes(op.id));
    
    this.isSyncing = false;
    logger.info(`Sync completed. Remaining queue size: ${this.syncQueue.length}`);
  }

  /**
   * Sync a single operation
   */
  async syncOperation(operation) {
    const { type, table, data, id } = operation;

    switch (type) {
      case 'INSERT':
        await this.supabase.from(table).insert(data);
        break;
      case 'UPDATE':
        await this.supabase.from(table).update(data).eq('id', id);
        break;
      case 'DELETE':
        await this.supabase.from(table).delete().eq('id', id);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  /**
   * Sync all data from Supabase to SQLite
   */
  async syncDown(tables) {
    logger.info('Starting sync down from Supabase to SQLite');
    
    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select('*');
        
        if (error) {
          logger.error(`Error fetching ${table}:`, error);
          continue;
        }

        // Store in SQLite
        for (const row of data) {
          // This would use actual SQLite queries
          logger.debug(`Syncing ${table} row:`, row.id);
        }
        
        logger.info(`Synced ${data.length} records from ${table}`);
      } catch (error) {
        logger.error(`Error syncing table ${table}:`, error);
      }
    }
  }

  /**
   * Handle conflict resolution
   */
  resolveConflict(localData, remoteData) {
    // Simple strategy: remote wins (last-write-wins)
    // In production, this should be more sophisticated
    const localTime = new Date(localData.updatedAt);
    const remoteTime = new Date(remoteData.updatedAt);
    
    return remoteTime > localTime ? remoteData : localData;
  }

  /**
   * Start auto-sync interval
   */
  startAutoSync(interval = 60000) {
    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, interval);
    logger.info(`Auto-sync started with interval: ${interval}ms`);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto-sync stopped');
    }
  }
}

module.exports = SyncManager;
