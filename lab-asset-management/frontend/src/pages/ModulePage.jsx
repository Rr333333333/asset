import { useEffect, useState } from "react";
import { Snackbar, Alert, Box } from "@mui/material";
import api from "../api/client";
import DataTable from "../components/DataTable";
import EntityForm from "../components/EntityForm";

// One generic page that serves every CRUD module. `moduleKey` selects the module.
export default function ModulePage({ moduleKey }) {
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [dialog, setDialog] = useState({ open: false, mode: "add", row: null });
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const notify = (msg, sev = "success") => setToast({ open: true, msg, sev });

  const load = () => {
    api.get(`/${moduleKey}/meta`).then((r) => setMeta(r.data));
    api.get(`/${moduleKey}`).then((r) => setRows(r.data));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [moduleKey]);

  const handleSubmit = async (values) => {
    try {
      if (dialog.mode === "edit") {
        const id = dialog.row[meta.id_field];
        await api.put(`/${moduleKey}/${encodeURIComponent(id)}`, values);
        notify("Record updated");
      } else {
        await api.post(`/${moduleKey}`, values);
        notify("Record created");
      }
      setDialog({ open: false, mode: "add", row: null });
      load();
    } catch (e) {
      notify(e?.response?.data?.detail || "Save failed", "error");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/${moduleKey}/${encodeURIComponent(row[meta.id_field])}`);
      notify("Record deleted");
      load();
    } catch (e) {
      notify(e?.response?.data?.detail || "Delete failed", "error");
    }
  };

  if (!meta) return null;

  return (
    <Box>
      <DataTable
        title={meta.label}
        moduleKey={moduleKey}
        columns={meta.columns}
        rows={rows}
        onAdd={() => setDialog({ open: true, mode: "add", row: null })}
        onEdit={(row) => setDialog({ open: true, mode: "edit", row })}
        onView={(row) => setDialog({ open: true, mode: "view", row })}
        onDelete={handleDelete}
      />

      <EntityForm
        open={dialog.open}
        title={
          dialog.mode === "add" ? `Add ${meta.label}` :
          dialog.mode === "edit" ? `Edit ${meta.label}` : `View ${meta.label}`
        }
        columns={meta.columns}
        initial={dialog.row}
        readOnly={dialog.mode === "view"}
        onClose={() => setDialog({ open: false, mode: "add", row: null })}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.sev} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
