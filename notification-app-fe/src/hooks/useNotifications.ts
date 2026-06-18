import { useState, useEffect } from "react";
import { fetchNotifications, Notification } from "../api/notifications";
import { Log } from "../../../logging-middleware/src/logger";

export function useNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Log("frontend", "debug", "hook", "useNotifications: effect triggered");
    setLoading(true);
    fetchNotifications(params)
      .then((data) => {
        setNotifications(data);
        Log("frontend", "info", "hook", `useNotifications: loaded ${data.length} items`);
      })
      .catch((err) => {
        setError(err.message);
        Log("frontend", "error", "hook", `useNotifications: fetch error — ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [params?.limit, params?.page, params?.notification_type]);

  return { notifications, loading, error };
}
