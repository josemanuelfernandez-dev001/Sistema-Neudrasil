const { ipcMain } = require('electron');
const websocketService = require('../services/websocket.service');
const logger = require('../utils/logger');

/**
 * Unity Controller
 * Handles Unity-specific IPC communications
 */
class UnityController {
  /**
   * Register IPC handlers
   */
  register() {
    // Get Unity connection status
    ipcMain.handle('unity:getStatus', async (event) => {
      try {
        const connectedClients = Array.from(websocketService.clients.values());
        return {
          success: true,
          data: {
            isConnected: connectedClients.length > 0,
            clientCount: connectedClients.length,
            clients: connectedClients.map(client => ({
              id: client.id,
              connectedAt: client.connectedAt,
              sessionId: client.sessionId
            }))
          }
        };
      } catch (error) {
        logger.error('Error getting Unity status:', error);
        return { success: false, error: error.message };
      }
    });

    // Send message to Unity
    ipcMain.handle('unity:sendMessage', async (event, { clientId, message }) => {
      try {
        if (clientId) {
          websocketService.sendToClient(clientId, message);
        } else {
          websocketService.broadcast(message);
        }
        
        return { success: true };
      } catch (error) {
        logger.error('Error sending message to Unity:', error);
        return { success: false, error: error.message };
      }
    });

    // Start game
    ipcMain.handle('unity:startGame', async (event, gameData) => {
      try {
        websocketService.broadcast({
          type: 'START_GAME',
          gameId: gameData.gameId,
          sessionId: gameData.sessionId,
          config: gameData.config
        });
        
        logger.info(`Game start command sent: ${gameData.gameId}`);
        return { success: true };
      } catch (error) {
        logger.error('Error starting game:', error);
        return { success: false, error: error.message };
      }
    });

    // Stop game
    ipcMain.handle('unity:stopGame', async (event, sessionId) => {
      try {
        websocketService.broadcast({
          type: 'STOP_GAME',
          sessionId
        });
        
        logger.info(`Game stop command sent for session: ${sessionId}`);
        return { success: true };
      } catch (error) {
        logger.error('Error stopping game:', error);
        return { success: false, error: error.message };
      }
    });

    // Pause game
    ipcMain.handle('unity:pauseGame', async (event, sessionId) => {
      try {
        websocketService.broadcast({
          type: 'PAUSE_GAME',
          sessionId
        });
        
        logger.info(`Game pause command sent for session: ${sessionId}`);
        return { success: true };
      } catch (error) {
        logger.error('Error pausing game:', error);
        return { success: false, error: error.message };
      }
    });

    // Resume game
    ipcMain.handle('unity:resumeGame', async (event, sessionId) => {
      try {
        websocketService.broadcast({
          type: 'RESUME_GAME',
          sessionId
        });
        
        logger.info(`Game resume command sent for session: ${sessionId}`);
        return { success: true };
      } catch (error) {
        logger.error('Error resuming game:', error);
        return { success: false, error: error.message };
      }
    });

    logger.info('Unity controller registered');
  }
}

module.exports = new UnityController();
