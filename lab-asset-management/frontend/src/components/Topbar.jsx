import {
  AppBar, Toolbar, IconButton, Typography, Box, InputBase, Avatar, Menu, MenuItem,
  Tooltip, Breadcrumbs, Link as MuiLink,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useColorMode } from "../context/ColorModeContext";
import NotificationBell from "./NotificationBell";
import { DRAWER_WIDTH } from "./Sidebar";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const crumb = location.pathname === "/" ? "Dashboard"
    : location.pathname.replace("/", "").replace(/-/g, " ");

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar className="gap-2">
        <IconButton edge="start" onClick={onMenu} sx={{ display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: "capitalize" }}>
            {crumb}
          </Typography>
          <Breadcrumbs sx={{ fontSize: 12 }}>
            <MuiLink underline="hover" color="inherit" href="/">Home</MuiLink>
            <Typography sx={{ fontSize: 12, textTransform: "capitalize" }}>{crumb}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="grow" />

        <Box
          className="hidden sm:flex items-center gap-2 px-3 rounded-full"
          sx={{ bgcolor: "action.hover", height: 38 }}
        >
          <SearchIcon fontSize="small" />
          <InputBase placeholder="Search..." sx={{ fontSize: 14 }} />
        </Box>

        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton onClick={toggle} color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <NotificationBell />

        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
            {user?.name?.[0] || "U"}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem disabled>{user?.name} ({user?.role})</MenuItem>
          <MenuItem onClick={() => { setAnchor(null); navigate("/settings"); }}>
            Settings
          </MenuItem>
          <MenuItem onClick={() => { logout(); navigate("/login"); }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
