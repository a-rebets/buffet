import createClient from "openapi-fetch";
import type { operations, paths } from "./api-types.gen";

export type Thought =
  operations["thoughts.list"]["responses"][200]["content"]["application/json"][number];

const client = createClient<paths>({
  baseUrl: process.env.BUN_PUBLIC_DOMAIN,
  credentials: "include",
});

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "_tag" in error) {
    return String((error as { _tag: unknown })._tag);
  }
  return String(error ?? "Request failed");
}

async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (error !== undefined || !response.ok) {
    throw new Error(errorMessage(error));
  }
  if (data === undefined) {
    throw new Error("No data returned");
  }
  return data;
}

export const listThoughts = () => unwrap(client.GET("/api/thoughts"));

export const createThought = (content: string) =>
  unwrap(client.POST("/api/thoughts", { body: { content } }));

export const deleteThought = (id: number) =>
  unwrap(
    client.DELETE("/api/thoughts/{id}", {
      params: { path: { id: String(id) } },
    }),
  );

export const thoughtsKeys = {
  all: () => ["thoughts"] as const,
};
