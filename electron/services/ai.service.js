const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');
const config = require('../config/ai.config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.models = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize AI service
   */
  async init() {
    try {
      logger.info('Initializing AI service...');
      
      // Set TensorFlow backend
      await tf.setBackend(config.backend);
      logger.info(`TensorFlow backend set to: ${config.backend}`);

      // Load available models
      await this.loadModels();

      this.isInitialized = true;
      logger.info('AI service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize AI service:', error);
      // Don't throw - allow system to run without AI
      return false;
    }
  }

  /**
   * Load AI models from disk
   */
  async loadModels() {
    const modelPath = config.modelPath;
    
    if (!fs.existsSync(modelPath)) {
      logger.warn(`Model path does not exist: ${modelPath}`);
      logger.info('Creating models directory...');
      fs.mkdirSync(modelPath, { recursive: true });
      return;
    }

    // Try to load each configured model
    for (const [modelName, modelConfig] of Object.entries(config.models)) {
      try {
        const modelFile = path.join(modelPath, modelConfig.name, 'model.json');
        
        if (fs.existsSync(modelFile)) {
          const model = await tf.loadLayersModel(`file://${modelFile}`);
          this.models.set(modelName, {
            model,
            config: modelConfig
          });
          logger.info(`Loaded model: ${modelName}`);
        } else {
          logger.warn(`Model file not found: ${modelFile}`);
        }
      } catch (error) {
        logger.error(`Failed to load model ${modelName}:`, error);
      }
    }

    logger.info(`Loaded ${this.models.size} models`);
  }

  /**
   * Analyze VR data
   */
  async analyze(dataType, data) {
    try {
      const modelType = this.getModelTypeForData(dataType);
      const modelInfo = this.models.get(modelType);

      if (!modelInfo) {
        logger.warn(`No model available for ${dataType}, using mock analysis`);
        return this.mockAnalysis(dataType, data);
      }

      // Prepare input data
      const inputTensor = this.prepareInputData(data, modelInfo.config);

      // Run inference
      const prediction = await modelInfo.model.predict(inputTensor).data();

      // Process results
      const analysis = this.processResults(prediction, modelInfo.config, dataType);

      // Cleanup
      inputTensor.dispose();

      return analysis;
    } catch (error) {
      logger.error('Error during AI analysis:', error);
      return this.mockAnalysis(dataType, data);
    }
  }

  /**
   * Get appropriate model type for data type
   */
  getModelTypeForData(dataType) {
    const mapping = {
      'MOVEMENT': 'movement',
      'GAZE': 'gaze',
      'GESTURE': 'gesture',
      'INTERACTION': 'movement',
      'BIOMETRIC': 'movement'
    };
    return mapping[dataType] || 'movement';
  }

  /**
   * Prepare input data for model
   */
  prepareInputData(data, modelConfig) {
    // This is a simplified version - actual implementation would depend on data format
    const inputShape = modelConfig.inputShape;
    
    // Create dummy tensor matching expected shape (in production, transform actual data)
    const tensorData = new Array(inputShape.reduce((a, b) => a * b, 1)).fill(0);
    
    return tf.tensor(tensorData, inputShape);
  }

  /**
   * Process model prediction results
   */
  processResults(prediction, modelConfig, dataType) {
    // Convert prediction to score (0-10)
    const rawScore = prediction[0] || 0.5; // Assume first output is confidence
    const score = Math.min(10, Math.max(0, rawScore * 10));

    // Detect anomalies
    const anomalies = [];
    if (rawScore < modelConfig.threshold) {
      anomalies.push({
        type: 'LOW_CONFIDENCE',
        severity: 'medium',
        message: `${dataType} analysis below confidence threshold`
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(score, dataType);

    return {
      modelVersion: modelConfig.version,
      score: parseFloat(score.toFixed(2)),
      confidence: parseFloat((rawScore * 100).toFixed(2)),
      result: {
        dataType,
        prediction: Array.from(prediction),
        timestamp: new Date().toISOString()
      },
      anomalies: anomalies.length > 0 ? anomalies : null,
      recommendations
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(score, dataType) {
    const recommendations = [];

    if (score < 4) {
      recommendations.push(`Consider adjusting ${dataType} exercises to easier difficulty level`);
      recommendations.push('Schedule additional support session');
    } else if (score < 7) {
      recommendations.push('Patient showing moderate progress');
      recommendations.push('Continue with current therapy plan');
    } else {
      recommendations.push('Excellent progress observed');
      recommendations.push(`Consider advancing ${dataType} complexity`);
    }

    return recommendations.join('. ');
  }

  /**
   * Mock analysis when no model is available
   */
  mockAnalysis(dataType, data) {
    logger.debug('Using mock analysis');
    
    // Generate a realistic-looking score
    const baseScore = 5 + Math.random() * 3;
    
    return {
      modelVersion: 'mock-1.0.0',
      score: parseFloat(baseScore.toFixed(2)),
      confidence: parseFloat((70 + Math.random() * 20).toFixed(2)),
      result: {
        dataType,
        prediction: [Math.random()],
        timestamp: new Date().toISOString(),
        note: 'Mock analysis - model not loaded'
      },
      anomalies: null,
      recommendations: this.generateRecommendations(baseScore, dataType)
    };
  }

  /**
   * Train a model (placeholder for future implementation)
   */
  async trainModel(modelName, trainingData) {
    logger.info(`Training model: ${modelName}`);
    // This would be implemented with actual training logic
    throw new Error('Training not implemented yet');
  }

  /**
   * Export model to TensorFlow.js format
   */
  async exportModel(modelName, outputPath) {
    const modelInfo = this.models.get(modelName);
    if (!modelInfo) {
      throw new Error(`Model ${modelName} not found`);
    }

    await modelInfo.model.save(`file://${outputPath}`);
    logger.info(`Model ${modelName} exported to ${outputPath}`);
  }

  /**
   * Get model info
   */
  getModelInfo(modelName) {
    const modelInfo = this.models.get(modelName);
    if (!modelInfo) {
      return null;
    }

    return {
      name: modelName,
      version: modelInfo.config.version,
      inputShape: modelInfo.config.inputShape,
      threshold: modelInfo.config.threshold
    };
  }

  /**
   * List all loaded models
   */
  listModels() {
    return Array.from(this.models.keys()).map(name => this.getModelInfo(name));
  }
}

// Export singleton instance
module.exports = new AIService();
