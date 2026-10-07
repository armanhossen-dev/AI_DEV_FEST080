import { NextRequest, NextResponse } from "next/server";
import { generateInvestigationAnalysis } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, customer, amount, time, device, location, recipient, riskScore, flags } = body;

    const result = await generateInvestigationAnalysis({
      caseId: caseId || "INV-1042",
      customer: customer || "U-1042",
      amount: amount || 48500,
      time: time || "02:13 AM",
      device: device || "DEV-8821",
      location: location || "Dhaka",
      recipient: recipient || "U-8831",
      riskScore: riskScore || 94,
      flags: flags || [
        "Amount 4.8× above normal baseline",
        "New device registered 12 min ago",
        "Off-hours nocturnal transaction",
        "Recipient linked to mule cluster #17",
      ],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Investigation Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate investigation analysis", details: error.message },
      { status: 500 }
    );
  }
}
