import { useEffect, useState } from "react";
import {
  IconButton, Badge, Menu, List, ListItem, ListItemText, Typography, Divider, Chip, Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../api/client";

const color = { error: "error", warning: "warning", info: "info" };

export default function NotificationBell() {
  const [anchor, setAnchor] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const load = () =>
    api.get("/notifications").then((r) => setAlerts(r.data.alerts || [])).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={alerts.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 460 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontWeight={700}>Notifications ({alerts.length})</Typography>
        </Box>
        <Divider />
        {alerts.length === 0 && (
          <ListItem><ListItemText primary="No active alerts" /></ListItem>
        )}
        <List dense>
          {alerts.map((a, i) => (
            <ListItem key={i} alignItems="flex-start">
              <ListItemText
                primary={
                  <Box className="flex items-center gap-2">
                    <Chip size="small" color={color[a.severity] || "default"} label={a.type} />
                  </Box>
                }
                secondary={a.message}
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </>
  );
}
