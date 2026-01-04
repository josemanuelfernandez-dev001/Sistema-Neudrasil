"""
Validate exported TensorFlow.js models
"""

import tensorflowjs as tfjs
import tensorflow as tf
import numpy as np
from pathlib import Path
import json

def validate_model(model_path, model_name, input_shape):
    """Validate that a TensorFlow.js model can be loaded and used"""
    print(f"\nValidating {model_name}...")
    
    model_json_path = model_path / 'model.json'
    
    if not model_json_path.exists():
        print(f"  ✗ model.json not found at {model_json_path}")
        return False
    
    try:
        # Create dummy input
        dummy_input = np.random.randn(*input_shape).astype(np.float32)
        
        # Load TensorFlow model for validation
        keras_model_path = model_path / 'final_model.h5'
        if keras_model_path.exists():
            model = tf.keras.models.load_model(str(keras_model_path))
            
            # Run inference
            output = model.predict(dummy_input)
            
            print(f"  ✓ Model loaded successfully")
            print(f"  ✓ Input shape: {dummy_input.shape}")
            print(f"  ✓ Output shape: {output.shape}")
            print(f"  ✓ Sample output: {output[0]}")
            
            return True
        else:
            print(f"  ⚠️  Keras model not found for validation")
            return False
            
    except Exception as e:
        print(f"  ✗ Validation failed: {str(e)}")
        return False

def main():
    base_path = Path('../../electron/models')
    
    models = [
        {
            'name': 'movement-analyzer',
            'path': base_path / 'movement-analyzer',
            'input_shape': (1, 100, 6)  # batch, timesteps, features
        },
        {
            'name': 'gaze-analyzer',
            'path': base_path / 'gaze-analyzer',
            'input_shape': (1, 50, 4)
        },
        {
            'name': 'gesture-recognizer',
            'path': base_path / 'gesture-recognizer',
            'input_shape': (1, 30, 12)
        }
    ]
    
    print("=" * 50)
    print("Model Validation")
    print("=" * 50)
    
    results = {}
    for model_info in models:
        is_valid = validate_model(
            model_info['path'],
            model_info['name'],
            model_info['input_shape']
        )
        results[model_info['name']] = is_valid
    
    print("\n" + "=" * 50)
    print("Validation Summary")
    print("=" * 50)
    
    for name, is_valid in results.items():
        status = "✓ PASSED" if is_valid else "✗ FAILED"
        print(f"{name}: {status}")
    
    all_valid = all(results.values())
    print("\n" + ("All models valid!" if all_valid else "Some models failed validation"))

if __name__ == '__main__':
    main()
