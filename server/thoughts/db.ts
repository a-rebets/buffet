import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { and, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { thoughts } from "./schema";

const getAllThoughts = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    return yield* db
      .select()
      .from(thoughts)
      .where(eq(thoughts.userId, userId))
      .orderBy(desc(thoughts.createdAt));
  });

const insertThought = (content: string, userId: string) =>
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const rows = yield* db
      .insert(thoughts)
      .values({ content, userId })
      .returning();
    const thought = rows[0];
    if (!thought) {
      return yield* Effect.fail("Failed to insert thought");
    }
    return thought;
  });

const deleteThought = (id: number, userId: string) =>
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const rows = yield* db
      .delete(thoughts)
      .where(and(eq(thoughts.id, id), eq(thoughts.userId, userId)))
      .returning();
    if (rows.length === 0) {
      return yield* Effect.fail("Thought not found");
    }
    return { success: true } as const;
  });

export { getAllThoughts, insertThought, deleteThought };
