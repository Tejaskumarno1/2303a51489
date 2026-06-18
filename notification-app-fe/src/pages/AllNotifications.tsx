import { useState } from "react";
import {
  Container, Typography, Select, MenuItem,
  FormControl, InputLabel, Pagination, Box,
  Card, CardContent, Chip, CircularProgress
} from "@mui/material";
import { useNotifications } from "../hooks/useNotifications";
import { markViewed, isViewed } from "../state/viewedStore";
import { Log } from "../../../logging-middleware/src/logger";

const TYPES = ["All", "Placement", "Result", "Event"];

export default function AllNotifications() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("All");
  const { notifications, loading, error } = useNotifications({
    limit: 10,
    page,
    notification_type: filterType === "All" ? undefined : filterType,
  });

  Log("frontend", "info", "page", `AllNotifications rendered: page=${page} filter=${filterType}`);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" mt={4}>Error: {error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={500} mb={2}>All Notifications</Typography>
      <FormControl size="small" sx={{ mb: 2, minWidth: 180 }}>
        <InputLabel>Type</InputLabel>
        <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
          {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>

      {notifications.map((n) => {
        const viewed = isViewed(n.ID);
        return (
          <Card
            key={n.ID}
            sx={{ mb: 1.5, opacity: viewed ? 0.65 : 1, cursor: "pointer",
                  borderLeft: viewed ? "none" : "3px solid #1976d2" }}
            onClick={() => { markViewed(n.ID); Log("frontend", "info", "component", `Notification ${n.ID} marked viewed`); }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={viewed ? 400 : 600} fontSize={14}>{n.Message}</Typography>
                <Chip label={n.Type} size="small"
                  color={n.Type === "Placement" ? "success" : n.Type === "Result" ? "warning" : "default"} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.Timestamp).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        );
      })}

      <Pagination count={5} page={page} onChange={(_, v) => setPage(v)} sx={{ mt: 2 }} />
    </Container>
  );
}
