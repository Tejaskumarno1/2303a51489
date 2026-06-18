import { Stack, Level, Package } from "./types";

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
const AUTH_TOKEN = process.env.AFFORDMED_TOKEN ||""; 

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  // console.log("debug log:", message) 

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
    
    if (!response.ok) {
      // silent fail
    }
  } catch (e: any) {
    // console.error(e)
  }
}