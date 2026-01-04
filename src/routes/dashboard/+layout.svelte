<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';

  onMount(() => {
    // Check authentication
    const unsubscribe = authStore.subscribe(state => {
      if (!state.isAuthenticated) {
        goto('/auth/login');
      }
    });

    return unsubscribe;
  });
</script>

<div class="min-h-screen flex flex-col">
  <Header />
  
  <div class="flex flex-1 overflow-hidden">
    <Sidebar />
    
    <main class="flex-1 overflow-auto bg-background-secondary p-6">
      <slot />
    </main>
  </div>
</div>
