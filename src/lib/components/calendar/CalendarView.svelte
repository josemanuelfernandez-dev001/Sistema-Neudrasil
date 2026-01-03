<script>
  import Card from '../ui/Card.svelte';

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month, year) {
    return new Date(year, month, 1).getDay();
  }

  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
</script>

<Card>
  <div class="space-y-4">
    <!-- Month Header -->
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-lg">
        {new Date(currentYear, currentMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
      </h3>
      <div class="flex space-x-2">
        <button class="p-2 hover:bg-neutral-100 rounded">‹</button>
        <button class="p-2 hover:bg-neutral-100 rounded">›</button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-2">
      {#each daysOfWeek as day}
        <div class="text-center text-sm font-medium text-neutral-600 py-2">
          {day}
        </div>
      {/each}

      {#each Array(firstDay) as _}
        <div class="aspect-square"></div>
      {/each}

      {#each Array(daysInMonth) as _, i}
        <button class="aspect-square flex items-center justify-center rounded-lg hover:bg-medical-50 transition {
          i + 1 === currentDate.getDate() ? 'bg-medical-500 text-white' : ''
        }">
          {i + 1}
        </button>
      {/each}
    </div>

    <!-- Appointments List -->
    <div class="border-t pt-4 mt-4">
      <h4 class="font-medium text-sm mb-3">Próximas Citas</h4>
      <p class="text-sm text-neutral-600">No hay citas programadas</p>
    </div>
  </div>
</Card>
