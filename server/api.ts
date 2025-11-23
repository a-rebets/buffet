import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { authRouter } from "./auth";
import { thoughtsRouter } from "./thoughts";
import { PUBLIC_ADDRESS } from "./util/constants";

export const apiRouter = new Elysia()
  .use(
    cors({
      origin: PUBLIC_ADDRESS
        ? `https://${PUBLIC_ADDRESS}`
        : "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .group("/api", (app) => app.use(authRouter).use(thoughtsRouter));
