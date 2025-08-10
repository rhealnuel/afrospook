"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentReturnPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // Paystack sends ?reference=... (sometimes also trxref)
        const reference =
          params.get("reference") || params.get("trxref") || "";

        if (!reference) {
          setError("Missing transaction reference.");
          return;
        }

        // Pull pending checkout context
        const raw = sessionStorage.getItem("pending_checkout_meta");
        if (!raw) {
          setError("Missing pending checkout info.");
          return;
        }
        const pending = JSON.parse(raw) as {
          buyer: { name: string; email: string; phone?: string };
          ticket: { id?: number; name?: string; price: number; seats: number };
          attendees: Array<{ name: string; email: string; ticketName?: string }>;
          reference: string;
        };

        // Verify with Paystack
        const verifyResp = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, {
          cache: "no-store",
        }).then((r) => r.json());

        if (!verifyResp?.success) {
          throw new Error(verifyResp?.error || "Verification failed");
        }

        // Persist + email via your existing route
        const saveResp = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionReference: reference,
            paymentReference: reference,
            amountPaid: Number(verifyResp.amountPaid || pending.ticket.price),
            customerName: pending.buyer.name,
            customerEmail: pending.buyer.email,
            paidOn: verifyResp.paidOn,
            ticket: pending.ticket,
            attendees: pending.attendees,
            raw: { gateway: "paystack", verify: verifyResp },
          }),
        }).then((r) => r.json());

        if (!saveResp?.success) {
          throw new Error(saveResp?.error || "Failed to save transaction");
        }

        // Optionally stash receipt meta (helps your receipt page UI)
        try {
          const receiptMeta = {
            buyer: pending.buyer,
            ticket: pending.ticket,
            attendees: saveResp.attendees,
            gateway: {
              transactionReference: reference,
              paymentReference: reference,
              amountPaid: Number(verifyResp.amountPaid || pending.ticket.price),
              paidOn: verifyResp.paidOn,
            },
            serials: saveResp.serials,
          };
          sessionStorage.setItem("receipt_meta", JSON.stringify(receiptMeta));
        } catch {}

        // Redirect to your receipt page (server also returned a URL)
        const to = saveResp.receiptUrl ||
          `/receipt?ref=${encodeURIComponent(reference)}&txref=${encodeURIComponent(reference)}&amount=${Number(pending.ticket.price)}&seats=${pending.ticket.seats}`;
        window.location.replace(to);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Something went wrong.");
        // As a fallback, go home after a bit
        setTimeout(() => router.push("/"), 4000);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700 mx-auto" />
        <p className="text-sm text-gray-600">
          {error ? error : "Finalizing your payment..."}
        </p>
      </div>
    </div>
  );
}
