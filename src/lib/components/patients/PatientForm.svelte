<script>
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import Modal from '../ui/Modal.svelte';

  export let isOpen = false;
  export let patient = null;

  let formData = {
    name: '',
    birthdate: '',
    diagnosis: '',
    medicalHistory: '',
    contactInfo: {}
  };

  $: if (patient) {
    formData = { ...patient };
  }

  function handleSubmit() {
    console.log('Saving patient:', formData);
    // Implement save logic
    isOpen = false;
  }
</script>

<Modal bind:isOpen title={patient ? 'Editar Paciente' : 'Nuevo Paciente'} size="lg">
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Nombre Completo
      </label>
      <Input bind:value={formData.name} required />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Fecha de Nacimiento
      </label>
      <Input type="date" bind:value={formData.birthdate} required />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Diagnóstico
      </label>
      <Input bind:value={formData.diagnosis} />
    </div>

    <div>
      <label class="block text-sm font-medium text-neutral-700 mb-2">
        Historial Médico
      </label>
      <textarea
        bind:value={formData.medicalHistory}
        class="input"
        rows="4"
        placeholder="Descripción del historial médico..."
      ></textarea>
    </div>
  </form>

  <div slot="footer" class="flex justify-end space-x-3">
    <Button variant="secondary" on:click={() => isOpen = false}>
      Cancelar
    </Button>
    <Button variant="primary" on:click={handleSubmit}>
      {patient ? 'Guardar' : 'Crear'}
    </Button>
  </div>
</Modal>
