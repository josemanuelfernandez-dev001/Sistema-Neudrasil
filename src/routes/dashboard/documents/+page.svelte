<script>
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import DocumentList from '$lib/components/documents/DocumentList.svelte';
  import FileUpload from '$lib/components/documents/FileUpload.svelte';

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
    <h1 class="text-3xl font-display font-bold text-neutral-800">Documentos</h1>
    <p class="text-neutral-600 mt-1">Gestiona archivos y documentos médicos</p>
  </div>

  <TabNavigation {tabs} activeTab="documents" />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1">
      <FileUpload />
    </div>
    <div class="lg:col-span-2">
      <DocumentList />
    </div>
  </div>
</div>
