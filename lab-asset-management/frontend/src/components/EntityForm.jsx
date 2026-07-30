import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Grid,
} from "@mui/material";

// Renders a form dialog from a column schema. Field type drives the widget.
export default function EntityForm({ open, title, columns, initial, onClose, onSubmit, readOnly }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    const v = {};
    columns.forEach((c) => { v[c.name] = initial?.[c.name] ?? ""; });
    setValues(v);
  }, [initial, columns, open]);

  const set = (name, val) => setValues((p) => ({ ...p, [name]: val }));

  const submit = () => {
    // Basic required-field validation.
    for (const c of columns) {
      if (c.required && !String(values[c.name] || "").trim()) {
        alert(`${c.name} is required`);
        return;
      }
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {columns.map((c) => {
            const disabled = readOnly || c.readonly;
            const common = {
              fullWidth: true, size: "small", label: c.name,
              value: values[c.name] ?? "", disabled,
              onChange: (e) => set(c.name, e.target.value),
            };
            return (
              <Grid item xs={12} sm={6} key={c.name}>
                {c.type === "select" ? (
                  <TextField select {...common}>
                    <MenuItem value="">—</MenuItem>
                    {(c.options || []).map((o) => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>
                ) : c.type === "date" ? (
                  <TextField type="date" InputLabelProps={{ shrink: true }} {...common} />
                ) : c.type === "number" ? (
                  <TextField type="number" {...common} />
                ) : c.type === "textarea" ? (
                  <TextField multiline minRows={2} {...common} />
                ) : (
                  <TextField {...common} />
                )}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        {!readOnly && (
          <Button variant="contained" onClick={submit}>Save</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
