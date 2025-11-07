import { HttpLayerRouter } from "@effect/platform";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { serve } from "bun";
import { Effect, Layer } from "effect";
import index from "../public/index.html";
import { initializeSchema, SqlLive } from "./db";
import { ThoughtHandlersLive } from "./thoughts";
import { ThoughtRpcs } from "./thoughts/rpc";

const rpcLayer = RpcServer.layerHttpRouter({
  group: ThoughtRpcs,
  path: "/rpc",
  protocol: "http",
}).pipe(
  Layer.provide(ThoughtHandlersLive),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(SqlLive),
);

const { handler, dispose } = HttpLayerRouter.toWebHandler(rpcLayer);

Effect.runPromise(initializeSchema.pipe(Effect.provide(SqlLive))).then(() => {
  const server = serve({
    routes: {
      "/": index,
    },
    fetch: (req) => handler(req),
    development: process.env.ENV !== "production",
  });

  console.log(`🚀 Server running on ${server.url}`);

  process.on("SIGINT", () => {
    dispose().then(
      () => {
        process.exit(0);
      },
      () => {
        process.exit(1);
      },
    );
  });
});
