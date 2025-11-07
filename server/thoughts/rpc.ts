import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export type Thought = Schema.Schema.Type<typeof ThoughtSchema>;

export const ThoughtSchema = Schema.Struct({
  id: Schema.Number,
  content: Schema.String,
  created_at: Schema.String,
});

export class ThoughtRpcs extends RpcGroup.make(
  Rpc.make("GetThoughts", {
    success: Schema.Array(ThoughtSchema),
  }),

  Rpc.make("CreateThought", {
    success: ThoughtSchema,
    error: Schema.String,
    payload: {
      content: Schema.String,
    },
  }),

  Rpc.make("DeleteThought", {
    success: Schema.Void,
    error: Schema.String,
    payload: {
      id: Schema.Number,
    },
  }),
) {}
