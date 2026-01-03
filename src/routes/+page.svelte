<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';

  onMount(() => {
    // Redirect to login or dashboard based on auth status
    const unsubscribe = authStore.subscribe(state => {
      if (state.isAuthenticated) {
        goto('/dashboard');
      } else {
        goto('/auth/login');
      }
    });

    return unsubscribe;
  });
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="spinner"></div>
</div>
