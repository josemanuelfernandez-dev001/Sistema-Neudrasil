<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  onMount(() => {
    // Redirect if already authenticated
    const unsubscribe = authStore.subscribe(state => {
      if (state.isAuthenticated) {
        goto('/dashboard');
      }
    });

    return unsubscribe;
  });

  async function handleLogin() {
    error = '';
    loading = true;

    try {
      await authStore.login(email, password);
      goto('/dashboard');
    } catch (err) {
      error = err.message || 'Error al iniciar sesión';
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-background-tertiary">
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
    <!-- Logo and Title -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-display font-bold text-medical-500 mb-2">
        Sistema Neudrasil
      </h1>
      <p class="text-neutral-600">
        Gestión de Neuroterapia con VR e IA
      </p>
    </div>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleLogin} class="space-y-6">
      {#if error}
        <div class="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="doctor@neudrasil.com"
          required
          disabled={loading}
          on:keypress={handleKeyPress}
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-neutral-700 mb-2">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          disabled={loading}
          on:keypress={handleKeyPress}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading || !email || !password}
        {loading}
        class="w-full"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>

    <!-- Demo Credentials -->
    <div class="mt-6 p-4 bg-neutral-50 rounded-md">
      <p class="text-xs text-neutral-600 mb-2">Credenciales de demostración:</p>
      <p class="text-xs text-neutral-500">Email: doctor@neudrasil.com</p>
      <p class="text-xs text-neutral-500">Password: doctor123</p>
    </div>
  </div>
</div>
