<script>
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let loading = false;
  let error = '';
  let currentUser = null;

  // Suscribirse al usuario actual
  authStore.subscribe(state => {
    currentUser = state.user;
  });

  let formData = {
    name: '',
    birthdate:  '',
    diagnosis: '',
    medicalHistory: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  };

  async function handleSubmit() {
    try {
      loading = true;
      error = '';

      // Validar que haya un usuario logueado
      if (!currentUser || !currentUser.id) {
        error = 'No hay un doctor logueado';
        return;
      }

      if (! formData.name || !formData.birthdate) {
        error = 'El nombre y fecha de nacimiento son obligatorios';
        return;
      }

      const patientData = {
        name: formData.name,
        birthdate: formData.birthdate,
        diagnosis: formData.diagnosis || null,
        medicalHistory: formData.medicalHistory || null,
        contactInfo: {
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          emergencyContact: formData.emergencyContact || null,
          emergencyPhone:  formData.emergencyPhone || null
        },
        assignedDoctorId: currentUser.id  // ✅ ID del doctor logueado
      };

      console.log('Creating patient with doctor ID:', currentUser.id);
      console.log('Patient data:', patientData);

      const result = await window.electronAPI.createPatient(patientData);

      if (result.success) {
        console.log('Patient created:', result.data);
        goto('/dashboard/patients');
      } else {
        error = result.error || 'Error al crear paciente';
        console.error('Error creating patient:', result.error);
      }
    } catch (err) {
      console.error('Error:', err);
      error = 'Error al crear el paciente';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/dashboard/patients');
  }
</script>

<!-- El resto del HTML se mantiene igual -->
<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-display font-bold text-neutral-900">Nuevo Paciente</h1>
      <p class="text-neutral-600 mt-1">Registra la información del paciente</p>
      {#if currentUser}
        <p class="text-xs text-neutral-500 mt-1">Asignado a: {currentUser.name}</p>
      {/if}
    </div>

    <Button variant="secondary" on:click={handleCancel}>
      Cancelar
    </Button>
  </div>

  {#if error}
    <div class="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-md">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow p-6 space-y-6">

    <div>
      <h2 class="text-xl font-semibold text-neutral-900 mb-4">Información Personal</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium text-neutral-700 mb-2">
            Nombre Completo <span class="text-status-error">*</span>
          </label>
          <Input
            id="name"
            type="text"
            bind:value={formData.name}
            placeholder="Ej: Juan Pérez García"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label for="birthdate" class="block text-sm font-medium text-neutral-700 mb-2">
            Fecha de Nacimiento <span class="text-status-error">*</span>
          </label>
          <Input
            id="birthdate"
            type="date"
            bind:value={formData.birthdate}
            required
            disabled={loading}
          />
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-neutral-900 mb-4">Información Médica</h2>

      <div class="space-y-4">
        <div>
          <label for="diagnosis" class="block text-sm font-medium text-neutral-700 mb-2">
            Diagnóstico
          </label>
          <Input
            id="diagnosis"
            type="text"
            bind:value={formData.diagnosis}
            placeholder="Ej:  Trastorno del espectro autista"
            disabled={loading}
          />
        </div>

        <div>
          <label for="medicalHistory" class="block text-sm font-medium text-neutral-700 mb-2">
            Historia Médica
          </label>
          <textarea
            id="medicalHistory"
            bind:value={formData.medicalHistory}
            placeholder="Antecedentes médicos relevantes..."
            disabled={loading}
            rows="4"
            class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
          ></textarea>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-neutral-900 mb-4">Información de Contacto</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
            Teléfono
          </label>
          <Input
            id="phone"
            type="tel"
            bind:value={formData.phone}
            placeholder="Ej: +1234567890"
            disabled={loading}
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
            Correo Electrónico
          </label>
          <Input
            id="email"
            type="email"
            bind:value={formData.email}
            placeholder="paciente@ejemplo.com"
            disabled={loading}
          />
        </div>

        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium text-neutral-700 mb-2">
            Dirección
          </label>
          <Input
            id="address"
            type="text"
            bind:value={formData.address}
            placeholder="Calle, Ciudad, País"
            disabled={loading}
          />
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-neutral-900 mb-4">Contacto de Emergencia</h2>

      <div class="grid grid-cols-1 md: grid-cols-2 gap-4">
        <div>
          <label for="emergencyContact" class="block text-sm font-medium text-neutral-700 mb-2">
            Nombre del Contacto
          </label>
          <Input
            id="emergencyContact"
            type="text"
            bind:value={formData.emergencyContact}
            placeholder="Nombre completo"
            disabled={loading}
          />
        </div>

        <div>
          <label for="emergencyPhone" class="block text-sm font-medium text-neutral-700 mb-2">
            Teléfono de Emergencia
          </label>
          <Input
            id="emergencyPhone"
            type="tel"
            bind:value={formData.emergencyPhone}
            placeholder="+1234567890"
            disabled={loading}
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-4 pt-4 border-t">
      <Button
        type="button"
        variant="secondary"
        on:click={handleCancel}
        disabled={loading}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        variant="primary"
        disabled={loading || !currentUser}
        {loading}
      >
        {loading ? 'Guardando...' : 'Crear Paciente'}
      </Button>
    </div>
  </form>
</div>