import type { Hooks } from "sv-router";
import { navigate } from "sv-router/generated";
import { getSession } from "@/lib/auth-client";

export default {
  async beforeLoad({ pathname }) {
    console.log("beforeLoad", pathname);
    if (pathname.startsWith("/auth")) {
      return;
    }

    const session = await getSession();

    if (!session?.data?.session) {
      throw navigate("/auth/login");
    }
  },
} satisfies Hooks;
