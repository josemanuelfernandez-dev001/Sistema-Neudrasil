<script>
  import { page } from '$app/stores';
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';

  $: patientId = $page.params.id;
</script>

<div class="space-y-6">
  <slot />
</div>
