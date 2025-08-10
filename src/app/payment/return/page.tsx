// app/payment/return/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// helper to read multiple key variants
function pickParam(params: URLSearchParams, keys: string[], def: string = "") {
  for (const k of keys) {
    const v = params.get(k);
    if (v != null && v !== "") return v;
  }
  return def;
}

function PaymentReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  const payload = useMemo(() => {
    // status variants we’ve seen on mobile/in-app browsers
    const statusRaw = pickParam(params, [
      "paymentStatus",
      "paymentstatus",
      "payment_status",
      "status",
      "transactionStatus",
      "transaction_status",
      "statusCode",
    ]);

    const status = (statusRaw || "").toUpperCase();

    // treat any of these as success
    const ok =
      status.includes("PAID") ||
      status.includes("SUCCESS") ||
      status.includes("SUCCESSFUL") ||
      status.includes("APPROVED") ||
      status.includes("COMPLETED");

    const paymentReference =
      pickParam(params, ["paymentReference", "paymentreference", "reference"]) || "";

    const transactionReference =
      pickParam(params, ["transactionReference", "transactionreference", "transaction_ref"]) || "";

    const amountPaidRaw = pickParam(params, ["amountPaid", "amount", "amt"], "0");
    const paidOn = pickParam(params, ["paidOn", "paid_on"], new Date().toISOString());

    return {
      ok,
      status, // for debugging if needed
      paymentReference,
      transactionReference,
      amountPaid: Number(amountPaidRaw) || 0,
      paidOn,
    };
  }, [params]);

  useEffect(() => {
    (async () => {
      try {
        // Recover the pre-payment context (set before opening Monnify)
        const metaRaw = sessionStorage.getItem("pending_checkout_meta");
        const base = metaRaw ? JSON.parse(metaRaw) : null;

        // If we don’t have context, at least try to forward to receipt
        if (!base) {
          if (!payload.ok) {
            // No context + unclear status: show message but still try to push to / if stuck
            setErr("Payment status unclear. If you already paid, please check your email for a receipt.");
            return;
          }
          router.replace(
            `/receipt?ref=${encodeURIComponent(payload.paymentReference)}&txref=${encodeURIComponent(
              payload.transactionReference
            )}&amount=${payload.amountPaid}&seats=1`
          );
          return;
        }

        // Even if status looks unclear on mobile, try to save — Monnify may omit status fields on some webviews.
        const r = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionReference: payload.transactionReference,
            paymentReference: payload.paymentReference,
            amountPaid: payload.amountPaid,
            customerName: base.buyer?.name,
            customerEmail: base.buyer?.email,
            paidOn: payload.paidOn,
            ticket: base.ticket,       // { id, name, price, seats }
            attendees: base.attendees, // [{ name, email, ticketName }]
            // Store raw query for audit/debug
            raw: Object.fromEntries(params.entries()),
          }),
        });

        const data = await r.json();

        // Persist meta for /receipt
        const receiptMeta = {
          buyer: base.buyer,
          ticket: base.ticket,
          attendees: data.attendees || base.attendees,
          gateway: {
            transactionReference: payload.transactionReference,
            paymentReference: payload.paymentReference,
            amountPaid: payload.amountPaid,
            paidOn: payload.paidOn,
          },
          serials: data.serials || (data.attendees || []).map((a: any) => a.serial).filter(Boolean),
        };
        try {
          sessionStorage.setItem("receipt_meta", JSON.stringify(receiptMeta));
        } catch {}

        const fallbackUrl = `/receipt?ref=${encodeURIComponent(
          payload.paymentReference
        )}&txref=${encodeURIComponent(payload.transactionReference)}&amount=${payload.amountPaid}&seats=${
          base.ticket?.seats || 1
        }`;

        window.location.replace(data.receiptUrl || fallbackUrl);
      } catch (e) {
        console.error(e);
        setErr("Could not finalize payment. Please check your email for a receipt or contact support.");
      }
    })();
  }, [payload, params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-700">
        {err ? err : "Finalizing your payment…"}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center text-sm text-gray-700">Loading…</div>
        </div>
      }
    >
      <PaymentReturnInner />
    </Suspense>
  );
}
