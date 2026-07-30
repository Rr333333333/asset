import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Switch, FormControlLabel, Divider, Chip, Table,
  TableHead, TableRow, TableCell, TableBody, TextField, Button, Alert,
} from "@mui/material";
import { useColorMode } from "../context/ColorModeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const users = [
  { name: "System Admin", username: "admin", role: "admin" },
  { name: "Lab Assistant", username: "assistant", role: "lab_assistant" },
  { name: "Technician", username: "technician", role: "technician" },
];

export default function Settings() {
  const { mode, toggle } = useColorMode();
  const { user } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => { api.get("/health").then((r) => setHealth(r.data.status)).catch(() => setHealth("down")); }, []);

  return (
    <Box>
      <Typography variant="h6" fontWeight={800} mb={3}>Settings</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>Appearance</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Switch checked={mode === "dark"} onChange={toggle} />}
              label={`${mode === "dark" ? "Dark" : "Light"} mode`}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>Backend Connection</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2">
              API status: <Chip size="small" label={health || "checking..."}
                                color={health === "healthy" ? "success" : "default"} />
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Storage backend and Google Sheets connection are configured via backend
              environment variables (STORAGE_BACKEND, GOOGLE_SPREADSHEET_ID).
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>Google Sheets & API Keys</Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="info" sx={{ mb: 2 }}>
              For security, keys are set on the server (.env), never in the browser.
            </Alert>
            <TextField fullWidth size="small" label="Spreadsheet ID (server-managed)" disabled sx={{ mb: 1.5 }} />
            <TextField fullWidth size="small" label="OpenAI Key (server-managed)" type="password" disabled />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>User Management</Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.username}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell><Chip size="small" label={u.role}
                      color={u.username === user?.username ? "primary" : "default"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>Backup & Restore</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={2}>
              Export any module as Excel/CSV from the Reports page for backup. With the
              Google Sheets backend, Google Drive version history serves as automatic backup.
            </Typography>
            <Button variant="outlined" href="/reports">Go to Reports</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
