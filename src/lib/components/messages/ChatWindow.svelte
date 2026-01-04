<script>
  import Card from '../ui/Card.svelte';
  import MessageInput from './MessageInput.svelte';
  import { onMount } from 'svelte';

  export let conversationId;

  let messages = [];

  onMount(async () => {
    // Load conversation messages
    if (window.electronAPI) {
      const result = await window.electronAPI.getConversation(conversationId);
      if (result.success) {
        messages = result.data;
      }
    }
  });

  async function handleSendMessage(event) {
    const { content } = event.detail;
    if (window.electronAPI) {
      await window.electronAPI.sendMessage({
        receiverId: conversationId,
        content
      });
      // Reload messages
      const result = await window.electronAPI.getConversation(conversationId);
      if (result.success) {
        messages = result.data;
      }
    }
  }
</script>

<Card class="h-full flex flex-col">
  <!-- Messages List -->
  <div class="flex-1 overflow-y-auto space-y-3 mb-4">
    {#each messages as message}
      <div class="flex {message.sender === 'me' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs px-4 py-2 rounded-lg {
          message.sender === 'me'
            ? 'bg-medical-500 text-white'
            : 'bg-neutral-100 text-neutral-800'
        }">
          <p class="text-sm">{message.content}</p>
          <span class="text-xs opacity-75 mt-1 block">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Input -->
  <MessageInput on:send={handleSendMessage} />
</Card>
