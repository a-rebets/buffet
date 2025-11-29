import { libsqlClient } from "@server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import Elysia from "elysia";
import * as schema from "./schema";

export const auth = betterAuth({
  baseURL: process.env.VERCEL_URL,
  basePath: "/auth",
  database: drizzleAdapter(drizzle({ client: libsqlClient, schema }), {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.VERCEL_URL ?? "http://localhost:3000"],
});

export const authRouter = new Elysia({ name: "auth" })
  .get("*", ({ request }) => auth.handler(request))
  .post("*", ({ request }) => auth.handler(request));

export const authPlugin = new Elysia({
  name: "auth-plugin",
}).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401);

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
