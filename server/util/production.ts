import { isProduction } from "elysia/error";

export const ensureClientBundleInProd = async () => {
  if (isProduction) {
    const hasClientBundle = await Bun.file("dist/index.html").exists();
    if (!hasClientBundle) {
      console.error(
        "Client bundle not found. Run `bun run build` to generate it.",
      );
      process.exit(1);
    }
  }
};
