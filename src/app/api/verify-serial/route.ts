// app/api/verify-serial/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Payment from "@/models/Transactions";

const SERIAL_REGEX = /^[A-Z0-9]{6}$/;
const MONGODB_URI = process.env.MONGODB_URI as string;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3001";

const EVENT_TIME = "12:00 PM";
const EVENT_VENUE = "Elegushi Beach, Lagos";

type AttendeeLean = { name: string; email: string; serial: string; ticketName?: string };
type TicketLean = { id?: number; name?: string; price?: number; seats?: number };
type TxLean = {
  customerName: string;
  customerEmail: string;
  amountPaid: number;
  paidOn: Date | string;
  paymentReference: string;
  transactionReference: string;
  ticket?: TicketLean;
  attendees?: AttendeeLean[];
};

export async function POST(req: NextRequest) {
  try {
    // Parse safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Normalize serial: keep A-Z/0-9, exactly 6 chars, uppercase
    const rawSerial = String(body?.serial ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    if (!SERIAL_REGEX.test(rawSerial)) {
      return NextResponse.json(
        { success: false, error: "Serial must be 6 characters (A–Z, 0–9)." },
        { status: 400 }
      );
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, error: "Missing MONGODB_URI" }, { status: 500 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    // Find only the matching attendee using projection $elemMatch
    const record = await Payment.findOne(
      { "attendees.serial": rawSerial },
      {
        attendees: { $elemMatch: { serial: rawSerial } },
        customerName: 1,
        customerEmail: 1,
        amountPaid: 1,
        paidOn: 1,
        paymentReference: 1,
        transactionReference: 1,
        ticket: 1,
      }
    ).lean<TxLean | null>();

    if (!record || !record.attendees || record.attendees.length === 0) {
      return NextResponse.json({ success: false, error: "Serial not found." }, { status: 404 });
    }

    const attendee = record.attendees[0] as AttendeeLean;
    const ticketName = attendee.ticketName || record.ticket?.name || "AfroSpook 2025 Ticket";
    const seats = Number(record.ticket?.seats ?? 1) || 1;
    const amount = Number(record.amountPaid ?? 0) || 0;

    const receiptUrl = `${APP_BASE_URL}/receipt?ref=${encodeURIComponent(
      record.paymentReference
    )}&txref=${encodeURIComponent(
      record.transactionReference
    )}&amount=${amount}&seats=${seats}&serial=${encodeURIComponent(attendee.serial)}`;

    // Always return a string for paidOn
    const paidOnISO =
      record.paidOn instanceof Date ? record.paidOn.toISOString() : new Date(record.paidOn).toISOString();

    return NextResponse.json({
      success: true,
      attendee: {
        name: attendee.name,
        email: attendee.email,
        serial: attendee.serial,
        ticketName,
      },
      ticket: {
        name: ticketName,
        price: record.ticket?.price ?? undefined,
        seats,
      },
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      amountPaid: amount,
      paymentReference: record.paymentReference,
      transactionReference: record.transactionReference,
      paidOn: paidOnISO,
      receiptUrl,
      event: {
        time: EVENT_TIME,
        venue: EVENT_VENUE,
      },
    });
  } catch (err) {
    console.error("Serial verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
