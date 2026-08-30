import { Database } from "bun:sqlite";
import { afterEach, expect, test } from "bun:test";
import { type Started, startBuffet, stopIfRunning, tempDbDir } from "./helpers";

const running: Started[] = [];

afterEach(async () => {
  await Promise.all(running.splice(0).map(stopIfRunning));
});

const cookieHeader = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

const origin = (started: Started) => `http://127.0.0.1:${started.port}`;

const signUp = async (started: Started, email: string) => {
  const base = origin(started);
  const response = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: base,
    },
    body: JSON.stringify({
      name: "Tester",
      email,
      password: "password-password",
    }),
  });
  const cookie = cookieHeader(response);
  if (!response.ok) {
    throw new Error(
      `sign-up failed ${response.status}: ${await response.text()}`,
    );
  }
  expect(cookie.length).toBeGreaterThan(0);
  return cookie;
};

const authHeaders = (cookie: string, started: Started) => ({
  cookie,
  "Content-Type": "application/json",
  Origin: origin(started),
});

const listThoughts = (started: Started, cookie: string) =>
  fetch(`${origin(started)}/api/thoughts`, {
    headers: authHeaders(cookie, started),
  });

const createThought = (started: Started, cookie: string, content: string) =>
  fetch(`${origin(started)}/api/thoughts`, {
    method: "POST",
    headers: authHeaders(cookie, started),
    body: JSON.stringify({ content }),
  });

const deleteThought = (started: Started, cookie: string, id: number) =>
  fetch(`${origin(started)}/api/thoughts/${id}`, {
    method: "DELETE",
    headers: authHeaders(cookie, started),
  });

const start = async () => {
  const dir = await tempDbDir();
  const started = await startBuffet(`${dir}/app.db`, dir);
  running.push(started);
  return started;
};

test("startup migrates an empty database", async () => {
  const started = await start();
  const db = new Database(started.dbPath);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    const names = db
      .query(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name`,
      )
      .all()
      .map((row) => (row as { name: string }).name);
    const count = db
      .query("SELECT count(*) AS count FROM __drizzle_migrations")
      .get() as { count: number };
    expect(names).toEqual([
      "__drizzle_migrations",
      "account",
      "session",
      "thoughts",
      "user",
      "verification",
    ]);
    expect(count.count).toBe(1);
  } finally {
    db.close();
  }
}, 30_000);

test("unauthenticated thought requests return 401 before any database work", async () => {
  const started = await start();
  const response = await listThoughts(started, "");
  expect(response.status).toBe(401);
}, 30_000);

test("a signed-in user can insert, list, and delete their own thought", async () => {
  const started = await start();
  const cookie = await signUp(started, "owner@example.com");

  const created = await createThought(started, cookie, "hello buffet");
  expect(created.ok).toBe(true);
  const thought = (await created.json()) as { id: number; content: string };
  expect(thought.content).toBe("hello buffet");

  const listed = await listThoughts(started, cookie);
  expect(listed.ok).toBe(true);
  const thoughts = (await listed.json()) as Array<{ id: number }>;
  expect(thoughts.map((row) => row.id)).toEqual([thought.id]);

  const deleted = await deleteThought(started, cookie, thought.id);
  expect(deleted.ok).toBe(true);

  const empty = await listThoughts(started, cookie);
  expect(await empty.json()).toEqual([]);
}, 30_000);

test("one user cannot list or delete another user's thought", async () => {
  const started = await start();
  const owner = await signUp(started, "owner-iso@example.com");
  const other = await signUp(started, "other-iso@example.com");

  const created = await createThought(started, owner, "private");
  const thought = (await created.json()) as { id: number };

  const listed = await listThoughts(started, other);
  expect(await listed.json()).toEqual([]);

  const deleted = await deleteThought(started, other, thought.id);
  expect(deleted.ok).toBe(false);
}, 30_000);

test("concurrent thought writes complete without SQLITE_BUSY", async () => {
  const started = await start();
  const cookie = await signUp(started, "concurrent@example.com");
  const writes = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      createThought(started, cookie, `thought ${i}`),
    ),
  );
  expect(writes.every((response) => response.ok)).toBe(true);
  const listed = await listThoughts(started, cookie);
  const thoughts = (await listed.json()) as unknown[];
  expect(thoughts).toHaveLength(8);
}, 30_000);

test("an empty thought is rejected with the public message", async () => {
  const started = await start();
  const cookie = await signUp(started, "empty@example.com");
  const response = await createThought(started, cookie, "   ");
  expect(response.ok).toBe(false);
  const body = await response.text();
  expect(body).toContain("Thought content is required");
}, 30_000);

test("API requests are rate limited after 50 hits in a minute", async () => {
  const started = await start();
  const responses = await Promise.all(
    Array.from({ length: 51 }, () => listThoughts(started, "")),
  );
  const limited = responses.filter((response) => response.status === 429);
  expect(limited.length).toBeGreaterThan(0);
  expect(limited[0]?.headers.get("retry-after")).toBeTruthy();
}, 30_000);
