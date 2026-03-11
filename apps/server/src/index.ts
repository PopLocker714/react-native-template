import crypto from "node:crypto";
import fs, { readFile } from "node:fs/promises";
import path from "node:path";
import { SignJWT } from "jose";
import { hotUpdater } from "./hotUpdater";

const STORAGE_PATH = path.resolve("./hot-updater-files");
export const BASE_URL =
	Bun.env.PROTOCOL === "http" ? `${Bun.env.PROTOCOL}://${Bun.env.HOST}:${Bun.env.PORT}` : "";

// Загрузка приватного ключа Ed25519
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
		"/files/*": async (req) => {
			const url = new URL(req.url);
			const relativePath = url.pathname.replace("/files/", "");
			const filePath = path.join(STORAGE_PATH, relativePath);
			try {
				const stat = await fs.stat(filePath);
				if (!stat.isFile()) throw new Error("Not a file");

				return new Response(Bun.file(filePath), {
					status: 200,
				});
			} catch (e) {
				return new Response("Not found", { status: 404 });
			}
		},
		"/s3/*": {
			POST: async (req) => {
				const url = new URL(req.url);
				const key = req.headers.get("X-Key");
				if (!key) return new Response("Missing X-Filename header", { status: 400 });

				const bucket = url.pathname.replace("/s3/", "").split("/")[0] || "template-app0";
				const filePath = path.join(STORAGE_PATH, bucket, key);

				await fs.mkdir(path.dirname(filePath), { recursive: true });

				const arrayBuffer = await req.arrayBuffer();
				await fs.writeFile(filePath, new Uint8Array(arrayBuffer));

				return new Response(JSON.stringify({ storageUri: `${BASE_URL}/s3/${bucket}/${key}` }), {
					headers: { "Content-Type": "application/json" },
				});
			},
			GET: async (req) => {
				const url = new URL(req.url);
				const relativePath = url.pathname.replace("/s3/", "");
				const filePath = path.join(STORAGE_PATH, relativePath);
				try {
					const stat = await fs.stat(filePath);
					if (!stat.isFile()) throw new Error("Not a file");

					return new Response(Bun.file(filePath), {
						status: 200,
					});
				} catch (e) {
					return new Response("Not found", { status: 404 });
				}
			},
		},
		"/hot-updater/*": {
			GET: (req) => {
				console.log("GET");
				return hotUpdater.handler(req);
			},
			POST: (req) => {
				console.log("POST");
				return hotUpdater.handler(req);
			},
			DELETE: (req) => {
				console.log("DELETE");
				return hotUpdater.handler(req);
			},
		},
	},
});

console.log(server.url.origin);
