const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const databaseService = require('./database.service');
const logger = require('../utils/logger');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
const JWT_EXPIRY = '24h';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.isInitialized = false;
  }

  /**
   * Initialize auth service
   */
  async init() {
    try {
      logger.info('Initializing auth service...');
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize auth service:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      logger.info(`Login attempt for: ${email}`);

      // Get user from database
      const supabase = databaseService.getSupabase();
      const { data: users, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error || !users || users.length === 0) {
        logger.warn(`Login failed: User not found - ${email}`);
        throw new Error('Invalid credentials');
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        logger.warn(`Login failed: Invalid password - ${email}`);
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      this.token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      // Store current user (without password hash)
      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty
      };

      logger.info(`Login successful: ${email}`);
      return {
        user: this.currentUser,
        token: this.token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    logger.info(`Logout: ${this.currentUser?.email}`);
    this.currentUser = null;
    this.token = null;
    return true;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verify token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token || this.token, JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null && this.token !== null;
  }

  /**
   * Check if user has role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Register new user (admin only)
   */
  async register(userData) {
    try {
      logger.info(`Registering new user: ${userData.email}`);

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user in database
      const supabase = databaseService.getSupabase();
      const { data, error } = await supabase
        .from('User')
        .insert({
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role || 'DOCTOR',
          specialty: userData.specialty
        })
        .select()
        .single();

      if (error) {
        logger.error('Registration error:', error);
        throw new Error('Failed to register user');
      }

      logger.info(`User registered successfully: ${userData.email}`);
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        specialty: data.specialty
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Verify current password
      const supabase = databaseService.getSupabase();
      const { data: user, error } = await supabase
        .from('User')
        .select('passwordHash')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('User')
        .update({ passwordHash: newPasswordHash })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update password');
      }

      logger.info(`Password changed for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Reset password (would send email in production)
   */
  async resetPassword(email) {
    logger.info(`Password reset requested for: ${email}`);
    // In production, this would send a reset email
    return { message: 'Password reset email sent' };
  }
}

// Export singleton instance
module.exports = new AuthService();
