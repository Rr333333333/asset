import { useMemo, useState } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, TextField, Toolbar, Typography, Box, IconButton,
  Button, Tooltip, InputAdornment, Menu, MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { downloadReport } from "../api/client";

export default function DataTable({
  title, columns, rows, moduleKey,
  onAdd, onEdit, onDelete, onView,
}) {
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState(columns[0]?.name);
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);
  const [exportAnchor, setExportAnchor] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let out = rows.filter((r) =>
      !q || Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
    out = [...out].sort((a, b) => {
      const av = a[orderBy] ?? "", bv = b[orderBy] ?? "";
      const na = parseFloat(av), nb = parseFloat(bv);
      let cmp;
      if (!isNaN(na) && !isNaN(nb)) cmp = na - nb;
      else cmp = String(av).localeCompare(String(bv));
      return order === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, search, orderBy, order]);

  const paged = filtered.slice(page * rpp, page * rpp + rpp);

  const sort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  const exportCSV = () => {
    const headers = columns.map((c) => c.name);
    const lines = [headers.join(",")];
    filtered.forEach((r) =>
      lines.push(headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${moduleKey}.csv`;
    a.click();
  };

  const print = () => {
    const headers = columns.map((c) => c.name);
    const html = `
      <html><head><title>${title}</title>
      <style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #ccc;padding:6px;font-size:12px}th{background:#2563EB;color:#fff}</style>
      </head><body><h2>${title}</h2><table><thead><tr>
      ${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${filtered.map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}
      </tbody></table></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.06)" }}>
      <Toolbar sx={{ gap: 1, flexWrap: "wrap", py: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>{title}</Typography>
        <TextField
          size="small" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: (
            <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
          )}}
        />
        <Tooltip title="Print"><IconButton onClick={print}><PrintIcon /></IconButton></Tooltip>
        <Button startIcon={<DownloadIcon />} onClick={(e) => setExportAnchor(e.currentTarget)}>
          Export
        </Button>
        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => { exportCSV(); setExportAnchor(null); }}>Export CSV</MenuItem>
          <MenuItem onClick={() => { downloadReport(moduleKey, "excel"); setExportAnchor(null); }}>
            Export Excel
          </MenuItem>
          <MenuItem onClick={() => { downloadReport(moduleKey, "pdf"); setExportAnchor(null); }}>
            Export PDF
          </MenuItem>
        </Menu>
        {onAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add</Button>
        )}
      </Toolbar>

      <TableContainer sx={{ maxHeight: 560 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.name} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === c.name}
                    direction={orderBy === c.name ? order : "asc"}
                    onClick={() => sort(c.name)}
                  >
                    {c.name}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow hover key={i}>
                {columns.map((c) => (
                  <TableCell key={c.name} sx={{ whiteSpace: "nowrap" }}>
                    {String(row[c.name] ?? "")}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {onView && (
                    <IconButton size="small" onClick={() => onView(row)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No records found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rpp}
        onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
