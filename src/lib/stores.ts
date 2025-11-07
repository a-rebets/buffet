import type { Thought } from "@server/thoughts/rpc";
import { writable } from "svelte/store";

export const thoughtsStore = writable<readonly Thought[]>([]);
