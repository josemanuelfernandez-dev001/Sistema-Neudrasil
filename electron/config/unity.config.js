require('dotenv').config();

module.exports = {
  server: {
    port: process.env.WEBSOCKET_PORT || 8080,
    host: process.env.WEBSOCKET_HOST || 'localhost'
  },
  
  protocol: {
    version: '1.0.0',
    messageTypes: {
      SESSION_START: 'SESSION_START',
      SESSION_END: 'SESSION_END',
      VR_DATA: 'VR_DATA',
      HEARTBEAT: 'HEARTBEAT',
      ERROR: 'ERROR',
      ACK: 'ACK'
    }
  },
  
  connection: {
    pingInterval: 30000, // Send ping every 30 seconds
    pongTimeout: 5000,   // Expect pong within 5 seconds
    reconnectAttempts: 5,
    reconnectDelay: 3000
  },
  
  data: {
    maxBatchSize: 100,
    sendInterval: 100, // Send batched data every 100ms
    maxQueueSize: 1000
  },
  
  validation: {
    enabled: true,
    strictMode: true
  }
};
