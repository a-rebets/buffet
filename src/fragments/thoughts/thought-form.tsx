export function ThoughtForm() {
  return (
    <form
      id="thought-form"
      hx-post="/api/thoughts"
      hx-target="#thoughts-list"
      hx-swap="innerHTML"
      hx-indicator="#form-loading"
      class="mb-6"
    >
      <div class="mb-3">
        <textarea
          id="thought-content"
          name="content"
          placeholder="What's on your mind?"
          required
          rows="4"
          class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200/50 dark:focus:ring-yellow-400/50 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 transition-all resize-none"
        ></textarea>
      </div>
      <div class="flex items-center justify-between">
        <div
          id="form-error"
          class="text-red-600 dark:text-red-400 text-sm font-medium"
        ></div>
        <button
          type="submit"
          class="px-6 py-2 text-neutral-900 dark:text-neutral-900 bg-linear-to-r from-orange-300 to-amber-300 rounded-lg border border-amber-200 shadow-md hover:from-orange-400 hover:to-yellow-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 active:translate-y-[0.5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            id="form-loading"
            class="htmx-indicator hidden [&.htmx-request]:inline-block"
          >
            <span class="inline-block animate-spin mr-2">⏳</span>
          </span>
          <span class="submit-text">Share</span>
        </button>
      </div>
    </form>
  );
}
