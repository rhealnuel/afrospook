// app/api/verify-payment/route.ts  (repurposed to "save only")
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/Transactions";
import { generateUniqueSerial } from "@/utils/generateUniqueSeriel";
import nodemailer from "nodemailer";

const MONGODB_URI = process.env.MONGODB_URI as string;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    transactionReference,
    paymentReference,
    amountPaid,
    customerName,
    customerEmail,
    paidOn,
    // New (optional) rich fields from client:
    ticket,      // { id, name, price, seats }
    attendees,   // [{ name, email }, ...] length <= seats (buyer first)
    raw,         // raw gateway payload (optional but useful for audit)
  } = body;

  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, error: "Missing MONGODB_URI" }, { status: 500 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    const seats = Math.max(Number(ticket?.seats ?? 1), 1);

    // Generate N unique serials
    const serials: string[] = [];
    for (let i = 0; i < seats; i++) {
      const s = await generateUniqueSerial();
      serials.push(s);
    }

    // Persist
    const doc = await Transaction.create({
      transactionReference,
      paymentReference,
      amountPaid,
      customerName,
      customerEmail,
      paidOn,
      ticket,           // store the whole ticket object
      attendees: Array.isArray(attendees) ? attendees : [],
      raw,
      serials,          // store all serials (array)
    });

    // ---- Email (brand-themed content) ----
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const formattedDate = new Date(paidOn || Date.now()).toLocaleString();
    const seatsText = seats > 1 ? `${seats} seats` : "1 seat";

    // Build serials table (match attendees to serials)
    const rows = (attendees && attendees.length ? attendees : [{ name: customerName, email: customerEmail }])
      .slice(0, seats)
      .map((a: any, i: number) => {
        const nm = (a?.name || `Attendee ${i + 1}`);
        const em = (a?.email || "—");
        const sr = serials[i];
        return `
          <tr>
            <td style="padding:8px 6px;border-bottom:1px solid #eee;">${nm}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #eee;color:#6b7280;">${em}</td>
            <td style="padding:8px 6px;border-bottom:1px solid #eee;font-family:monospace;font-weight:600;">${sr}</td>
          </tr>
        `;
      })
      .join("");

    const emailHTML = `
  <div style="font-family:Inter,Segoe UI,Tahoma,sans-serif;background:#0A0A0A;padding:24px;color:#fff;">
    <div style="max-width:560px;margin:auto;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(90deg,#FF3B00,#B6FF00);color:#000;padding:20px;text-align:center;">
        <h2 style="margin:0;font-size:20px;font-weight:800;">Payment Successful</h2>
        <p style="margin:6px 0 0;font-size:13px;">AfroSpook 2025 — Ticket Receipt</p>
      </div>

      <!-- Body -->
      <div style="padding:20px 22px;background:#0B0B0B;">
        <p style="margin:0 0 12px;font-size:14px;">Hi <strong>${customerName}</strong>,</p>
        <p style="margin:0 0 18px;font-size:14px;color:#d1d5db">
          Thank you for your purchase! Your ticket details are below.
        </p>

        <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:16px;color:#e5e7eb">
          <tr><td style="padding:6px 0;">Ticket:</td><td style="text-align:right;font-weight:600;">${ticket?.name ?? "AfroSpook 2025"}</td></tr>
          <tr><td style="padding:6px 0;">Seats:</td><td style="text-align:right;">${seatsText}</td></tr>
          <tr><td style="padding:6px 0;">Amount Paid:</td><td style="text-align:right;font-weight:800;">₦${Number(amountPaid).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;">Payment Ref:</td><td style="text-align:right;">${paymentReference}</td></tr>
          <tr><td style="padding:6px 0;">Transaction Ref:</td><td style="text-align:right;">${transactionReference}</td></tr>
          <tr><td style="padding:6px 0;">Date:</td><td style="text-align:right;">${formattedDate}</td></tr>
        </table>

        <div style="margin:10px 0 12px;font-size:13px;color:#A3A3A3">Serial Codes</div>
        <table style="width:100%;font-size:13px;border-collapse:collapse;background:#0F0F0F;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#111827;color:#E5E7EB;">
              <th style="text-align:left;padding:8px 6px;">Attendee</th>
              <th style="text-align:left;padding:8px 6px;">Email</th>
              <th style="text-align:left;padding:8px 6px;">Serial</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="font-size:12px;line-height:1.5;color:#9CA3AF;margin-top:14px;">
          <p style="margin:0 0 6px;">📷 Please <strong>take a screenshot</strong> of this receipt.</p>
          <p style="margin:0 0 6px;">🎟️ Present your <strong>serial code(s)</strong> at the event gate.</p>
          <p style="margin:0;">📧 Delivered to <strong>${customerEmail}</strong>.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#0C0C0C;color:#9CA3AF;padding:12px;text-align:center;font-size:11px;border-top:1px solid rgba(255,255,255,0.06);">
        &copy; 2025 AfroSpook • Lagos Cultural Center
      </div>
    </div>
  </div>`;

    await transporter.sendMail({
      from: `"AfroSpook Tickets" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: "🎟️ Your AfroSpook Ticket Receipt",
      html: emailHTML,
    });

    return NextResponse.json({ success: true, serials, id: doc._id });
  } catch (err) {
    console.error("Save Payment API Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
