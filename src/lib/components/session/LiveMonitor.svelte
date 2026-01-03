<script>
  import { onMount, onDestroy } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Badge from '../ui/Badge.svelte';

  export let sessionId;

  let vrData = null;
  let isConnected = false;

  onMount(() => {
    // Listen for VR data events from Electron
    if (window.electronAPI) {
      window.electronAPI.onVRData((data) => {
        if (data.sessionId === sessionId) {
          vrData = data;
        }
      });

      window.electronAPI.onUnityConnected(() => {
        isConnected = true;
      });

      window.electronAPI.onUnityDisconnected(() => {
        isConnected = false;
      });
    }
  });

  onDestroy(() => {
    if (window.electronAPI) {
      window.electronAPI.removeAllListeners('vr-data-received');
      window.electronAPI.removeAllListeners('unity-connected');
      window.electronAPI.removeAllListeners('unity-disconnected');
    }
  });
</script>

<Card>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-lg">Monitor en Vivo</h3>
      <Badge variant={isConnected ? 'success' : 'default'}>
        {isConnected ? 'Unity Conectado' : 'Unity Desconectado'}
      </Badge>
    </div>

    {#if isConnected}
      <div class="border-2 border-medical-200 rounded-lg p-6 bg-medical-50">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm text-neutral-600">Tipo de Datos:</span>
            <p class="font-semibold">{vrData?.dataType || 'N/A'}</p>
          </div>
          <div>
            <span class="text-sm text-neutral-600">Timestamp:</span>
            <p class="font-mono text-sm">{vrData?.timestamp ? new Date(vrData.timestamp).toLocaleTimeString() : 'N/A'}</p>
          </div>
        </div>

        <div class="mt-4 p-4 bg-white rounded border">
          <pre class="text-xs overflow-auto">{JSON.stringify(vrData?.data, null, 2) || 'Esperando datos...'}</pre>
        </div>
      </div>
    {:else}
      <div class="text-center py-12 text-neutral-600">
        <p>Esperando conexión con Unity...</p>
      </div>
    {/if}
  </div>
</Card>
