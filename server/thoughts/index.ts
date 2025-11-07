import { Effect } from "effect";
import { SqlLive } from "server/db";
import { deleteThought, getAllThoughts, insertThought } from "./db";
import { ThoughtRpcs } from "./rpc";

const getThoughtsHandler = () =>
  getAllThoughts.pipe(
    Effect.provide(SqlLive),
    Effect.catchAll(() => Effect.succeed([])),
  );

const createThoughtHandler = ({ content }: { content: string }) => {
  const trimmed = content.trim();
  return trimmed
    ? insertThought(trimmed).pipe(
        Effect.provide(SqlLive),
        Effect.catchAll(() => Effect.fail("Failed to create thought" as const)),
      )
    : Effect.fail("Thought content is required");
};

const deleteThoughtHandler = ({ id }: { id: number }) =>
  deleteThought(id).pipe(
    Effect.provide(SqlLive),
    Effect.catchAll(() => Effect.fail("Failed to delete thought" as const)),
  );

export const ThoughtHandlersLive = ThoughtRpcs.toLayer({
  GetThoughts: getThoughtsHandler,
  CreateThought: createThoughtHandler,
  DeleteThought: deleteThoughtHandler,
});
