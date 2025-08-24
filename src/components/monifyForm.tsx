// src/components/PaymentModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, CheckCircle, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

const ACCENT_LIME = "#7FD700";

export default function PaymentModal({ isOpen, onClose, ticket }: PaymentModalProps) {
  const seats = ticket?.seats ?? 1;

  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving] = useState(false); // kept to preserve button states

  useEffect(() => {
    if (!isOpen || !ticket) return;
    setBuyer({ name: "", email: "", phone: "" });
    const extraCount = Math.max((ticket.seats ?? 1) - 1, 0);
    setAttendees(Array.from({ length: extraCount }, () => ({ name: "", email: "" })));
    setIsLoading(false);
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

  // Launch Paystack via server-init (redirect)
  const handleSubmit = async () => {
    if (!isFormValid || !ticket || isLoading || isSaving) return;
    setIsLoading(true);

    const reference = `PSK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Stash pending checkout context for /payment/return
    try {
      const baseAttendees = [{ name: buyer.name, email: buyer.email }, ...attendees]
        .slice(0, seats)
        .map((a) => ({ ...a, ticketName: ticket?.name ?? "AfroSpook 2025 Ticket" }));

      const pending = {
        buyer,
        ticket: { id: ticket?.id, name: ticket?.name, price: Number(ticket?.price), seats },
        attendees: baseAttendees,
        reference,
      };
      sessionStorage.setItem("pending_checkout_meta", JSON.stringify(pending));
    } catch {}

    try {
      const callbackUrl = `${window.location.origin}/payment/return`;

      const resp = await fetch("/api/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: buyer.email,
          amount: Number(ticket.price),
          reference,
          callbackUrl,
          metadata: {
            buyerName: buyer.name,
            buyerPhone: buyer.phone,
            ticketName: ticket.name,
            seats,
          },
        }),
      }).then((r) => r.json());

      if (!resp?.success || !resp?.authorizationUrl) {
        throw new Error(resp?.error || "Failed to initialize payment");
      }

      // onClose();
      window.location.href = resp.authorizationUrl;
    } catch (err) {
      console.error("Init/redirect error:", err);
      alert("Could not start payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <ModalPortal>
          <motion.div
            className="fixed inset-0 z-[9000] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            >
              <div className="rounded-3xl bg-gradient-to-br from-orange-200/60 via-white to-lime-200/60 p-[1.25px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] flex-1 flex flex-col min-h-0">
                <div className="relative rounded-3xl bg-white flex-1 flex flex-col min-h-0">
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 transition hover:bg-white hover:shadow-sm"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Header - Fixed */}
                  <div className="px-4 sm:px-6 pt-6 pb-4 flex-shrink-0">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                      <div
                        className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-sm"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,59,0,0.12), rgba(127,215,0,0.12))",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                    </div>

                    <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-900">Complete Purchase</h2>

                    <div className="mt-3 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)" }}
                        />
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{ticket.name}</span>
                        {seats > 1 && (
                          <>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{seats} seats</span>
                          </>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-gray-900">₦{Number(ticket.price).toLocaleString()}</span>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Form - Scrollable (restored) */}
                  <div className="px-4 sm:px-6 pb-4 flex-1 overflow-y-auto min-h-0">
                    <div className="space-y-4">
                      {/* Buyer Info */}
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
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

                      {/* Additional Attendees */}
                      {seats > 1 && (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">
                            Additional attendee{seats - 1 > 1 ? "s" : ""} ({seats - 1})
                          </p>

                          <div className="space-y-3">
                            {attendees.map((a, i) => (
                              <div key={i} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
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
                    </div>
                  </div>

                  {/* Footer - Fixed */}
                  <div className="px-4 sm:px-6 pb-6 flex-shrink-0 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-700 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 flex-shrink-0" style={{ color: ACCENT_LIME }} />
                        <span className="truncate">Secure payment via Paystack</span>
                      </div>
                      <div
                        className="rounded-full px-2 py-0.5 font-semibold whitespace-nowrap"
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
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold transition ${
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
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-600"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span className="truncate">{payLabel}</span>
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
