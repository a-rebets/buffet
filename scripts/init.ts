import { randomBytes } from "node:crypto";
import { $ } from "bun";
import { isProduction } from "../server/util/production";
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
BUN_PUBLIC_DOMAIN=http://localhost:3000
`;
  await Bun.write(".env", envContent);
  console.log(c(colors.accent, "Added secrets to the .env file\n"));
}

console.log(c(colors.accent, "Running better-auth CLI ...\n"));
// `auth` is the 1.7 CLI. `@better-auth/cli` stopped at 1.5 and emits a
// schema missing account.issuer, which 1.7 requires at sign-up.
await $`bunx --bun --env-file=.env --silent auth@1.7.1 generate --output server/auth/schema.ts --config server/auth/index.ts -y`;

// Drizzle 1.0 moved the legacy relations() helper off the root export.
// The Better Auth CLI still emits `from "drizzle-orm"` — rewrite until it
// generates defineRelationsPart instead.
const schemaPath = "server/auth/schema.ts";
const schema = await Bun.file(schemaPath).text();
const fixed = schema.replace(
  'import { relations } from "drizzle-orm";',
  'import { relations } from "drizzle-orm/_relations";',
);
if (fixed !== schema) {
  await Bun.write(schemaPath, fixed);
}

console.log(
  `\n${c(
    colors.primary,
    "  Your Buffet is protected now 🔒  ",
    false,
    colors.accentDark,
  )}\n`,
);
