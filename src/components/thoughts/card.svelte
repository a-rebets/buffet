<script lang="ts">
  import type { Thought } from "@server/thoughts/schema";
  import { format } from "date-fns";
  import { Button } from "../ui/button";

  const {
    thought,
    onDelete,
    isDeleting = false,
  } = $props<{
    thought: Thought;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
  }>();

  const createdDate = $derived(
    format(new Date(thought.created_at), "MMMM d, yyyy 'at' h:mm a")
  );
</script>

<div
  class="group bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
  id={"thought-" + thought.id}
>
  <div class="flex justify-between items-start gap-3">
    <div class="flex-1 min-w-0">
      <p
        class="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap wrap-break-word text-base leading-relaxed"
      >
        {thought.content}
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
        {createdDate}
      </p>
    </div>
    <Button
      variant="destructive"
      class="text-sm shrink-0 opacity-0 group-hover:opacity-100 rounded-md transition-all border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 bg-red-50 dark:bg-red-900/20"
      disabled={isDeleting}
      onclick={() => onDelete(thought.id)}
      >{isDeleting ? "Deleting..." : "Delete"}</Button
    >
  </div>
</div>
