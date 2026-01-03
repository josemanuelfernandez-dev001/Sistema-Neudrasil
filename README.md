# Sistema Neudrasil

<div align="center">
  <h1>🧠 Sistema Neudrasil</h1>
  <p><strong>Sistema de Gestión de Neuroterapia con VR e Inteligencia Artificial</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?style=flat-square&logo=electron" alt="Electron" />
    <img src="https://img.shields.io/badge/SvelteKit-2.0.0-FF3E00?style=flat-square&logo=svelte" alt="SvelteKit" />
    <img src="https://img.shields.io/badge/Unity-2020.3+-000000?style=flat-square&logo=unity" alt="Unity" />
    <img src="https://img.shields.io/badge/TensorFlow.js-4.15.0-FF6F00?style=flat-square&logo=tensorflow" alt="TensorFlow" />
  </p>
</div>

## 📋 Descripción

Sistema Neudrasil es una aplicación de escritorio médica construida con Electron y SvelteKit para la gestión de sesiones de neuroterapia. Integra realidad virtual (Unity) y análisis mediante inteligencia artificial para proporcionar terapias personalizadas y análisis detallados del progreso de los pacientes.

## ✨ Características Principales

- 🎮 **Integración VR con Unity**: Juegos terapéuticos en realidad virtual
- 🤖 **Análisis con IA**: TensorFlow.js para análisis en tiempo real
- 📊 **Visualización de Datos**: Gráficos interactivos con Chart.js
- 💾 **Modo Offline**: Funcionamiento completo sin conexión a internet
- 🔄 **Sincronización Automática**: Sync bidireccional con Supabase
- 🔐 **Seguridad Médica**: Cifrado de datos sensibles
- 📱 **Interfaz Moderna**: UI intuitiva con TailwindCSS

## 🛠️ Stack Tecnológico

### Frontend
- **SvelteKit 2.0**: Framework principal
- **TailwindCSS**: Estilos con paleta médica
- **Chart.js**: Visualización de datos
- **Svelte Query**: Gestión de estado

### Backend (Electron)
- **Node.js**: Runtime principal
- **Express.js**: API interna
- **WebSocket (ws)**: Comunicación con Unity
- **Prisma ORM**: Gestión de base de datos
- **Supabase**: Base de datos PostgreSQL
- **better-sqlite3**: Base de datos local offline

### IA
- **TensorFlow.js**: Motor de IA
- **Teachable Machine**: Modelos preentrenados
- Análisis de movimiento, mirada y gestos

### VR Integration
- **Unity**: Motor VR
- **WebSocket Client (C#)**: Comunicación bidireccional
- Protocolo JSON documentado

## 📁 Estructura del Proyecto

```
sistema-neudrasil/
├── electron/              # Proceso principal Electron
│   ├── main.js
│   ├── preload.js
│   ├── config/           # Configuraciones
│   ├── services/         # Servicios backend
│   ├── controllers/      # Controladores IPC
│   └── utils/            # Utilidades
├── src/                   # Frontend SvelteKit
│   ├── routes/           # Páginas y rutas
│   └── lib/              # Componentes y stores
├── unity-integration/     # Scripts Unity + Protocolo
├── ai-models/            # Modelos de IA + Scripts
├── prisma/               # Esquema de base de datos
├── docs/                 # Documentación
└── tests/                # Tests unitarios e integración
```

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o yarn
- PostgreSQL (vía Supabase)
- Unity 2020.3+ (para desarrollo VR)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/josemanuelfernandez-dev001/Sistema-Neudrasil.git
cd Sistema-Neudrasil

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Inicializar base de datos
npx prisma generate
npx prisma db push
npx prisma db seed

# Iniciar en modo desarrollo
npm run dev          # Frontend (puerto 5173)
npm run electron:dev # Electron app
```

### Desarrollo

```bash
# Frontend
npm run dev

# Electron (en otra terminal)
npm run electron:dev

# Build para producción
npm run build
npm run electron:build
```

## 📖 Documentación

- [Arquitectura](docs/architecture.md) - Visión general de la arquitectura
- [API Reference](docs/api-reference.md) - Documentación de APIs
- [Unity Integration](docs/unity-integration.md) - Guía de integración VR
- [AI Models](docs/ai-models.md) - Modelos de inteligencia artificial

## 🎮 Integración Unity

1. Copiar scripts C# desde `unity-integration/unity-client/` a tu proyecto Unity
2. Instalar dependencias: WebSocketSharp y Newtonsoft.Json
3. Configurar GameObject con los 3 componentes
4. Ver [protocolo completo](unity-integration/protocol.md)

## 🤖 Modelos de IA

El sistema incluye 3 modelos de IA:

1. **Movement Analyzer**: Analiza patrones de movimiento VR
2. **Gaze Analyzer**: Evalúa atención mediante eye tracking
3. **Gesture Recognizer**: Identifica gestos específicos

Ver [documentación completa](ai-models/README.md) para entrenar y exportar modelos.

## 🔐 Seguridad

- Autenticación con Supabase Auth + JWT
- Cifrado AES-256-GCM para datos sensibles
- Validación de todos los inputs
- WebSocket solo en localhost
- Logs de auditoría

## 🧪 Testing

```bash
# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📊 Características Médicas

### Gestión de Pacientes
- Expedientes médicos digitales
- Historial completo de sesiones
- Línea de tiempo de progreso
- Reportes generados por IA

### Sesiones de Terapia
- Juegos VR personalizables
- Monitoreo en tiempo real
- Análisis automático con IA
- Generación de recomendaciones

### Análisis y Reportes
- Visualización de progreso
- Comparación entre sesiones
- Detección de anomalías
- Recomendaciones personalizadas

## 🌐 Modo Offline

El sistema funciona completamente offline:
- SQLite local para almacenamiento
- Queue de sincronización
- Resolución automática de conflictos
- Reconexión automática

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit de cambios
4. Push a la rama
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es privado y está sujeto a las políticas de la organización.

## 👥 Equipo

Desarrollado por el equipo de Sistema Neudrasil.

## 📧 Contacto

Para soporte o consultas:
- Email: soporte@sistemaneudrasil.com
- Issues: GitHub Issues

---

<div align="center">
  <p>Hecho con ❤️ para mejorar la neuroterapia</p>
  <p>© 2026 Sistema Neudrasil</p>
</div>
