import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/auth-context";
import { LoginPage } from "../pages/LoginPage";
import { recommendAction } from "../lib/risk-engine/action-recommendation";

describe("upay Sentinel — UI Component Tests", () => {
  it("renders LoginPage with enterprise branding and demo access button", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: /upay Sentinel/i })).toBeInTheDocument();
    expect(screen.getByText(/AI Trust & Risk Intelligence Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/One-Click Judge \/ Demo Sign-In/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In to Sentinel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Authenticate with Google/i })).toBeInTheDocument();
  });

  it("recommends correct advisory action per risk severity", () => {
    const critRec = recommendAction("critical", 92);
    expect(critRec.actionCode).toBe("HOLD");
    expect(critRec.title).toContain("HOLD — Temporarily hold transaction");
    expect(critRec.advisoryDisclaimer).toContain("Advisory Recommendation");

    const highRec = recommendAction("high", 68);
    expect(highRec.actionCode).toBe("VERIFY");
    expect(highRec.title).toContain("VERIFY — Require additional verification");

    const medRec = recommendAction("medium", 45);
    expect(medRec.actionCode).toBe("MONITOR");
    expect(medRec.title).toContain("MONITOR");

    const lowRec = recommendAction("low", 12);
    expect(lowRec.actionCode).toBe("ALLOW");
    expect(lowRec.title).toContain("ALLOW");
  });
});
