import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import MemoryIcon from "@mui/icons-material/Memory";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import InsightsIcon from "@mui/icons-material/Insights";
import StoreIcon from "@mui/icons-material/Store";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";

const DRAWER_WIDTH = 250;

const items = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/assets", label: "Asset Inventory", icon: <Inventory2Icon /> },
  { to: "/stock", label: "Stock Maintenance", icon: <WarehouseIcon /> },
  { to: "/hardware", label: "Hardware Monitoring", icon: <MemoryIcon /> },
  { to: "/maintenance", label: "Maintenance Requests", icon: <BuildCircleIcon /> },
  { to: "/preventive", label: "Preventive Maintenance", icon: <EventRepeatIcon /> },
  { to: "/predictive", label: "Predictive Maintenance", icon: <InsightsIcon /> },
  { to: "/vendors", label: "Vendor Details", icon: <StoreIcon /> },
  { to: "/ai", label: "AI Assistant", icon: <SmartToyIcon /> },
  { to: "/reports", label: "Reports", icon: <AssessmentIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();

  const content = (
    <div>
      <Toolbar className="gap-2">
        <ScienceIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={800}>
          Lab AMS
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {items.map((it) => {
          const active =
            it.to === "/" ? location.pathname === "/" : location.pathname.startsWith(it.to);
          return (
            <ListItemButton
              key={it.to}
              component={NavLink}
              to={it.to}
              onClick={onClose}
              selected={active}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": { width: DRAWER_WIDTH, borderRight: "1px solid rgba(0,0,0,0.06)" } }}
      >
        {content}
      </Drawer>
    </Box>
  );
}

export { DRAWER_WIDTH };
