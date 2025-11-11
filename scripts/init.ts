import { $ } from "bun";
import { format } from "date-fns";
import { c, colors } from "./printing";

function runBetterAuth(args: string) {
  return $`bunx --bun --no-install --silent @better-auth/cli ${{ raw: args }} -y`;
}

console.log(c(colors.primary, "\nInitializing ...\n", true));

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
    colors.accent,
    "\n  Your Buffet has authentication now 🔒  \n",
    false,
    colors.accentDark,
  ),
);
