"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, CheckCircle, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { triggerMonnifyPayment } from "@/lib/monify";
import ModalPortal from "./modalPortal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: number;
    name: string;
    price: number;   // bundle total
    seats?: number;  // 1 (single), 2 (couple), 4 (group)
  } | null;
}

type Attendee = { name: string; email: string };

type ApiVerifyPaymentResponse = {
  success: boolean;
  id?: string;
  attendees?: Array<{ name: string; email: string; serial: string; ticketName: string }>;
  serials?: string[];
  receiptUrl?: string;
  error?: string;
};

type MonnifyResult = {
  status?: string;              // "SUCCESS" | "SUCCESSFUL" | ...
  paymentStatus?: string;       // "PAID" | "PENDING" | ...
  transactionReference: string;
  paymentReference: string;
  amountPaid: number | string;
  paidOn?: string;
};

const ACCENT_LIME = "#7FD700";

export default function PaymentModal({ isOpen, onClose, ticket }: PaymentModalProps) {
  const seats = ticket?.seats ?? 1;

  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !ticket) return;
    setBuyer({ name: "", email: "", phone: "" });
    const extraCount = Math.max((ticket.seats ?? 1) - 1, 0);
    setAttendees(Array.from({ length: extraCount }, () => ({ name: "", email: "" })));
    setIsLoading(false);
    setIsSaving(false);
  }, [isOpen, ticket]);

  const baseValid =
    buyer.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(buyer.email) &&
    buyer.phone.trim().length >= 7;

  const attendeesValid =
    seats <= 1 ||
    attendees.every((a) => a.name.trim().length > 1 && /\S+@\S+\.\S+/.test(a.email));

  const isFormValid = !!(baseValid && attendeesValid);

  const payLabel = useMemo(() => {
    const amt = ticket ? `₦${Number(ticket.price).toLocaleString()}` : "";
    const tail = seats > 1 ? ` (${seats} seats)` : "";
    return `Pay Now — ${amt}${tail}`;
  }, [ticket, seats]);

  // ---- Save (server) + redirect ----
  const saveToDB = async (res: MonnifyResult) => {
    setIsSaving(true);
    try {
      // Ensure buyer is first attendee; cap to seats
      const baseAttendees: Attendee[] = [{ name: buyer.name, email: buyer.email }, ...attendees].slice(0, seats);

      const attendeesForRequest = baseAttendees.map((a) => ({
        ...a,
        ticketName: ticket?.name ?? "AfroSpook 2025 Ticket",
      }));

      const r = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionReference: res.transactionReference,
          paymentReference: res.paymentReference,
          amountPaid: Number(res.amountPaid),
          customerName: buyer.name,
          customerEmail: buyer.email,
          paidOn: res.paidOn,
          ticket: { id: ticket?.id, name: ticket?.name, price: Number(ticket?.price), seats },
          attendees: attendeesForRequest,
          raw: res,
        }),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || `Save failed with status ${r.status}`);
      }

      const data: ApiVerifyPaymentResponse = await r.json();
      if (!data.success) throw new Error(data.error || "Payment saved but server returned an error.");

      const enrichedAttendees =
        (Array.isArray(data.attendees) && data.attendees.length ? data.attendees : attendeesForRequest) as Array<{
          name: string;
          email: string;
          serial?: string;
          ticketName: string;
        }>;

      const receiptMeta = {
        buyer,
        ticket: { id: ticket?.id, name: ticket?.name, price: Number(ticket?.price), seats },
        attendees: enrichedAttendees,
        gateway: {
          transactionReference: res.transactionReference,
          paymentReference: res.paymentReference,
          amountPaid: Number(res.amountPaid),
          paidOn: res.paidOn,
        },
        serials: Array.isArray(data.serials) ? data.serials : enrichedAttendees.map((a) => a.serial).filter(Boolean),
      };
      try {
        sessionStorage.setItem("receipt_meta", JSON.stringify(receiptMeta));
      } catch {}

      const fallbackUrl = `/receipt?ref=${encodeURIComponent(
        res.paymentReference
      )}&txref=${encodeURIComponent(res.transactionReference)}&amount=${Number(ticket?.price)}&seats=${seats}`;

      window.location.href = data.receiptUrl || fallbackUrl;
    } catch (e) {
      console.error("Save-to-DB/email failed:", e);
      alert("Payment saved but receipt/email failed. Please check your inbox or contact support.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Launch Monnify (overlay + redirect fallback) ----
  const handleSubmit = () => {
    if (!isFormValid || !ticket || isLoading || isSaving) return;
    setIsLoading(true);

    const paymentReference = `AF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Stash pending checkout context (used by /payment/return)
    try {
      const baseAttendees = [{ name: buyer.name, email: buyer.email }, ...attendees]
        .slice(0, seats)
        .map((a) => ({ ...a, ticketName: ticket?.name ?? "AfroSpook 2025 Ticket" }));

      const pending = {
        buyer,
        ticket: { id: ticket?.id, name: ticket?.name, price: Number(ticket?.price), seats },
        attendees: baseAttendees,
      };
      sessionStorage.setItem("pending_checkout_meta", JSON.stringify(pending));
    } catch {}

    // Close our modal, then launch payment
    onClose();

    setTimeout(() => {
      const redirectUrl = `${window.location.origin}/payment/return`;

      triggerMonnifyPayment({
        amount: Number(ticket.price),
        customerName: buyer.name,
        customerEmail: buyer.email,
        customerPhone: buyer.phone,
        paymentReference,
        redirectUrl, // 👈 mobile fallback
        onComplete: (res: MonnifyResult) => {
          setIsLoading(false);

          const s = String(res.status || "").toUpperCase();
          const ps = String(res.paymentStatus || "").toUpperCase();
          const ok = ps === "PAID" || s === "SUCCESS" || s === "SUCCESSFUL";

          if (ok) {
            saveToDB(res); // fast path
          } else {
            alert("Payment failed or cancelled.");
          }
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    }, 120);
  };

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <ModalPortal>
          <motion.div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-2xl"
            >
              <div className="rounded-3xl bg-gradient-to-br from-orange-200/60 via-white to-lime-200/60 p-[1.25px] shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
                <div className="relative rounded-3xl bg-white">
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 transition hover:bg-white hover:shadow-sm"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="px-6 pt-7">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                      <div
                        className="inline-flex h-14 w-14 items-center justify-center rounded-full shadow-sm"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,59,0,0.12), rgba(127,215,0,0.12))",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <CreditCard className="h-7 w-7" />
                      </div>
                    </div>

                    <h2 className="text-center text-2xl font-bold text-gray-900">Complete Purchase</h2>

                    <div className="mt-3 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)" }}
                        />
                        <span className="font-medium">{ticket.name}</span>
                        {seats > 1 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{seats} seats</span>
                          </>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-gray-900">₦{Number(ticket.price).toLocaleString()}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="px-6 pb-6 pt-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-gray-500">Full Name (Buyer)</span>
                        <input
                          name="name"
                          placeholder="e.g. Adaeze Okoro"
                          value={buyer.name}
                          onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-500">Email (Buyer)</span>
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={buyer.email}
                          onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-gray-500">Phone (Buyer)</span>
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+234 801 234 5678"
                          value={buyer.phone}
                          onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                        />
                      </label>
                    </div>

                    {seats > 1 && (
                      <div className="mt-6">
                        <p className="mb-2 text-xs text-gray-500">
                          Additional attendee{seats - 1 > 1 ? "s" : ""} ({seats - 1})
                        </p>

                        <div className="space-y-3">
                          {attendees.map((a, i) => (
                            <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <input
                                placeholder={`Attendee ${i + 2} Name`}
                                value={a.name}
                                onChange={(e) => {
                                  const next = [...attendees];
                                  next[i] = { ...next[i], name: e.target.value };
                                  setAttendees(next);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                              />
                              <input
                                placeholder={`Attendee ${i + 2} Email`}
                                type="email"
                                value={a.email}
                                onChange={(e) => {
                                  const next = [...attendees];
                                  next[i] = { ...next[i], email: e.target.value };
                                  setAttendees(next);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" style={{ color: ACCENT_LIME }} />
                        <span>Secure payment via Monnify</span>
                      </div>
                      <div
                        className="rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)", color: "#111827" }}
                      >
                        ₦{Number(ticket?.price ?? 0).toLocaleString()}
                      </div>
                    </div>

                    <motion.button
                      onClick={handleSubmit}
                      disabled={!isFormValid || isLoading || isSaving}
                      whileHover={isFormValid && !isLoading && !isSaving ? { scale: 1.02 } : {}}
                      whileTap={isFormValid && !isLoading && !isSaving ? { scale: 0.98 } : {}}
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition ${
                        isFormValid && !isLoading && !isSaving
                          ? "text-white shadow-lg"
                          : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                      }`}
                      style={
                        isFormValid && !isLoading && !isSaving
                          ? { background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)" }
                          : undefined
                      }
                    >
                      {isLoading || isSaving ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-600"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>{isSaving ? "Saving..." : "Processing..."}</span>
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span>{payLabel}</span>
                        </>
                      )}
                    </motion.button>

                    <p className="mt-3 text-center text-[11px] text-gray-500">
                      By continuing, you agree to our Terms & Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
