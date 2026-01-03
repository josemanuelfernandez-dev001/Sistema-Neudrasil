const path = require('path');
require('dotenv').config();

module.exports = {
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },
  
  sqlite: {
    path: process.env.SQLITE_PATH || path.join(__dirname, '../../database/sqlite/neudrasil-local.db'),
    options: {
      verbose: console.log
    }
  },
  
  sync: {
    interval: 60000, // Sync every 60 seconds
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000
  }
};
