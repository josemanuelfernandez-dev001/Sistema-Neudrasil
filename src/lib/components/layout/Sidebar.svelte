<script>
  import { page } from '$app/stores';

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      href: '/dashboard/patients',
      label: 'Pacientes',
      icon: '👥'
    },
    {
      href: '/dashboard/calendar',
      label: 'Calendario',
      icon: '📅'
    },
    {
      href: '/dashboard/messages',
      label: 'Mensajes',
      icon: '💬'
    },
    {
      href: '/dashboard/therapies',
      label: 'Terapias',
      icon: '🎮'
    },
    {
      href: '/dashboard/documents',
      label: 'Documentos',
      icon: '📄'
    }
  ];

  $: currentPath = $page.url.pathname;
  
  function isActive(href) {
    if (href === '/dashboard') {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  }
</script>

<aside class="w-64 bg-white shadow-md flex-shrink-0">
  <nav class="p-4 space-y-2">
    {#each menuItems as item}
      <a
        href={item.href}
        class="flex items-center space-x-3 px-4 py-3 rounded-lg transition {
          isActive(item.href)
            ? 'bg-medical-50 text-medical-600 font-medium'
            : 'text-neutral-700 hover:bg-neutral-50'
        }"
      >
        <span class="text-2xl">{item.icon}</span>
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <!-- Unity Connection Status -->
  <div class="p-4 border-t border-neutral-200 mt-4">
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 bg-neutral-400 rounded-full"></div>
      <span class="text-xs text-neutral-600">Unity Desconectado</span>
    </div>
  </div>
</aside>
