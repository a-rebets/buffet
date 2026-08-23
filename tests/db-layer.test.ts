import { afterAll, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "buffet-db-layer-"));
process.env.DB_PATH = join(dir, "app.db");

const { AppDb, initDb, runWithDb, shutdownDb } = await import("../server/db");
const { EffectDrizzleQueryError } = await import(
  "drizzle-orm/effect-core/errors"
);
const { Effect } = await import("effect");

afterAll(async () => {
  await shutdownDb();
  await rm(dir, { recursive: true, force: true });
});

test("an invalid statement fails as EffectDrizzleQueryError", async () => {
  await initDb();
  const failure = await runWithDb(
    Effect.gen(function* () {
      const db = yield* AppDb;
      return yield* db.run("SELECT * FROM not_a_table");
    }).pipe(Effect.flip),
  );
  expect(failure).toBeInstanceOf(EffectDrizzleQueryError);
});
