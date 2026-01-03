<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';

  onMount(() => {
    // Check if user is already authenticated
    authStore.checkAuth();
  });
</script>

<slot />
