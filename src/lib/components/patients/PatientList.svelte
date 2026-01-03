<script>
  import { onMount } from 'svelte';
  import { patientsStore } from '$lib/stores/patients.store';
  import PatientCard from './PatientCard.svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import LoadingSpinner from '../ui/LoadingSpinner.svelte';

  let patients = [];
  let filteredPatients = [];
  let loading = true;
  let searchQuery = '';

  patientsStore.subscribe(state => {
    patients = state.patients;
    loading = state.loading;
    filterPatients();
  });

  function filterPatients() {
    if (!searchQuery) {
      filteredPatients = patients;
    } else {
      filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }

  $: {
    searchQuery;
    filterPatients();
  }
</script>

<div class="space-y-6">
  <!-- Search and Actions -->
  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 max-w-md">
      <Input
        type="search"
        bind:value={searchQuery}
        placeholder="Buscar pacientes..."
      />
    </div>
    <Button variant="primary">
      + Nuevo Paciente
    </Button>
  </div>

  <!-- Patients Grid -->
  {#if loading}
    <LoadingSpinner message="Cargando pacientes..." />
  {:else if filteredPatients.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredPatients as patient}
        <PatientCard {patient} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-neutral-600">
        {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
      </p>
    </div>
  {/if}
</div>
