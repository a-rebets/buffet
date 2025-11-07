<script lang="ts">
  import { withRpcClient } from "@lib/rpc-client";
  import { thoughtsStore } from "@lib/stores";
  import { Effect } from "effect";
  import ThoughtCard from "./card.svelte";

  function del(id: number) {
    Effect.runPromise(
      withRpcClient((client) =>
        Effect.gen(function* () {
          yield* client.DeleteThought({ id });
          thoughtsStore.update((thoughts) =>
            thoughts.filter((t) => t.id !== id)
          );
        })
      ).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Failed to delete thought:", error);
          })
        )
      )
    );
  }
</script>

{#if !$thoughtsStore || $thoughtsStore.length === 0}
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
    {#each $thoughtsStore as thought (thought.id)}
      <ThoughtCard {thought} onDelete={del} />
    {/each}
  </div>
{/if}
