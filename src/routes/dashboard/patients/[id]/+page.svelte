<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { patientsStore } from '$lib/stores/patients.store';
  import PatientCard from '$lib/components/patients/PatientCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';

  let patient = null;
  let loading = true;

  $: patientId = $page.params.id;

  onMount(async () => {
    loading = true;
    patient = await patientsStore.getPatient(patientId);
    loading = false;
  });

  const tabs = [
    { id: 'info', label: 'Información', href: `/dashboard/patients/${patientId}` },
    { id: 'timeline', label: 'Línea de Tiempo', href: `/dashboard/patients/${patientId}/timeline` },
    { id: 'reports', label: 'Reportes', href: `/dashboard/patients/${patientId}/reports` }
  ];
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>
  {:else if patient}
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-display font-bold text-neutral-800">{patient.name}</h1>
        <p class="text-neutral-600 mt-1">Perfil del Paciente</p>
      </div>
      <Button
        variant="primary"
        on:click={() => goto(`/dashboard/therapies/start?patientId=${patientId}`)}
      >
        Iniciar Terapia
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Patient Info Card -->
      <div class="lg:col-span-1">
        <div class="card">
          <h3 class="font-semibold text-lg mb-4">Información Personal</h3>
          <div class="space-y-3">
            <div>
              <span class="text-sm text-neutral-600">Fecha de Nacimiento:</span>
              <p class="font-medium">{new Date(patient.birthdate).toLocaleDateString()}</p>
            </div>
            {#if patient.diagnosis}
              <div>
                <span class="text-sm text-neutral-600">Diagnóstico:</span>
                <p class="font-medium">{patient.diagnosis}</p>
              </div>
            {/if}
            {#if patient.medicalHistory}
              <div>
                <span class="text-sm text-neutral-600">Historial Médico:</span>
                <p class="text-sm">{patient.medicalHistory}</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Sessions and Timeline -->
      <div class="lg:col-span-2">
        <div class="card">
          <h3 class="font-semibold text-lg mb-4">Sesiones Recientes</h3>
          <p class="text-neutral-600">Lista de sesiones se mostrará aquí</p>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-neutral-600">Paciente no encontrado</p>
    </div>
  {/if}
</div>
