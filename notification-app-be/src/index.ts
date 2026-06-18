import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { getTopNPriority } from "./priority";

async function main() {
    try {
        const top10 = await getTopNPriority(10);
        console.log("--- Top 10 Priority Notifications ---");
        top10.forEach((n, idx) => {
            console.log(`${idx + 1}. [${n.Type}] - ${n.Message}`);
        });
    } catch (err) {
        console.error("Failed to fetch top notifications:", err);
    }
}

main();
