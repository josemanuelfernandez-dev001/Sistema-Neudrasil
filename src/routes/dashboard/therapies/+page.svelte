<script>
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import TherapyCard from '$lib/components/therapies/TherapyCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';

  const tabs = [
    { id: 'patients', label: 'Pacientes', href: '/dashboard' },
    { id: 'calendar', label: 'Calendario', href: '/dashboard/calendar' },
    { id: 'messages', label: 'Mensajes', href: '/dashboard/messages' },
    { id: 'therapies', label: 'Terapias', href: '/dashboard/therapies' },
    { id: 'documents', label: 'Documentos', href: '/dashboard/documents' }
  ];

  const therapies = [
    {
      id: 'balance-vr',
      name: 'Balance VR',
      description: 'Ejercicios de equilibrio en realidad virtual',
      icon: '⚖️'
    },
    {
      id: 'memory-game',
      name: 'Juegos de Memoria',
      description: 'Estimulación cognitiva con VR',
      icon: '🧠'
    },
    {
      id: 'motor-skills',
      name: 'Habilidades Motoras',
      description: 'Ejercicios para coordinación motora',
      icon: '🤸'
    }
  ];
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-display font-bold text-neutral-800">Terapias VR</h1>
    <p class="text-neutral-600 mt-1">Juegos y ejercicios de realidad virtual</p>
  </div>

  <TabNavigation {tabs} activeTab="therapies" />

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each therapies as therapy}
      <TherapyCard {therapy} />
    {/each}
  </div>
</div>
