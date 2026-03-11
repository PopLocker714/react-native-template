import { createHotUpdater } from '@hot-updater/server'
import { drizzleAdapter } from "@hot-updater/server/adapters/drizzle";
import { db } from './db';
import { localS3Storage } from './lib/hot-updater/customS3Storage';

export const hotUpdater = createHotUpdater({
    database: drizzleAdapter({ db, provider: "sqlite" }),
    storages: [localS3Storage({
        bucketName: 'template-app',
        storagePath: './hot-updater-files'
    })],
    basePath: "/hot-updater",
});
