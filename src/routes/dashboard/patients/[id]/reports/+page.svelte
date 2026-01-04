<script>
  import { page } from '$app/stores';

  $: patientId = $page.params.id;
</script>

<div class="space-y-6">
  <h2 class="text-2xl font-display font-bold">Reportes del Paciente</h2>
  
  <div class="card">
    <p class="text-neutral-600">
      Sistema de reportes en desarrollo. Aquí se mostrarán los análisis detallados,
      gráficos de progreso y recomendaciones de IA para el paciente.
    </p>
  </div>
</div>
