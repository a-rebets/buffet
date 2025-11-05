import { ThoughtForm } from "@/fragments/thoughts/thought-form";
import { ThoughtsList } from "@/fragments/thoughts/thoughts-list";
import type { Thought } from "@/types";
import { Links } from "./links";

export function WelcomePage({
  initialThoughts = [],
}: {
  initialThoughts?: Thought[];
}) {
  return (
    <div class="min-h-full h-fit w-full bg-linear-to-br from-amber-50 to-amber-100 dark:from-neutral-950 dark:to-neutral-900">
      <div class="container max-w-6xl mx-auto px-4 py-8">
        <header class="text-center mb-10">
          <h1 class="text-5xl font-light tracking-wide font-serif text-transparent bg-clip-text bg-linear-to-b from-yellow-500 from-40% to-amber-600 mb-3 flex items-center justify-center gap-3">
            <img
              src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G36z7AU98EMFmqYgawV09ps7Btn5QheWLfdKy"
              alt="Buffet logo"
              class="size-12"
            />
            Buffet
          </h1>
          <p class="text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto font-light">
            A fresh and simple full-stack template
          </p>
        </header>

        <Links />

        <div class="bg-white/95 dark:bg-neutral-900/60 rounded-xl border border-amber-300 dark:border-amber-500 p-6 backdrop-blur-sm">
          <h2 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            Share Your Thoughts
          </h2>
          <ThoughtForm />
          <ThoughtsList thoughts={initialThoughts} />
        </div>
      </div>
    </div>
  );
}
