# AI Models - Sistema Neudrasil

## Descripción

Este directorio contiene los modelos de inteligencia artificial utilizados para analizar datos de sesiones VR y generar recomendaciones terapéuticas.

## Estructura

```
ai-models/
├── training/              # Scripts y datos de entrenamiento
│   ├── datasets/          # Conjuntos de datos para entrenamiento
│   ├── scripts/           # Scripts Python para entrenar modelos
│   └── notebooks/         # Jupyter notebooks para experimentación
├── teachable-machine/     # Modelos exportados desde Teachable Machine
│   └── exported-models/   # Modelos listos para usar
└── README.md
```

## Modelos Disponibles

### 1. Movement Analyzer (Analizador de Movimiento)

**Propósito**: Analizar patrones de movimiento del headset y controladores VR

**Input**: 
- 100 timesteps
- 6 features: head position (x, y, z) y velocidades de manos

**Output**: Score de calidad de movimiento (0-1)

**Uso**:
```javascript
const score = await aiService.analyze('MOVEMENT', vrData);
```

### 2. Gaze Analyzer (Analizador de Mirada)

**Propósito**: Evaluar atención y seguimiento ocular

**Input**:
- 50 timesteps
- 4 features: posición de ambos ojos (x, y)

**Output**: Score de atención (0-1)

### 3. Gesture Recognizer (Reconocedor de Gestos)

**Propósito**: Identificar gestos específicos realizados por el paciente

**Input**:
- 30 timesteps
- 12 features: posición y rotación de ambas manos

**Output**: Tipo de gesto y confianza

## Entrenamiento de Modelos

### Requisitos

```bash
pip install tensorflow tensorflowjs pandas numpy jupyter
```

### Preparar Datos

1. Colocar archivos CSV en `training/datasets/{modelo}/`
2. Formato esperado:
   - `movement_data.csv`: timestamp, head_x, head_y, head_z, hand_l_x, hand_l_y, hand_l_z, hand_r_x, hand_r_y, hand_r_z, label
   - `gaze_data.csv`: timestamp, left_eye_x, left_eye_y, right_eye_x, right_eye_y, attention_score
   - `gesture_data.csv`: timestamp, [12 hand features], gesture_type

### Entrenar Modelos

```bash
cd ai-models/training/scripts

# Entrenar modelo de movimiento
python train-movement.py

# Entrenar modelo de mirada
python train-gaze.py

# Exportar a TensorFlow.js
python export-tfjs.py

# Validar modelos exportados
python validate-model.py
```

### Resultados

Los modelos entrenados se guardarán en:
```
electron/models/
├── movement-analyzer/
│   ├── model.json
│   ├── group1-shard1of1.bin
│   └── final_model.h5
├── gaze-analyzer/
│   └── ...
└── gesture-recognizer/
    └── ...
```

## Teachable Machine

### Crear Modelo con Teachable Machine

1. Ir a https://teachablemachine.withgoogle.com/
2. Crear nuevo proyecto (Image, Audio, o Pose)
3. Agregar clases y entrenar
4. Exportar como "TensorFlow.js"
5. Descargar y extraer en `teachable-machine/exported-models/`

### Usar Modelo en la Aplicación

```javascript
const model = await tf.loadLayersModel('file://ai-models/teachable-machine/exported-models/my-model/model.json');
```

## Métricas y Evaluación

### Métricas Clave

- **Accuracy**: Precisión del modelo
- **AUC**: Área bajo la curva ROC
- **MAE**: Error absoluto medio (para regresión)
- **F1-Score**: Balance entre precisión y recall

### Evaluación en Producción

Los modelos son evaluados continuamente en producción:
- Comparación de predicciones con feedback médico
- Monitoreo de distribución de datos de entrada
- Alertas si el rendimiento degrada

## Mejora Continua

### Reentrenamiento

Se recomienda reentrenar modelos:
- Mensualmente con nuevos datos
- Cuando se detecta drift en datos
- Cuando médicos reportan predicciones incorrectas

### Versionamiento

Los modelos siguen versionamiento semántico:
- `1.0.0`: Primera versión estable
- `1.1.0`: Mejoras menores
- `2.0.0`: Cambios mayores en arquitectura

## Optimización

### Reducir Tamaño del Modelo

```bash
# Cuantización
python -c "import tensorflow as tf; model = tf.keras.models.load_model('model.h5'); converter = tf.lite.TFLiteConverter.from_keras_model(model); converter.optimizations = [tf.lite.Optimize.DEFAULT]; tflite_model = converter.convert(); open('model.tflite', 'wb').write(tflite_model)"
```

### Mejorar Performance

- Usar batch inference cuando sea posible
- Cache de modelos en memoria
- Reducir frecuencia de análisis si no es crítico

## Troubleshooting

### Modelo no carga

**Problema**: Error al cargar modelo en TensorFlow.js

**Solución**:
1. Verificar que `model.json` existe
2. Verificar que archivos `.bin` están en el mismo directorio
3. Revisar versión de TensorFlow.js

### Predicciones extrañas

**Problema**: Modelo da predicciones inesperadas

**Solución**:
1. Verificar normalización de datos de entrada
2. Comparar distribución de datos con datos de entrenamiento
3. Revisar si el modelo está obsoleto

### Performance lenta

**Problema**: Análisis de IA toma mucho tiempo

**Solución**:
1. Usar backend GPU si está disponible
2. Reducir frecuencia de análisis
3. Usar batch processing
4. Considerar modelo más simple

## Referencias

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Best Practices for ML Models](https://www.tensorflow.org/tfx/guide/best_practices)

## Contribuir

Para agregar nuevos modelos:
1. Crear script de entrenamiento en `training/scripts/`
2. Documentar arquitectura y propósito
3. Agregar tests de validación
4. Actualizar este README

## Licencia

Los modelos son propiedad de Sistema Neudrasil y están sujetos a la licencia del proyecto.
