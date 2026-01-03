const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const databaseService = require('./database.service');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');
require('dotenv').config();

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

class FileService {
  constructor() {
    this.supabase = null;
    this.localStoragePath = path.join(__dirname, '../../database/files');
    this.isInitialized = false;
  }

  /**
   * Initialize file service
   */
  async init() {
    try {
      logger.info('Initializing file service...');

      // Initialize Supabase client for storage
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      // Ensure local storage directory exists
      await fs.mkdir(this.localStoragePath, { recursive: true });

      this.isInitialized = true;
      logger.info('File service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize file service:', error);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(fileData) {
    try {
      const { patientId, fileName, fileType, buffer, uploadedById } = fileData;

      // Validate file
      this.validateFile(fileName, fileType, buffer.length);

      const fileId = this.generateFileId();
      const fileExtension = path.extname(fileName);
      const storageName = `${fileId}${fileExtension}`;

      let fileUrl;
      let storageLocation;

      try {
        // Try to upload to Supabase
        const { data, error } = await this.supabase.storage
          .from('patient-documents')
          .upload(`${patientId}/${storageName}`, buffer, {
            contentType: fileType,
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = this.supabase.storage
          .from('patient-documents')
          .getPublicUrl(`${patientId}/${storageName}`);

        fileUrl = urlData.publicUrl;
        storageLocation = 'SUPABASE';
        logger.info(`File uploaded to Supabase: ${storageName}`);
      } catch (error) {
        logger.warn('Supabase upload failed, using local storage:', error);
        
        // Fallback to local storage
        const localPath = await this.saveLocally(patientId, storageName, buffer);
        fileUrl = localPath;
        storageLocation = 'LOCAL';
      }

      // Save document metadata to database
      const db = databaseService.getSupabase();
      const { data: document, error: dbError } = await db
        .from('Document')
        .insert({
          patientId,
          fileName,
          fileType,
          fileSize: buffer.length,
          fileUrl,
          storageLocation,
          uploadedById
        })
        .select()
        .single();

      if (dbError) {
        logger.error('Error saving document metadata:', dbError);
        throw dbError;
      }

      logger.info(`Document uploaded successfully: ${fileName}`);
      return document;
    } catch (error) {
      logger.error('Upload file error:', error);
      throw error;
    }
  }

  /**
   * Download file
   */
  async downloadFile(documentId) {
    try {
      // Get document metadata
      const db = databaseService.getSupabase();
      const { data: document, error } = await db
        .from('Document')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found');
      }

      if (document.storageLocation === 'SUPABASE') {
        // Download from Supabase
        const filePath = document.fileUrl.split('/').slice(-2).join('/');
        const { data, error: downloadError } = await this.supabase.storage
          .from('patient-documents')
          .download(filePath);

        if (downloadError) throw downloadError;

        return {
          buffer: await data.arrayBuffer(),
          fileName: document.fileName,
          fileType: document.fileType
        };
      } else {
        // Read from local storage
        const buffer = await fs.readFile(document.fileUrl);
        return {
          buffer,
          fileName: document.fileName,
          fileType: document.fileType
        };
      }
    } catch (error) {
      logger.error('Download file error:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(documentId, userId) {
    try {
      // Get document metadata
      const db = databaseService.getSupabase();
      const { data: document, error } = await db
        .from('Document')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found');
      }

      // Delete from storage
      if (document.storageLocation === 'SUPABASE') {
        const filePath = document.fileUrl.split('/').slice(-2).join('/');
        await this.supabase.storage
          .from('patient-documents')
          .remove([filePath]);
      } else {
        await fs.unlink(document.fileUrl);
      }

      // Delete from database
      await db
        .from('Document')
        .delete()
        .eq('id', documentId);

      logger.info(`Document deleted: ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Get documents for patient
   */
  async getDocuments(patientId) {
    try {
      const db = databaseService.getSupabase();
      const { data, error } = await db
        .from('Document')
        .select('*')
        .eq('patientId', patientId)
        .order('createdAt', { ascending: false });

      if (error) {
        logger.error('Error fetching documents:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get documents error:', error);
      throw error;
    }
  }

  /**
   * Save file locally
   */
  async saveLocally(patientId, fileName, buffer) {
    const patientDir = path.join(this.localStoragePath, patientId);
    await fs.mkdir(patientDir, { recursive: true });
    
    const filePath = path.join(patientDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    return filePath;
  }

  /**
   * Validate file
   */
  validateFile(fileName, fileType, fileSize) {
    if (!fileName || fileName.trim() === '') {
      throw new Error('File name is required');
    }

    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new Error(`File type not allowed: ${fileType}`);
    }

    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return true;
  }

  /**
   * Generate unique file ID
   */
  generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get file info
   */
  async getFileInfo(documentId) {
    try {
      const db = databaseService.getSupabase();
      const { data, error } = await db
        .from('Document')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !data) {
        throw new Error('Document not found');
      }

      return data;
    } catch (error) {
      logger.error('Get file info error:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new FileService();
