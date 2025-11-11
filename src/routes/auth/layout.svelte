<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<main
  class="relative min-h-screen h-fit w-full grid place-items-center bg-linear-to-br from-amber-50 to-amber-100 dark:from-neutral-950 dark:to-neutral-900"
>
  <div class="container mx-auto px-4 py-8 md:-mt-20">
    {@render children()}
  </div>
</main>
