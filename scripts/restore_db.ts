import "dotenv/config";
import { db } from "../db";
import * as schema from "../db/schema";
import fs from "fs";

async function restore() {
    console.log("Starting restore process...");
    const backupDir = "./backup";
    if (!fs.existsSync(backupDir)) {
        console.error("Backup directory not found. Please run backup script first.");
        process.exit(1);
    }

    const tablesToRestore = [
        "wards",
        "users",
        "drugs",
        "constantSets",
        "wardConstantDrugs",
        "systemSettings",
        "announcements",
        "periodicEvents",
        "orders",
        "orderItems"
    ];

    // Clear tables in reverse order to respect potential foreign key constraints
    const reverseTables = [...tablesToRestore].reverse();
    console.log("Clearing existing data...");
    for (const tableName of reverseTables) {
        // @ts-expect-error
        const table = schema[tableName];
        if (table) {
            try {
                await db.delete(table);
                console.log(`  -> Cleared ${tableName}`);
            } catch (err) {
                console.warn(`  -> Could not clear ${tableName} (might be empty or missing)`);
            }
        }
    }

    console.log("\nImporting backup data...");
    for (const tableName of tablesToRestore) {
        // @ts-expect-error dynamic access
        const table = schema[tableName];
        if (!table) continue;

        const filePath = `${backupDir}/${tableName}.json`;
        if (!fs.existsSync(filePath)) continue;

        try {
            const fileData = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(fileData);

            if (data.length > 0) {
                // Bulk insert safely ignoring duplicates caused by seed scripts
                await db.insert(table).values(data).onConflictDoNothing();
                console.log(`  -> Restored ${data.length} records into ${tableName}`);
            } else {
                console.log(`  -> No records to restore for ${tableName}`);
            }
        } catch (error) {
            console.error(`  -> Error restoring ${tableName}:`, error);
        }
    }

    console.log("\nRestore complete! Please verify the data in your application.");
    process.exit(0);
}

restore().catch(err => {
    console.error(err);
    process.exit(1);
});
