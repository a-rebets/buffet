<script lang="ts">
  import LoginForm from "@components/auth/login.svelte";
  import { navigate } from "sv-router/generated";
  import {
    type AuthFormErrors,
    createEmptyErrors,
    signUp,
  } from "@/lib/auth-client";

  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let loading = $state(false);
  let errors = $state<AuthFormErrors>(createEmptyErrors());

  async function handleSubmit(data: {
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    errors = createEmptyErrors();
    loading = true;

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      loading = false;
      return;
    }

    if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
      loading = false;
      return;
    }

    try {
      const result = await signUp.email({
        name: "",
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        const errorMessage = result.error.message || "Failed to create account";
        if (errorMessage.toLowerCase().includes("email")) {
          errors.email = errorMessage;
        } else {
          errors.password = errorMessage;
        }
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
  variant="signup"
  bind:email
  bind:password
  bind:confirmPassword
  bind:loading
  bind:errors
  onSubmit={handleSubmit}
/>
