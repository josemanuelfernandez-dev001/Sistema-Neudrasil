# Unity Integration Guide

Ver archivos completos en `unity-integration/`:
- `protocol.md` - Protocolo WebSocket completo
- `message-schemas.json` - Esquemas JSON de validación
- `unity-client/README.md` - Guía de uso de scripts C#
- `unity-client/NeudrasilClient.cs` - Cliente WebSocket
- `unity-client/SessionManager.cs` - Gestor de sesiones
- `unity-client/DataCollector.cs` - Recolector de datos VR

## Quick Start

1. Instalar dependencias en Unity:
   - WebSocketSharp
   - Newtonsoft.Json

2. Copiar scripts C# al proyecto

3. Configurar GameObject con los 3 componentes

4. Iniciar servidor Electron

5. Jugar en Unity - la conexión es automática

## Flujo de Integración

```
Doctor inicia sesión → Unity recibe SESSION_START
→ Unity carga juego → Recolecta datos VR
→ Envía a Electron → Análisis de IA
→ Juego termina → SESSION_END
```

Para más detalles, ver `unity-integration/protocol.md`.
