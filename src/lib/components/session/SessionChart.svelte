<script>
  import { onMount } from 'svelte';
  import Card from '../ui/Card.svelte';

  export let data = [];
  export let title = 'Gráfico de Sesión';
  export let type = 'line'; // line, bar, scatter

  let canvas;
  let chart = null;

  onMount(async () => {
    // Placeholder for Chart.js initialization
    // In production, import Chart.js and initialize here
    console.log('Chart.js would be initialized here');
  });

  $: if (chart && data) {
    // Update chart data
    console.log('Update chart with new data');
  }
</script>

<Card>
  <div class="space-y-4">
    <h3 class="font-semibold text-lg">{title}</h3>
    
    <div class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
      <p class="text-neutral-600">Gráfico Chart.js</p>
      <p class="text-sm text-neutral-500 mt-2">
        Se mostrará visualización de datos de sesión en tiempo real
      </p>
      <canvas bind:this={canvas} class="hidden"></canvas>
    </div>
  </div>
</Card>
