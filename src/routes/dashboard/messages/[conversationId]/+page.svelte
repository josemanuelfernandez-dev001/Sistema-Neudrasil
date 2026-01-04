<script>
  import { page } from '$app/stores';
  import ChatWindow from '$lib/components/messages/ChatWindow.svelte';

  $: conversationId = $page.params.conversationId;
</script>

<div class="h-full">
  <ChatWindow {conversationId} />
</div>
