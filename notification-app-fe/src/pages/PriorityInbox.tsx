import { useState, useMemo } from "react";
import {
  Container, Typography, Select, MenuItem, FormControl,
  InputLabel, Box, Card, CardContent, Chip, Slider, CircularProgress
} from "@mui/material";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "../../../logging-middleware/src/logger";

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 } as const;

export default function PriorityInbox() {
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState("All");
  const { notifications, loading, error } = useNotifications({ limit: 100 });

  const prioritized = useMemo(() => {
    Log("frontend", "debug", "state", `Recalculating priority: topN=${topN} filter=${filterType}`);
    let filtered = filterType === "All" ? notifications :
      notifications.filter((n) => n.Type === filterType);
    return filtered
      .sort((a, b) => {
        const wDiff = (WEIGHTS[b.Type] ?? 0) - (WEIGHTS[a.Type] ?? 0);
        if (wDiff !== 0) return wDiff;
        return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
      })
      .slice(0, topN);
  }, [notifications, topN, filterType]);

  Log("frontend", "info", "page", `PriorityInbox rendered with ${prioritized.length} items`);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" mt={4}>Error: {error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={500} mb={2}>Priority Inbox</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">Top N notifications: {topN}</Typography>
          <Slider value={topN} min={5} max={50} step={5}
            onChange={(_, v) => setTopN(v as number)} marks />
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter type</InputLabel>
          <Select value={filterType} label="Filter type" onChange={(e) => setFilterType(e.target.value)}>
            {["All", "Placement", "Result", "Event"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {prioritized.map((n, i) => (
        <Card key={n.ID} sx={{ mb: 1.5,
          borderLeft: n.Type === "Placement" ? "4px solid #2e7d32"
                    : n.Type === "Result" ? "4px solid #ed6c02" : "4px solid #757575" }}>
          <CardContent sx={{ py: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography color="text.secondary" fontSize={12} fontWeight={500}>#{i + 1}</Typography>
                <Typography fontSize={14} fontWeight={500}>{n.Message}</Typography>
              </Box>
              <Chip label={n.Type} size="small"
                color={n.Type === "Placement" ? "success" : n.Type === "Result" ? "warning" : "default"} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {new Date(n.Timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
