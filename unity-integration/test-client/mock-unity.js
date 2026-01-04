/**
 * Mock Unity Client for Testing
 * Simulates Unity VR client without needing Unity engine
 */

const WebSocket = require('ws');

class MockUnityClient {
  constructor(host = 'localhost', port = 8080) {
    this.host = host;
    this.port = port;
    this.ws = null;
    this.isConnected = false;
    this.currentSessionId = null;
    this.dataInterval = null;
  }

  connect() {
    const url = `ws://${this.host}:${this.port}`;
    console.log(`Connecting to ${url}...`);

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.isConnected = true;
      console.log('✓ Connected to Neudrasil System');
      this.startSimulation();
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      console.log('Disconnected from server');
      this.stopDataCollection();
    });
  }

  handleMessage(message) {
    console.log(`\n📨 Received: ${message.type}`);

    switch (message.type) {
      case 'SESSION_START':
        console.log(`  Session ID: ${message.sessionId}`);
        console.log(`  Patient: ${message.patientName}`);
        console.log(`  Game: ${message.gameId}`);
        this.handleSessionStart(message);
        break;

      case 'ACK':
        console.log(`  ✓ ${message.message}`);
        break;

      case 'ERROR':
        console.error(`  ✗ Error: ${message.message}`);
        break;

      case 'HEARTBEAT':
        this.sendMessage({ type: 'HEARTBEAT', timestamp: new Date().toISOString() });
        break;

      default:
        console.log(`  Unknown message type: ${message.type}`);
    }
  }

  handleSessionStart(message) {
    this.currentSessionId = message.sessionId;
    this.startDataCollection();
  }

  startSimulation() {
    // Simulate waiting for SESSION_START from server
    console.log('\n⏳ Waiting for SESSION_START from server...');
    console.log('(In real scenario, doctor would start session from frontend)');
  }

  startDataCollection() {
    console.log('\n🎮 Starting VR data collection...');

    let frameCount = 0;
    
    this.dataInterval = setInterval(() => {
      if (!this.isConnected || !this.currentSessionId) {
        return;
      }

      frameCount++;

      // Simulate VR data
      const vrData = {
        headPosition: {
          x: Math.sin(frameCount * 0.1) * 0.5,
          y: 1.7 + Math.sin(frameCount * 0.05) * 0.1,
          z: -2.0 + Math.cos(frameCount * 0.1) * 0.3
        },
        headRotation: {
          x: Math.sin(frameCount * 0.02) * 10,
          y: Math.cos(frameCount * 0.03) * 30,
          z: 0
        },
        leftHand: {
          position: {
            x: -0.3 + Math.sin(frameCount * 0.2) * 0.1,
            y: 1.2 + Math.cos(frameCount * 0.15) * 0.1,
            z: -0.5
          },
          rotation: { x: 0, y: 0, z: 0 },
          velocity: Math.abs(Math.sin(frameCount * 0.1)) * 0.5
        },
        rightHand: {
          position: {
            x: 0.3 + Math.cos(frameCount * 0.2) * 0.1,
            y: 1.2 + Math.sin(frameCount * 0.15) * 0.1,
            z: -0.5
          },
          rotation: { x: 0, y: 0, z: 0 },
          velocity: Math.abs(Math.cos(frameCount * 0.1)) * 0.5
        }
      };

      this.sendVRData('MOVEMENT', vrData);

      // Log every 10 frames
      if (frameCount % 10 === 0) {
        console.log(`📊 Sent ${frameCount} data frames`);
      }

      // Simulate occasional gestures
      if (frameCount % 50 === 0) {
        this.sendVRData('GESTURE', {
          gestureName: 'wave',
          confidence: 0.85 + Math.random() * 0.15
        });
        console.log('👋 Gesture detected: wave');
      }

      // Auto-end session after 100 frames for testing
      if (frameCount >= 100) {
        console.log('\n⏱️  Test session duration reached, ending session...');
        this.endSession();
      }
    }, 100); // 100ms = 10 fps
  }

  stopDataCollection() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
      console.log('\n⏸️  Data collection stopped');
    }
  }

  sendVRData(dataType, data) {
    const message = {
      type: 'VR_DATA',
      sessionId: this.currentSessionId,
      timestamp: new Date().toISOString(),
      dataType,
      data
    };

    this.sendMessage(message);
  }

  endSession() {
    if (!this.currentSessionId) {
      console.log('No active session to end');
      return;
    }

    this.stopDataCollection();

    const summary = {
      totalMovements: 100,
      accuracy: 85.5 + Math.random() * 10,
      averageSpeed: 2.3 + Math.random(),
      completed: true,
      levelsCompleted: 3,
      score: Math.floor(800 + Math.random() * 200)
    };

    const message = {
      type: 'SESSION_END',
      sessionId: this.currentSessionId,
      duration: 10, // 10 seconds for testing
      summary
    };

    this.sendMessage(message);
    console.log('\n✅ Session ended successfully');
    console.log('Summary:', JSON.stringify(summary, null, 2));

    this.currentSessionId = null;
  }

  sendMessage(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.stopDataCollection();
      this.ws.close();
    }
  }
}

// CLI Interface
if (require.main === module) {
  console.log('🧪 Mock Unity Client - Sistema Neudrasil');
  console.log('=========================================\n');

  const host = process.argv[2] || 'localhost';
  const port = process.argv[3] || 8080;

  const client = new MockUnityClient(host, port);
  client.connect();

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    client.disconnect();
    process.exit(0);
  });
}

module.exports = MockUnityClient;
