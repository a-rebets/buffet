import { getSession } from "@lib/auth-client";
import type { Hooks } from "sv-router";
import { navigate } from "sv-router/generated";

export default {
  async beforeLoad({ pathname }) {
    if (pathname.startsWith("/auth")) {
      return;
    }

    const session = await getSession();

    if (!session?.data?.session) {
      throw navigate("/auth/login");
    }
  },
} satisfies Hooks;
