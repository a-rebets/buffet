import { layer as DrizzleLive } from "@effect/sql-drizzle/Sqlite";
import { LibsqlClient } from "@effect/sql-libsql";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { Effect, Layer, ManagedRuntime } from "effect";
import { getDbConfig } from "./util/constants";

const config = getDbConfig();
export const libsqlClient = createClient(config);

const MigrationLive = Layer.effectDiscard(
  Effect.promise(() => {
    const db = drizzle({ client: libsqlClient });
    return migrate(db, { migrationsFolder: "migrations" });
  }),
);

const SqlLive = LibsqlClient.layer({
  liveClient: libsqlClient,
}).pipe(Layer.provideMerge(MigrationLive));

const AppLayer = DrizzleLive.pipe(Layer.provide(SqlLive));

const appRuntime = ManagedRuntime.make(AppLayer);

export const runWithDb = appRuntime.runPromise;
export const initDb = () => runWithDb(Effect.logInfo("DB initialized"));
