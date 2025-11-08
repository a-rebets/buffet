import { Effect, Schema } from "effect";
import Elysia, { t } from "elysia";
import { runWithSql } from "server/db";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { ThoughtSchema } from "./schema";

export const ThoughtsRouter = new Elysia({ prefix: "/thoughts" })
  .get("/", async () => {
    return await runWithSql(
      getAllThoughts.pipe(Effect.catchAll(() => Effect.succeed([]))),
    );
  })
  .post(
    "/",
    async ({ body }) => {
      const trimmed = body.content.trim();
      const effect = trimmed
        ? insertThought(trimmed).pipe(
            Effect.catchAll(() =>
              Effect.fail("Failed to create thought" as const),
            ),
          )
        : Effect.fail("Thought content is required");

      return await runWithSql(effect);
    },
    {
      body: Schema.standardSchemaV1(ThoughtSchema.pick("content")),
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const effect = deleteThought(params.id).pipe(
        Effect.catchAll(() => Effect.fail("Failed to delete thought" as const)),
      );
      return await runWithSql(effect);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    },
  );
