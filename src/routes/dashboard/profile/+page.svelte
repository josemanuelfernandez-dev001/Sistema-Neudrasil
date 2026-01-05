<script>
  import { authStore } from '$lib/stores/auth.store';

  let user = null;

  authStore.subscribe(state => {
    user = state.user;
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Mi Perfil</h1>

  {#if user}
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
        <p class="text-lg">{user.name || 'N/A'}</p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <p class="text-lg">{user.email}</p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
        <p class="text-lg">{user.role}</p>
      </div>
    </div>
  {: else}
    <p>Cargando...</p>
  {/if}
</div>