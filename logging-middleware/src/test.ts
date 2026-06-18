import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { Log } from "./logger";

async function main() {
  await Log("backend", "info", "middleware", "Logging middleware test — working correctly");
  console.log("Log sent! Check Postman to verify 200 response");
}
main();
