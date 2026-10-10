const DATABASE_URL_HELP =
  "Set it to a PostgreSQL connection string (see apps/api/.env.example).";

/**
 * Returns DATABASE_URL after checking that it is a PostgreSQL connection string.
 * Error messages name the variable but never contain its value, because it
 * holds the database password.
 */
export function readDatabaseUrl(env: NodeJS.ProcessEnv): string {
  const value = env.DATABASE_URL;
  if (!value) {
    throw new Error(`DATABASE_URL is not set. ${DATABASE_URL_HELP}`);
  }
  // URL.canParse instead of new URL(): the TypeError from new URL() carries the input.
  const protocol = URL.canParse(value) ? new URL(value).protocol : undefined;
  if (protocol !== "postgresql:" && protocol !== "postgres:") {
    throw new Error(
      `DATABASE_URL is not a PostgreSQL connection string. ${DATABASE_URL_HELP}`,
    );
  }
  return value;
}
