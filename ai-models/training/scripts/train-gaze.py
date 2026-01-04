"""
Training script for gaze analysis model
"""

import tensorflow as tf
import numpy as np
import pandas as pd
from pathlib import Path
import json

# Configuration
DATA_PATH = Path('../datasets/gaze')
MODEL_OUTPUT_PATH = Path('../../electron/models/gaze-analyzer')
EPOCHS = 40
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.2

def load_data():
    """Load and preprocess gaze tracking data"""
    print("Loading gaze data...")
    
    data = pd.read_csv(DATA_PATH / 'gaze_data.csv')
    
    # Extract features: left_eye_x, left_eye_y, right_eye_x, right_eye_y
    features = data[['left_eye_x', 'left_eye_y', 'right_eye_x', 'right_eye_y']].values
    labels = data['attention_score'].values
    
    # Normalize
    features = (features - np.mean(features, axis=0)) / np.std(features, axis=0)
    
    # Reshape for sequence (50 timesteps)
    samples = len(features) // 50
    features = features[:samples * 50].reshape((samples, 50, 4))
    labels = labels[::50][:samples]
    
    return features, labels

def create_model(input_shape):
    """Create model for gaze analysis"""
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(48, input_shape=input_shape, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(24),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(12, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_model():
    """Main training function"""
    X, y = load_data()
    print(f"Data shape: X={X.shape}, y={y.shape}")
    
    model = create_model((X.shape[1], X.shape[2]))
    model.summary()
    
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(
            str(MODEL_OUTPUT_PATH / 'best_model.h5'),
            save_best_only=True
        )
    ]
    
    history = model.fit(
        X, y,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_split=VALIDATION_SPLIT,
        callbacks=callbacks,
        verbose=1
    )
    
    model.save(str(MODEL_OUTPUT_PATH / 'final_model.h5'))
    
    with open(MODEL_OUTPUT_PATH / 'history.json', 'w') as f:
        json.dump(history.history, f)
    
    print("\n✓ Training completed")
    print(f"✓ Model saved to {MODEL_OUTPUT_PATH}")
    
    return model, history

if __name__ == '__main__':
    MODEL_OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
    model, history = train_model()
