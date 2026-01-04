<script>
  import { onMount } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Badge from '../ui/Badge.svelte';

  export let sessionId;

  let analysis = null;
  let score = 0;

  onMount(() => {
    // Listen for AI analysis events
    if (window.electronAPI) {
      window.electronAPI.onVRDataProcessed((data) => {
        if (data.sessionId === sessionId) {
          analysis = data.analysis;
          score = data.score;
        }
      });
    }
  });
</script>

<Card>
  <div class="space-y-4">
    <h3 class="font-semibold text-lg">Análisis de IA</h3>

    {#if analysis}
      <!-- Score Circle -->
      <div class="flex items-center justify-center py-6">
        <div class="relative w-32 h-32">
          <svg class="transform -rotate-90" width="128" height="128">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              stroke-width="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#1a9d9d"
              stroke-width="8"
              fill="none"
              stroke-dasharray="{2 * Math.PI * 56}"
              stroke-dashoffset="{2 * Math.PI * 56 * (1 - score / 10)}"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl font-bold text-medical-600">{score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div>
        <h4 class="font-medium text-sm text-neutral-700 mb-2">Recomendaciones:</h4>
        <p class="text-sm text-neutral-600">{analysis.recommendations}</p>
      </div>

      <!-- Anomalies -->
      {#if analysis.anomalies}
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 class="font-medium text-sm text-yellow-800 mb-2">⚠️ Anomalías Detectadas</h4>
          <ul class="text-sm text-yellow-700 space-y-1">
            {#each analysis.anomalies as anomaly}
              <li>• {anomaly.message}</li>
            {/each}
          </ul>
        </div>
      {/if}
    {:else}
      <div class="text-center py-12 text-neutral-600">
        <p>Esperando análisis de IA...</p>
      </div>
    {/if}
  </div>
</Card>
