import { useEffect, useMemo, useState } from "react";
import {
  Grid, Paper, Typography, Box, MenuItem, TextField, Skeleton,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../api/client";
import StatCard from "../components/StatCard";

const COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#DC2626", "#0EA5E9", "#DB2777"];
const RISK_COLORS = { Green: "#16A34A", Yellow: "#F59E0B", Red: "#DC2626" };

const monthNames = ["01","02","03","04","05","06","07","08","09","10","11","12"];

function ChartCard({ title, children }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)", height: 320 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={1}>{title}</Typography>
      <ResponsiveContainer width="100%" height="88%">{children}</ResponsiveContainer>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [options, setOptions] = useState(null);
  const [filters, setFilters] = useState({
    year: "All", month: "All", department: "All",
    laboratory: "All", category: "All", status: "All",
  });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== "All") p.append(k, v); });
    return p.toString();
  }, [filters]);

  useEffect(() => { api.get("/dashboard/filters").then((r) => setOptions(r.data)); }, []);

  useEffect(() => {
    setStats(null); setCharts(null);
    api.get(`/dashboard/stats?${query}`).then((r) => setStats(r.data));
    api.get(`/dashboard/charts?${query}`).then((r) => setCharts(r.data));
  }, [query]);

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const cards = [
    { t: "Total Assets", v: stats?.total_assets, i: <Inventory2Icon />, c: "#2563EB" },
    { t: "Active Assets", v: stats?.active_assets, i: <CheckCircleIcon />, c: "#16A34A" },
    { t: "Faulty Assets", v: stats?.faulty_assets, i: <ErrorIcon />, c: "#DC2626" },
    { t: "Under Maintenance", v: stats?.under_maintenance, i: <BuildIcon />, c: "#F59E0B" },
    { t: "Maintenance Due", v: stats?.maintenance_due, i: <EventIcon />, c: "#7C3AED" },
    { t: "Available Stock", v: stats?.available_stock, i: <WarehouseIcon />, c: "#0EA5E9" },
    { t: "Low Stock", v: stats?.low_stock, i: <TrendingDownIcon />, c: "#DB2777" },
    { t: "Critical Alerts", v: stats?.critical_alerts, i: <WarningIcon />, c: "#B91C1C" },
  ];

  const filterDefs = [
    { key: "year", label: "Year", opts: options?.years },
    { key: "month", label: "Month", opts: monthNames },
    { key: "department", label: "Department", opts: options?.departments },
    { key: "laboratory", label: "Laboratory", opts: options?.laboratories },
    { key: "category", label: "Category", opts: options?.categories },
    { key: "status", label: "Status", opts: options?.statuses },
  ];

  return (
    <Box>
      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Grid container spacing={2}>
          {filterDefs.map((f) => (
            <Grid item xs={6} sm={4} md={2} key={f.key}>
              <TextField
                select fullWidth size="small" label={f.label} value={filters[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {(f.opts || []).map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.t}>
            <StatCard title={c.t} value={c.v ?? 0} icon={c.i} color={c.c} loading={!stats} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Asset Distribution">
            {charts ? (
              <PieChart>
                <Pie data={charts.asset_distribution} dataKey="value" nameKey="name"
                     cx="50%" cy="50%" outerRadius={90} label>
                  {charts.asset_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Asset Status">
            {charts ? (
              <BarChart data={charts.asset_status}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {charts.asset_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Maintenance Trends">
            {charts ? (
              <LineChart data={charts.maintenance_trends}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Monthly Stock Consumption">
            {charts ? (
              <AreaChart data={charts.monthly_stock}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="consumed" stroke="#16A34A" fill="#16A34A33" />
              </AreaChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Prediction Chart (Risk Levels)">
            {charts ? (
              <PieChart>
                <Pie data={charts.prediction_chart} dataKey="value" nameKey="name"
                     cx="50%" cy="50%" innerRadius={55} outerRadius={90} label>
                  {charts.prediction_chart.map((e, i) => (
                    <Cell key={i} fill={RISK_COLORS[e.name] || COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Failure Trend">
            {charts ? (
              <BarChart data={charts.failure_trend}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis />
                <Tooltip />
                <Bar dataKey="failures" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : <Skeleton variant="rounded" height="100%" />}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
