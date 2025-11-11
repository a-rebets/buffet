import { createAuthClient } from "better-auth/svelte";

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient();

export interface AuthFormErrors {
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

export function createEmptyErrors(): AuthFormErrors {
  return {
    email: null,
    password: null,
    confirmPassword: null,
  };
}
