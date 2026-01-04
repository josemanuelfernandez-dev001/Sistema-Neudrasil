"""
Training script for movement analysis model
"""

import tensorflow as tf
import numpy as np
import pandas as pd
from pathlib import Path
import json

# Configuration
DATA_PATH = Path('../datasets/movement')
MODEL_OUTPUT_PATH = Path('../../electron/models/movement-analyzer')
EPOCHS = 50
BATCH_SIZE = 32
VALIDATION_SPLIT = 0.2

def load_data():
    """Load and preprocess movement data"""
    print("Loading movement data...")
    
    # Load training data from CSV
    # Expected format: timestamp, head_x, head_y, head_z, hand_l_x, hand_l_y, hand_l_z, hand_r_x, hand_r_y, hand_r_z, label
    data = pd.read_csv(DATA_PATH / 'movement_data.csv')
    
    # Extract features and labels
    features = data[['head_x', 'head_y', 'head_z', 
                     'hand_l_x', 'hand_l_y', 'hand_l_z',
                     'hand_r_x', 'hand_r_y', 'hand_r_z']].values
    labels = data['label'].values
    
    # Normalize features
    features = (features - np.mean(features, axis=0)) / np.std(features, axis=0)
    
    # Reshape for sequence model (assuming 100 timesteps)
    # This will depend on your actual data structure
    samples = len(features) // 100
    features = features[:samples * 100].reshape((samples, 100, 9))
    labels = labels[::100][:samples]
    
    return features, labels

def create_model(input_shape):
    """Create LSTM model for movement analysis"""
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, input_shape=input_shape, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', 'AUC']
    )
    
    return model

def train_model():
    """Main training function"""
    # Load data
    X, y = load_data()
    print(f"Data shape: X={X.shape}, y={y.shape}")
    
    # Create model
    model = create_model((X.shape[1], X.shape[2]))
    model.summary()
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(
            str(MODEL_OUTPUT_PATH / 'best_model.h5'),
            save_best_only=True
        )
    ]
    
    # Train
    history = model.fit(
        X, y,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_split=VALIDATION_SPLIT,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save final model
    model.save(str(MODEL_OUTPUT_PATH / 'final_model.h5'))
    
    # Save training history
    with open(MODEL_OUTPUT_PATH / 'history.json', 'w') as f:
        json.dump(history.history, f)
    
    print("\n✓ Training completed")
    print(f"✓ Model saved to {MODEL_OUTPUT_PATH}")
    
    return model, history

if __name__ == '__main__':
    MODEL_OUTPUT_PATH.mkdir(parents=True, exist_ok=True)
    model, history = train_model()
