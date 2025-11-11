import { Database } from "bun:sqlite";
import { betterAuth } from "better-auth";
import Elysia from "elysia";

export const auth = betterAuth({
  basePath: "/auth",
  database: new Database("app.db"),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"],
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
