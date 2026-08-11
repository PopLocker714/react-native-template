import { Database } from "bun:sqlite";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";

const database = new Database("db.sqlite");
database.run("PRAGMA journal_mode = WAL;");

// Schema and migrations are managed by hot-updater (fumadb's kysely adapter,
// which supports a programmatic migration engine) — see hotUpdater.ts.
export const db = new Kysely({
	dialect: new BunSqliteDialect({ database }),
});
