import { Database } from "bun:sqlite";
import { SqliteClient } from "@effect/sql-sqlite-bun";
import { pushSchema } from "drizzle-kit/payload/sqlite";
import {
  type EffectSQLiteBunDatabase,
  makeWithDefaults,
} from "drizzle-orm/effect-sqlite-bun";
import { Context, Effect, Layer, ManagedRuntime } from "effect";
import * as schema from "./schema";
import { DB_PATH } from "./util/constants";

export class AppDb extends Context.Service<AppDb, EffectSQLiteBunDatabase>()(
  "AppDb",
) {}

const sqliteKitClient = (sqlite: Database) => ({
  query: async (sql: string, params?: unknown[]) => {
    const statement = sqlite.query(sql);
    return params && params.length > 0
      ? statement.all(...(params as never[]))
      : statement.all();
  },
  run: async (query: string) => {
    sqlite.run(query);
  },
  batch: async (statements: string[]) => {
    for (const statement of statements) {
      sqlite.exec(statement);
    }
  },
});

const SchemaLive = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* Effect.acquireRelease(
      Effect.try(() => new Database(DB_PATH)),
      (sqlite) =>
        Effect.try(() => sqlite.close()).pipe(
          Effect.catchCause((cause) =>
            Effect.logWarning(
              "Failed to close DB connection when pushing schema",
              cause,
            ),
          ),
        ),
    ).pipe(
      Effect.tap((sqlite) =>
        Effect.tryPromise(async () => {
          const { apply } = await pushSchema(schema, sqliteKitClient(sqlite));
          await apply();
        }),
      ),
      Effect.scoped,
    );
  }),
);

const SqlLive = SqliteClient.layer({
  filename: DB_PATH,
  disableWAL: true,
}).pipe(Layer.provide(SchemaLive));

const AppLayer = Layer.effect(AppDb, makeWithDefaults()).pipe(
  Layer.provide(SqlLive),
);

const appRuntime = ManagedRuntime.make(AppLayer);

let disposePromise: Promise<void> | undefined;

export const runWithDb = appRuntime.runPromise;
export const initDb = () => runWithDb(Effect.logInfo("DB initialized"));

export const shutdownDb = (): Promise<void> => {
  disposePromise ??= appRuntime.dispose();
  return disposePromise;
};
