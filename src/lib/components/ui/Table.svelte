<script>
  export let headers = [];
  export let data = [];
  export let hoverable = true;

  let className = '';
  export { className as class };
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-neutral-200 {className}">
    <thead class="bg-neutral-50">
      <tr>
        {#each headers as header}
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
          >
            {header}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-neutral-200">
      {#if data.length > 0}
        {#each data as row, i}
          <tr class="{hoverable ? 'hover:bg-neutral-50 cursor-pointer' : ''}" on:click={() => dispatch('rowClick', { row, index: i })}>
            <slot name="row" {row} {i} />
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan={headers.length} class="px-6 py-12 text-center text-neutral-500">
            <slot name="empty">
              No hay datos disponibles
            </slot>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<script context="module">
  import { createEventDispatcher } from 'svelte';
</script>

<script>
  const dispatch = createEventDispatcher();
</script>
