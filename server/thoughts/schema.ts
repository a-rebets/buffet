import { Schema } from "effect";

export const ThoughtSchema = Schema.Struct({
  id: Schema.Number,
  content: Schema.String,
  created_at: Schema.String,
  user_id: Schema.String,
});

export type Thought = Schema.Schema.Type<typeof ThoughtSchema>;
