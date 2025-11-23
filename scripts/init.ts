import { randomBytes } from "node:crypto";
import { $ } from "bun";
import { isProduction } from "elysia/error";
import { c, colors } from "./printing";

function generateSecret(): string {
  return randomBytes(16).toString("hex");
}

if (isProduction) process.exit(0);

console.log(c(colors.primary, "\nPreparing Buffet\n", true));

const hasEnvFile = await Bun.file(".env").exists();
if (!hasEnvFile) {
  const secret = generateSecret();
  const envContent = `BETTER_AUTH_SECRET=${secret}
BETTER_AUTH_URL=http://localhost:3000
BUN_PUBLIC_DOMAIN=localhost:3000
`;
  await Bun.write(".env", envContent);
  console.log(c(colors.accent, "Added secrets to the .env file\n"));
}

console.log(c(colors.accent, "Running better-auth CLI ...\n"));
await $`bunx --bun --silent @better-auth/cli generate --output server/auth/schema.ts --config server/auth/index.ts -y`;

console.log(
  c(
    colors.primary,
    "\n  Your Buffet is protected now 🔒  \n",
    false,
    colors.accentDark,
  ),
);
