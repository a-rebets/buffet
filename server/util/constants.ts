import { isProduction } from "elysia/error";

export const DB_PATH = isProduction ? "/data/app.db" : "app.db";
