using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using Newtonsoft.Json;

namespace Neudrasil
{
    /// <summary>
    /// Cliente WebSocket para comunicación con Sistema Neudrasil
    /// </summary>
    public class NeudrasilClient : MonoBehaviour
    {
        [Header("Connection Settings")]
        [SerializeField] private string serverHost = "localhost";
        [SerializeField] private int serverPort = 8080;
        [SerializeField] private int reconnectAttempts = 5;
        [SerializeField] private float reconnectDelay = 3f;

        private WebSocket ws;
        private bool isConnected = false;
        private int currentReconnectAttempt = 0;
        private Queue<string> messageQueue = new Queue<string>();
        
        // Events
        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action<SessionStartMessage> OnSessionStart;
        public event Action<AcknowledgmentMessage> OnAcknowledgment;
        public event Action<ErrorMessage> OnError;

        private void Start()
        {
            Connect();
        }

        /// <summary>
        /// Establecer conexión con el servidor
        /// </summary>
        public void Connect()
        {
            if (ws != null && (ws.ReadyState == WebSocketState.Open || ws.ReadyState == WebSocketState.Connecting))
            {
                Debug.Log("Already connected or connecting");
                return;
            }

            string url = $"ws://{serverHost}:{serverPort}";
            Debug.Log($"Connecting to {url}...");

            ws = new WebSocket(url);

            ws.OnOpen += (sender, e) =>
            {
                isConnected = true;
                currentReconnectAttempt = 0;
                Debug.Log("Connected to Neudrasil System");
                OnConnected?.Invoke();
                ProcessMessageQueue();
            };

            ws.OnMessage += (sender, e) =>
            {
                HandleMessage(e.Data);
            };

            ws.OnError += (sender, e) =>
            {
                Debug.LogError($"WebSocket Error: {e.Message}");
            };

            ws.OnClose += (sender, e) =>
            {
                isConnected = false;
                Debug.Log($"Disconnected from server. Reason: {e.Reason}");
                OnDisconnected?.Invoke();
                
                // Attempt reconnection
                if (currentReconnectAttempt < reconnectAttempts)
                {
                    StartCoroutine(AttemptReconnect());
                }
            };

            ws.Connect();
        }

        /// <summary>
        /// Manejar mensajes recibidos del servidor
        /// </summary>
        private void HandleMessage(string jsonData)
        {
            try
            {
                var baseMessage = JsonConvert.DeserializeObject<BaseMessage>(jsonData);

                switch (baseMessage.type)
                {
                    case "SESSION_START":
                        var sessionStart = JsonConvert.DeserializeObject<SessionStartMessage>(jsonData);
                        OnSessionStart?.Invoke(sessionStart);
                        break;

                    case "ACK":
                        var ack = JsonConvert.DeserializeObject<AcknowledgmentMessage>(jsonData);
                        OnAcknowledgment?.Invoke(ack);
                        break;

                    case "ERROR":
                        var error = JsonConvert.DeserializeObject<ErrorMessage>(jsonData);
                        OnError?.Invoke(error);
                        Debug.LogError($"Server Error: {error.message}");
                        break;

                    case "HEARTBEAT":
                        SendHeartbeat();
                        break;

                    default:
                        Debug.LogWarning($"Unknown message type: {baseMessage.type}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Error parsing message: {ex.Message}");
            }
        }

        /// <summary>
        /// Enviar datos VR al servidor
        /// </summary>
        public void SendVRData(string sessionId, string dataType, object data)
        {
            var message = new VRDataMessage
            {
                type = "VR_DATA",
                sessionId = sessionId,
                timestamp = DateTime.UtcNow.ToString("o"),
                dataType = dataType,
                data = data
            };

            SendMessage(message);
        }

        /// <summary>
        /// Notificar finalización de sesión
        /// </summary>
        public void SendSessionEnd(string sessionId, int duration, object summary)
        {
            var message = new SessionEndMessage
            {
                type = "SESSION_END",
                sessionId = sessionId,
                duration = duration,
                summary = summary
            };

            SendMessage(message);
        }

        /// <summary>
        /// Enviar heartbeat al servidor
        /// </summary>
        private void SendHeartbeat()
        {
            var message = new HeartbeatMessage
            {
                type = "HEARTBEAT",
                timestamp = DateTime.UtcNow.ToString("o")
            };

            SendMessage(message);
        }

        /// <summary>
        /// Enviar mensaje al servidor
        /// </summary>
        private void SendMessage(object message)
        {
            string json = JsonConvert.SerializeObject(message);

            if (isConnected && ws.ReadyState == WebSocketState.Open)
            {
                ws.Send(json);
            }
            else
            {
                // Queue message for later
                messageQueue.Enqueue(json);
                Debug.LogWarning("Message queued - not connected");
            }
        }

        /// <summary>
        /// Procesar cola de mensajes pendientes
        /// </summary>
        private void ProcessMessageQueue()
        {
            while (messageQueue.Count > 0)
            {
                string message = messageQueue.Dequeue();
                ws.Send(message);
            }
        }

        /// <summary>
        /// Intentar reconexión
        /// </summary>
        private IEnumerator AttemptReconnect()
        {
            currentReconnectAttempt++;
            Debug.Log($"Reconnection attempt {currentReconnectAttempt}/{reconnectAttempts}...");
            
            yield return new WaitForSeconds(reconnectDelay);
            
            Connect();
        }

        /// <summary>
        /// Desconectar del servidor
        /// </summary>
        public void Disconnect()
        {
            if (ws != null)
            {
                ws.Close();
                ws = null;
            }
        }

        private void OnDestroy()
        {
            Disconnect();
        }

        // Message Classes
        [Serializable]
        public class BaseMessage
        {
            public string type;
        }

        [Serializable]
        public class SessionStartMessage : BaseMessage
        {
            public string sessionId;
            public string patientId;
            public string patientName;
            public string doctorId;
            public string gameId;
        }

        [Serializable]
        public class VRDataMessage : BaseMessage
        {
            public string sessionId;
            public string timestamp;
            public string dataType;
            public object data;
        }

        [Serializable]
        public class SessionEndMessage : BaseMessage
        {
            public string sessionId;
            public int duration;
            public object summary;
        }

        [Serializable]
        public class HeartbeatMessage : BaseMessage
        {
            public string timestamp;
        }

        [Serializable]
        public class AcknowledgmentMessage : BaseMessage
        {
            public string sessionId;
            public string message;
        }

        [Serializable]
        public class ErrorMessage : BaseMessage
        {
            public string message;
            public string code;
        }
    }
}
