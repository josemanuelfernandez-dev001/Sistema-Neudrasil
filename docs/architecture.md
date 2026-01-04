# Sistema Neudrasil - Arquitectura del Sistema

## Visión General

Sistema Neudrasil es una aplicación de escritorio médica construida con Electron y SvelteKit para la gestión de sesiones de neuroterapia con integración VR y análisis mediante inteligencia artificial.

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA NEUDRASIL                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Electron   │  │     Unity     │      │
│  │  SvelteKit   │◄─┤     Main     │◄─┤   VR Client   │      │
│  │              │  │   Process    │  │   (WebSocket) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                                  │
│         │                  │                                  │
│         ▼                  ▼                                  │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │     IPC      │  │   Services   │                         │
│  │   Channels   │  │  - Auth      │                         │
│  │              │  │  - Database  │                         │
│  └──────────────┘  │  - WebSocket │                         │
│                     │  - AI        │                         │
│                     │  - Messaging │                         │
│                     │  - Files     │                         │
│                     └──────────────┘                         │
│                            │                                  │
│                            ▼                                  │
│                     ┌──────────────┐                         │
│                     │   Database   │                         │
│                     ├──────────────┤                         │
│                     │  Supabase    │                         │
│                     │ (PostgreSQL) │                         │
│                     └──────────────┘                         │
│                            │                                  │
│                            ▼                                  │
│                     ┌──────────────┐                         │
│                     │   SQLite     │                         │
│                     │   (Offline)  │                         │
│                     └──────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (SvelteKit)

**Responsabilidades**:
- Interfaz de usuario
- Gestión de estado con Stores
- Comunicación con Electron vía IPC
- Visualización de datos (Chart.js)

**Tecnologías**:
- SvelteKit 2.0
- TailwindCSS
- Chart.js
- Svelte Query

### 2. Electron Main Process

**Responsabilidades**:
- Gestión de ventanas
- Comunicación IPC con frontend
- Orquestación de servicios
- Gestión del ciclo de vida de la app

**Archivo principal**: `electron/main.js`

### 3. Servicios Backend

#### Auth Service
- Autenticación de usuarios
- Gestión de sesiones
- Tokens JWT
- Roles y permisos

#### Database Service
- Cliente Supabase (online)
- Cliente SQLite (offline)
- Sincronización bidireccional
- Queue de operaciones

#### WebSocket Service
- Servidor WebSocket para Unity
- Protocolo de mensajes JSON
- Heartbeat y reconexión
- Procesamiento de datos VR

#### AI Service
- Carga de modelos TensorFlow.js
- Análisis de datos VR
- Generación de scores
- Detección de anomalías

#### Messaging Service
- Sistema de mensajería interna
- Conversaciones entre usuarios
- Notificaciones en tiempo real

#### File Service
- Upload a Supabase Storage
- Almacenamiento local como respaldo
- Validación de archivos
- Cifrado de datos sensibles

### 4. Unity VR Client

**Responsabilidades**:
- Ejecución de juegos VR
- Captura de datos de tracking
- Comunicación WebSocket con Electron
- Gestión de sesiones

**Scripts C#**:
- NeudrasilClient.cs
- SessionManager.cs
- DataCollector.cs

## Flujo de Datos

### Flujo de Sesión Completa

```
1. Doctor → Frontend: Iniciar sesión
2. Frontend → Electron (IPC): Crear sesión
3. Electron → Database: Guardar sesión
4. Electron → Unity (WebSocket): SESSION_START
5. Unity → Juego VR: Cargar y comenzar
6. Unity → Electron: VR_DATA (continuo)
7. Electron → Database: Guardar datos raw
8. Electron → AI Service: Procesar datos
9. AI Service → Database: Guardar análisis
10. Electron → Frontend (IPC): Datos procesados
11. Frontend: Actualizar visualización
12. Unity → Electron: SESSION_END
13. Electron → Database: Actualizar sesión
14. Electron → Frontend: Sesión completada
```

## Base de Datos

### Esquema Prisma

Modelos principales:
- User (doctores, admins, terapeutas)
- Patient (pacientes asignados)
- TherapySession (sesiones de terapia)
- VRData (datos raw de VR)
- AIAnalysis (análisis de IA)
- Document (archivos médicos)
- Message (mensajería interna)
- Appointment (citas programadas)

### Estrategia de Sincronización

**Online**: 
- Todas las operaciones van a Supabase
- Respuestas inmediatas

**Offline**:
- Operaciones se guardan en SQLite
- Se encolan para sincronización
- Al reconectar, se sincronizan automáticamente

**Conflictos**:
- Estrategia: Last-Write-Wins
- El timestamp más reciente prevalece

## Seguridad

### Autenticación
- Supabase Auth para usuarios
- Tokens JWT con expiración
- Refresh tokens

### Datos Sensibles
- Contraseñas hasheadas con bcrypt
- Datos médicos cifrados con AES-256-GCM
- Archivos sensibles cifrados antes de almacenar

### Comunicación
- WebSocket solo localhost
- IPC aislado por contexto
- Validación de todos los inputs

## Performance

### Optimizaciones Frontend
- Lazy loading de componentes
- Virtualización de listas largas
- Debounce en búsquedas
- Cache de datos frecuentes

### Optimizaciones Backend
- Modelos de IA en memoria
- Batching de datos VR
- Conexiones pooled a DB
- Queue para operaciones pesadas

### Optimizaciones Unity
- Batching de datos VR (cada 100ms)
- Buffer local para offline
- Compresión de datos grandes

## Escalabilidad

### Horizontal
- Supabase escala automáticamente
- Frontend stateless permite múltiples instancias

### Vertical
- SQLite para operaciones locales rápidas
- Cache en memoria para datos frecuentes
- Procesamiento asíncrono de IA

## Monitoreo

### Logs
- Winston para logs estructurados
- Niveles: error, warn, info, debug
- Rotación automática de archivos

### Métricas
- Tiempo de respuesta de servicios
- Tasa de éxito/fallo de sincronización
- Performance de modelos de IA

## Decisiones Arquitectónicas

### ¿Por qué Electron?
- Cross-platform sin esfuerzo
- Acceso a APIs nativas
- Ecosistema maduro
- Fácil integración con WebSocket

### ¿Por qué SvelteKit?
- Performance superior
- Menor bundle size
- DX (Developer Experience) excelente
- SSR y routing integrados

### ¿Por qué Supabase?
- PostgreSQL con APIs REST y realtime
- Auth integrada
- Storage de archivos
- Open source y self-hosteable

### ¿Por qué SQLite offline?
- Cero configuración
- Embebido en la app
- Excelente para datos locales
- Sincronización simple

### ¿Por qué WebSocket?
- Bidireccional en tiempo real
- Baja latencia
- Ideal para datos VR continuos
- Ampliamente soportado

## Patrones de Diseño

### Singleton
- Servicios backend (auth, database, etc.)
- Cliente WebSocket

### Observer
- Stores de Svelte
- IPC event listeners
- WebSocket message handlers

### Factory
- Creación de modelos AI
- Generación de reportes

### Strategy
- Resolución de conflictos DB
- Algoritmos de análisis IA

## Futuras Mejoras

1. **Microservicios**: Separar servicios en procesos independientes
2. **GraphQL**: Reemplazar REST con GraphQL para queries más eficientes
3. **Redis**: Cache distribuido para mejor performance
4. **Docker**: Containerización para deployment más fácil
5. **CI/CD**: Pipeline automatizado de pruebas y deployment
