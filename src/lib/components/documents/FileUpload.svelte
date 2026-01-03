<script>
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let selectedFile = null;
  let uploading = false;

  function handleFileSelect(event) {
    selectedFile = event.target.files[0];
  }

  async function handleUpload() {
    if (!selectedFile) return;

    uploading = true;
    // Implement upload logic
    console.log('Uploading file:', selectedFile.name);
    
    setTimeout(() => {
      uploading = false;
      selectedFile = null;
      dispatch('uploaded');
    }, 1000);
  }
</script>

<Card>
  <h3 class="font-semibold text-lg mb-4">Subir Documento</h3>

  <div class="space-y-4">
    <div class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
      <input
        type="file"
        on:change={handleFileSelect}
        class="hidden"
        id="file-upload"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <label
        for="file-upload"
        class="cursor-pointer flex flex-col items-center space-y-2"
      >
        <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-sm text-neutral-600">
          Click para seleccionar archivo
        </span>
        <span class="text-xs text-neutral-500">
          PDF, DOC, DOCX, JPG, PNG (Max 10MB)
        </span>
      </label>
    </div>

    {#if selectedFile}
      <div class="bg-neutral-50 p-3 rounded-lg">
        <p class="text-sm font-medium truncate">{selectedFile.name}</p>
        <p class="text-xs text-neutral-600">
          {(selectedFile.size / 1024).toFixed(2)} KB
        </p>
      </div>

      <Button
        variant="primary"
        on:click={handleUpload}
        loading={uploading}
        class="w-full"
      >
        {uploading ? 'Subiendo...' : 'Subir Documento'}
      </Button>
    {/if}
  </div>
</Card>
