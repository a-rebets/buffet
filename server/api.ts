import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { authRouter } from "./auth";
import { thoughtsRouter } from "./thoughts";

export const apiRouter = new Elysia()
  .use(
    cors({
      origin: process.env.BUN_PUBLIC_DOMAIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .group("/api", (app) => app.use(authRouter).use(thoughtsRouter));
