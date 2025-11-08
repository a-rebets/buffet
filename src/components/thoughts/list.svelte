<script lang="ts">
  import { apiClient, apiResponse, thoughtsKeys } from "@lib/api";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import ThoughtCard from "./card.svelte";

  const queryClient = useQueryClient();

  const thoughtsQuery = createQuery(() => ({
    queryKey: thoughtsKeys.all(),
    queryFn: () => apiResponse(apiClient.thoughts.get()),
  }));

  const deleteThought = createMutation(() => ({
    mutationFn: (id: number) =>
      apiResponse(apiClient.thoughts({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thoughtsKeys.all() });
    },
  }));
</script>

{#if thoughtsQuery.isLoading}
  <p class="text-center text-neutral-500 dark:text-neutral-400 py-6">
    Loading thoughts...
  </p>
{:else if thoughtsQuery.isError}
  <div class="text-center text-red-600 dark:text-red-400 py-6">
    Failed to load thoughts: {(thoughtsQuery.error as Error).message}
  </div>
{:else if !thoughtsQuery.data || thoughtsQuery.data.length === 0}
  <div class="text-center pb-10 pt-5">
    <div
      class="inline-block p-4 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4"
    >
      <svg
        class="w-12 h-12 text-neutral-400 dark:text-neutral-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <title>No thoughts yet</title>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </div>
    <p class="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
      No thoughts yet
    </p>
    <p class="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
      Share your first thought above!
    </p>
  </div>
{:else}
  <div id="thoughts-list" class="space-y-3">
    {#each thoughtsQuery.data as thought (thought.id)}
      <ThoughtCard
        {thought}
        onDelete={deleteThought.mutate}
        isDeleting={deleteThought.isPending &&
          deleteThought.variables === thought.id}
      />
    {/each}
  </div>
{/if}
