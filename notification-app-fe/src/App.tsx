import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import AllNotifications from "./pages/AllNotifications";
import PriorityInbox from "./pages/PriorityInbox";
import { Log } from "../../logging-middleware/src/logger";

Log("frontend", "info", "config", "App initialised");

export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "white", color: "inherit" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography fontWeight={600} sx={{ mr: 2 }}>Notifications</Typography>
          <Button component={Link} to="/" onClick={() => Log("frontend", "info", "component", "Nav: All Notifications")}>All</Button>
          <Button component={Link} to="/priority" onClick={() => Log("frontend", "info", "component", "Nav: Priority Inbox")}>Priority Inbox</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<AllNotifications />} />
        <Route path="/priority" element={<PriorityInbox />} />
      </Routes>
    </BrowserRouter>
  );
}
