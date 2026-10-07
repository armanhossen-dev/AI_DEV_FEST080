import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import Home from "./app/page";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CopilotPage } from "./pages/CopilotPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { InvestigationDetailPage } from "./pages/InvestigationDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Primary Intelligence Suite & Fraud Defense Cloud (Matches Production Vercel App) */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/transactions" element={<Home />} />
          <Route path="/alerts" element={<Home />} />
          <Route path="/investigations" element={<Home />} />
          <Route path="/analytics" element={<Home />} />
          <Route path="/customers" element={<Home />} />
          <Route path="/network" element={<Home />} />
          <Route path="/risk" element={<Home />} />

          {/* Detailed Workspaces */}
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          <Route path="/investigations/:id" element={<InvestigationDetailPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
