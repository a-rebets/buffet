import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { CACHE_MAX_AGE } from "server/util";

const app = new Elysia({ nativeStaticResponse: false })
  .use(
    await staticPlugin({
      assets: "dist",
      prefix: "/",
      alwaysStatic: true,
      maxAge: CACHE_MAX_AGE,
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
  );

export default app;

export type App = typeof app;
