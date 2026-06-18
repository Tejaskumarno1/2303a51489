import { Stack, Level, Package } from "./types";

const LOG_API_URL = typeof window !== "undefined" 
  ? "/api/logs" 
  : "http://4.224.186.213/evaluation-service/logs";
let AUTH_TOKEN = "";
try {
  if (typeof process !== "undefined" && process.env && process.env.AFFORDMED_TOKEN) {
    AUTH_TOKEN = process.env.AFFORDMED_TOKEN;
  } else if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    AUTH_TOKEN = (import.meta as any).env.VITE_TOKEN || "";
  }
} catch (e) {}

export function setAuthToken(token: string) {
  AUTH_TOKEN = token;
}
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  console.log(`[LOG] ${level.toUpperCase()} [${pkg}]:`, message);

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