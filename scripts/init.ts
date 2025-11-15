import { randomBytes } from "node:crypto";
import { $ } from "bun";
import { format } from "date-fns";
import { isProduction } from "elysia/error";
import { c, colors } from "./printing";

async function runBetterAuth(args: string) {
  const argsArray = args.split(/\s+/).filter(Boolean);
  const proc = Bun.spawn(
    ["bunx", "--bun", "@better-auth/cli", ...argsArray, "-y"],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  await proc.exited;
  if (proc.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${proc.exitCode}`);
  }
}

function generateSecret(): string {
  return randomBytes(16).toString("hex");
}

console.log(c(colors.primary, "\nInitializing ...\n", true));

const hasEnvFile = await Bun.file(".env").exists();
if (!hasEnvFile && !isProduction) {
  const secret = generateSecret();
  const envContent = `BETTER_AUTH_SECRET=${secret}
BETTER_AUTH_URL=http://localhost:3000
`;
  await Bun.write(".env", envContent);
  console.log(c(colors.accent, "Added secrets to the .env file\n"));
}

await $`mkdir -p migrations`;

let migrationFile: string;
let files: string;

try {
  files = await $`ls migrations/*.sql`.quiet().text();
} catch {
  files = "";
}

if (files.trim().length === 0) {
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
  migrationFile = `migrations/${timestamp}.sql`;
  await $`touch ${migrationFile}`;
} else {
  migrationFile = files.split("\n")[0]?.trim() ?? "";
}

await runBetterAuth(`generate --output ${migrationFile}`);
await runBetterAuth("migrate");

console.log(
  c(
    colors.primary,
    "\n  Your Buffet is protected now 🔒  \n",
    false,
    colors.accentDark,
  ),
);
