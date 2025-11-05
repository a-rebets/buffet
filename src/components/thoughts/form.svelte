<script lang="ts">
let {
  content = $bindable(),
  error,
  loading,
  onSubmit,
} = $props<{
  content: string;
  error: string;
  loading: boolean;
  onSubmit: (e: Event) => void;
}>();

function handleSubmit(e: Event) {
  e.preventDefault();
  onSubmit(e);
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
    <button
      type="submit"
      class="px-6 py-2 text-neutral-900 dark:text-neutral-900 bg-linear-to-r from-orange-300 to-amber-300 rounded-lg border border-amber-200 shadow-md hover:from-orange-400 hover:to-yellow-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 active:translate-y-[0.5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
    >
      {#if loading}
        <span class="inline-block animate-spin mr-2">⏳</span>
      {/if}
      <span class="submit-text">Share</span>
    </button>
  </div>
</form>