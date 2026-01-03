<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../ui/Button.svelte';

  const dispatch = createEventDispatcher();

  let content = '';

  function handleSubmit() {
    if (content.trim()) {
      dispatch('send', { content });
      content = '';
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="flex items-end space-x-2">
  <textarea
    bind:value={content}
    on:keypress={handleKeyPress}
    placeholder="Escribe un mensaje..."
    class="input flex-1 resize-none"
    rows="2"
  ></textarea>
  <Button
    variant="primary"
    on:click={handleSubmit}
    disabled={!content.trim()}
  >
    Enviar
  </Button>
</div>
