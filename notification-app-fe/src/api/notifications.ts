import { Log } from "../../../logging-middleware/src/logger";

const BASE_URL = "/api/notifications";
const TOKEN = import.meta.env.VITE_TOKEN || "";

export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

export async function fetchNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  Log("frontend", "info", "api", `fetchNotifications called: ${JSON.stringify(params)}`);
  const url = new URL(BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.notification_type) url.searchParams.set("notification_type", params.notification_type);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    Log("frontend", "error", "api", `fetchNotifications failed: HTTP ${res.status}`);
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  Log("frontend", "info", "api", `Received ${data.notifications?.length ?? 0} notifications`);
  return data.notifications ?? [];
}
