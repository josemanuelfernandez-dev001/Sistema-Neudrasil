"""
Export TensorFlow models to TensorFlow.js format
"""

import tensorflowjs as tfjs
import tensorflow as tf
from pathlib import Path
import sys

def export_model(model_path, output_path, model_name):
    """Export a Keras/TensorFlow model to TensorFlow.js format"""
    print(f"\nExporting {model_name}...")
    print(f"  Input: {model_path}")
    print(f"  Output: {output_path}")
    
    # Load model
    model = tf.keras.models.load_model(str(model_path))
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Export to TensorFlow.js format
    tfjs.converters.save_keras_model(model, str(output_path))
    
    print(f"  ✓ {model_name} exported successfully")

def main():
    base_path = Path('../../electron/models')
    
    models = [
        {
            'name': 'movement-analyzer',
            'input': base_path / 'movement-analyzer' / 'final_model.h5',
            'output': base_path / 'movement-analyzer'
        },
        {
            'name': 'gaze-analyzer',
            'input': base_path / 'gaze-analyzer' / 'final_model.h5',
            'output': base_path / 'gaze-analyzer'
        },
        {
            'name': 'gesture-recognizer',
            'input': base_path / 'gesture-recognizer' / 'final_model.h5',
            'output': base_path / 'gesture-recognizer'
        }
    ]
    
    print("=" * 50)
    print("TensorFlow.js Model Export")
    print("=" * 50)
    
    for model_info in models:
        if model_info['input'].exists():
            export_model(
                model_info['input'],
                model_info['output'],
                model_info['name']
            )
        else:
            print(f"\n⚠️  Skipping {model_info['name']}: Model file not found")
    
    print("\n" + "=" * 50)
    print("Export completed!")
    print("=" * 50)

if __name__ == '__main__':
    main()
