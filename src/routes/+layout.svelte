<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';

  onMount(() => {
    authStore.checkAuth();
  });
</script>

<slot />