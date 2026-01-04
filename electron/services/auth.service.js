const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.currentUser = null;
    this. jwtSecret = process.env.JWT_SECRET || 'neudrasil-secret-key-change-in-production';
  }

  async init() {
    logger.info('Initializing auth service.. .');
  }

  async login(credentials) {
    try {
      // Extraer email y password correctamente
      const { email, password } = credentials;

      logger.info(`Login attempt for:  ${email}`);

      // Validación hardcoded para demo
      if (email === 'doctor@neudrasil.com' && password === 'admin123') {
        const user = {
          id: 1,
          email: 'doctor@neudrasil.com',
          name: 'Dr. Juan Pérez',
          role:  'DOCTOR',
        };

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        this.currentUser = user;

        logger.info(`User logged in successfully: ${email}`);

        return { user, token };
      }

      logger.warn(`Login failed:  User not found - ${email}`);
      throw new Error('Invalid credentials');
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

  async getCurrentUser() {
    return this.currentUser;
  }
}

module.exports = new AuthService();