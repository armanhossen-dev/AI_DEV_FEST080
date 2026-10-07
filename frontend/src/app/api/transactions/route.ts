import { NextRequest, NextResponse } from "next/server";
import { initialTransactions } from "@/lib/data";
import { scoreTransaction } from "@/lib/fraud-engine";
import { Transaction } from "@/types";

let liveTransactions: Transaction[] = [...initialTransactions];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const risk = searchParams.get("risk");
  const type = searchParams.get("type");
  const query = searchParams.get("q")?.toLowerCase();

  let filtered = [...liveTransactions];

  if (risk && risk !== "All") {
    filtered = filtered.filter((t) => t.riskLevel.toLowerCase() === risk.toLowerCase());
  }

  if (type && type !== "All") {
    filtered = filtered.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  }

  if (query) {
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.customer.toLowerCase().includes(query) ||
        t.recipient.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query) ||
        t.device.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    transactions: filtered,
    total: filtered.length,
    timestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scoring = scoreTransaction(body);

    const newTxn: Transaction = {
      id: body.id || `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      customer: body.customer || "U-9901",
      recipient: body.recipient || "U-8831",
      amount: Number(body.amount) || 15000,
      time: body.time || "Just now",
      timestamp: Date.now(),
      type: body.type || "Wallet Transfer",
      device: body.device || "DEV-NEW",
      isNewDevice: body.isNewDevice ?? true,
      location: body.location || "Dhaka",
      isNewLocation: body.isNewLocation ?? false,
      riskLevel: scoring.riskLevel,
      riskScore: scoring.riskScore,
      status: scoring.riskLevel === "Critical" ? "Investigating" : scoring.riskLevel === "High" ? "Flagged" : "Approved",
      flags: scoring.flags,
    };

    liveTransactions.unshift(newTxn);

    // Keep memory clean
    if (liveTransactions.length > 50) {
      liveTransactions = liveTransactions.slice(0, 50);
    }

    return NextResponse.json({
      transaction: newTxn,
      scoring,
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
