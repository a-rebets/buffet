import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { authRouter } from "./auth";
import { thoughtsRouter } from "./thoughts";

export const apiRouter = new Elysia({
  prefix: "/api",
})
  .use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(authRouter)
  .use(thoughtsRouter);
