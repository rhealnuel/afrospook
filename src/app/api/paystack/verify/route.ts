export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export async function GET(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ success: false, error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
    }

    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data?.status) {
      const msg = data?.message || "Verification failed";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const d = data.data;
    const status: string = d?.status ?? "";
    const success = status.toLowerCase() === "success";

    return NextResponse.json({
      success,
      reference: d?.reference,
      amountPaid: Number(d?.amount || 0) / 100,
      currency: d?.currency,
      paidOn: d?.paid_at || d?.created_at,
      raw: d,
    });
  } catch (err: any) {
    console.error("Paystack verify error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
