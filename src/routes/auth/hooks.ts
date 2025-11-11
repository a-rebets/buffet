import type { Hooks } from "sv-router";
import { navigate } from "sv-router/generated";
import { getSession } from "@/lib/auth-client";

export default {
  async beforeLoad() {
    const session = await getSession();

    if (session?.data?.session) {
      throw navigate("/");
    }
  },
} satisfies Hooks;
