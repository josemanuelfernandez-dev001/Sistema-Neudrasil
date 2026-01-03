<script>
  import Card from '../ui/Card.svelte';

  let conversations = [];
</script>

<Card>
  <h3 class="font-semibold text-lg mb-4">Conversaciones</h3>

  <div class="space-y-2">
    {#if conversations.length > 0}
      {#each conversations as conversation}
        <a
          href="/dashboard/messages/{conversation.id}"
          class="block p-3 hover:bg-neutral-50 rounded-lg transition"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">{conversation.name}</p>
              <p class="text-sm text-neutral-600 truncate">{conversation.lastMessage}</p>
            </div>
            {#if conversation.unread > 0}
              <span class="bg-medical-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conversation.unread}
              </span>
            {/if}
          </div>
        </a>
      {/each}
    {:else}
      <p class="text-center text-neutral-600 py-8">No hay conversaciones</p>
    {/if}
  </div>
</Card>
