import { Paper, Box, Typography } from "@mui/material";

export default function StatCard({ title, value, icon, color = "primary.main", loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, borderRadius: 3, display: "flex", alignItems: "center", gap: 2,
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "transform .2s, box-shadow .2s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
      }}
    >
      <Box
        sx={{
          width: 52, height: 52, borderRadius: 2.5, display: "grid", placeItems: "center",
          bgcolor: color, color: "#fff",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight={800}>
          {loading ? "…" : value}
        </Typography>
      </Box>
    </Paper>
  );
}
