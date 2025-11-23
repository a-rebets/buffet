import { Database } from "bun:sqlite";
import { BunContext, BunFileSystem } from "@effect/platform-bun";
import { layer as DrizzleLive } from "@effect/sql-drizzle/Sqlite";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Effect, Layer, ManagedRuntime } from "effect";
import { DB_PATH } from "./util/constants";

const MigrationLive = Layer.effectDiscard(
  Effect.gen(function* (_) {
    yield* Effect.acquireRelease(
      Effect.try(() => new Database(DB_PATH)),
      (sqlite) =>
        Effect.try(() => sqlite.close()).pipe(
          Effect.catchAllCause((cause) =>
            Effect.logWarning(
              "Failed to close DB connection when migrating",
              cause,
            ),
          ),
        ),
    ).pipe(
      Effect.tap((sqlite) =>
        Effect.try(() => {
          const db = drizzle(sqlite);
          migrate(db, { migrationsFolder: "migrations" });
        }),
      ),
      Effect.scoped,
    );
  }),
);

const SqlBase = SqliteClient.layer({
  filename: DB_PATH,
  disableWAL: true,
}).pipe(Layer.provide(BunFileSystem.layer));

const SqlLive = SqlBase.pipe(Layer.provide(MigrationLive));

const AppLayer = DrizzleLive.pipe(
  Layer.provide(SqlLive),
  Layer.provide(BunContext.layer),
);

const appRuntime = ManagedRuntime.make(AppLayer);

export const runWithDb = appRuntime.runPromise;
export const initDb = () => runWithDb(Effect.logInfo("DB initialized"));
