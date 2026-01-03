const { ipcMain } = require('electron');
const databaseService = require('../services/database.service');
const websocketService = require('../services/websocket.service');
const logger = require('../utils/logger');

/**
 * Session Controller
 * Handles all therapy session-related IPC communications
 */
class SessionController {
  /**
   * Register IPC handlers
   */
  register() {
    // Get sessions by patient
    ipcMain.handle('sessions:getByPatient', async (event, patientId) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('TherapySession')
          .select(`
            *,
            patient:patientId(id, name),
            doctor:doctorId(id, name),
            vrData:VRData(count),
            aiAnalyses:AIAnalysis(*)
          `)
          .eq('patientId', patientId)
          .order('startTime', { ascending: false });

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        logger.error('Error getting sessions:', error);
        return { success: false, error: error.message };
      }
    });

    // Get session by ID
    ipcMain.handle('sessions:getById', async (event, id) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('TherapySession')
          .select(`
            *,
            patient:patientId(*),
            doctor:doctorId(*),
            vrData:VRData(*),
            aiAnalyses:AIAnalysis(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        logger.error('Error getting session:', error);
        return { success: false, error: error.message };
      }
    });

    // Create session
    ipcMain.handle('sessions:create', async (event, sessionData) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('TherapySession')
          .insert({
            patientId: sessionData.patientId,
            doctorId: sessionData.doctorId,
            gameId: sessionData.gameId,
            status: 'ACTIVE',
            notes: sessionData.notes
          })
          .select()
          .single();

        if (error) throw error;
        
        logger.info(`Session created: ${data.id}`);
        
        // Send SESSION_START message to Unity via WebSocket
        websocketService.broadcast({
          type: 'SESSION_START',
          sessionId: data.id,
          patientId: sessionData.patientId,
          doctorId: sessionData.doctorId,
          gameId: sessionData.gameId
        });
        
        return { success: true, data };
      } catch (error) {
        logger.error('Error creating session:', error);
        return { success: false, error: error.message };
      }
    });

    // End session
    ipcMain.handle('sessions:end', async (event, { id, summary }) => {
      try {
        const supabase = databaseService.getSupabase();
        
        // Get session start time to calculate duration
        const { data: session } = await supabase
          .from('TherapySession')
          .select('startTime')
          .eq('id', id)
          .single();

        const duration = session 
          ? Math.floor((new Date() - new Date(session.startTime)) / 1000)
          : null;

        const { data, error } = await supabase
          .from('TherapySession')
          .update({
            status: 'COMPLETED',
            endTime: new Date().toISOString(),
            duration,
            notes: summary?.notes
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        logger.info(`Session ended: ${id}`);
        
        // Notify Unity via WebSocket
        websocketService.broadcast({
          type: 'SESSION_END_ACK',
          sessionId: id
        });
        
        return { success: true, data };
      } catch (error) {
        logger.error('Error ending session:', error);
        return { success: false, error: error.message };
      }
    });

    logger.info('Session controller registered');
  }
}

module.exports = new SessionController();
