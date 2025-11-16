import { Database } from "bun:sqlite";
import { betterAuth } from "better-auth";
import Elysia from "elysia";
import { DB_PATH } from "./util/constants";

export const auth = betterAuth({
  basePath: "/auth",
  database: new Database(DB_PATH),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.RAILWAY_PUBLIC_DOMAIN ?? "http://localhost:3000",
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
