# API Reference - Sistema Neudrasil

## IPC API (Frontend ↔ Electron)

### Authentication

#### `auth:login`
```javascript
await window.electronAPI.login({ email, password })
```
**Returns**: `{ success: boolean, data?: { user, token }, error?: string }`

#### `auth:logout`
```javascript
await window.electronAPI.logout()
```

#### `auth:getCurrentUser`
```javascript
await window.electronAPI.getCurrentUser()
```

### Patients

#### `patients:getAll`
```javascript
await window.electronAPI.getPatients()
```

#### `patients:getById`
```javascript
await window.electronAPI.getPatient(id)
```

#### `patients:create`
```javascript
await window.electronAPI.createPatient(patientData)
```

#### `patients:update`
```javascript
await window.electronAPI.updatePatient(id, data)
```

#### `patients:delete`
```javascript
await window.electronAPI.deletePatient(id)
```

### Sessions

#### `sessions:getByPatient`
```javascript
await window.electronAPI.getSessions(patientId)
```

#### `sessions:create`
```javascript
await window.electronAPI.createSession({ patientId, doctorId, gameId })
```

#### `sessions:end`
```javascript
await window.electronAPI.endSession(id, summary)
```

### Events (Electron → Frontend)

#### `vr-data-received`
```javascript
window.electronAPI.onVRData((data) => {
  console.log(data.sessionId, data.dataType, data.data);
});
```

#### `vr-data-processed`
```javascript
window.electronAPI.onVRDataProcessed((data) => {
  console.log(data.score, data.analysis);
});
```

## WebSocket Protocol (Unity ↔ Electron)

Ver `unity-integration/protocol.md` para detalles completos.

## Svelte Stores

### authStore
```javascript
import { authStore } from '$lib/stores/auth.store';

// Login
await authStore.login(email, password);

// Logout
await authStore.logout();

// Subscribe
authStore.subscribe(state => {
  console.log(state.user, state.isAuthenticated);
});
```

### patientsStore
```javascript
import { patientsStore } from '$lib/stores/patients.store';

// Load all patients
await patientsStore.loadPatients();

// Get specific patient
const patient = await patientsStore.getPatient(id);

// Create patient
await patientsStore.createPatient(data);
```

## Service APIs

### AIService

#### analyze(dataType, data)
```javascript
const analysis = await aiService.analyze('MOVEMENT', vrData);
```

**Returns**: 
```javascript
{
  modelVersion: string,
  score: number,
  confidence: number,
  result: object,
  anomalies: array | null,
  recommendations: string
}
```

### DatabaseService

#### query(table, operation, data)
```javascript
const result = await databaseService.query('Patient', 'SELECT', { 
  select: '*' 
});
```

### WebSocketService

#### broadcast(message)
```javascript
websocketService.broadcast({
  type: 'SESSION_START',
  sessionId: 'uuid',
  gameId: 'balance-vr'
});
```

## Utility Functions

### Formatters

```javascript
import { formatDate, formatDuration, calculateAge } from '$lib/utils/formatters';

formatDate(new Date()); // "03/01/2026"
formatDuration(3600); // "1h 0m"
calculateAge('1990-01-01'); // 36
```

### Validators

```javascript
import { validateEmail, validatePassword } from '$lib/utils/validators';

validateEmail('test@example.com'); // true
validatePassword('12345'); // false (too short)
```

## Error Handling

Todas las llamadas a APIs devuelven un objeto con:
```javascript
{
  success: boolean,
  data?: any,
  error?: string
}
```

Siempre verificar `success` antes de usar `data`.
