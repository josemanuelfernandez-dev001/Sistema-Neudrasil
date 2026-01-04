<script>
  import Card from '../ui/Card.svelte';
  import Badge from '../ui/Badge.svelte';

  export let therapy;
</script>

<Card hoverable clickable>
  <div class="text-center space-y-3">
    <div class="text-5xl">{therapy.icon}</div>
    <h3 class="font-semibold text-lg">{therapy.name}</h3>
    <p class="text-sm text-neutral-600">{therapy.description}</p>
    <Badge variant="info" size="sm">Disponible</Badge>
  </div>
</Card>
