<script>
  export let variant = 'primary'; // primary, secondary, danger
  export let size = 'md'; // sm, md, lg
  export let disabled = false;
  export let loading = false;
  export let type = 'button';
  
  let className = '';
  export { className as class };

  $: variantClasses = {
    primary: 'bg-medical-500 hover:bg-medical-600 text-white',
    secondary: 'border-2 border-medical-500 text-medical-500 hover:bg-medical-50',
    danger: 'bg-status-error hover:bg-red-600 text-white'
  }[variant];

  $: sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }[size];
</script>

<button
  {type}
  class="btn {variantClasses} {sizeClasses} {className}"
  disabled={disabled || loading}
  on:click
>
  {#if loading}
    <span class="spinner mr-2"></span>
  {/if}
  <slot />
</button>
