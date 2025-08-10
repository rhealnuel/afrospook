// app/api/checkin/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Payment from "@/models/Transactions";
import VerifiedSerial from "@/models/VerifiedSeriel"; // ✅ correct import

const MONGODB_URI = process.env.MONGODB_URI as string;
const SERIAL_REGEX = /^[A-Z0-9]{6}$/;

// Lean types for exactly what we read
type AttendeeLean = {
  name?: string;
  email?: string;
  serial: string;
  ticketName?: string;
};
type TicketLean = { name?: string };
type TxLean = {
  _id: mongoose.Types.ObjectId;
  attendees?: AttendeeLean[];
  paymentReference: string;
  transactionReference: string;
  amountPaid: number;
  ticket?: TicketLean;
};

export async function POST(req: NextRequest) {
  try {
    // Parse body safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Normalize serial
    const serial = String(body?.serial ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    const gate = String(body?.gate ?? "").trim();
    const usedBy = String(body?.usedBy ?? "").trim();
    const venue = String(body?.venue ?? "").trim() || "Elegushi Beach, Lagos";

    if (!SERIAL_REGEX.test(serial)) {
      return NextResponse.json({ success: false, error: "Invalid serial format." }, { status: 400 });
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, error: "Missing MONGODB_URI" }, { status: 500 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    // 1) Look up ONLY the matching attendee
    const txRaw = await Payment.findOne(
      { "attendees.serial": serial },
      {
        attendees: { $elemMatch: { serial } },
        paymentReference: 1,
        transactionReference: 1,
        amountPaid: 1,
        ticket: 1,
        _id: 1,
      }
    ).lean();

    const tx = txRaw as TxLean | null;

    if (!tx || !tx.attendees || tx.attendees.length === 0) {
      return NextResponse.json({ success: false, error: "Serial not found." }, { status: 404 });
    }

    const a = tx.attendees[0]!;
    const attendeeSnapshot = {
      name: a.name || "",
      email: a.email || "",
      ticketName: a.ticketName || tx.ticket?.name || "",
    };
    const paymentSnapshot = {
      paymentReference: tx.paymentReference,
      transactionReference: tx.transactionReference,
      amountPaid: tx.amountPaid,
    };

    // 2) ATOMIC CLAIM via native updateOne (clear signal via upsertedCount)
    const upper = serial.toUpperCase();
    const updateRes: any = await VerifiedSerial.collection.updateOne(
      { serial: upper },
      {
        $setOnInsert: {
          serial: upper,
          usedAt: new Date(),
          status: "USED",
          attendee: attendeeSnapshot,
          payment: paymentSnapshot,
          usedBy,
          gate,
          venue,
          ip: req.headers.get("x-forwarded-for") || "",
          userAgent: req.headers.get("user-agent") || "",
        },
      },
      { upsert: true }
    );

    const alreadyUsed = (updateRes?.upsertedCount ?? 0) === 0;

    if (alreadyUsed) {
      // Return the existing usage snapshot
      const existing = await VerifiedSerial.findOne({ serial: upper })
        .select("usedAt usedBy gate venue")
        .lean();
      return NextResponse.json(
        {
          success: false,
          error: "Serial already used.",
          alreadyUsed: true,
          usedAt: existing?.usedAt ?? null,
          usedBy: existing?.usedBy ?? null,
          gate: existing?.gate ?? null,
          venue: existing?.venue ?? null,
        },
        { status: 409 }
      );
    }

    // Fetch the created doc to echo minimal success payload
    const created = await VerifiedSerial.findOne({ serial: upper })
      .select("usedAt usedBy gate venue attendee payment")
      .lean();

    return NextResponse.json({
      success: true,
      serial,
      usedAt: created?.usedAt ?? null,
      usedBy: created?.usedBy ?? null,
      gate: created?.gate ?? null,
      venue: created?.venue ?? null,
      attendee: created?.attendee ?? attendeeSnapshot,
      payment: created?.payment ?? paymentSnapshot,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
