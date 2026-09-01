import { Context, Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSchema,
} from "effect/unstable/httpapi";

export const Thought = Schema.Struct({
  id: Schema.Int,
  content: Schema.String,
  createdAt: Schema.Date,
  userId: Schema.String,
});
export type Thought = typeof Thought.Type;

export const ThoughtCreate = Schema.Struct({
  content: Schema.String,
});

export const ThoughtDeleted = Schema.Struct({
  success: Schema.Boolean,
});

/** Public error body kept as a plain string so existing clients can match it. */
export const ThoughtProblem = Schema.String.pipe(
  HttpApiSchema.asText(),
  HttpApiSchema.status(400),
);

export class CurrentUser extends Context.Service<
  CurrentUser,
  { readonly id: string }
>()("buffet/CurrentUser") {}

export class Authorization extends HttpApiMiddleware.Service<
  Authorization,
  { provides: CurrentUser }
>()("buffet/Authorization", {
  error: HttpApiError.Unauthorized,
}) {}

const thoughtsGroup = HttpApiGroup.make("thoughts")
  .add(
    HttpApiEndpoint.get("list", "/", {
      success: Schema.Array(Thought),
    }),
    HttpApiEndpoint.post("create", "/", {
      payload: ThoughtCreate,
      success: Thought,
      error: ThoughtProblem,
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: { id: Schema.Int },
      success: ThoughtDeleted,
      error: ThoughtProblem,
    }),
  )
  .middleware(Authorization)
  .prefix("/api/thoughts");

export const Api = HttpApi.make("Api").add(thoughtsGroup);
