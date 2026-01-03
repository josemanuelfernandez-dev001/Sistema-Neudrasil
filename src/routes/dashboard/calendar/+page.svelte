<script>
  import CalendarView from '$lib/components/calendar/CalendarView.svelte';
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';

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
    <h1 class="text-3xl font-display font-bold text-neutral-800">Calendario</h1>
    <p class="text-neutral-600 mt-1">Agenda de citas y sesiones</p>
  </div>

  <TabNavigation {tabs} activeTab="calendar" />

  <CalendarView />
</div>
