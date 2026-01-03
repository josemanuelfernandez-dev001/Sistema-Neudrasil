<script>
  export let variant = 'default'; // default, success, warning, error, info
  export let size = 'md'; // sm, md, lg

  let className = '';
  export { className as class };

  $: variantClasses = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }[variant];

  $: sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }[size];
</script>

<span class="inline-flex items-center rounded-full font-medium {variantClasses} {sizeClasses} {className}">
  <slot />
</span>
