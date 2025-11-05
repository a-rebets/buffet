import { Database } from "bun:sqlite";
import { Effect } from "effect";
import type { Thought } from "@/types";

const db = new Database("app.db");
db.run(`
  CREATE TABLE IF NOT EXISTS thoughts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const getAllThoughts = Effect.sync(
  () =>
    db
      .query("SELECT * FROM thoughts ORDER BY created_at DESC")
      .all() as Thought[],
);

const insertThought = (content: string) =>
  Effect.sync(() => {
    const stmt = db.prepare("INSERT INTO thoughts (content) VALUES (?)");
    stmt.run(content);
    return db
      .query("SELECT * FROM thoughts ORDER BY created_at DESC")
      .all() as Thought[];
  });

const deleteThought = (id: string) =>
  Effect.sync(() => db.query("DELETE FROM thoughts WHERE id = ?").run(id));

export { getAllThoughts, insertThought, deleteThought };
