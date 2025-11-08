<script lang="ts">
  import { Button } from "@components/ui/button/index.js";
  import { apiClient, apiResponse, thoughtsKeys } from "@lib/api";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";

  let content = $state("");
  let error = $state("");

  const queryClient = useQueryClient();

  const createThought = createMutation(() => ({
    mutationFn: (newContent: string) =>
      apiResponse(apiClient.thoughts.post({ content: newContent })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.all() });
    },
  }));

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    error = "";

    createThought
      .mutateAsync(trimmed)
      .then(() => {
        content = "";
      })
      .catch((err) => {
        error = err instanceof Error ? err.message : String(err);
      });
  }
</script>

<form class="mb-6" onsubmit={handleSubmit}>
  <div class="mb-3">
    <textarea
      bind:value={content}
      placeholder="What's on your mind?"
      required
      rows="4"
      class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200/50 dark:focus:ring-yellow-400/50 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 transition-all resize-none"
    ></textarea>
  </div>
  <div class="flex items-center justify-between">
    <div class="text-red-600 dark:text-red-400 text-sm font-medium">
      {error}
    </div>

    <Button
      type="submit"
      class="w-32 bg-linear-to-r from-orange-300 to-amber-300 rounded-lg border-amber-200 shadow-md hover:from-orange-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
      disabled={createThought.isPending}
    >
      {#if createThought.isPending}
        <span class="inline-block animate-spin mr-2">⏳</span>
      {/if}
      Share
    </Button>
  </div>
</form>
