<script>
  import { onMount } from 'svelte';
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import PatientList from '$lib/components/patients/PatientList.svelte';
  import { patientsStore } from '$lib/stores/patients.store';

  let activeTab = 'patients';

  onMount(async () => {
    await patientsStore.loadPatients();
  });

  const tabs = [
    { id: 'patients', label: 'Pacientes', href: '/dashboard' },
    { id: 'calendar', label: 'Calendario', href: '/dashboard/calendar' },
    { id: 'messages', label: 'Mensajes', href: '/dashboard/messages' },
    { id: 'therapies', label: 'Terapias', href: '/dashboard/therapies' },
    { id: 'documents', label: 'Documentos', href: '/dashboard/documents' }
  ];
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-display font-bold text-neutral-800">Dashboard</h1>
    <p class="text-neutral-600 mt-1">Gestiona tus pacientes y sesiones de terapia</p>
  </div>

  <TabNavigation {tabs} {activeTab} />

  <PatientList />
</div>
