# AI Models Documentation

Ver archivo completo en `ai-models/README.md`.

## Modelos Disponibles

1. **Movement Analyzer**: Analiza patrones de movimiento
2. **Gaze Analyzer**: Evalúa atención y seguimiento ocular  
3. **Gesture Recognizer**: Identifica gestos específicos

## Entrenamiento

```bash
cd ai-models/training/scripts
python train-movement.py
python export-tfjs.py
python validate-model.py
```

## Uso en la Aplicación

Los modelos se cargan automáticamente al iniciar la app.
El análisis ocurre en segundo plano cuando se reciben datos VR.

Para más detalles, ver `ai-models/README.md`.
