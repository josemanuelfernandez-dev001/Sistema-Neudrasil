const path = require('path');
require('dotenv').config();

module.exports = {
  modelPath: process.env.AI_MODEL_PATH || path.join(__dirname, '../models'),
  
  backend: process.env.TENSORFLOW_BACKEND || 'cpu',
  
  models: {
    movement: {
      name: 'movement-analyzer',
      version: '1.0.0',
      inputShape: [1, 100, 6], // 100 frames, 6 features (x,y,z for head and hands)
      threshold: 0.7
    },
    gaze: {
      name: 'gaze-analyzer',
      version: '1.0.0',
      inputShape: [1, 50, 4], // 50 frames, 4 features (x,y for each eye)
      threshold: 0.65
    },
    gesture: {
      name: 'gesture-recognizer',
      version: '1.0.0',
      inputShape: [1, 30, 12], // 30 frames, 12 features (both hands tracking)
      threshold: 0.75
    }
  },
  
  analysis: {
    batchSize: 10,
    scoreMin: 0,
    scoreMax: 10,
    anomalyThreshold: 0.3
  },
  
  cache: {
    enabled: true,
    maxSize: 5 // Maximum number of models to keep in memory
  }
};
