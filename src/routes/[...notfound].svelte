<script lang="ts">
  import { navigate } from "sv-router/generated";
  import { Button } from "@/components/ui/button";
</script>

<main
  class="min-h-screen h-fit w-full bg-linear-to-br from-amber-50 to-amber-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center"
>
  <div class="container max-w-6xl mx-auto px-4 py-8">
    <div
      class="bg-white/95 dark:bg-neutral-900/60 rounded-xl border border-amber-300 dark:border-amber-400 p-12 backdrop-blur-sm text-center max-w-2xl mx-auto"
    >
      <div class="mb-8">
        <h2
          class="text-8xl font-light text-transparent bg-clip-text bg-linear-to-b from-yellow-600 to-amber-800 dark:from-yellow-400 dark:to-amber-500 mb-4 font-serif"
        >
          404
        </h2>
        <h3 class="text-3xl font-semibold mb-4">Page Not Found</h3>
        <p
          class="text-muted-foreground font-light leading-relaxed text-balance"
        >
          Oops! The page you're looking for seems to have wandered off. It might
          be enjoying a snack somewhere else.
        </p>
      </div>

      <Button
        size="lg"
        variant="ghost"
        onclick={() => navigate("/")}
        class="bg-amber-500/80 text-primary-foreground hover:text-primary-foreground hover:bg-amber-600/80 dark:bg-amber-600/20 dark:hover:bg-amber-600/40 dark:text-amber-500 dark:hover:text-amber-200 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        Take me home
      </Button>
    </div>
  </div>
</main>
