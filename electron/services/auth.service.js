const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.currentUser = null;
    this. jwtSecret = process.env.JWT_SECRET || 'neudrasil-secret-key-change-in-production';
    this. databaseService = null;
  }

  setDatabaseService(dbService) {
    this.databaseService = dbService;
  }

  async init() {
    logger.info('Initializing auth service...');
  }

  async login(email, password) {
    try {
      logger.info(`Login attempt for:  ${email}`);

      if (!this.databaseService) {
        throw new Error('Database service not initialized');
      }

      const supabase = this.databaseService.getSupabase();

      // Buscar el doctor por email
      const { data: doctor, error } = await supabase
          .from('Doctor')
          .select('id, name, email, role, passwordHash')
          .eq('email', email)
          .single();

      if (error || !doctor) {
        logger.warn(`Login failed:  User not found - ${email}`);
        throw new Error('Invalid credentials');
      }

      // Verificar contraseña con bcrypt
      const isPasswordValid = await bcrypt.compare(password, doctor.passwordHash);

      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password - ${email}`);
        throw new Error('Invalid credentials');
      }

      // Crear objeto de usuario sin el passwordHash
      const user = {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        role: doctor.role,
      };

      const token = jwt.sign(
          { userId: user.id, email: user.email },
          this.jwtSecret,
          { expiresIn: '24h' }
      );

      this.currentUser = user;

      logger.info(`User logged in successfully: ${email} (ID: ${user.id})`);

      return { user, token };
    } catch (error) {
      logger.error('Login error:', error. message);
      throw error;
    }
  }

  async logout() {
    const userEmail = this.currentUser?.email || 'unknown';
    this.currentUser = null;
    logger.info(`User logged out: ${userEmail}`);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

module.exports = new AuthService();