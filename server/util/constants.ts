import { isProduction } from "elysia/error";

export const DB_PATH = isProduction ? "/data/app.db" : "app.db";

export const PUBLIC_ADDRESS = process.env.RAILWAY_PUBLIC_DOMAIN;
