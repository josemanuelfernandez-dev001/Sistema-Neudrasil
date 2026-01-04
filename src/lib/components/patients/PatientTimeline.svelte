<script>
  export let patientId;

  // Placeholder for timeline visualization
  const events = [
    { date: '2026-01-01', title: 'Sesión de Balance VR', score: 7.5 },
    { date: '2025-12-28', title: 'Sesión de Memoria', score: 6.8 },
    { date: '2025-12-20', title: 'Primera Evaluación', score: 5.2 }
  ];
</script>

<div class="card space-y-6">
  <h3 class="font-semibold text-lg">Progreso del Paciente</h3>

  <!-- Timeline -->
  <div class="space-y-4">
    {#each events as event}
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0 w-2 h-2 mt-2 bg-medical-500 rounded-full"></div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="font-medium text-neutral-800">{event.title}</p>
            <span class="text-sm text-neutral-600">{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-sm text-neutral-600">Score:</span>
            <span class="font-semibold text-medical-600">{event.score}/10</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Chart Placeholder -->
  <div class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
    <p class="text-neutral-600">Gráfico de progreso con Chart.js</p>
    <p class="text-sm text-neutral-500 mt-2">Se implementará visualización de datos</p>
  </div>
</div>
