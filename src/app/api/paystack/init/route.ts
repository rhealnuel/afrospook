export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
    }

    const { email, amount, reference, callbackUrl, metadata } = await req.json();

    if (!email || !amount || !reference || !callbackUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100), // kobo
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: metadata || {},
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.status) {
      const msg = data?.message || "Paystack initialize failed";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const { authorization_url, access_code } = data.data || {};
    return NextResponse.json({
      success: true,
      authorizationUrl: authorization_url,
      accessCode: access_code,
      reference,
    });
  } catch (err: any) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
