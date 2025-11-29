export const CACHE_MAX_AGE = 86400;

export const getDbConfig = () => {
  if (process.env.NODE_ENV === "production") {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    }

    return { url, authToken };
  }

  return { url: "file:app.db" };
};
