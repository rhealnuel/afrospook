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

export default function PaymentModal({ isOpen, onClose, ticket }: PaymentModalProps) {
  const seats = ticket?.seats ?? 1;

  // Buyer (primary contact/payer)
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });

  // Additional attendees (only names + emails for bundles)
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset + create attendee slots when opening or changing ticket
  useEffect(() => {
    if (!isOpen || !ticket) return;
    setBuyer({ name: "", email: "", phone: "" });

    const extraCount = Math.max((ticket.seats ?? 1) - 1, 0);
    setAttendees(Array.from({ length: extraCount }, () => ({ name: "", email: "" })));

    setIsLoading(false);
    setIsSaving(false);
  }, [isOpen, ticket]);

  // Validation
  const baseValid = buyer.name.trim() && buyer.email.trim() && buyer.phone.trim();
  const attendeesValid = attendees.every((a) => a.name.trim() && a.email.trim());
  const isFormValid = seats > 1 ? baseValid && attendeesValid : baseValid;

  // Button label e.g. “Pay Now — ₦12,000 (2 seats)”
  const payLabel = useMemo(() => {
    const amt = ticket ? `₦${Number(ticket.price).toLocaleString()}` : "";
    const tail = seats > 1 ? ` (${seats} seats)` : "";
    return `Pay Now — ${amt}${tail}`;
  }, [ticket, seats]);

  // Save to DB + email (no external verification)
  const saveToDB = async (res: any) => {
    setIsSaving(true);
    try {
      const attendeeList = [{ name: buyer.name, email: buyer.email }, ...attendees].slice(0, seats);

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
          attendees: attendeeList,
          raw: res,
        }),
      });

      const data = await r.json();

      // Persist receipt meta (incl. serials if returned)
      const receiptMeta = {
        buyer,
        ticket: { id: ticket?.id, name: ticket?.name, price: Number(ticket?.price), seats },
        attendees: attendeeList,
        gateway: {
          transactionReference: res.transactionReference,
          paymentReference: res.paymentReference,
          amountPaid: Number(res.amountPaid),
          paidOn: res.paidOn,
        },
        serials: Array.isArray(data?.serials) ? data.serials : undefined,
      };
      try {
        sessionStorage.setItem("receipt_meta", JSON.stringify(receiptMeta));
      } catch {}

      // Redirect to receipt
      window.location.href = `/receipt?ref=${encodeURIComponent(
        res.paymentReference
      )}&txref=${encodeURIComponent(res.transactionReference)}&amount=${Number(ticket?.price)}&seats=${seats}`;
    } catch (e) {
      console.error("Save-to-DB/email failed:", e);
      alert("Payment saved but receipt/email failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // Launch Monnify
  const handleSubmit = () => {
    if (!isFormValid || !ticket) {
      alert("Please fill all required fields.");
      return;
    }
    setIsLoading(true);

    // Client-side unique reference
    const paymentReference = `AF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Close OUR modal so Monnify’s iframe stays on top (avoid z-index conflicts)
    onClose();

    // Allow the modal to unmount, then trigger payment
    setTimeout(() => {
      triggerMonnifyPayment({
        amount: Number(ticket.price),
        customerName: buyer.name,
        customerEmail: buyer.email,
        customerPhone: buyer.phone,
        paymentReference,
        onComplete: (res: any) => {
          setIsLoading(false);
          if (res.paymentStatus === "PAID" && res.status === "SUCCESS") {
            saveToDB(res);
          } else {
            alert("Payment failed or cancelled.");
          }
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <ModalPortal>
          {/* lowered z-index so Monnify won't sit behind this if it opens fast */}
          <motion.div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-full max-w-xl"
            >
              <div className="rounded-3xl bg-gradient-to-br from-[#FF3B00]/40 via-white/10 to-[#B6FF00]/40 p-[1.5px] shadow-[0_0_60px_rgba(255,59,0,0.15)]">
                <div className="relative rounded-3xl border border-white/10 bg-neutral-950/90 backdrop-blur-xl">
                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Header */}
                  <div className="px-6 pt-6">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B00] to-[#B6FF00] shadow-[0_10px_30px_rgba(182,255,0,0.25)]">
                        <CreditCard className="h-7 w-7 text-black" />
                      </div>
                    </div>
                    <h2 className="text-center text-2xl font-bold text-white">Complete Purchase</h2>

                    {/* Ticket pill */}
                    <div className="mt-3 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF3B00] to-[#B6FF00]" />
                        <span className="font-medium">{ticket.name}</span>
                        {seats > 1 && (
                          <>
                            <span className="text-white/60">•</span>
                            <span>{seats} seats</span>
                          </>
                        )}
                        <span className="text-white/60">•</span>
                        <span className="font-semibold text-white">₦{Number(ticket.price).toLocaleString()}</span>
                        <CheckCircle className="h-4 w-4 text-lime-400" />
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="px-6 pb-6 pt-5">
                    {/* Buyer */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-xs text-neutral-400">Full Name (Buyer)</span>
                        <input
                          name="name"
                          placeholder="e.g. Adaeze Okoro"
                          value={buyer.name}
                          onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-neutral-400">Email (Buyer)</span>
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={buyer.email}
                          onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-neutral-400">Phone (Buyer)</span>
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+234 801 234 5678"
                          value={buyer.phone}
                          onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                        />
                      </label>
                    </div>

                    {/* Additional attendees for Couple / Group */}
                    {seats > 1 && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs text-neutral-400">
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
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
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
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secure bar */}
                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-neutral-300">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-lime-300" />
                        <span>Secure payment via Monnify</span>
                      </div>
                      <div className="rounded-full bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] px-2 py-0.5 font-semibold text-black">
                        ₦{Number(ticket.price).toLocaleString()}
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      onClick={handleSubmit}
                      disabled={!isFormValid || isLoading || isSaving}
                      whileHover={isFormValid && !isLoading && !isSaving ? { scale: 1.02 } : {}}
                      whileTap={isFormValid && !isLoading && !isSaving ? { scale: 0.98 } : {}}
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition ${
                        isFormValid && !isLoading && !isSaving
                          ? "bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] text-black shadow-[0_10px_30px_rgba(255,59,0,0.3)]"
                          : "cursor-not-allowed border border-white/10 bg-white/5 text-neutral-400"
                      }`}
                    >
                      {isLoading || isSaving ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
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

                    <p className="mt-3 text-center text-[11px] text-neutral-500">
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
