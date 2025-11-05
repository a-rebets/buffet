import { serve } from "bun";
import { Effect } from "effect";
import { ThoughtsListContent } from "@/fragments/thoughts/thoughts-list";
import { WelcomePage } from "@/pages/home";
import index from "../public/index.html";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { renderResponse } from "./helpers";

const errorHtml = (
  <div class="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
    Thought content is required
  </div>
);

const handleCreateThought = (content: string | null) =>
  Effect.gen(function* () {
    if (!content || content.trim().length === 0) {
      return yield* renderResponse(errorHtml, 400);
    }

    const thoughts = yield* insertThought(content.trim());
    return yield* renderResponse(
      <ThoughtsListContent thoughts={thoughts} />,
      201,
    );
  });

const handleDeleteThought = (id: string) =>
  Effect.gen(function* () {
    yield* deleteThought(id);
    const thoughts = yield* getAllThoughts;
    const response = <ThoughtsListContent thoughts={thoughts} />;
    return yield* renderResponse(response, 200);
  });

const server = serve({
  routes: {
    "/": index,
    "/page/home": {
      GET: () =>
        Effect.runPromise(
          getAllThoughts.pipe(
            Effect.flatMap((thoughts) =>
              renderResponse(<WelcomePage initialThoughts={thoughts} />),
            ),
          ),
        ),
    },
    "/api/thoughts": {
      async POST(req) {
        const formData = await req.formData();
        const content = formData.get("content") as string | null;
        return Effect.runPromise(handleCreateThought(content));
      },
    },
    "/api/thoughts/:id": {
      DELETE: (req) => Effect.runPromise(handleDeleteThought(req.params.id)),
    },
  },
  fetch: () => new Response("Not Found", { status: 404 }),
  development:
    process.env.ENV === "production" ? false : { hmr: true, console: true },
});

console.log(`🚀 Server running on ${server.url}`);
