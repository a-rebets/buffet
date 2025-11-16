import { authPlugin } from "@server/auth";
import { runWithSql } from "@server/db";
import { Effect, Schema } from "effect";
import Elysia, { t } from "elysia";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { ThoughtSchema } from "./schema";

export const thoughtsRouter = new Elysia({
  name: "thoughts",
  prefix: "/thoughts",
})
  .use(authPlugin)
  .get(
    "",
    async ({ user }) => {
      return await runWithSql(
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

      return await runWithSql(effect);
    },
    {
      body: Schema.standardSchemaV1(ThoughtSchema.pick("content")),
      auth: true,
    },
  )
  .delete(
    "/:id",
    async ({ params, user }) => {
      const effect = deleteThought(params.id, user.id).pipe(
        Effect.catchAll(() => Effect.fail("Failed to delete thought" as const)),
      );
      return await runWithSql(effect);
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
      auth: true,
    },
  );
