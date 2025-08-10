// app/payment/return/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  const payload = useMemo(() => {
    const status = (params.get("status") || "").toUpperCase();              // SUCCESS / SUCCESSFUL / FAILED
    const paymentStatus = (params.get("paymentStatus") || "").toUpperCase(); // PAID / FAILED / PENDING
    const ok = paymentStatus === "PAID" || status === "SUCCESS" || status === "SUCCESSFUL";

    return {
      ok,
      paymentReference: params.get("paymentReference") || params.get("paymentreference") || "",
      transactionReference: params.get("transactionReference") || params.get("transactionreference") || "",
      amountPaid: Number(params.get("amountPaid") || params.get("amount") || 0),
      paidOn: params.get("paidOn") || new Date().toISOString(),
    };
  }, [params]);

  useEffect(() => {
    (async () => {
      try {
        if (!payload.ok) {
          setErr("Payment was not successful.");
          return;
        }

        // Recover the pre-payment context
        const metaRaw = sessionStorage.getItem("pending_checkout_meta");
        const base = metaRaw ? JSON.parse(metaRaw) : null;

        // If no context, send to receipt with minimal info
        if (!base) {
          router.replace(
            `/receipt?ref=${encodeURIComponent(payload.paymentReference)}&txref=${encodeURIComponent(
              payload.transactionReference
            )}&amount=${payload.amountPaid}&seats=1`
          );
          return;
        }

        // Complete server save (idempotent on your side)
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
            raw: Object.fromEntries(params.entries()),
          }),
        });

        const data = await r.json();

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
