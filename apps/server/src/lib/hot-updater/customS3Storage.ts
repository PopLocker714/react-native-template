import { createStoragePlugin, getContentType, parseStorageUri } from "@hot-updater/plugin-core";
import fs from "fs/promises";
import path from "path";
import { BASE_URL } from "../..";

export interface LocalS3StorageConfig {
    bucketName: string;
    storagePath: string;
}

export const localS3Storage = createStoragePlugin<LocalS3StorageConfig>({
    name: "localS3Storage",
    supportedProtocol: "s3",
    factory: (config) => {
        const { bucketName, storagePath } = config;
        return {
            async upload(key, filePath) {
                const filename = path.basename(filePath);
                const storageKey = `${key}/${filename}`;
                return { storageUri: `${BASE_URL}/s3/${bucketName}/${storageKey}` };
            },

            async delete(storageUri) {
                const { bucket, key } = parseStorageUri(storageUri, "s3");
                const fullPath = path.join(storagePath, bucket, key);

                try {
                    await fs.unlink(fullPath);
                } catch (e) {
                    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
                }
            },

            async getDownloadUrl(storageUri) {
                const url = new URL(storageUri)
                const data = url.pathname.split('/')
                const fileUrl = `${BASE_URL}/s3/${data[data.length - 2]}/${data[data.length - 1]}`;
                return { fileUrl };
            },
        };
    },
});
