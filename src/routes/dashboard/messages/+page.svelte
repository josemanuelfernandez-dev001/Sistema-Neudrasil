<script>
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import MessageList from '$lib/components/messages/MessageList.svelte';

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
    <h1 class="text-3xl font-display font-bold text-neutral-800">Mensajes</h1>
    <p class="text-neutral-600 mt-1">Comunicación con el equipo médico</p>
  </div>

  <TabNavigation {tabs} activeTab="messages" />

  <MessageList />
</div>
