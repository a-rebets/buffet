import { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import { $ } from "bun";
import { format } from "date-fns";
import { isProduction } from "elysia/error";
import { c, colors } from "./printing";

function runBetterAuth(args: string) {
  return $`bunx --bun --silent @better-auth/cli ${{ raw: args }} -y`;
}

function runMigration(sql: string) {
  const db = new Database("app.db");
  try {
    db.run(sql);
  } finally {
    db.close();
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

if (isProduction) {
  // In production, run the SQL file directly (no better-auth CLI)
  const sql = await Bun.file(migrationFile).text();
  if (!sql.trim()) {
    console.error(`Migration file ${migrationFile} is empty or missing`);
    process.exit(1);
  }
  runMigration(sql);
  console.log("✓ Migration applied");
} else {
  // In development, use better-auth CLI
  await runBetterAuth(`generate --output ${migrationFile}`);
  await runBetterAuth("migrate");
}

console.log(
  c(
    colors.primary,
    "\n  Your Buffet is protected now 🔒  \n",
    false,
    colors.accentDark,
  ),
);
