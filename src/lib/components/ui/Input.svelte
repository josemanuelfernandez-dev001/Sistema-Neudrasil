<script>
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let error = false;
  export let id = '';
  export let required = false;
  
  let className = '';
  export { className as class };
</script>

<input
  {id}
  {type}
  {placeholder}
  {disabled}
  {required}
  bind:value
  class="input {error ? 'error' : ''} {className}"
  on:input
  on:change
  on:keypress
  on:focus
  on:blur
/>
