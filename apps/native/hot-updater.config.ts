import { s3Storage } from "@hot-updater/aws";
import { bare } from "@hot-updater/bare";
import { standaloneRepository } from "@hot-updater/standalone";
import { config } from "dotenv";
import { defineConfig } from "hot-updater";

config({ path: ".env.hotupdater" });

// Bundles are uploaded directly to S3 by the CLI. Must point at the same
// bucket/credentials as the server (apps/server/src/hotUpdater.ts).
// For MinIO set S3_ENDPOINT (e.g. http://localhost:9000) and keep forcePathStyle.
const s3Config = {
	region: process.env.S3_REGION ?? "auto",
	endpoint: process.env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
	bucketName: process.env.S3_BUCKET_NAME!,
};

export default defineConfig({
	build: bare({ enableHermes: true }),
	storage: s3Storage(s3Config),
	updateStrategy: "appVersion", // or "fingerprint"
	// Metadata is stored by the self-hosted server (standalone repository).
	database: standaloneRepository({
		baseUrl: `${process.env.HOT_UPDATER_BASE_URL}/hot-updater`,
	}),
});
