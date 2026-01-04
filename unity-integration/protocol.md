# Protocolo WebSocket - Sistema Neudrasil ↔ Unity

## Información General

- **Versión del Protocolo**: 1.0.0
- **Puerto por Defecto**: 8080
- **Host**: localhost
- **Formato de Mensajes**: JSON
- **Codificación**: UTF-8

## Conexión

### Establecer Conexión

```csharp
// Unity C#
WebSocket ws = new WebSocket("ws://localhost:8080");
ws.Connect();
```

Al conectarse exitosamente, el servidor enviará un mensaje de acknowledgment (ACK).

### Heartbeat

El servidor envía `ping` cada 30 segundos. El cliente debe responder con `pong`.

## Tipos de Mensajes

### 1. SESSION_START

**Dirección**: Unity → Electron (recibido desde Electron después de que el doctor inicie la sesión)

**Propósito**: Notificar al juego Unity que debe iniciar una sesión de terapia

**Estructura**:
```json
{
  "type": "SESSION_START",
  "sessionId": "uuid-123-456",
  "patientId": "patient-uuid",
  "patientName": "Juan Pérez",
  "doctorId": "doctor-uuid",
  "gameId": "balance-game-vr"
}
```

**Respuesta Esperada**: Unity debe enviar ACK y comenzar el juego.

### 2. VR_DATA

**Dirección**: Unity → Electron

**Propósito**: Enviar datos de VR capturados durante la sesión

**Frecuencia**: Cada 100ms o por evento

**Estructura**:
```json
{
  "type": "VR_DATA",
  "sessionId": "uuid-123-456",
  "timestamp": "2026-01-03T15:30:22.500Z",
  "dataType": "MOVEMENT",
  "data": {
    "headPosition": {"x": 0.5, "y": 1.7, "z": -2.1},
    "headRotation": {"x": 5, "y": 30, "z": 0},
    "leftHand": {
      "position": {"x": -0.3, "y": 1.2, "z": -0.5},
      "rotation": {"x": 0, "y": 0, "z": 0},
      "velocity": 0.3
    },
    "rightHand": {
      "position": {"x": 0.3, "y": 1.2, "z": -0.5},
      "rotation": {"x": 0, "y": 0, "z": 0},
      "velocity": 0.5
    }
  }
}
```

**Data Types**:
- `MOVEMENT`: Datos de posición y movimiento
- `GAZE`: Datos de seguimiento ocular
- `GESTURE`: Gestos reconocidos
- `INTERACTION`: Interacciones con objetos
- `BIOMETRIC`: Datos biométricos (si disponibles)

**Respuesta Esperada**: El servidor no enviará confirmación individual para cada VR_DATA (para no saturar), pero procesará los datos.

### 3. SESSION_END

**Dirección**: Unity → Electron

**Propósito**: Notificar que la sesión ha terminado

**Estructura**:
```json
{
  "type": "SESSION_END",
  "sessionId": "uuid-123-456",
  "duration": 1200,
  "summary": {
    "totalMovements": 450,
    "accuracy": 85.5,
    "averageSpeed": 2.3,
    "completed": true,
    "levelsCompleted": 3,
    "score": 850
  }
}
```

**Respuesta Esperada**: El servidor enviará ACK.

### 4. HEARTBEAT

**Dirección**: Bidireccional

**Propósito**: Mantener la conexión activa y verificar el estado

**Estructura**:
```json
{
  "type": "HEARTBEAT",
  "timestamp": "2026-01-03T15:30:22.500Z"
}
```

### 5. ACK (Acknowledgment)

**Dirección**: Electron → Unity

**Propósito**: Confirmar recepción de mensajes importantes

**Estructura**:
```json
{
  "type": "ACK",
  "sessionId": "uuid-123-456",
  "message": "Session started successfully"
}
```

### 6. ERROR

**Dirección**: Electron → Unity

**Propósito**: Notificar errores

**Estructura**:
```json
{
  "type": "ERROR",
  "message": "Invalid message format",
  "code": "INVALID_FORMAT"
}
```

**Error Codes**:
- `INVALID_FORMAT`: Formato de mensaje inválido
- `UNKNOWN_MESSAGE_TYPE`: Tipo de mensaje desconocido
- `SESSION_NOT_FOUND`: Sesión no encontrada
- `VALIDATION_ERROR`: Error de validación de datos

## Flujo Completo de Sesión

```
1. Doctor inicia sesión desde frontend
   Frontend → Electron: Crear sesión
   
2. Electron crea sesión en BD y notifica a Unity
   Electron → Unity: SESSION_START
   
3. Unity inicia el juego VR
   Unity → Electron: ACK
   
4. Durante la sesión
   Unity → Electron: VR_DATA (cada 100ms)
   Electron procesa con IA en background
   Electron → Frontend: Datos procesados
   
5. Sesión termina
   Unity → Electron: SESSION_END
   Electron → Unity: ACK
   Electron actualiza BD
   Electron → Frontend: Sesión completada
```

## Manejo de Errores

### Reconexión

Si la conexión se pierde:
1. Unity debe intentar reconectar automáticamente
2. Máximo 5 intentos con delay de 3 segundos entre intentos
3. Si falla, notificar al usuario y guardar datos localmente

### Datos Pendientes

Unity debe implementar un buffer local para datos VR que no se pudieron enviar:
- Buffer máximo: 1000 datos
- Al reconectar, enviar datos pendientes en orden

### Timeout

- Si no hay respuesta del servidor en 5 segundos para mensajes críticos (SESSION_START, SESSION_END), reintentar
- Si no hay heartbeat en 60 segundos, considerar conexión perdida

## Mejores Prácticas

### Batching de Datos

Para optimizar el rendimiento:
- Agrupar múltiples datos VR en un solo mensaje
- Enviar cada 100ms en lugar de por cada frame

```json
{
  "type": "VR_DATA_BATCH",
  "sessionId": "uuid-123-456",
  "data": [
    {
      "timestamp": "2026-01-03T15:30:22.500Z",
      "dataType": "MOVEMENT",
      "data": {...}
    },
    {
      "timestamp": "2026-01-03T15:30:22.600Z",
      "dataType": "MOVEMENT",
      "data": {...}
    }
  ]
}
```

### Compresión

Para sesiones largas, considerar comprimir datos JSON antes de enviar.

### Validación

Unity debe validar datos antes de enviar:
- Verificar que todos los campos requeridos estén presentes
- Valores numéricos dentro de rangos válidos
- Timestamps en formato ISO 8601

## Ejemplo de Implementación

Ver `NeudrasilClient.cs` para una implementación completa del cliente WebSocket en Unity.

## Seguridad

- La conexión debe ser local (localhost) solamente
- No enviar datos sensibles del paciente a través del WebSocket
- Validar origen de mensajes recibidos

## Versionamiento

Cambios futuros en el protocolo incrementarán el número de versión. Unity debe enviar la versión del protocolo en la conexión inicial:

```json
{
  "type": "CONNECT",
  "protocolVersion": "1.0.0",
  "clientVersion": "1.2.0"
}
```
