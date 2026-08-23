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

const openUserEmails = (dbPath: string) => {
  const db = new Database(dbPath);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    return db
      .query("SELECT email FROM user ORDER BY email")
      .all()
      .map((row) => (row as { email: string }).email);
  } finally {
    db.close();
  }
};

const insertMarkerUser = (dbPath: string, email: string) => {
  const db = new Database(dbPath);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    db.run(
      `INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
       VALUES (?, 'Marker', ?, 0, 1, 1)`,
      [crypto.randomUUID(), email],
    );
  } finally {
    db.close();
  }
};

const assertShutdownCycle = async (signal: "SIGINT" | "SIGTERM") => {
  const dir = await tempDbDir();
  const dbPath = `${dir}/app.db`;
  const email = `marker-${signal.toLowerCase()}@example.com`;

  const first = await startBuffet(dbPath, dir);
  running.push(first);
  insertMarkerUser(dbPath, email);
  await signalAndWait(first, signal);

  expect(openUserEmails(dbPath)).toEqual([email]);

  const second = await startBuffet(dbPath, dir);
  running.push(second);
  expect(openUserEmails(dbPath)).toEqual([email]);
  await signalAndWait(second, signal);
  expect(openUserEmails(dbPath)).toEqual([email]);
};

test(
  "SIGINT stops Buffet, exits 0, and leaves the database reusable",
  () => assertShutdownCycle("SIGINT"),
  30_000,
);

test(
  "SIGTERM stops Buffet, exits 0, and leaves the database reusable",
  () => assertShutdownCycle("SIGTERM"),
  30_000,
);
