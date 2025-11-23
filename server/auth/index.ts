import { Database } from "bun:sqlite";
import { DB_PATH, PUBLIC_ADDRESS } from "@server/util/constants";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/bun-sqlite";
import Elysia from "elysia";
import * as schema from "./schema";

export const auth = betterAuth({
  basePath: "/auth",
  database: drizzleAdapter(drizzle(new Database(DB_PATH), { schema }), {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    PUBLIC_ADDRESS ? `https://${PUBLIC_ADDRESS}` : "http://localhost:3000",
  ],
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
