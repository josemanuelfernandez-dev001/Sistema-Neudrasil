<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  let patients = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadPatients();
  });

  async function loadPatients() {
    try {
      loading = true;
      error = '';

      const result = await window.electronAPI.getPatients();

      if (result.success) {
        patients = result.data || [];
      } else {
        error = result.error || 'Error al cargar pacientes';
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      error = 'Error al cargar pacientes';
    } finally {
      loading = false;
    }
  }

  function goToPatient(patientId) {
    goto(`/dashboard/patients/${patientId}`);
  }

  function createNewPatient() {
    console.log('🔵 CLICK EN BOTÓN NUEVO PACIENTE');
    console.log('🔵 Navegando a:  /dashboard/patients/new');
    goto('/dashboard/patients/new');
    console.log('🔵 goto() ejecutado');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-display font-bold text-neutral-900">Pacientes</h1>
      <p class="text-neutral-600 mt-1">Gestiona la información de tus pacientes</p>
    </div>

    <a
      href="/dashboard/patients/new"
      class="inline-flex items-center px-6 py-3 bg-medical-500 hover: bg-medical-600 text-white rounded-lg font-medium transition shadow"
    >
      Crear Primer Paciente
    </a>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-md">
      {error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="spinner"></div>
      <p class="ml-3 text-neutral-600">Cargando pacientes...</p>
    </div>
  {:else if patients.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <div class="text-6xl mb-4">👥</div>
      <h3 class="text-xl font-semibold text-neutral-700 mb-2">No hay pacientes registrados</h3>
      <p class="text-neutral-500 mb-6">Comienza agregando tu primer paciente</p>
      <Button variant="primary" on:click={createNewPatient}>
        Crear Primer Paciente
      </Button>
    </div>
  {:else}
    <!-- Patients Grid -->
    <div class="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-3 gap-6">
      {#each patients as patient}
        <Card clickable on:click={() => goToPatient(patient.id)}>
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">👤</span>
              </div>
              <span class="px-3 py-1 bg-medical-50 text-medical-600 text-xs font-medium rounded-full">
                Activo
              </span>
            </div>

            <h3 class="text-lg font-semibold text-neutral-900 mb-2">
              {patient.name}
            </h3>

            <div class="space-y-2 text-sm text-neutral-600">
              <div class="flex items-center">
                <span class="mr-2">📅</span>
                <span>
                  {new Date(patient. birthdate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {#if patient.diagnosis}
                <div class="flex items-center">
                  <span class="mr-2">🏥</span>
                  <span class="truncate">{patient.diagnosis}</span>
                </div>
              {/if}

              {#if patient.contactInfo?. phone}
                <div class="flex items-center">
                  <span class="mr-2">📞</span>
                  <span>{patient.contactInfo. phone}</span>
                </div>
              {/if}
            </div>

            <div class="mt-4 pt-4 border-t border-neutral-200">
              <div class="flex justify-between text-xs text-neutral-500">
                <span>Registro: {new Date(patient.createdAt).toLocaleDateString()}</span>
                <button
                  on:click|stopPropagation={() => goToPatient(patient.id)}
                  class="text-medical-600 hover:text-medical-700 font-medium"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<style>
  .spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #1a9d9d;
    border-radius:  50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>