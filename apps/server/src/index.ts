import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { SignJWT } from "jose";
import { hotUpdater } from "./hotUpdater";

// Create / migrate the hot-updater tables (managed by the library via fumadb).
const migration = await hotUpdater.createMigrator().migrateToLatest();
await migration.execute();

// Загрузка приватного ключа Ed25519 (для libsql /new эксперимента ниже)
const PRIVATE_KEY_PEM = await readFile("./keys/private.pem", "utf-8");

// jose требует KeyObject, преобразуем PEM
const PRIVATE_KEY = crypto.createPrivateKey({
	key: PRIVATE_KEY_PEM,
	format: "pem",
	type: "pkcs8",
});

const jwt = await new SignJWT({ sub: `id:${Bun.randomUUIDv7()}` })
	.setProtectedHeader({ alg: "EdDSA" })
	.setExpirationTime("30d")
	.sign(PRIVATE_KEY);

console.log(Date.now());
console.log(jwt);

const server = Bun.serve({
	port: Bun.env.PORT,
	development: true,
	routes: {
		"/new": {
			POST: async () => {
				console.log("ok");
				const url = "http://localhost:7017";

				const body = {
					statements: [
						`INSERT INTO events (type, data)
                     VALUES ('grow_fuild_item', '{"fuild_id":1,"game_item_id":1}')`,
					],
				};

				fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${jwt}`,
					},
					body: JSON.stringify(body),
				})
					.then((res) => res.json())
					.then(console.log)
					.catch(console.error);
				return new Response("ok", { status: 200, statusText: "ok" });
			},
		},
		// Bundles live in S3 now — the CLI uploads directly and the runtime
		// resolves presigned download URLs, so no local file routes are needed.
		"/hot-updater/*": {
			GET: (req) => hotUpdater.handler(req),
			POST: (req) => hotUpdater.handler(req),
			DELETE: (req) => hotUpdater.handler(req),
		},
	},
});

console.log(server.url.origin);
