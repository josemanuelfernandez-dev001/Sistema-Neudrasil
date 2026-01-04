<script>
  export let tabs = [];
  export let activeTab = '';
</script>

<div class="border-b border-neutral-200">
  <nav class="flex space-x-8">
    {#each tabs as tab}
      <a
        href={tab.href}
        class="py-4 px-2 font-medium text-sm transition border-b-2 {
          activeTab === tab.id
            ? 'border-medical-400 text-medical-600'
            : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
        }"
      >
        {tab.label}
      </a>
    {/each}
  </nav>
</div>
