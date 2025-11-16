<script lang="ts">
  import LoginForm from "@components/auth/login.svelte";
  import {
    type AuthFormErrors,
    createEmptyErrors,
    signIn,
  } from "@lib/auth-client";
  import { navigate } from "sv-router/generated";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let errors = $state<AuthFormErrors>(createEmptyErrors());

  async function handleSubmit(data: { email: string; password: string }) {
    errors = createEmptyErrors();
    loading = true;

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        const errorMessage = result.error.message || "Failed to sign in";
        errors.password = errorMessage;
        return;
      }

      navigate("/");
    } catch (err) {
      errors.password =
        err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<LoginForm
  variant="login"
  bind:email
  bind:password
  bind:loading
  bind:errors
  onSubmit={handleSubmit}
/>
