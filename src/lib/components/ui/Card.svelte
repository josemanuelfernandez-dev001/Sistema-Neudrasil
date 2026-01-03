<script>
  export let hoverable = false;
  export let clickable = false;
  
  let className = '';
  export { className as class };

  $: hoverClass = hoverable || clickable ? 'card-hover cursor-pointer' : '';
</script>

<div class="card {hoverClass} {className}" on:click>
  <slot />
</div>
