import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Effect } from "effect";
import type { Thought } from "./rpc";

const getAllThoughts = Effect.gen(function* () {
  const sql = yield* SqliteClient.SqliteClient;
  return yield* sql<Thought>`
      SELECT * FROM thoughts 
      ORDER BY created_at DESC
    `;
});

const insertThought = (content: string) =>
  Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    const rows = yield* sql<Thought>`
        INSERT INTO thoughts (content) 
        VALUES (${content})
        RETURNING *
      `;
    const thought = rows[0];
    if (!thought) {
      return yield* Effect.fail("Failed to insert thought");
    }
    return thought;
  });

const deleteThought = (id: number) =>
  Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    yield* sql`
        DELETE FROM thoughts 
        WHERE id = ${id}
      `;
  });

export { getAllThoughts, insertThought, deleteThought };
