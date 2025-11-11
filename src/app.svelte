<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { Router } from "sv-router";

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <Router />
</QueryClientProvider>
