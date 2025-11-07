import { HttpLayerRouter } from "@effect/platform";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { serve } from "bun";
import { Effect, Layer } from "effect";
import index from "../public/index.html";
import { initializeSchema, SqlLive } from "./db";
import { ThoughtHandlersLive } from "./thoughts";
import { ThoughtRpcs } from "./thoughts/rpc";

const isDev = process.env.NODE_ENV !== "production";

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

async function handlerWithStaticFiles(req: Request) {
  const path = new URL(req.url).pathname;
  if (path.startsWith("/rpc")) {
    return handler(req);
  }
  const file = Bun.file(`dist${path}`);
  if (await file.exists()) {
    return new Response(file);
  }
  return new Response(null, { status: 404 });
}

Effect.runPromise(initializeSchema.pipe(Effect.provide(SqlLive))).then(() => {
  const server = serve({
    routes: {
      "/": isDev ? index : Bun.file("dist/index.html"),
    },
    fetch: (req) => (isDev ? handler(req) : handlerWithStaticFiles(req)),
    development: { console: isDev },
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
