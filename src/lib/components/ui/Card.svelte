<script>
  export let clickable = false;
  export let hoverable = false;
  export let className = '';
</script>

{#if clickable}
  <div
    role="button"
    tabindex="0"
    on:click
    on:keypress={(e) => e.key === 'Enter' && e.currentTarget.click()}
    class="card {clickable ? 'clickable' :  ''} {hoverable ? 'hoverable' :  ''} {className}"
  >
    <slot />
  </div>
{:else}
  <div class="card {hoverable ? 'hoverable' :  ''} {className}">
    <slot />
  </div>
{/if}

<style>
  .card {
    background: white;
    border-radius: 0.5rem;
    box-shadow:  0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .card.clickable,
  .card.hoverable {
    cursor: pointer;
  }

  .card.clickable:hover,
  .card.hoverable:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card.clickable:active {
    transform: translateY(0);
  }
</style>