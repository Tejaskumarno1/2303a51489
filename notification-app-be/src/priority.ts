import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { Log } from "../../logging-middleware/src/logger";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOKEN = process.env.AFFORDMED_TOKEN || "";

type NotificationType = "Placement" | "Result" | "Event";

interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

const WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function priorityScore(n: Notification): number {
  const weight = WEIGHTS[n.Type] ?? 0;
  const recency = new Date(n.Timestamp).getTime();
  // Combine weight (dominant) and recency (tiebreaker)
  return weight * 1e13 + recency;
}

async function fetchNotifications(): Promise<Notification[]> {
  Log("backend", "info", "api", "Fetching notifications from evaluation service");
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    Log("backend", "error", "api", `Fetch failed: HTTP ${res.status}`);
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  Log("backend", "info", "api", `Fetched ${data.notifications.length} notifications`);
  return data.notifications;
}

export async function getTopNPriority(n: number): Promise<Notification[]> {
  Log("backend", "info", "service", `getTopNPriority called with n=${n}`);

  const all = await fetchNotifications();

  // Sort descending by priority score
  const sorted = all.sort((a, b) => priorityScore(b) - priorityScore(a));

  const topN = sorted.slice(0, n);
  Log("backend", "info", "service", `Returning top ${topN.length} priority notifications`);
  return topN;
}

// Efficient maintenance: how to keep top N as new notifications arrive
// Use a min-heap of size N. For each new notification:
// - If heap.size < N: push it
// - Else if priorityScore(new) > heap.min: pop min, push new
// This is O(log N) per insertion vs O(n log n) full resort
