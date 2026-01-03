<script>
  import Card from '../ui/Card.svelte';
  import Badge from '../ui/Badge.svelte';

  let documents = [];
</script>

<Card>
  <h3 class="font-semibold text-lg mb-4">Documentos</h3>

  <div class="space-y-2">
    {#if documents.length > 0}
      {#each documents as doc}
        <div class="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-medical-100 rounded flex items-center justify-center">
              📄
            </div>
            <div>
              <p class="font-medium text-sm">{doc.fileName}</p>
              <p class="text-xs text-neutral-600">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <Badge variant="info" size="sm">{doc.fileType}</Badge>
            <button class="text-neutral-600 hover:text-medical-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-center text-neutral-600 py-8">No hay documentos</p>
    {/if}
  </div>
</Card>
