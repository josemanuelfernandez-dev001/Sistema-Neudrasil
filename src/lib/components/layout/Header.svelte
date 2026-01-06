<script>
  import { authStore } from '$lib/stores/auth.store';
  import Button from '../ui/Button.svelte';

  let user = null;
  let showUserMenu = false;

  authStore.subscribe(state => {
    user = state.user;
  });

  async function handleLogout() {
    await authStore.logout();
  }
</script>

<header class="medical-gradient text-white shadow-lg">
  <div class="container mx-auto px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo and Title -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span class="text-2xl">🧠</span>
        </div>
        <div>
          <h1 class="text-xl font-display font-bold">Sistema Neudrasil</h1>
          <p class="text-xs text-medical-100">Neuroterapia VR + IA</p>
        </div>
      </div>

      <!-- User Info and Actions -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button class="relative p-2 hover:bg-medical-600 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full"></span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            on:click={() => showUserMenu = !showUserMenu}
            class="flex items-center space-x-3 p-2 hover:bg-medical-600 rounded-lg transition"
          >
            <div class="w-8 h-8 bg-medical-700 rounded-full flex items-center justify-center">
              <span class="text-sm font-semibold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div class="text-left hidden md:block">
              <p class="text-sm font-medium">{user?.name || 'Usuario'}</p>
              <p class="text-xs text-medical-100">{user?.specialty || user?.role}</p>
            </div>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if showUserMenu}
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
              <a href="/dashboard/profile" class="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Mi Perfil
              </a>
              <a href="/dashboard/settings" class="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Configuración
              </a>
              <hr class="my-1" />
              <button
                on:click={handleLogout}
                class="block w-full text-left px-4 py-2 text-sm text-status-error hover:bg-neutral-100"
              >
                Cerrar Sesión
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>
