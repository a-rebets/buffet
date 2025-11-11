import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Effect } from "effect";
import type { Thought } from "./schema";

const getAllThoughts = (userId: string) =>
  Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    return yield* sql<Thought>`
        SELECT *
        FROM thoughts
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
  });

const insertThought = (content: string, userId: string) =>
  Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    const rows = yield* sql<Thought>`
        INSERT INTO thoughts (content, user_id)
        VALUES (${content}, ${userId})
        RETURNING *
      `;
    const thought = rows[0];
    if (!thought) {
      return yield* Effect.fail("Failed to insert thought");
    }
    return thought;
  });

const deleteThought = (id: number, userId: string) =>
  Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    const rows = yield* sql<{ id: number }>`
        DELETE FROM thoughts
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;
    if (rows.length === 0) {
      return yield* Effect.fail("Thought not found");
    }
    return { success: true } as const;
  });

export { getAllThoughts, insertThought, deleteThought };
