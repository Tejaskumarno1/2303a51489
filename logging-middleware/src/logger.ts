import { Stack, Level, Package } from "./types";

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  const token = process.env.AFFORDMED_TOKEN || process.env.VITE_TOKEN || "";
  try {
    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // silent fail
  }
}