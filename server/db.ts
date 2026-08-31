import { Database } from "bun:sqlite";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import {
  type EffectSQLiteBunDatabase,
  makeWithDefaults,
} from "drizzle-orm/effect-sqlite-bun";
import { Context, Effect, Layer } from "effect";
import { DB_PATH } from "./util/constants";

export class AppDb extends Context.Service<AppDb, EffectSQLiteBunDatabase>()(
  "AppDb",
) {}

const MigrationLive = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.acquireRelease(
      Effect.try(() => new Database(DB_PATH)),
      (sqlite) =>
        Effect.try(() => sqlite.close()).pipe(
          Effect.catchCause((cause) =>
            Effect.logWarning(
              "Failed to close DB connection after migrations",
              cause,
            ),
          ),
        ),
    ).pipe(
      Effect.tap((sqlite) =>
        Effect.try(() =>
          migrate(drizzle({ client: sqlite }), {
            migrationsFolder: "migrations",
          }),
        ),
      ),
      Effect.scoped,
    );
  }),
);

const SqlLive = SqliteClient.layer({
  filename: DB_PATH,
}).pipe(Layer.provide(MigrationLive));

export const AppLayer = Layer.effect(AppDb, makeWithDefaults()).pipe(
  Layer.provide(SqlLive),
);
