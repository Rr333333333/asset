import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Alert, Chip, Stack, InputAdornment, IconButton,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demos = [
  { label: "Admin", u: "admin", p: "admin123" },
  { label: "Lab Assistant", u: "assistant", p: "assistant123" },
  { label: "Technician", u: "technician", p: "tech123" },
];

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid username or password");
    } finally { setBusy(false); }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", display: "grid", placeItems: "center", p: 2,
        background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 50%,#7c3aed 100%)",
      }}
    >
      <Paper elevation={8} sx={{ p: 4, width: 400, maxWidth: "100%", borderRadius: 4 }}>
        <Box className="flex items-center gap-2 mb-1">
          <ScienceIcon color="primary" fontSize="large" />
          <Typography variant="h6" fontWeight={800}>Lab AMS</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3}>
          AI Smart Laboratory Asset Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="Username" margin="normal" value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth label="Password" margin="normal" type={show ? "text" : "password"}
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          InputProps={{ endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShow((s) => !s)} edge="end">
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )}}
        />
        <Button
          fullWidth variant="contained" size="large" sx={{ mt: 2 }}
          disabled={busy} onClick={submit}
        >
          {busy ? "Signing in..." : "Sign In"}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block" }}>
          Demo accounts (click to fill):
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
          {demos.map((d) => (
            <Chip
              key={d.u} label={d.label} size="small" variant="outlined" clickable
              onClick={() => { setUsername(d.u); setPassword(d.p); }}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
