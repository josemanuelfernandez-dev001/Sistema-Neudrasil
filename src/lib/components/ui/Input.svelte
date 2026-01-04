<script>
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let error = false;
  export let id = '';
  export let required = false;
  export let className = '';

  function handleInput(event) {
    value = event.target. value;
  }
</script>

<input
  {id}
  {type}
  {placeholder}
  {disabled}
  {required}
  {value}
  on:input={handleInput}
  on:change
  on:keypress
  on:focus
  on:blur
  class="input {error ?  'error' : ''} {className}"
/>

<style>
  .input {
    width: 100%;
    padding:  0.5rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .input:focus {
    outline: none;
    border-color: #1a9d9d;
    box-shadow: 0 0 0 3px rgba(26, 157, 157, 0.1);
  }

  .input:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }

  .input.error {
    border-color: #ef4444;
  }

  .input.error:focus {
    border-color:  #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
</style>