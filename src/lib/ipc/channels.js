/**
 * IPC Channel names
 * Centralized definition of all IPC channel names
 */

export const IPC_CHANNELS = {
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_GET_CURRENT_USER: 'auth:getCurrentUser',

  // Patients
  PATIENTS_GET_ALL: 'patients:getAll',
  PATIENTS_GET_BY_ID: 'patients:getById',
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_UPDATE: 'patients:update',
  PATIENTS_DELETE: 'patients:delete',

  // Sessions
  SESSIONS_GET_BY_PATIENT: 'sessions:getByPatient',
  SESSIONS_GET_BY_ID: 'sessions:getById',
  SESSIONS_CREATE: 'sessions:create',
  SESSIONS_END: 'sessions:end',

  // Messages
  MESSAGES_GET_ALL: 'messages:getAll',
  MESSAGES_GET_CONVERSATION: 'messages:getConversation',
  MESSAGES_SEND: 'messages:send',
  MESSAGES_MARK_AS_READ: 'messages:markAsRead',

  // Documents
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_GET_BY_PATIENT: 'documents:getByPatient',
  DOCUMENTS_DELETE: 'documents:delete',

  // Events (from main to renderer)
  VR_DATA_RECEIVED: 'vr-data-received',
  VR_DATA_PROCESSED: 'vr-data-processed',
  SESSION_UPDATE: 'session-update',
  UNITY_CONNECTED: 'unity-connected',
  UNITY_DISCONNECTED: 'unity-disconnected'
};
