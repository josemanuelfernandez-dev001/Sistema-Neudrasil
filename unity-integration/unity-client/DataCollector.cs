using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

namespace Neudrasil
{
    /// <summary>
    /// Recolector de datos VR
    /// </summary>
    public class DataCollector : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float sendInterval = 0.1f; // 100ms
        [SerializeField] private int batchSize = 10;
        [SerializeField] private bool collectGazeData = true;
        [SerializeField] private bool collectBiometricData = false;

        [Header("References")]
        [SerializeField] private NeudrasilClient client;
        [SerializeField] private Transform headTransform;
        [SerializeField] private Transform leftHandTransform;
        [SerializeField] private Transform rightHandTransform;

        private string currentSessionId;
        private bool isCollecting = false;
        private List<VRDataPoint> dataBuffer = new List<VRDataPoint>();
        private int totalMovements = 0;
        private Coroutine collectionCoroutine;

        private void Start()
        {
            if (client == null)
            {
                client = GetComponent<NeudrasilClient>();
            }

            // Auto-detect XR devices if transforms not assigned
            if (headTransform == null || leftHandTransform == null || rightHandTransform == null)
            {
                SetupXRDevices();
            }
        }

        /// <summary>
        /// Configurar dispositivos XR automáticamente
        /// </summary>
        private void SetupXRDevices()
        {
            Debug.Log("Auto-detecting XR devices...");
            // Implementar detección automática de dispositivos XR
            // Esto dependerá del sistema XR utilizado (OpenXR, Oculus, SteamVR, etc.)
        }

        /// <summary>
        /// Iniciar recolección de datos
        /// </summary>
        public void StartCollection(string sessionId)
        {
            currentSessionId = sessionId;
            isCollecting = true;
            totalMovements = 0;
            dataBuffer.Clear();

            collectionCoroutine = StartCoroutine(CollectAndSendData());
            Debug.Log($"Data collection started for session {sessionId}");
        }

        /// <summary>
        /// Detener recolección de datos
        /// </summary>
        public void StopCollection()
        {
            isCollecting = false;
            
            if (collectionCoroutine != null)
            {
                StopCoroutine(collectionCoroutine);
                collectionCoroutine = null;
            }

            // Enviar datos pendientes
            if (dataBuffer.Count > 0)
            {
                SendBatch();
            }

            Debug.Log("Data collection stopped");
        }

        /// <summary>
        /// Pausar recolección
        /// </summary>
        public void PauseCollection()
        {
            isCollecting = false;
        }

        /// <summary>
        /// Reanudar recolección
        /// </summary>
        public void ResumeCollection()
        {
            isCollecting = true;
        }

        /// <summary>
        /// Corrutina para recolectar y enviar datos
        /// </summary>
        private IEnumerator CollectAndSendData()
        {
            while (true)
            {
                if (isCollecting)
                {
                    CollectCurrentFrame();

                    if (dataBuffer.Count >= batchSize)
                    {
                        SendBatch();
                    }
                }

                yield return new WaitForSeconds(sendInterval);
            }
        }

        /// <summary>
        /// Recolectar datos del frame actual
        /// </summary>
        private void CollectCurrentFrame()
        {
            // Recolectar datos de movimiento
            var movementData = CollectMovementData();
            dataBuffer.Add(new VRDataPoint
            {
                type = "MOVEMENT",
                timestamp = DateTime.UtcNow.ToString("o"),
                data = movementData
            });

            // Recolectar datos de mirada si está habilitado
            if (collectGazeData)
            {
                var gazeData = CollectGazeData();
                if (gazeData != null)
                {
                    dataBuffer.Add(new VRDataPoint
                    {
                        type = "GAZE",
                        timestamp = DateTime.UtcNow.ToString("o"),
                        data = gazeData
                    });
                }
            }

            // Recolectar datos biométricos si está habilitado
            if (collectBiometricData)
            {
                var biometricData = CollectBiometricData();
                if (biometricData != null)
                {
                    dataBuffer.Add(new VRDataPoint
                    {
                        type = "BIOMETRIC",
                        timestamp = DateTime.UtcNow.ToString("o"),
                        data = biometricData
                    });
                }
            }

            totalMovements++;
        }

