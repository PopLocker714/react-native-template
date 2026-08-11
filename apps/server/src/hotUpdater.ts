import { s3Storage } from "@hot-updater/aws";
import { createHotUpdater } from "@hot-updater/server";
import { kyselyAdapter } from "@hot-updater/server/adapters/kysely";
import { db } from "./db";

// S3-compatible storage (AWS S3 / MinIO / R2). For MinIO set S3_ENDPOINT and
// keep forcePathStyle. The same bucket/credentials are used by the CLI
// (apps/native/hot-updater.config.ts) which uploads bundles directly to S3.
const s3Config = {
	region: process.env.S3_REGION ?? "auto",
	endpoint: process.env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
	},
	bucketName: process.env.S3_BUCKET_NAME ?? "",
};

export const hotUpdater = createHotUpdater({
	database: kyselyAdapter({ db, provider: "sqlite" }),
	storages: [s3Storage(s3Config)],
	basePath: "/hot-updater",
});
