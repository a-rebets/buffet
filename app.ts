import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import { rateLimit } from "elysia-rate-limit";
import indexHtml from "public/index.html";
import { apiRouter } from "server/api";
import { initDb, shutdownDb } from "server/db";
import {
  CACHE_MAX_AGE,
  compressionPlugin,
  ensureClientBundleInProd,
  railwayIpGenerator,
} from "server/util";

const label = isProduction ? "[PROD]" : "[DEV]";
await ensureClientBundleInProd();

/*
 * ========================================================
 *   DEVELOPERS - SOME IMPORTANT STUFF YOU SHOULD KNOW
 * ========================================================
 *
 * - the order of the plugins you add matters! meaning events like
 *   .onError() or .onBeforeHandle() will apply only to routes that
 *   are registered after them.
 * - Elysia has this precedence for different types of routes:
 *   static > dynamic > wildcard.
 * - when two routes have the same priority (e.g. two static routes),
 *   the one that was registered first is used.
 * - .all() handler is weaker than a handler for a specific HTTP verb,
 *   meaning .all("/test/*") will not match when .get("/*") exists even
 *   if the GET request was sent to "/test/something".
 * - more here: https://elysiajs.com/key-concept.html
 *
 * - right now relying on Bun as the bundler for SPAs is rough. it works but,
 *   for example, a hack was added below to prevent Bun from short-circuiting
 *   routing internals of Elysia, this should be fixed in the future.
 */

const baseApp = new Elysia()
  .use(
    rateLimit({
      max: 50, // 50 requests per minute
      generator: railwayIpGenerator,
      skip: (req: Request) => !req.url.includes("/api/"),
    }),
  )
  .use(apiRouter)
  .onStart(async (app) => {
    await initDb();
    console.log(`${label} 🚀 Server running on port ${app.server?.port}`);
  });

const port = process.env.PORT ?? 3000;

type HttpApp = {
  stop: (closeActiveConnections?: boolean) => Promise<unknown>;
};

let httpApp: HttpApp;
let shuttingDown = false;

const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  let code = 0;
  try {
    await httpApp.stop();
  } catch {
    code = 1;
  }
  try {
    await shutdownDb();
  } catch {
    code = 1;
  }
  process.exit(code);
};

if (isProduction) {
  httpApp = new Elysia({ nativeStaticResponse: false })
    .use(compressionPlugin)
    .use(baseApp)
    .use(
      await staticPlugin({
        assets: "dist",
        prefix: "/",
        alwaysStatic: true,
        maxAge: CACHE_MAX_AGE,
        // Precompressed siblings are negotiated by compressionPlugin, not served raw.
        ignorePatterns: [
          ".DS_Store",
          ".git",
          ".env",
          /\.gz$/,
          /\.br$/,
          /(?:^|\/)gzip\//,
          /(?:^|\/)brotli\//,
        ],
      }),
    )
    .get(
      "/*",
      () =>
        new Response(Bun.file("dist/index.html"), {
          headers: {
            "cache-control": `public, max-age=${CACHE_MAX_AGE}`,
          },
        }),
    )
    .listen(port);
} else {
  httpApp = new Elysia({
    serve: {
      routes: {
        "/api/*": false,
      },
    },
  })
    .use(baseApp)
    .get("/*", indexHtml)
    .listen(port);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});

export type App = typeof baseApp;
