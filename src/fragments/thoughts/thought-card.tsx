import type { Thought } from "@/types";

export function ThoughtCard({ thought }: { thought: Thought }) {
  const createdDate = new Date(thought.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      class="group bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
      id={`thought-${thought.id}`}
    >
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap wrap-break-word text-base leading-relaxed">
            {thought.content}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {createdDate}
          </p>
        </div>
        <button
          type="button"
          hx-delete={`/api/thoughts/${thought.id}`}
          hx-target="#thoughts-list"
          hx-swap="innerHTML"
          hx-confirm="Are you sure you want to delete this thought?"
          class="delete-btn px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-all font-medium text-sm shrink-0 opacity-0 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
