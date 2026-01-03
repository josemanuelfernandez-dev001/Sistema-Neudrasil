<script>
  import { goto } from '$app/navigation';
  import Card from '../ui/Card.svelte';
  import Badge from '../ui/Badge.svelte';

  export let patient;

  function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function handleClick() {
    goto(`/dashboard/patients/${patient.id}`);
  }
</script>

<Card hoverable clickable on:click={handleClick}>
  <div class="flex items-start space-x-4">
    <!-- Avatar -->
    <div class="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
      <span class="text-2xl font-bold text-medical-600">
        {patient.name.charAt(0)}
      </span>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-lg text-neutral-800 truncate">
        {patient.name}
      </h3>
      
      <div class="flex items-center space-x-4 mt-2 text-sm text-neutral-600">
        <span>{calculateAge(patient.birthdate)} años</span>
        {#if patient.diagnosis}
          <span class="truncate">{patient.diagnosis}</span>
        {/if}
      </div>

      {#if patient.assignedDoctor}
        <p class="text-xs text-neutral-500 mt-2">
          Dr/a. {patient.assignedDoctor.name}
        </p>
      {/if}
    </div>

    <!-- Status -->
    <div class="flex-shrink-0">
      <Badge variant="info" size="sm">Activo</Badge>
    </div>
  </div>
</Card>
