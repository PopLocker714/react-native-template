// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    schema: './src/lib/hot-updater/*schema.ts',
    dbCredentials: {
        url: "db.sqlite"
    },
});
