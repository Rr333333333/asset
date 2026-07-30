import { useEffect, useState } from "react";
import {
  Box, Button, Paper, Typography, Grid, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, CircularProgress, TextField, Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import api from "../api/client";

const statusColor = { Green: "success", Yellow: "warning", Red: "error" };

export default function Predictive() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [whatif, setWhatif] = useState({ age: 5, failure_count: 2, downtime: 100, cpu: 60, temp: 55 });
  const [result, setResult] = useState(null);

  const load = () => api.get("/predictive").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const run = async () => {
    setRunning(true);
    try { await api.post("/predictive/run"); await load(); }
    finally { setRunning(false); }
  };

  const predictWhatIf = async () => {
    const r = await api.post("/predictive/predict", whatif);
    setResult(r.data);
  };

  const set = (k, v) => setWhatif((p) => ({ ...p, [k]: v }));

  return (
    <Box>
      <Box className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <Typography variant="h6" fontWeight={800}>Predictive Maintenance (Random Forest)</Typography>
        <Button variant="contained" startIcon={running ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                disabled={running} onClick={run}>
          {running ? "Running model..." : "Run Predictions"}
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>What-if Prediction</Typography>
            <Divider sx={{ mb: 2 }} />
            {[
              ["age", "Age (years)"], ["failure_count", "Repair Count"],
              ["downtime", "Downtime (hrs)"], ["cpu", "CPU Usage (%)"], ["temp", "Temperature (C)"],
            ].map(([k, label]) => (
              <TextField key={k} type="number" size="small" fullWidth label={label} sx={{ mb: 1.5 }}
                         value={whatif[k]} onChange={(e) => set(k, e.target.value)} />
            ))}
            <Button fullWidth variant="outlined" onClick={predictWhatIf}>Predict</Button>
            {result && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Chip label={`${result.status} — ${result.risk_percentage}% risk`}
                      color={statusColor[result.status]} sx={{ fontWeight: 700, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">{result.recommended_action}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
            <Typography fontWeight={700} mb={1}>Asset Risk Scores</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Asset ID", "Age", "Failures", "Downtime", "Risk %", "Status", "Recommended Action"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r["Asset ID"]}</TableCell>
                    <TableCell>{r["Age"]}</TableCell>
                    <TableCell>{r["Failure Count"]}</TableCell>
                    <TableCell>{r["Downtime Hours"]}</TableCell>
                    <TableCell>{r["Risk Percentage"] || "-"}</TableCell>
                    <TableCell>
                      {r["AI Prediction"]
                        ? <Chip size="small" label={r["AI Prediction"]} color={statusColor[r["AI Prediction"]]} />
                        : <Chip size="small" label="Not run" />}
                    </TableCell>
                    <TableCell>{r["Recommended Action"] || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
