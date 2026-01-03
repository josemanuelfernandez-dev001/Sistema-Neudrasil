using System;
using UnityEngine;

namespace Neudrasil
{
    /// <summary>
    /// Gestor de sesiones de terapia
    /// </summary>
    public class SessionManager : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private NeudrasilClient client;
        [SerializeField] private DataCollector dataCollector;

        private string currentSessionId;
        private string currentPatientId;
        private string currentGameId;
        private DateTime sessionStartTime;
        private bool isSessionActive = false;

        private void Start()
        {
            if (client == null)
            {
                client = GetComponent<NeudrasilClient>();
            }

            if (dataCollector == null)
            {
                dataCollector = GetComponent<DataCollector>();
            }

            // Subscribe to client events
            client.OnSessionStart += HandleSessionStart;
            client.OnAcknowledgment += HandleAcknowledgment;
        }

        /// <summary>
        /// Manejar inicio de sesión desde el servidor
        /// </summary>
        private void HandleSessionStart(NeudrasilClient.SessionStartMessage message)
        {
            Debug.Log($"Starting session {message.sessionId} for patient {message.patientName}");

            currentSessionId = message.sessionId;
            currentPatientId = message.patientId;
            currentGameId = message.gameId;
            sessionStartTime = DateTime.UtcNow;
            isSessionActive = true;

            // Iniciar recolección de datos
            dataCollector.StartCollection(currentSessionId);

            // Cargar y comenzar el juego
            LoadGame(message.gameId);
        }

        /// <summary>
        /// Cargar el juego VR especificado
        /// </summary>
        private void LoadGame(string gameId)
        {
            Debug.Log($"Loading game: {gameId}");
            
            // Implementar lógica para cargar el juego específico
            // Por ejemplo, usando SceneManager o un sistema de carga de prefabs
            
            switch (gameId)
            {
                case "balance-vr":
                    // Cargar juego de balance
                    break;
                case "memory-game":
                    // Cargar juego de memoria
                    break;
                case "motor-skills":
                    // Cargar juego de habilidades motoras
                    break;
                default:
                    Debug.LogWarning($"Unknown game ID: {gameId}");
                    break;
            }
        }

        /// <summary>
        /// Finalizar sesión actual
        /// </summary>
        public void EndSession(SessionSummary summary = null)
        {
            if (!isSessionActive)
            {
                Debug.LogWarning("No active session to end");
                return;
            }

            // Detener recolección de datos
            dataCollector.StopCollection();

            // Calcular duración
            int duration = (int)(DateTime.UtcNow - sessionStartTime).TotalSeconds;

            // Crear resumen si no se proporciona
            if (summary == null)
            {
                summary = new SessionSummary
                {
                    totalMovements = dataCollector.GetTotalMovements(),
                    accuracy = CalculateAccuracy(),
                    completed = true,
                    score = CalculateScore()
                };
            }

            // Enviar al servidor
            client.SendSessionEnd(currentSessionId, duration, summary);

            // Limpiar estado
            isSessionActive = false;
            currentSessionId = null;
        }

        /// <summary>
        /// Pausar sesión actual
        /// </summary>
        public void PauseSession()
        {
            if (!isSessionActive)
            {
                Debug.LogWarning("No active session to pause");
                return;
            }

            dataCollector.PauseCollection();
            Debug.Log("Session paused");
        }

        /// <summary>
        /// Reanudar sesión pausada
        /// </summary>
        public void ResumeSession()
        {
            if (!isSessionActive)
            {
                Debug.LogWarning("No active session to resume");
                return;
            }

            dataCollector.ResumeCollection();
            Debug.Log("Session resumed");
        }

        /// <summary>
        /// Calcular precisión de la sesión
        /// </summary>
        private float CalculateAccuracy()
        {
            // Implementar lógica de cálculo de precisión
            // Basado en los datos recolectados
            return 85.5f; // Placeholder
        }

        /// <summary>
        /// Calcular puntuación de la sesión
        /// </summary>
        private int CalculateScore()
        {
            // Implementar lógica de cálculo de puntuación
            return 850; // Placeholder
        }

        /// <summary>
        /// Manejar confirmaciones del servidor
        /// </summary>
        private void HandleAcknowledgment(NeudrasilClient.AcknowledgmentMessage message)
        {
            Debug.Log($"Server ACK: {message.message}");
        }

        /// <summary>
        /// Obtener información de sesión actual
        /// </summary>
        public SessionInfo GetCurrentSessionInfo()
        {
            if (!isSessionActive)
                return null;

            return new SessionInfo
            {
                sessionId = currentSessionId,
                patientId = currentPatientId,
                gameId = currentGameId,
                duration = (int)(DateTime.UtcNow - sessionStartTime).TotalSeconds,
                isActive = isSessionActive
            };
        }

        private void OnDestroy()
        {
            if (isSessionActive)
            {
                EndSession();
            }
        }

        // Data Classes
        [Serializable]
        public class SessionSummary
        {
            public int totalMovements;
            public float accuracy;
            public bool completed;
            public int score;
            public int levelsCompleted;
            public float averageSpeed;
        }

        [Serializable]
        public class SessionInfo
        {
            public string sessionId;
            public string patientId;
            public string gameId;
            public int duration;
            public bool isActive;
        }
    }
}
