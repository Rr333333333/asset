import { useState, useRef, useEffect } from "react";
import {
  Box, Paper, TextField, IconButton, Typography, Chip, Stack, Avatar, CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api/client";

const samples = [
  "Which assets are due for maintenance?",
  "Show all faulty computers",
  "How many SSDs should we purchase?",
  "Which systems have high CPU usage?",
  "Predict which systems will fail",
  "Generate inventory summary",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me anything about your lab assets, stock, maintenance or predictions." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput(""); setBusy(true);
    try {
      const r = await api.post("/ai/chat", { message: q });
      setMessages((m) => [...m, { role: "assistant", text: r.data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, something went wrong." }]);
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <Typography variant="h6" fontWeight={800} mb={2}>AI Assistant</Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        {samples.map((s) => (
          <Chip key={s} label={s} variant="outlined" clickable onClick={() => send(s)} />
        ))}
      </Stack>

      <Paper elevation={0} sx={{ flex: 1, p: 2, overflowY: "auto", borderRadius: 3,
                                 border: "1px solid rgba(0,0,0,0.06)", mb: 2 }}>
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2,
                             flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <Avatar sx={{ bgcolor: m.role === "user" ? "secondary.main" : "primary.main", width: 34, height: 34 }}>
              {m.role === "user" ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Paper elevation={0} sx={{
              p: 1.5, maxWidth: "75%", borderRadius: 3, whiteSpace: "pre-wrap",
              bgcolor: m.role === "user" ? "primary.main" : "action.hover",
              color: m.role === "user" ? "#fff" : "text.primary",
            }}>
              <Typography variant="body2">{m.text}</Typography>
            </Paper>
          </Box>
        ))}
        {busy && <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <CircularProgress size={16} /><Typography variant="body2" color="text.secondary">Thinking…</Typography>
        </Box>}
        <div ref={endRef} />
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth size="small" placeholder="Ask a question..." value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <IconButton color="primary" onClick={() => send()} disabled={busy}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
