// app/api/verify-payment/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Resend } from "resend";
import Payment from "@/models/Transactions";

/* ---------- Config ---------- */
const MONGODB_URI = process.env.MONGODB_URI as string;
const RESEND_API_KEY = process.env.RESEND_API_KEY as string;
const FROM_EMAIL = process.env.FROM_EMAIL || "tickets@afrospook.com";
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

// Event meta
const EVENT_TIME = "7:00 PM";
const EVENT_VENUE = "Image Garden, Benin City";

/* ---------- Helpers ---------- */
// Generate a unique 6-char serial (A–Z + 2–9, excluding 0/1/O/I)
const SERIAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
async function generateUniqueSerial() {
  while (true) {
    let s = "";
    for (let i = 0; i < 6; i++) s += SERIAL_CHARS[Math.floor(Math.random() * SERIAL_CHARS.length)];
    const exists = await Payment.exists({ "attendees.serial": s });
    if (!exists) return s;
  }
}

/* ---------- Route ---------- */
export async function POST(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, error: "Missing MONGODB_URI" }, { status: 500 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    const body = await req.json();
    const {
      transactionReference,
      paymentReference,
      amountPaid,
      customerName,
      customerEmail,
      paidOn,
      ticket,      // { id, name, price, seats }
      attendees,   // [{ name, email, ticketName? }...] buyer first
      raw,         // optional
    } = body;

    if (!transactionReference || !paymentReference || !customerName || !customerEmail || !amountPaid) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const seats = Math.max(Number(ticket?.seats ?? 1), 1);

    // Normalize attendees to seats
    const baseAttendees: Array<{ name: string; email: string; ticketName?: string }> =
      Array.isArray(attendees) && attendees.length
        ? attendees.slice(0, seats)
        : [{ name: customerName, email: customerEmail, ticketName: ticket?.name }];

    while (baseAttendees.length < seats) baseAttendees.push(baseAttendees[0]);

    // Generate unique serials + attach to attendees (ONLY on the attendee objects)
    const enrichedAttendees: Array<{ name: string; email: string; serial: string; ticketName: string }> = [];
    for (let i = 0; i < seats; i++) {
      const serial = await generateUniqueSerial();
      enrichedAttendees.push({
        name: baseAttendees[i]?.name || `Attendee ${i + 1}`,
        email: baseAttendees[i]?.email || "",
        serial,
        ticketName: baseAttendees[i]?.ticketName || ticket?.name || "AfroSpook 2025 Ticket",
      });
    }

    // Persist with small retry if a race causes E11000 (duplicate attendee.serial)
    const MAX_RETRIES = 3;
    let doc: any = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        doc = await Payment.create({
          transactionReference,
          paymentReference,
          amountPaid: Number(amountPaid),
          customerName,
          customerEmail,
          paidOn: paidOn ? new Date(paidOn) : new Date(),
          ticket: ticket ? { ...ticket, seats } : { name: "AfroSpook 2025 Ticket", seats },
          attendees: enrichedAttendees, // <-- the only place serials live
          raw,
        });
        break; // success
      } catch (err: any) {
        if (err?.code === 11000 && attempt < MAX_RETRIES - 1) {
          // regenerate serials and try again
          for (let i = 0; i < enrichedAttendees.length; i++) {
            enrichedAttendees[i].serial = await generateUniqueSerial();
          }
          continue;
        }
        throw err;
      }
    }

    // Build receipt URL (base) for UI redirect / email links
    const receiptBaseUrl = `${APP_BASE_URL}/receipt?ref=${encodeURIComponent(
      paymentReference
    )}&txref=${encodeURIComponent(transactionReference)}&amount=${Number(amountPaid)}&seats=${seats}`;

    const formattedDate = new Date(paidOn || Date.now()).toLocaleString();

    // Buyer email (summary of all attendees)
    const buyerEmailHTML = `
<div style="min-height:100vh;background:linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f7fee7 100%);padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;font-size:14px;">
  <div style="max-width:576px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;margin:0 auto 12px;background:#ffffff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;">
        <div style="width:32px;height:32px;background:#B6FF00;border-radius:50%;position:relative;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <div style="width:160px;height:56px;margin:0 auto 8px;background:#000000;border-radius:8px;">
  <table style="width:100%;height:100%;border-collapse:collapse;">
    <tr>
      <td style="text-align:center;vertical-align:middle;">
        <img src="${APP_BASE_URL}/afrospook-logo.png" alt="AfroSpook" style="height:40px;width:auto;object-fit:contain;display:block;margin:0 auto;" />
      </td>
    </tr>
  </table>
</div>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 4px;color:#111827;">Payment Successful</h1>
      <p style="font-size:12px;color:#6b7280;margin:0;">Welcome to AfroSpook 2025</p>
    </div>

    <div style="background:linear-gradient(135deg, rgba(251,146,60,0.7) 0%, #ffffff 50%, rgba(182,255,0,0.7) 100%);padding:1px;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <div style="background:#ffffff;border-radius:15px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:14px;margin-bottom:12px;">
          <span>${ticket?.name ?? "AfroSpook 2025 Ticket"}</span>
          <span style="display:flex;align-items:center;gap:4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="#FF3B00" stroke-width="2" fill="none"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="#FF3B00" stroke-width="2"/>
            </svg>
            ₦${Number(amountPaid).toLocaleString()}
          </span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 0;font-size:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:4px;color:#6b7280;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#FF3B00" stroke-width="2" fill="none"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#FF3B00" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#FF3B00" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#FF3B00" stroke-width="2"/>
            </svg>
            ${formattedDate}
          </div>
          <div style="display:flex;align-items:center;gap:4px;color:#6b7280;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#B6FF00;">
              <line x1="4" y1="9" x2="20" y2="9" stroke="#B6FF00" stroke-width="2"/>
              <line x1="4" y1="15" x2="20" y2="15" stroke="#B6FF00" stroke-width="2"/>
              <line x1="10" y1="3" x2="8" y2="21" stroke="#B6FF00" stroke-width="2"/>
              <line x1="16" y1="3" x2="14" y2="21" stroke="#B6FF00" stroke-width="2"/>
            </svg>
            ${paymentReference}
          </div>
          <div style="grid-column:span 2;color:#6b7280;font-size:11px;">Tx: ${transactionReference}</div>
          <div style="grid-column:span 2;font-weight:500;color:#1f2937;">${customerName}</div>
        </div>

        <div style="display:flex;align-items:center;gap:4px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px;font-size:12px;color:#374151;margin-bottom:16px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#FF3B00" stroke-width="2" fill="none"/>
            <circle cx="12" cy="10" r="3" stroke="#FF3B00" stroke-width="2" fill="none"/>
          </svg>
          ${EVENT_VENUE}
        </div>

        <div style="margin-bottom:12px;">
          <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">${seats > 1 ? "Serial Codes" : "Serial Code"}</p>
          <div style="display:grid;${seats > 1 ? "grid-template-columns:1fr 1fr;" : ""}gap:8px;">
            ${enrichedAttendees
              .map(
                (a) => `
              <div style="display:flex;align-items:center;justify-content:space-between;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px;">
                <code style="background:#ffffff;border:1px solid #e5e7eb;border-radius:4px;padding:2px 4px;font-family:monospace;font-size:11px;">${a.serial}</code>
                <div style="font-size:10px;color:#6b7280;">${a.name}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div style="display:flex;align-items:flex-start;gap:8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px;font-size:11px;color:#374151;margin-bottom:16px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#B6FF00;margin-top:1px;">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#B6FF00" stroke-width="2" fill="none"/>
            <polyline points="22,6 12,13 2,6" stroke="#B6FF00" stroke-width="2" fill="none"/>
          </svg>
          <p style="margin:0;">Receipt has been sent to your email.</p>
        </div>

        <div style="text-align:center;">
          <a href="${receiptBaseUrl}" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(90deg, #FF3B00 0%, #B6FF00 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:12px;padding:6px 12px;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            View Receipt
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="7" y1="17" x2="17" y2="7" stroke="white" stroke-width="2"/>
              <polyline points="7,7 17,7 17,17" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <p style="text-align:center;font-size:10px;color:#6b7280;margin:12px 0 0;">
      AfroSpook 2025 • Lagos Cultural Center
    </p>
  </div>
</div>`;

    /* ---------- Email sending with Resend ---------- */
    let emailStatus: "sent" | "partial" | "skipped" = "sent";

    // If Resend config is missing, skip emails gracefully
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      emailStatus = "skipped";
      console.warn("Resend API key or FROM_EMAIL missing, skipping emails");
    } else {
      // Buyer email
      try {
        await resend.emails.send({
          from: `AfroSpook Tickets <${FROM_EMAIL}>`,
          to: customerEmail,
          subject: "🎟️ Your AfroSpook Ticket Receipt",
          html: buyerEmailHTML,
        });
      } catch (e) {
        console.error("Buyer email failed:", e);
        emailStatus = "partial";
      }

      // Per-attendee emails (only those with email)
      const emailPromises = enrichedAttendees
        .filter((a) => !!a.email)
        .map(async (a) => {
          const attendeeHtml = `
<div style="min-height:100vh;background:linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f7fee7 100%);padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;font-size:14px;">
  <div style="max-width:576px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;margin:0 auto 12px;background:#ffffff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;">
        <div style="width:32px;height:32px;background:#B6FF00;border-radius:50%;position:relative;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
     <div style="width:160px;height:56px;margin:0 auto 8px;background:#000000;border-radius:8px;">
        <table style="width:100%;height:100%;border-collapse:collapse;">
          <tr>
            <td style="text-align:center;vertical-align:middle;">
              <img src="${APP_BASE_URL}/afrospook-logo.png" alt="AfroSpook" style="height:40px;width:auto;object-fit:contain;display:block;margin:0 auto;" />
            </td>
          </tr>
        </table>
      </div>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 4px;color:#111827;">Your Ticket</h1>
      <p style="font-size:12px;color:#6b7280;margin:0;">AfroSpook 2025</p>
    </div>

    <div style="background:linear-gradient(135deg, rgba(251,146,60,0.7) 0%, #ffffff 50%, rgba(182,255,0,0.7) 100%);padding:1px;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <div style="background:#ffffff;border-radius:15px;padding:20px;">
        <div style="margin-bottom:16px;">
          <p style="font-size:14px;margin:0 0 4px;">Hi <strong>${a.name || "Guest"}</strong>,</p>
          <p style="font-size:12px;color:#6b7280;margin:0;">Here's your ticket for AfroSpook 2025!</p>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:14px;margin-bottom:12px;">
          <span>${a.ticketName}</span>
          <span style="display:flex;align-items:center;gap:4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="#FF3B00" stroke-width="2" fill="none"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="#FF3B00" stroke-width="2"/>
            </svg>
            ₦${Number(amountPaid).toLocaleString()}
          </span>
        </div>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center;margin-bottom:12px;">
          <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">Your Serial Code</p>
          <code style="background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:6px 12px;font-family:monospace;font-size:16px;font-weight:700;color:#1f2937;">${a.serial}</code>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 0;font-size:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:4px;color:#6b7280;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#FF3B00" stroke-width="2" fill="none"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#FF3B00" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#FF3B00" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#FF3B00" stroke-width="2"/>
            </svg>
            ${new Date(paidOn || Date.now()).toLocaleString()}
          </div>
          <div style="display:flex;align-items:center;gap:4px;color:#6b7280;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#B6FF00;">
              <circle cx="12" cy="12" r="10" stroke="#B6FF00" stroke-width="2" fill="none"/>
              <polyline points="12,6 12,12 16,14" stroke="#B6FF00" stroke-width="2" fill="none"/>
            </svg>
            ${EVENT_TIME}
          </div>
          <div style="grid-column:span 2;color:#6b7280;font-size:11px;">Ref: ${paymentReference}</div>
        </div>

        <div style="display:flex;align-items:center;gap:4px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px;font-size:12px;color:#374151;margin-bottom:16px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#FF3B00;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#FF3B00" stroke-width="2" fill="none"/>
            <circle cx="12" cy="10" r="3" stroke="#FF3B00" stroke-width="2" fill="none"/>
          </svg>
          ${EVENT_VENUE}
        </div>

        <div style="text-align:center;">
          <a href="${receiptBaseUrl}&serial=${encodeURIComponent(a.serial)}" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(90deg, #FF3B00 0%, #B6FF00 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:12px;padding:6px 12px;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="12" cy="13" r="4" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            View Receipt
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="7" y1="17" x2="17" y2="7" stroke="white" stroke-width="2"/>
              <polyline points="7,7 17,7 17,17" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <p style="text-align:center;font-size:10px;color:#6b7280;margin:12px 0 0;">
      AfroSpook 2025 • Lagos Cultural Center
    </p>
  </div>
</div>`;

          try {
            await resend.emails.send({
              from: `AfroSpook Tickets <${FROM_EMAIL}>`,
              to: a.email!,
              subject: "🎟️ Your AfroSpook Ticket (Attendee Copy)",
              html: attendeeHtml,
            });
          } catch (error) {
            console.error(`Failed to send email to ${a.email}:`, error);
            throw error;
          }
        });

      const results = await Promise.allSettled(emailPromises);
      if (results.some((r) => r.status === "rejected")) {
        emailStatus = "partial";
      }
    }

    // ✅ Always return success here (emails shouldn't block the flow)
    return NextResponse.json({
      success: true,
      id: doc?._id,
      serials: enrichedAttendees.map((a) => a.serial),
      attendees: enrichedAttendees,
      receiptUrl: receiptBaseUrl,
      emailStatus,
    });
  } catch (err) {
    console.error("Save Payment API Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}