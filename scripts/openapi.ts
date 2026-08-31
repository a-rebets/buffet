import { mkdir } from "node:fs/promises";
import { OpenApi } from "effect/unstable/httpapi";
import openapiTS, { astToString } from "openapi-typescript";
import { Api } from "../shared/api";
import { c, colors } from "./printing";

const specDir = ".openapi";
const specPath = `${specDir}/openapi.json`;
const typesPath = "src/lib/api-types.gen.ts";

const spec = OpenApi.fromApi(Api);
await mkdir(specDir, { recursive: true });
await Bun.write(specPath, `${JSON.stringify(spec, null, 2)}\n`);

const ast = await openapiTS(new URL(`../${specPath}`, import.meta.url));
await Bun.write(typesPath, astToString(ast));

console.log(c(colors.accent, `Wrote ${specPath} and ${typesPath}`));
