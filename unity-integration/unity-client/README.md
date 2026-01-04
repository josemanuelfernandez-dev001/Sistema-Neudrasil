# Unity Integration - Sistema Neudrasil

## Descripción

Este directorio contiene los scripts de Unity necesarios para integrar juegos VR con el Sistema Neudrasil.

## Archivos Incluidos

### Scripts C#

1. **NeudrasilClient.cs**
   - Cliente WebSocket para comunicación con Electron
   - Manejo de conexión/desconexión automática
   - Sistema de cola para mensajes offline
   - Reconexión automática

2. **SessionManager.cs**
   - Gestión del ciclo de vida de sesiones de terapia
   - Carga de juegos basada en gameId
   - Cálculo de métricas de sesión
   - Pausar/reanudar sesiones

3. **DataCollector.cs**
   - Recolección automática de datos VR
   - Batching de datos para eficiencia
   - Tracking de headset y controladores
   - Soporte para eye tracking y biometría (opcional)

## Requisitos

### Dependencias de Unity

- **WebSocketSharp**: Para conexiones WebSocket
  ```
  Instalar vía Package Manager o descargar de:
  https://github.com/sta/websocket-sharp
  ```

- **Newtonsoft.Json**: Para serialización JSON
  ```
  Instalar vía Package Manager:
  Window > Package Manager > Add package from git URL
  com.unity.nuget.newtonsoft-json
  ```

### Versión de Unity

- Unity 2020.3 LTS o superior
- XR Plugin Management instalado
- OpenXR o el plugin XR de tu preferencia

## Instalación

1. Copiar los archivos `.cs` a tu proyecto de Unity en la carpeta `Assets/Scripts/Neudrasil/`

2. Instalar dependencias:
   ```
   - WebSocketSharp
   - Newtonsoft.Json
   ```

3. Crear un GameObject vacío en tu escena principal llamado "NeudrasilManager"

4. Agregar los tres componentes:
   - NeudrasilClient
   - SessionManager
   - DataCollector

5. Configurar las referencias en el Inspector:
   - SessionManager → Client: Asignar NeudrasilClient
   - SessionManager → DataCollector: Asignar DataCollector
   - DataCollector → Client: Asignar NeudrasilClient

## Configuración

### NeudrasilClient

En el Inspector:
- **Server Host**: `localhost` (default)
- **Server Port**: `8080` (default)
- **Reconnect Attempts**: `5` (intentos de reconexión)
- **Reconnect Delay**: `3` (segundos entre intentos)

### DataCollector

En el Inspector:
- **Send Interval**: `0.1` (segundos entre envíos - 100ms recomendado)
- **Batch Size**: `10` (cantidad de datos por lote)
- **Collect Gaze Data**: Activar si tienes eye tracking
- **Collect Biometric Data**: Activar si tienes sensores biométricos

Asignar Transforms:
- **Head Transform**: Transform de la cámara/headset
- **Left Hand Transform**: Transform del controlador izquierdo
- **Right Hand Transform**: Transform del controlador derecho

## Uso Básico

### Ejemplo 1: Configuración Mínima

```csharp
using Neudrasil;

public class GameController : MonoBehaviour
{
    private SessionManager sessionManager;

    void Start()
    {
        sessionManager = FindObjectOfType<SessionManager>();
        
        // El SessionManager escuchará automáticamente los eventos SESSION_START
        // del servidor y cargará el juego correspondiente
    }

    void OnGameComplete()
    {
        // Finalizar sesión cuando el juego termine
        var summary = new SessionManager.SessionSummary
        {
            totalMovements = 450,
            accuracy = 85.5f,
            completed = true,
            score = 850,
            levelsCompleted = 3
        };
        
        sessionManager.EndSession(summary);
    }
}
```

### Ejemplo 2: Registrar Interacciones

```csharp
using Neudrasil;

public class InteractiveObject : MonoBehaviour
{
    private DataCollector dataCollector;

    void Start()
    {
        dataCollector = FindObjectOfType<DataCollector>();
    }

    void OnPlayerInteract()
    {
        dataCollector.RecordInteraction(gameObject.name, "grab");
    }
}
```

### Ejemplo 3: Registrar Gestos

```csharp
using Neudrasil;

public class GestureRecognizer : MonoBehaviour
{
    private DataCollector dataCollector;

    void Start()
    {
        dataCollector = FindObjectOfType<DataCollector>();
    }

    void OnGestureDetected(string gestureName, float confidence)
    {
        dataCollector.RecordGesture(gestureName, confidence);
    }
}
```

## Flujo de Trabajo

1. **El doctor inicia una sesión desde el frontend**
   - Se crea la sesión en la base de datos
   - Electron envía mensaje SESSION_START a Unity

2. **Unity recibe SESSION_START**
   - SessionManager recibe el evento
   - Se carga el juego especificado en `gameId`
   - DataCollector comienza a recolectar datos

3. **Durante el juego**
   - DataCollector captura datos cada 100ms
   - Los datos se envían en lotes al servidor
   - El servidor procesa con IA en segundo plano

4. **Finalización**
   - El juego llama a `sessionManager.EndSession()`
   - Se envía resumen al servidor
   - Se actualiza la base de datos

## Personalización

### Agregar Nuevos Tipos de Datos

1. Crear clase de datos:
```csharp
[Serializable]
public class CustomData
{
    public string customField;
    public float customValue;
}
```

2. Enviar datos:
```csharp
var data = new CustomData
{
    customField = "test",
    customValue = 1.5f
};

client.SendVRData(sessionId, "CUSTOM", data);
```

### Crear Handler para Nuevos Tipos de Mensajes

Modificar `NeudrasilClient.HandleMessage()`:

```csharp
case "CUSTOM_MESSAGE":
    var custom = JsonConvert.DeserializeObject<CustomMessage>(jsonData);
    OnCustomMessage?.Invoke(custom);
    break;
```

## Troubleshooting

### Problema: No se conecta al servidor

**Solución**:
1. Verificar que Electron esté corriendo
2. Verificar puerto y host en NeudrasilClient
3. Revisar firewall/antivirus

### Problema: Datos no se están enviando

**Solución**:
1. Verificar que la sesión esté activa
2. Verificar que DataCollector tenga referencias a los transforms
3. Revisar logs de Unity para errores de serialización

### Problema: Reconexión no funciona

**Solución**:
1. Aumentar `reconnectAttempts`
2. Aumentar `reconnectDelay`
3. Verificar que el servidor esté aceptando reconexiones

## Testing

Ver `../test-client/mock-unity.js` para un cliente de prueba que simula Unity sin necesidad de correr el engine.

## Notas Importantes

- **Rendimiento**: El batching de datos está configurado para minimizar impacto en el framerate
- **Seguridad**: La conexión es local (localhost) solamente
- **Persistencia**: Los datos se guardan en cola si pierde conexión
- **Threading**: Los callbacks de WebSocket se ejecutan en el main thread de Unity

## Soporte

Para problemas o preguntas, consultar:
- `../protocol.md`: Documentación completa del protocolo
- `../message-schemas.json`: Esquemas JSON de validación

## Licencia

Este código es parte del Sistema Neudrasil y está sujeto a la licencia del proyecto.