        /// <summary>
        /// Recolectar datos de movimiento
        /// </summary>
        private MovementData CollectMovementData()
        {
            var data = new MovementData();

            if (headTransform != null)
            {
                data.headPosition = new Vector3Data(headTransform.position);
                data.headRotation = new Vector3Data(headTransform.eulerAngles);
            }

            if (leftHandTransform != null)
            {
                data.leftHand = new HandData
                {
                    position = new Vector3Data(leftHandTransform.position),
                    rotation = new Vector3Data(leftHandTransform.eulerAngles),
                    velocity = CalculateVelocity(leftHandTransform)
                };
            }

            if (rightHandTransform != null)
            {
                data.rightHand = new HandData
                {
                    position = new Vector3Data(rightHandTransform.position),
                    rotation = new Vector3Data(rightHandTransform.eulerAngles),
                    velocity = CalculateVelocity(rightHandTransform)
                };
            }

            return data;
        }

        /// <summary>
        /// Recolectar datos de seguimiento ocular
        /// </summary>
        private GazeData CollectGazeData()
        {
            // Implementar recolección de datos de eye tracking
            // Esto dependerá del hardware y SDK utilizado
            return null; // Placeholder
        }

        /// <summary>
        /// Recolectar datos biométricos
        /// </summary>
        private BiometricData CollectBiometricData()
        {
            // Implementar recolección de datos biométricos
            // (frecuencia cardíaca, etc., si el hardware lo soporta)
            return null; // Placeholder
        }

        /// <summary>
        /// Calcular velocidad de un transform
        /// </summary>
        private float CalculateVelocity(Transform t)
        {
            // Implementar cálculo de velocidad basado en posición anterior
            // Por ahora retornamos un placeholder
            return 0f;
        }

        /// <summary>
        /// Enviar lote de datos al servidor
        /// </summary>
        private void SendBatch()
        {
            if (dataBuffer.Count == 0) return;

            foreach (var dataPoint in dataBuffer)
            {
                client.SendVRData(currentSessionId, dataPoint.type, dataPoint.data);
            }

            dataBuffer.Clear();
        }

        /// <summary>
        /// Registrar interacción con objeto
        /// </summary>
        public void RecordInteraction(string objectName, string interactionType)
        {
            var interactionData = new InteractionData
            {
                objectName = objectName,
                interactionType = interactionType,
                timestamp = DateTime.UtcNow.ToString("o")
            };

            client.SendVRData(currentSessionId, "INTERACTION", interactionData);
        }

        /// <summary>
        /// Registrar gesto reconocido
        /// </summary>
        public void RecordGesture(string gestureName, float confidence)
        {
            var gestureData = new GestureData
            {
                gestureName = gestureName,
                confidence = confidence,
                timestamp = DateTime.UtcNow.ToString("o")
            };

            client.SendVRData(currentSessionId, "GESTURE", gestureData);
        }

        /// <summary>
        /// Obtener total de movimientos recolectados
        /// </summary>
        public int GetTotalMovements()
        {
            return totalMovements;
        }

        // Data Classes
        [Serializable]
        private class VRDataPoint
        {
            public string type;
            public string timestamp;
            public object data;
        }

        [Serializable]
        public class MovementData
        {
            public Vector3Data headPosition;
            public Vector3Data headRotation;
            public HandData leftHand;
            public HandData rightHand;
        }

        [Serializable]
        public class HandData
        {
            public Vector3Data position;
            public Vector3Data rotation;
            public float velocity;
        }

        [Serializable]
        public class Vector3Data
        {
            public float x;
            public float y;
            public float z;

            public Vector3Data() { }
            
            public Vector3Data(Vector3 v)
            {
                x = v.x;
                y = v.y;
                z = v.z;
            }
        }

        [Serializable]
        public class GazeData
        {
            public Vector3Data gazeOrigin;
            public Vector3Data gazeDirection;
            public float confidence;
        }

        [Serializable]
        public class BiometricData
        {
            public float heartRate;
            public float skinTemperature;
        }

        [Serializable]
        public class InteractionData
        {
            public string objectName;
            public string interactionType;
            public string timestamp;
        }

        [Serializable]
        public class GestureData
        {
            public string gestureName;
            public float confidence;
            public string timestamp;
        }
    }
}
