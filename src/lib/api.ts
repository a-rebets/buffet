import { Api, type Thought } from "@shared/api";
import { type Effect, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

export type { Thought };

const FetchLive = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" }),
  ),
);

const runtime = ManagedRuntime.make(FetchLive);

const client = runtime.runSync(
  HttpApiClient.make(Api, {
    baseUrl: process.env.BUN_PUBLIC_DOMAIN,
  }),
);

const run = <A, E>(effect: Effect.Effect<A, E>): Promise<A> =>
  runtime.runPromise(effect).catch((error: unknown) => {
    if (typeof error === "string") throw new Error(error);
    throw error;
  });

export const listThoughts = () => run(client.thoughts.list());

export const createThought = (content: string) =>
  run(client.thoughts.create({ payload: { content } }));

export const deleteThought = (id: number) =>
  run(client.thoughts.delete({ params: { id } }));

export const thoughtsKeys = {
  all: () => ["thoughts"] as const,
};
