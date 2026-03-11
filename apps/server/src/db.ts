import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./lib/hot-updater/hot-updater.schema";

const client = new Database("db.sqlite");

client.run(`PRAGMA foreign_keys = ON;`);
client.run("PRAGMA journal_mode = WAL;");

export const db = drizzle({ client, schema });

migrate(db, {
	migrationsFolder: "./drizzle",
	migrationsSchema: "./src/lib//hot-upater/*schema.ts",
});
