import { authPlugin } from "@server/auth";
import { runWithDb } from "@server/db";
import { Effect } from "effect";
import { Elysia } from "elysia";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { ThoughtInsertSchema } from "./schema";

export const thoughtsRouter = new Elysia({
  name: "thoughts",
  prefix: "/thoughts",
})
  .use(authPlugin)
  .get(
    "",
    async ({ user }) => {
      return await runWithDb(
        getAllThoughts(user.id).pipe(Effect.catchAll(() => Effect.succeed([]))),
      );
    },
    {
      auth: true,
    },
  )
  .post(
    "",
    async ({ body, user }) => {
      const trimmed = body.content.trim();
      const effect = trimmed
        ? insertThought(trimmed, user.id).pipe(
            Effect.catchAll(() =>
              Effect.fail("Failed to create thought" as const),
            ),
          )
        : Effect.fail("Thought content is required");
      return await runWithDb(effect);
    },
    {
      body: ThoughtInsertSchema.pick({ content: true }),
      auth: true,
    },
  )
  .delete(
    "/:id",
    async ({ params, user }) => {
      const effect = deleteThought(parseInt(params.id, 10), user.id).pipe(
        Effect.catchAll(() => Effect.fail("Failed to delete thought" as const)),
      );
      return await runWithDb(effect);
    },
    {
      auth: true,
    },
  );
