import { Elysia } from "elysia";
import { CACHE_MAX_AGE } from "server/util";

const app = new Elysia({ nativeStaticResponse: false }).get(
  "/*",
  () =>
    new Response(Bun.file("index.html"), {
      headers: {
        "cache-control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    }),
);

export default app;

export type App = typeof app;
