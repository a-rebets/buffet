import { BunFileSystem } from "@effect/platform-bun";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Effect, Layer } from "effect";

export const SqlLive = SqliteClient.layer({
  filename: "app.db",
  disableWAL: true,
}).pipe(Layer.provide(BunFileSystem.layer));

export const initializeSchema = Effect.gen(function* () {
  const sql = yield* SqliteClient.SqliteClient;
  yield* sql`
    CREATE TABLE IF NOT EXISTS thoughts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES user(id)
    )
  `;
});

export const runWithSql = <A, E>(
  effect: Effect.Effect<A, E, SqliteClient.SqliteClient>,
): Promise<A> => Effect.runPromise(effect.pipe(Effect.provide(SqlLive)));
