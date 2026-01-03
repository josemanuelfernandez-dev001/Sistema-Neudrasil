const { ipcMain } = require('electron');
const databaseService = require('../services/database.service');
const logger = require('../utils/logger');

/**
 * Patient Controller
 * Handles all patient-related IPC communications
 */
class PatientController {
  /**
   * Register IPC handlers
   */
  register() {
    // Get all patients
    ipcMain.handle('patients:getAll', async (event) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('Patient')
          .select(`
            *,
            assignedDoctor:assignedDoctorId(id, name, specialty)
          `)
          .order('name', { ascending: true });

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        logger.error('Error getting patients:', error);
        return { success: false, error: error.message };
      }
    });

    // Get patient by ID
    ipcMain.handle('patients:getById', async (event, id) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('Patient')
          .select(`
            *,
            assignedDoctor:assignedDoctorId(id, name, specialty),
            sessions:TherapySession(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        logger.error('Error getting patient:', error);
        return { success: false, error: error.message };
      }
    });

    // Create patient
    ipcMain.handle('patients:create', async (event, patientData) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('Patient')
          .insert({
            name: patientData.name,
            birthdate: patientData.birthdate,
            diagnosis: patientData.diagnosis,
            medicalHistory: patientData.medicalHistory,
            contactInfo: patientData.contactInfo,
            assignedDoctorId: patientData.assignedDoctorId
          })
          .select()
          .single();

        if (error) throw error;
        logger.info(`Patient created: ${data.id}`);
        return { success: true, data };
      } catch (error) {
        logger.error('Error creating patient:', error);
        return { success: false, error: error.message };
      }
    });

    // Update patient
    ipcMain.handle('patients:update', async (event, { id, data: patientData }) => {
      try {
        const supabase = databaseService.getSupabase();
        const { data, error } = await supabase
          .from('Patient')
          .update(patientData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        logger.info(`Patient updated: ${id}`);
        return { success: true, data };
      } catch (error) {
        logger.error('Error updating patient:', error);
        return { success: false, error: error.message };
      }
    });

    // Delete patient
    ipcMain.handle('patients:delete', async (event, id) => {
      try {
        const supabase = databaseService.getSupabase();
        const { error } = await supabase
          .from('Patient')
          .delete()
          .eq('id', id);

        if (error) throw error;
        logger.info(`Patient deleted: ${id}`);
        return { success: true };
      } catch (error) {
        logger.error('Error deleting patient:', error);
        return { success: false, error: error.message };
      }
    });

    logger.info('Patient controller registered');
  }
}

module.exports = new PatientController();
