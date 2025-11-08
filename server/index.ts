import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { initializeSchema, runWithSql } from "./db";
import { ThoughtsRouter } from "./thoughts";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const hasClientBundle = await Bun.file("dist/index.html").exists();
  if (!hasClientBundle) {
    console.error(
      "Client bundle not found. Run `bun run build` to generate it.",
    );
    process.exit(1);
  }
}

const app = new Elysia()
  .use(
    await staticPlugin({
      assets: isProduction ? "dist" : "public",
      prefix: "/",
    }),
  )
  .group("/api", (app) => app.use(ThoughtsRouter))
  .onStart(async ({ server }) => {
    await runWithSql(initializeSchema);
    console.log(
      `${isProduction ? "[PROD]" : "[DEV]"} 🚀 Server running on port ${server?.port}`,
    );
  })
  .listen(3000);

export type App = typeof app;
