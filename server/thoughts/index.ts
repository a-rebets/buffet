import { authPlugin } from "@server/auth";
import { runWithDb } from "@server/db";
import { EffectDrizzleQueryError } from "drizzle-orm/effect-core/errors";
import { Effect } from "effect";
import { Elysia } from "elysia";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { ThoughtInsertSchema } from "./schema";

const isSqlFailure = (error: unknown): error is EffectDrizzleQueryError =>
  error instanceof EffectDrizzleQueryError;

const mapCreateFailure = (error: unknown) =>
  Effect.gen(function* () {
    if (isSqlFailure(error)) {
      yield* Effect.logError("SQL failure while creating thought", error);
    }
    return yield* Effect.fail("Failed to create thought" as const);
  });

const mapDeleteFailure = (error: unknown) =>
  Effect.gen(function* () {
    if (isSqlFailure(error)) {
      yield* Effect.logError("SQL failure while deleting thought", error);
    } else if (error === "Thought not found") {
      yield* Effect.logWarning("Thought not found");
    }
    return yield* Effect.fail("Failed to delete thought" as const);
  });

export const thoughtsRouter = new Elysia({
  name: "thoughts",
  prefix: "/thoughts",
})
  .use(authPlugin)
  .get(
    "",
    async ({ user }) => {
      return await runWithDb(getAllThoughts(user.id));
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
        ? insertThought(trimmed, user.id).pipe(Effect.catch(mapCreateFailure))
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
        Effect.catch(mapDeleteFailure),
      );
      return await runWithDb(effect);
    },
    {
      auth: true,
    },
  );
