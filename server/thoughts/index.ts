import { AuthorizationLive } from "@server/auth";
import { Api, CurrentUser } from "@shared/api";
import { EffectDrizzleQueryError } from "drizzle-orm/effect-core/errors";
import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { deleteThought, getAllThoughts, insertThought } from "./db";

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

export const ThoughtsLive = HttpApiBuilder.group(Api, "thoughts", (handlers) =>
  handlers.handleAll({
    list: () =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;
        return yield* getAllThoughts(user.id);
      }),
    create: ({ payload }) =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;
        const trimmed = payload.content.trim();
        if (!trimmed) {
          return yield* Effect.fail("Thought content is required");
        }
        return yield* insertThought(trimmed, user.id).pipe(
          Effect.catch(mapCreateFailure),
        );
      }),
    delete: ({ params }) =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;
        return yield* deleteThought(params.id, user.id).pipe(
          Effect.catch(mapDeleteFailure),
        );
      }),
  }),
).pipe(Layer.provide(AuthorizationLive));
