import { readDatabaseUrl } from "./database-url.js";

const PASSWORD = "s3cret-pw";

describe("readDatabaseUrl", () => {
  it.each([
    "postgresql://app:pw@localhost:5432/app",
    "postgres://app:pw@db.internal/app?sslmode=require",
  ])("accepts the PostgreSQL connection string %s", (url) => {
    expect(readDatabaseUrl({ DATABASE_URL: url })).toBe(url);
  });

  it.each([
    ["missing", undefined, /DATABASE_URL is not set/],
    ["empty", "", /DATABASE_URL is not set/],
  ])("rejects a %s value and names the variable", (_, url, message) => {
    expect(() => readDatabaseUrl({ DATABASE_URL: url })).toThrow(message);
  });

  it.each([
    ["another database's URL", `mysql://app:${PASSWORD}@localhost/app`],
    ["a value that is not a URL", `app:${PASSWORD}@localhost`],
  ])("rejects %s without revealing the value", (_, url) => {
    expect(() => readDatabaseUrl({ DATABASE_URL: url })).toThrow(
      /^DATABASE_URL is not a PostgreSQL connection string\./,
    );
    expect(() => readDatabaseUrl({ DATABASE_URL: url })).not.toThrow(PASSWORD);
  });
});
