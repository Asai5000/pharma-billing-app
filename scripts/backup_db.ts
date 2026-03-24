import "dotenv/config";
import { db } from "../db";
import * as schema from "../db/schema";
import fs from "fs";

async function backup() {
    console.log("Starting backup...");
    const backupDir = "./backup";
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const tablesToBackup = [
        "users",
        "wards",
        "drugs",
        "wardConstantDrugs",
        "systemSettings",
        "announcements",
        "periodicEvents",
        "orders",
        "orderItems"
    ];

    for (const tableName of tablesToBackup) {
        console.log(`Backing up table: ${tableName}...`);
        // @ts-expect-error dynamic access
        const table = schema[tableName];
        if (!table) {
            console.warn(`Table ${tableName} not found in schema. Skipping...`);
            continue;
        }

        try {
            const data = await db.select().from(table);
            fs.writeFileSync(`${backupDir}/${tableName}.json`, JSON.stringify(data, null, 2));
            console.log(`  -> Saved ${data.length} records to backup/${tableName}.json`);
        } catch (error) {
            console.error(`  -> Error backing up ${tableName}:`, error);
        }
    }

    console.log("Backup complete! All data saved to ./backup directory.");
    process.exit(0);
}

backup().catch(err => {
    console.error(err);
    process.exit(1);
});
