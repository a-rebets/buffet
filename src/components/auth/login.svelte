<script lang="ts">
  import { Button } from "@components/ui/button/index.js";
  import * as Card from "@components/ui/card/index.js";
  import * as Field from "@components/ui/field/index.js";
  import { Input } from "@components/ui/input/index.js";
  import type { AuthFormErrors } from "@lib/auth-client";
  import { p } from "sv-router/generated";
  import loginImage from "@/assets/login.jpg";
  import signupImage from "@/assets/signup.jpg";

  let {
    id,
    variant = "login",
    email = $bindable(""),
    password = $bindable(""),
    confirmPassword = $bindable(""),
    loading = $bindable(false),
    errors = $bindable<AuthFormErrors>({}),
    onSubmit,
  }: {
    id?: () => string;
    variant?: "login" | "signup";
    email?: string;
    password?: string;
    confirmPassword?: string;
    loading?: boolean;
    errors?: AuthFormErrors;
    onSubmit?: (data: {
      email: string;
      password: string;
      confirmPassword?: string;
    }) => void | Promise<void>;
  } = $props();

  const fieldId = id?.() ?? crypto.randomUUID();
  const isSignup = variant === "signup";
  const imageSrc = isSignup ? signupImage : loginImage;

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        email,
        password,
        ...(isSignup && { confirmPassword }),
      });
    }
  }
</script>

<Card.Root
  class="mx-auto w-full max-w-4xl bg-white/95 dark:bg-neutral-900/60 rounded-xl border border-amber-300 dark:border-amber-500 overflow-hidden py-0"
>
  <div class="flex flex-col md:flex-row">
    <div
      class="flex-1 md:px-8 md:py-8 px-3 py-6 flex flex-col md:gap-y-8 gap-y-6"
    >
      <Card.Header>
        <Card.Title
          class="md:text-4xl text-3xl font-semibold font-serif text-neutral-900 dark:text-neutral-100 mb-3"
          >{isSignup ? "Sign Up" : "Sign In"}</Card.Title
        >
        <Card.Description class="text-neutral-700 dark:text-neutral-300"
          >{isSignup
            ? "Create a new account to get started"
            : "We need to know it's actually you"}</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <form onsubmit={handleSubmit}>
          <Field.Group class="md:gap-6 gap-4">
            <Field.Field data-invalid={!!errors.email}>
              <Field.Label for="email-{fieldId}">Email</Field.Label>
              <Input
                id="email-{fieldId}"
                type="email"
                placeholder="bun@buffet.dev"
                bind:value={email}
                aria-invalid={!!errors.email}
                required
                disabled={loading}
              />
              {#if errors.email}
                <Field.Error>{errors.email}</Field.Error>
              {/if}
            </Field.Field>
            <Field.Field data-invalid={!!errors.password}>
              <Field.Label for="password-{fieldId}">Password</Field.Label>
              <Input
                id="password-{fieldId}"
                type="password"
                bind:value={password}
                aria-invalid={!!errors.password}
                required
                disabled={loading}
              />
              {#if errors.password}
                <Field.Error>{errors.password}</Field.Error>
              {:else if isSignup}
                <Field.Description
                  >Must be at least 8 characters long.</Field.Description
                >
              {/if}
            </Field.Field>
            {#if isSignup}
              <Field.Field data-invalid={!!errors.confirmPassword}>
                <Field.Label for="confirm-password-{fieldId}"
                  >Confirm Password</Field.Label
                >
                <Input
                  id="confirm-password-{fieldId}"
                  type="password"
                  bind:value={confirmPassword}
                  aria-invalid={!!errors.confirmPassword}
                  required
                  disabled={loading}
                />
                {#if errors.confirmPassword}
                  <Field.Error>{errors.confirmPassword}</Field.Error>
                {:else}
                  <Field.Description
                    >Please confirm your password.</Field.Description
                  >
                {/if}
              </Field.Field>
            {/if}
            <Field.Field>
              <Button
                type="submit"
                class="w-full border-amber-200 bg-linear-to-r hover:from-orange-400 hover:to-yellow-400 from-orange-300 to-amber-300 focus:ring-amber-400 focus:outline-none focus:ring-2"
                size="lg"
                disabled={loading}
                >{loading
                  ? isSignup
                    ? "Creating Account..."
                    : "Signing in..."
                  : isSignup
                    ? "Create Account"
                    : "Continue"}</Button
              >
              <Field.Description class="text-center">
                {#if isSignup}
                  Already have an account? <a href={p("/auth/login")}>Sign in</a
                  >
                {:else}
                  Don't have an account? <a href={p("/auth/signup")}>Sign up</a>
                {/if}
              </Field.Description>
            </Field.Field>
          </Field.Group>
        </form>
      </Card.Content>
    </div>
    <div class="w-full md:w-1/2 h-64 md:h-auto">
      <img
        src={imageSrc}
        alt={isSignup ? "Sign up" : "Login"}
        class="w-full h-full object-cover"
        fetchpriority="high"
      />
    </div>
  </div>
</Card.Root>
