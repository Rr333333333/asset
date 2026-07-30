import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import Predictive from "./pages/Predictive";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<ModulePage moduleKey="assets" />} />
        <Route path="stock" element={<ModulePage moduleKey="stock" />} />
        <Route path="hardware" element={<ModulePage moduleKey="hardware" />} />
        <Route path="maintenance" element={<ModulePage moduleKey="maintenance" />} />
        <Route path="preventive" element={<ModulePage moduleKey="preventive" />} />
        {/* Predictive has a dedicated page (model runner + what-if), not generic CRUD */}
        <Route path="predictive" element={<Predictive />} />
        <Route path="vendors" element={<ModulePage moduleKey="vendors" />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
