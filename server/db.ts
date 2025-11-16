import { Database } from "bun:sqlite";
import { readdirSync } from "node:fs";
import { BunFileSystem } from "@effect/platform-bun";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { Effect, Layer } from "effect";
import { DB_PATH } from "./util/constants";

export const SqlLive = SqliteClient.layer({
  filename: DB_PATH,
  disableWAL: true,
}).pipe(Layer.provide(BunFileSystem.layer));

export const runMigrations = Effect.gen(function* () {
  const files = yield* Effect.sync(() => readdirSync("migrations"));
  const contents = yield* Effect.forEach(files, (file) =>
    Effect.promise(() => Bun.file(`migrations/${file}`).text()),
  );
  const combined = contents.join("\n");

  yield* Effect.acquireUseRelease(
    Effect.sync(() => new Database(DB_PATH)),
    (db) =>
      Effect.try({
        try: () => db.run(combined),
        catch: (error) => new Error(`Migration failed: ${error}`),
      }),
    (db) => Effect.sync(() => db.close()),
  );
});

export const runWithSql = <A, E>(
  effect: Effect.Effect<A, E, SqliteClient.SqliteClient>,
): Promise<A> => Effect.runPromise(effect.pipe(Effect.provide(SqlLive)));
