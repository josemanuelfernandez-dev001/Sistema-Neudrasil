const WebSocket = require('ws');
const config = require('../config/unity.config');
const logger = require('../utils/logger');
const aiService = require('./ai.service');
const databaseService = require('./database.service');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.mainWindow = null;
    this.isInitialized = false;
  }

  /**
   * Initialize WebSocket server
   */
  async init(mainWindow) {
    try {
      this.mainWindow = mainWindow;
      
      this.wss = new WebSocket.Server({
        port: config.server.port,
        host: config.server.host
      });

      this.setupEventHandlers();
      
      logger.info(`WebSocket server started on ${config.server.host}:${config.server.port}`);
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize WebSocket service:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        id: clientId,
        connectedAt: new Date(),
        sessionId: null
      });

      logger.info(`Unity client connected: ${clientId}`);
      
      // Notify frontend
      if (this.mainWindow) {
        this.mainWindow.webContents.send('unity-connected', { clientId });
      }

      // Setup ping/pong for connection health
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle messages
      ws.on('message', async (data) => {
        await this.handleMessage(clientId, data);
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send acknowledgment
      this.sendToClient(clientId, {
        type: config.protocol.messageTypes.ACK,
        message: 'Connected to Neudrasil System'
      });
    });

    // Setup heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, config.connection.pingInterval);
  }

  /**
   * Handle incoming messages from Unity
   */
  async handleMessage(clientId, rawData) {
    try {
      const message = JSON.parse(rawData.toString());
      logger.debug(`Received message from ${clientId}:`, message.type);

      // Validate message
      if (config.validation.enabled) {
        this.validateMessage(message);
      }

      switch (message.type) {
        case config.protocol.messageTypes.SESSION_START:
          await this.handleSessionStart(clientId, message);
          break;

        case config.protocol.messageTypes.VR_DATA:
          await this.handleVRData(clientId, message);
          break;

        case config.protocol.messageTypes.SESSION_END:
          await this.handleSessionEnd(clientId, message);
          break;

        case config.protocol.messageTypes.HEARTBEAT:
          this.sendToClient(clientId, {
            type: config.protocol.messageTypes.ACK,
            timestamp: new Date().toISOString()
          });
          break;

        default:
          logger.warn(`Unknown message type: ${message.type}`);
          this.sendToClient(clientId, {
            type: config.protocol.messageTypes.ERROR,
            message: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      this.sendToClient(clientId, {
        type: config.protocol.messageTypes.ERROR,
        message: error.message
      });
    }
  }

  /**
   * Handle SESSION_START message
   */
  async handleSessionStart(clientId, message) {
    logger.info(`Session starting: ${message.sessionId}`);
    
    const client = this.clients.get(clientId);
    if (client) {
      client.sessionId = message.sessionId;
    }

    // Notify frontend
    if (this.mainWindow) {
      this.mainWindow.webContents.send('session-update', {
        type: 'SESSION_STARTED',
        sessionId: message.sessionId,
        data: message
      });
    }

    // Send acknowledgment
    this.sendToClient(clientId, {
      type: config.protocol.messageTypes.ACK,
      sessionId: message.sessionId,
      message: 'Session started successfully'
    });
  }

  /**
   * Handle VR_DATA message
   */
  async handleVRData(clientId, message) {
    try {
      const { sessionId, timestamp, dataType, data } = message;

      // Save raw VR data to database
      await databaseService.query('vr_data', 'INSERT', {
        values: {
          id: this.generateId(),
          sessionId,
          timestamp,
          dataType,
          rawData: JSON.stringify(data),
          createdAt: new Date().toISOString()
        }
      });

      // Notify frontend of raw data
      if (this.mainWindow) {
        this.mainWindow.webContents.send('vr-data-received', {
          sessionId,
          timestamp,
          dataType,
          data
        });
      }

      // Process with AI (async, don't block)
      this.processWithAI(sessionId, dataType, data);

    } catch (error) {
      logger.error('Error handling VR data:', error);
    }
  }

  /**
   * Process VR data with AI
   */
  async processWithAI(sessionId, dataType, data) {
    try {
      const analysis = await aiService.analyze(dataType, data);
      
      // Save AI analysis to database
      await databaseService.query('ai_analysis', 'INSERT', {
        values: {
          id: this.generateId(),
          sessionId,
          patientId: analysis.patientId,
          modelVersion: analysis.modelVersion,
          analysisResult: JSON.stringify(analysis.result),
          progressScore: analysis.score,
          recommendations: analysis.recommendations,
          anomalies: JSON.stringify(analysis.anomalies),
          createdAt: new Date().toISOString()
        }
      });

      // Notify frontend
      if (this.mainWindow) {
        this.mainWindow.webContents.send('vr-data-processed', {
          sessionId,
          timestamp: new Date().toISOString(),
          score: analysis.score,
          analysis
        });
      }
    } catch (error) {
      logger.error('Error processing with AI:', error);
    }
  }

  /**
   * Handle SESSION_END message
   */
  async handleSessionEnd(clientId, message) {
    logger.info(`Session ending: ${message.sessionId}`);

    // Update session in database
    await databaseService.query('therapy_sessions', 'UPDATE', {
      id: message.sessionId,
      values: {
        status: 'COMPLETED',
        endTime: new Date().toISOString(),
        duration: message.duration,
        notes: JSON.stringify(message.summary)
      }
    });

    // Notify frontend
    if (this.mainWindow) {
      this.mainWindow.webContents.send('session-update', {
        type: 'SESSION_ENDED',
        sessionId: message.sessionId,
        summary: message.summary
      });
    }

    // Send acknowledgment
    this.sendToClient(clientId, {
      type: config.protocol.messageTypes.ACK,
      sessionId: message.sessionId,
      message: 'Session ended successfully'
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      logger.info(`Unity client disconnected: ${clientId}`);
      
      // Notify frontend
      if (this.mainWindow) {
        this.mainWindow.webContents.send('unity-disconnected', {
          clientId,
          sessionId: client.sessionId
        });
      }

      this.clients.delete(clientId);
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(message) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Validate incoming message
   */
  validateMessage(message) {
    if (!message.type) {
      throw new Error('Message type is required');
    }

    // Add more validation as needed
    return true;
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `unity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown WebSocket server
   */
  async shutdown() {
    try {
      logger.info('Shutting down WebSocket service...');
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      // Close all client connections
      this.clients.forEach((client) => {
        client.ws.close();
      });
      this.clients.clear();

      // Close server
      if (this.wss) {
        this.wss.close();
      }

      this.isInitialized = false;
      logger.info('WebSocket service shut down successfully');
    } catch (error) {
      logger.error('Error shutting down WebSocket service:', error);
    }
  }
}

// Export singleton instance
module.exports = new WebSocketService();
