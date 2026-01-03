<script>
  import { createEventDispatcher } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';

  const dispatch = createEventDispatcher();

  const games = [
    {
      id: 'balance-vr',
      name: 'Balance VR',
      description: 'Ejercicios de equilibrio y coordinación en realidad virtual',
      icon: '⚖️',
      difficulty: 'Media'
    },
    {
      id: 'memory-game',
      name: 'Juegos de Memoria',
      description: 'Estimulación cognitiva con juegos de memoria interactivos',
      icon: '🧠',
      difficulty: 'Fácil'
    },
    {
      id: 'motor-skills',
      name: 'Habilidades Motoras',
      description: 'Ejercicios para mejorar la coordinación motora fina y gruesa',
      icon: '🤸',
      difficulty: 'Difícil'
    }
  ];

  function selectGame(gameId) {
    dispatch('gameSelected', { gameId });
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each games as game}
    <Card hoverable clickable on:click={() => selectGame(game.id)}>
      <div class="text-center space-y-3">
        <div class="text-6xl">{game.icon}</div>
        <h3 class="font-semibold text-lg">{game.name}</h3>
        <p class="text-sm text-neutral-600">{game.description}</p>
        <div class="pt-2">
          <span class="text-xs bg-medical-100 text-medical-700 px-3 py-1 rounded-full">
            {game.difficulty}
          </span>
        </div>
      </div>
    </Card>
  {/each}
</div>
