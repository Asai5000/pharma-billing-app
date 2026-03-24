import { createClient } from "@libsql/client";
import fs from "fs";

const oldUrl = "libsql://pharma-db-kensei0130.aws-ap-northeast-1.turso.io";
const oldToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzExNDc0MzksImlkIjoiYTI3OGJhZjgtOGRmMC00NGEzLWJhMzQtMDNhMTMxZjU2OWYwIiwicmlkIjoiMmNiNTM0OTItNzM2OC00YTQ3LThkMzYtMjY2MzA3ZjkwOWQwIn0.6wHna3AtryfE4X1c9ozSM34PLshfqBLmJs0kWgrIPbeTC5N1PpcqOtU_eFpWGReHMAhnzqowEP3xETp0B_cWCA";

const client = createClient({ url: oldUrl, authToken: oldToken });

async function fix() {
    try {
        const rs = await client.execute("SELECT * FROM constant_sets");

        // Convert rows to plain objects to match drizzle output
        const data = rs.rows.map(row => {
            return {
                id: row.id,
                wardId: row.ward_id,
                name: row.name
            };
        });

        fs.writeFileSync("backup/constantSets.json", JSON.stringify(data, null, 2));
        console.log("Fixed backup. Dumped", data.length, "constantSets.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
fix();
