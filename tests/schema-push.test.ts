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

test("an empty database gets every auth and thoughts table", async () => {
  const dir = await tempDbDir();
  const dbPath = `${dir}/app.db`;
  const started = await startBuffet(dbPath, dir);
  running.push(started);
  expect(tableNames(dbPath)).toEqual([
    "account",
    "session",
    "thoughts",
    "user",
    "verification",
  ]);
  await signalAndWait(started, "SIGTERM");
}, 30_000);

test("starting twice against the same file is a no-op", async () => {
  const dir = await tempDbDir();
  const dbPath = `${dir}/app.db`;

  const first = await startBuffet(dbPath, dir);
  running.push(first);
  const names = tableNames(dbPath);
  await signalAndWait(first, "SIGTERM");

  const second = await startBuffet(dbPath, dir);
  running.push(second);
  expect(tableNames(dbPath)).toEqual(names);
  await signalAndWait(second, "SIGTERM");
}, 30_000);
