import { treaty } from "@elysiajs/eden";
import type { App } from "@server";

// CAUTION: the env variable has to be present in the .env file
// for this to work in development
const apiAddress = process.env.BUN_PUBLIC_DOMAIN ?? "localhost:3000";

export const apiClient = treaty<App>(apiAddress).api;

export async function apiResponse<T>(
  promise: Promise<{ data: T; error: null } | { data: null; error: unknown }>,
): Promise<T> {
  const response = await promise;

  if (response.error && response.error !== null) {
    throw new Error(String(response.error));
  }

  if (response.data === null || response.data === undefined) {
    throw new Error("No data returned");
  }

  return response.data;
}

export const thoughtsKeys = {
  all: () => ["thoughts"] as const,
};
