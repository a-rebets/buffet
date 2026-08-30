import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import indexHtml from "public/index.html";
import { Routes } from "server/api";
import { ensureClientBundleInProd, isProduction } from "server/util";

const label = isProduction ? "[PROD]" : "[DEV]";
await ensureClientBundleInProd();

const port = Number(process.env.PORT ?? 3000);

const AnnounceLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const { address } = yield* HttpServer.HttpServer;
    if (address._tag === "TcpAddress") {
      console.log(`${label} Server running on port ${address.port}`);
    }
  }),
);

/*
 * Bun HTML imports only work as Bun.serve route values. A catch-all `/*`
 * route would also match `/api/*` and steal those requests from Effect.
 * `/api/*`: false tells Bun to fall through to the Effect fetch handler.
 */
const serveOptions = isProduction
  ? { port }
  : {
      port,
      routes: {
        "/api/*": false,
        "/*": indexHtml,
      },
    };

const ServerLive = Layer.mergeAll(
  HttpRouter.serve(Routes, { disableListenLog: true }),
  AnnounceLive,
).pipe(Layer.provide(BunHttpServer.layer(serveOptions)));

BunRuntime.runMain(Layer.launch(ServerLive));
