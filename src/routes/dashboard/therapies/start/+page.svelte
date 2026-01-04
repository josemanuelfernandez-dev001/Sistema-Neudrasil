<script>
  import { page } from '$app/stores';
  import GameSelector from '$lib/components/therapies/GameSelector.svelte';
  import { goto } from '$app/navigation';

  $: patientId = $page.url.searchParams.get('patientId');

  function handleGameSelected(event) {
    const { gameId } = event.detail;
    // Create session and start therapy
    console.log('Starting therapy with game:', gameId, 'for patient:', patientId);
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-display font-bold text-neutral-800">Iniciar Sesión de Terapia</h1>
    <p class="text-neutral-600 mt-1">Selecciona un juego para comenzar</p>
  </div>

  <GameSelector on:gameSelected={handleGameSelected} />
</div>
