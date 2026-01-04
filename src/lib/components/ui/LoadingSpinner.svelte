<script>
  export let size = 'md'; // sm, md, lg
  export let message = 'Cargando...';

  $: sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];
</script>

<div class="flex flex-col items-center justify-center p-8">
  <div class="spinner {sizeClasses}"></div>
  {#if message}
    <p class="mt-4 text-neutral-600 text-sm">{message}</p>
  {/if}
</div>
