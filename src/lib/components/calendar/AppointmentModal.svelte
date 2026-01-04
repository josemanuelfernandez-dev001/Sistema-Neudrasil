<script>
  import Modal from '../ui/Modal.svelte';
  import Input from '../ui/Input.svelte';
  import Button from '../ui/Button.svelte';

  export let isOpen = false;

  let formData = {
    patientId: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  };

  function handleSubmit() {
    console.log('Creating appointment:', formData);
    isOpen = false;
  }
</script>

<Modal bind:isOpen title="Nueva Cita" size="md">
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Fecha
      </label>
      <Input type="date" bind:value={formData.date} required />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Hora
      </label>
      <Input type="time" bind:value={formData.time} required />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Duración (minutos)
      </label>
      <Input type="number" bind:value={formData.duration} required />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Notas
      </label>
      <textarea bind:value={formData.notes} class="input" rows="3"></textarea>
    </div>
  </form>

  <div slot="footer" class="flex justify-end space-x-3">
    <Button variant="secondary" on:click={() => isOpen = false}>
      Cancelar
    </Button>
    <Button variant="primary" on:click={handleSubmit}>
      Crear Cita
    </Button>
  </div>
</Modal>
