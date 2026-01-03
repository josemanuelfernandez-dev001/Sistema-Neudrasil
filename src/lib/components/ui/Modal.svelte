<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  export let isOpen = false;
  export let title = '';
  export let size = 'md'; // sm, md, lg
  export let closable = true;

  const dispatch = createEventDispatcher();

  function close() {
    if (closable) {
      isOpen = false;
      dispatch('close');
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && closable) {
      close();
    }
  }

  $: sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  }[size];
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
    on:click={handleBackdropClick}
  >
    <div class="bg-white rounded-xl shadow-2xl {sizeClasses} w-full max-h-[90vh] overflow-auto animate-slide-in">
      <!-- Header -->
      {#if title || closable}
        <div class="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 class="text-2xl font-display font-bold text-neutral-800">{title}</h2>
          {#if closable}
            <button
              on:click={close}
              class="text-neutral-400 hover:text-neutral-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>

      <!-- Footer -->
      {#if $$slots.footer}
        <div class="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}
