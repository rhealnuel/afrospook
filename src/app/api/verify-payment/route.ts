// app/api/verify-payment/route.ts
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
    raw,
  } = body;

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    const serial = await generateUniqueSerial();

    await Transaction.create({
      transactionReference,
      paymentReference,
      amountPaid,
      customerName,
      customerEmail,
      paidOn,
      raw,
      serial,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formattedDate = new Date(paidOn).toLocaleString();

    const emailHTML = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; padding: 24px;">
    <div style="max-width: 520px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e5e7eb;">
      
      <!-- Header -->
      <div style="background: linear-gradient(to right, #22c55e, #10b981); color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">🎉 Payment Successful</h2>
        <p style="margin: 4px 0 0; font-size: 14px;">AfroSpook 2025 - Ticket Receipt</p>
      </div>

      <!-- Body -->
      <div style="padding: 20px 24px;">
        <p style="font-size: 14px; margin: 0 0 12px;">Hello <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; margin: 0 0 18px;">Thank you for your payment! Here are your ticket details:</p>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0;">Amount Paid:</td>
            <td style="text-align: right; font-weight: 600;">₦${amountPaid}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Payment Reference:</td>
            <td style="text-align: right;">${paymentReference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Transaction Reference:</td>
            <td style="text-align: right;">${transactionReference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Date Paid:</td>
            <td style="text-align: right;">${formattedDate}</td>
          </tr>
        </table>

        <!-- Serial Code -->
        <div style="background: #f0fdf4; padding: 12px; border: 1px solid #bbf7d0; border-radius: 6px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 13px; color: #065f46;">🎟️ Your Ticket Serial Code</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-family: monospace; font-weight: bold; color: #065f46; letter-spacing: 1px;">
            ${serial}
          </p>
        </div>

        <div style="font-size: 13px; line-height: 1.5; color: #374151;">
          <p style="margin: 0 0 6px;">📷 Please <strong>take a screenshot</strong> of this receipt.</p>
          <p style="margin: 0 0 6px;">🎟️ Present your <strong>serial code</strong> at the event gate for verification.</p>
          <p style="margin: 0;">📧 This receipt has also been sent to <strong>${customerEmail}</strong>.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 11px; color: #6b7280;">
        &copy; 2025 AfroSpook. All rights reserved.
      </div>
    </div>
  </div>
`;

    await transporter.sendMail({
      from: `"AfroSpook Tickets" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: "🎟️ Your AfroSpook Ticket Receipt",
      html: emailHTML,
    });

    return NextResponse.json({ success: true, serial });
  } catch (err) {
    console.error("Verification API Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
