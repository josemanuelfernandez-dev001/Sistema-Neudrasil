<script>
  import { page } from '$app/stores';
  import PatientTimeline from '$lib/components/patients/PatientTimeline.svelte';

  $: patientId = $page.params.id;
</script>

<div class="space-y-6">
  <h2 class="text-2xl font-display font-bold">Línea de Tiempo del Paciente</h2>
  <PatientTimeline {patientId} />
</div>
