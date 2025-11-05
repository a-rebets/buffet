import { serve } from "bun";
import { Effect } from "effect";
import index from "../public/index.html";
import { deleteThought, getAllThoughts, insertThought } from "./db";

const server = serve({
  routes: {
    "/": index,

    "/api/thoughts": {
      GET: () =>
        Effect.runPromise(
          getAllThoughts.pipe(
            Effect.map(
              (thoughts) =>
                new Response(JSON.stringify(thoughts), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }),
            ),
          ),
        ),

      async POST(req) {
        const formData = await req.formData();
        const content =
          (formData.get("content") as string | null)?.trim() ?? "";
        if (!content) {
          return new Response("Thought content is required", { status: 400 });
        }

        return Effect.runPromise(
          insertThought(content).pipe(
            Effect.map(
              (thoughts) =>
                new Response(JSON.stringify(thoughts), {
                  status: 201,
                  headers: { "Content-Type": "application/json" },
                }),
            ),
          ),
        );
      },
    },

    "/api/thoughts/:id": {
      DELETE: (req) =>
        Effect.runPromise(
          deleteThought(req.params.id).pipe(
            Effect.flatMap(() => getAllThoughts),
            Effect.map(
              (thoughts) =>
                new Response(JSON.stringify(thoughts), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }),
            ),
          ),
        ),
    },
  },
  fetch: () => new Response("Not Found", { status: 404 }),
  development:
    process.env.ENV === "production" ? false : { hmr: true, console: true },
});

console.log(`🚀 Server running on ${server.url}`);
