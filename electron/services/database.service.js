const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');
const config = require('../config/database.config');
const SyncManager = require('../utils/sync');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.sqlite = null;
    this.syncManager = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connections
   */
  async init() {
    try {
      logger.info('Initializing database service...');

      // Initialize Supabase client
      this.supabase = createClient(
        config.supabase.url,
        config.supabase.anonKey
      );
      logger.info('Supabase client initialized');

      // Initialize SQLite database
      const dbDir = path.dirname(config.sqlite.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.sqlite = new Database(config.sqlite.path);
      this.initializeSQLiteTables();
      logger.info('SQLite database initialized');

      // Initialize sync manager
      this.syncManager = new SyncManager(this.supabase, this.sqlite);
      this.syncManager.startAutoSync(config.sync.interval);
      logger.info('Sync manager initialized');

      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Initialize SQLite tables for offline storage
   */
  initializeSQLiteTables() {
    // Create tables matching Prisma schema
    const schema = `
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        diagnosis TEXT,
        medicalHistory TEXT,
        contactInfo TEXT,
        assignedDoctorId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS therapy_sessions (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        doctorId TEXT NOT NULL,
        gameId TEXT NOT NULL,
        status TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        duration INTEGER,
        notes TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vr_data (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        dataType TEXT NOT NULL,
        rawData TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        tableName TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `;

    this.sqlite.exec(schema);
    logger.info('SQLite tables initialized');
  }

  /**
   * Get Supabase client
   */
  getSupabase() {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }
    return this.supabase;
  }

  /**
   * Get SQLite client
   */
  getSQLite() {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }
    return this.sqlite;
  }

  /**
   * Execute query with fallback to SQLite if offline
   */
  async query(table, operation, data = {}) {
    try {
      // Try Supabase first
      const isOnline = await this.syncManager.checkConnection();
      
      if (isOnline) {
        return await this.executeSupabaseQuery(table, operation, data);
      } else {
        logger.warn('Offline - using SQLite and queuing for sync');
        return await this.executeSQLiteQuery(table, operation, data);
      }
    } catch (error) {
      logger.error('Query failed:', error);
      // Fallback to SQLite
      return await this.executeSQLiteQuery(table, operation, data);
    }
  }

  /**
   * Execute Supabase query
   */
  async executeSupabaseQuery(table, operation, data) {
    switch (operation) {
      case 'SELECT':
        return await this.supabase.from(table).select(data.select || '*');
      case 'INSERT':
        return await this.supabase.from(table).insert(data.values);
      case 'UPDATE':
        return await this.supabase.from(table).update(data.values).eq('id', data.id);
      case 'DELETE':
        return await this.supabase.from(table).delete().eq('id', data.id);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Execute SQLite query
   */
  async executeSQLiteQuery(table, operation, data) {
    // Add to sync queue for later
    if (operation !== 'SELECT') {
      this.syncManager.addToQueue({
        type: operation,
        table,
        data: data.values,
        id: data.id
      });
    }

    // Execute locally (simplified - in production would need full SQL generation)
    return { data: [], error: null };
  }

  /**
   * Shutdown database connections
   */
  async shutdown() {
    try {
      logger.info('Shutting down database service...');
      
      if (this.syncManager) {
        this.syncManager.stopAutoSync();
        await this.syncManager.processQueue(); // Final sync
      }
      
      if (this.sqlite) {
        this.sqlite.close();
      }
      
      this.isInitialized = false;
      logger.info('Database service shut down successfully');
    } catch (error) {
      logger.error('Error shutting down database service:', error);
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();
