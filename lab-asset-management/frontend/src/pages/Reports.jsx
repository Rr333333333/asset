import { Box, Grid, Paper, Typography, Button, Stack } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { downloadReport } from "../api/client";

const reports = [
  { key: "assets", label: "Asset Report" },
  { key: "stock", label: "Stock Report" },
  { key: "hardware", label: "Hardware Report" },
  { key: "maintenance", label: "Maintenance Report" },
  { key: "preventive", label: "Preventive Maintenance Report" },
  { key: "predictive", label: "Predictive Maintenance Report" },
  { key: "vendors", label: "Vendor Report" },
];

export default function Reports() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={800} mb={3}>Reports</Typography>
      <Grid container spacing={2}>
        {reports.map((r) => (
          <Grid item xs={12} sm={6} md={4} key={r.key}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
              <Typography fontWeight={700} mb={2}>{r.label}</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" color="error" startIcon={<PictureAsPdfIcon />}
                        onClick={() => downloadReport(r.key, "pdf")}>PDF</Button>
                <Button size="small" variant="outlined" color="success" startIcon={<GridOnIcon />}
                        onClick={() => downloadReport(r.key, "excel")}>Excel</Button>
                <Button size="small" variant="outlined" startIcon={<DescriptionIcon />}
                        onClick={() => downloadReport(r.key, "csv")}>CSV</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
