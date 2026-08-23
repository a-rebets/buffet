import { Database } from "bun:sqlite";
import { afterEach, expect, test } from "bun:test";
import {
  type Started,
  signalAndWait,
  startBuffet,
  stopIfRunning,
  tempDbDir,
} from "./helpers";

const running: Started[] = [];

afterEach(async () => {
  await Promise.all(running.splice(0).map(stopIfRunning));
});

const tableNames = (dbPath: string) => {
  const db = new Database(dbPath);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    return db
      .query(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name`,
      )
      .all()
      .map((row) => (row as { name: string }).name);
  } finally {
    db.close();
  }
};

const migrationCount = (dbPath: string) => {
  const db = new Database(dbPath);
  try {
    return db
      .query("SELECT count(*) AS count FROM __drizzle_migrations")
      .get() as { count: number };
  } finally {
    db.close();
  }
};

test("startup migrates an empty database", async () => {
  const dir = await tempDbDir();
  const dbPath = `${dir}/app.db`;
  const started = await startBuffet(dbPath, dir);
  running.push(started);
  expect(tableNames(dbPath)).toEqual([
    "__drizzle_migrations",
    "account",
    "session",
    "thoughts",
    "user",
    "verification",
  ]);
  expect(migrationCount(dbPath).count).toBe(1);
  await signalAndWait(started, "SIGTERM");
}, 30_000);

test("starting twice does not reapply migrations", async () => {
  const dir = await tempDbDir();
  const dbPath = `${dir}/app.db`;

  const first = await startBuffet(dbPath, dir);
  running.push(first);
  const names = tableNames(dbPath);
  await signalAndWait(first, "SIGTERM");

  const second = await startBuffet(dbPath, dir);
  running.push(second);
  expect(tableNames(dbPath)).toEqual(names);
  expect(migrationCount(dbPath).count).toBe(1);
  await signalAndWait(second, "SIGTERM");
}, 30_000);
