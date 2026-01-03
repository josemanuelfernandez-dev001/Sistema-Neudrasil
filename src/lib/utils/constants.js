/**
 * Application constants
 */

// User roles
export const ROLES = {
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
  THERAPIST: 'THERAPIST'
};

// Session statuses
export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Data types
export const DATA_TYPES = {
  MOVEMENT: 'MOVEMENT',
  GAZE: 'GAZE',
  INTERACTION: 'INTERACTION',
  GESTURE: 'GESTURE',
  BIOMETRIC: 'BIOMETRIC'
};

// Storage types
export const STORAGE_TYPES = {
  SUPABASE: 'SUPABASE',
  LOCAL: 'LOCAL'
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  SESSION_START: 'SESSION_START',
  SESSION_END: 'SESSION_END',
  VR_DATA: 'VR_DATA',
  HEARTBEAT: 'HEARTBEAT',
  ERROR: 'ERROR',
  ACK: 'ACK'
};

// Medical theme colors (matching Tailwind config)
export const COLORS = {
  MEDICAL_PRIMARY: '#1a9d9d',
  MEDICAL_LIGHT: '#26bcbc',
  MEDICAL_DARK: '#105f5f',
  STATUS_SUCCESS: '#10b981',
  STATUS_WARNING: '#f59e0b',
  STATUS_ERROR: '#ef4444',
  STATUS_INFO: '#3b82f6'
};

// Navigation routes
export const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/dashboard/patients',
  CALENDAR: '/dashboard/calendar',
  MESSAGES: '/dashboard/messages',
  THERAPIES: '/dashboard/therapies',
  DOCUMENTS: '/dashboard/documents'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'neudrasil_auth_token',
  USER_PREFERENCES: 'neudrasil_user_preferences'
};
