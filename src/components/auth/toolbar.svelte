<script lang="ts">
  import * as Avatar from "@components/ui/avatar/index.js";
  import { Button } from "@components/ui/button/index.js";
  import { signOut, useSession } from "@lib/auth-client";
  import {
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { navigate } from "sv-router/generated";

  const queryClient = useQueryClient();

  const logout = createMutation(() => ({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.clear();
      navigate("/auth/login");
    },
  }));

  const session = useSession();
</script>

<footer
  class="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t-[0.5px] border-yellow-600 bg-amber-50/80 py-0 backdrop-blur-md dark:border-yellow-200 dark:bg-neutral-950/80"
>
  <div
    class="pointer-events-none absolute inset-0 bg-linear-to-b from-yellow-600/10 to-transparent dark:from-yellow-200/5"
  ></div>
  <div
    class="relative container mx-auto flex max-w-6xl items-center justify-between px-4 py-3 select-none"
  >
    <div class="flex items-center gap-3">
      {#if $session}
        <Avatar.Root class="size-7 rounded-full">
          <Avatar.Fallback
            class="text-amber-100 dark:text-amber-900 bg-linear-to-b from-yellow-400 to-amber-500 text-sm font-semibold"
            >{$session.data?.user.email
              .charAt(0)
              .toUpperCase()}</Avatar.Fallback
          >
        </Avatar.Root>
        <span class="font-semibold text-yellow-700/80 dark:text-yellow-200/80"
          >{$session.data?.user.email}</span
        >
      {/if}
    </div>
    <Button
      onclick={() => logout.mutate()}
      variant="ghost"
      class="text-yellow-600 dark:text-yellow-200 border-yellow-600 dark:border-yellow-200 hover:bg-yellow-600/20 hover:text-yellow-700 dark:hover:text-yellow-200 border-[0.5px] rounded-lg"
      >⏻ <span class="ml-1">Sign out</span>
    </Button>
  </div>
</footer>
