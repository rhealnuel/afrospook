"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Camera,
  ArrowRight,
  Mail,
  Receipt,
  Hash,
  Calendar,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";

/* Brand */
const ORANGE = "#FF3B00";
const LIME = "#B6FF00";

/* --- tiny hash -> pretty serials (fallback when none provided) --- */
function hashToSerial(seed: string, index = 0) {
  // simple hash -> 16 hex chars
  let h = 2166136261 ^ index;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let hex = (h >>> 0).toString(16).padStart(8, "0");
  // expand a bit more using the seed again
  for (let i = 0; i < seed.length && hex.length < 16; i++) {
    hex += (seed.charCodeAt(i) & 0xff).toString(16).padStart(2, "0");
  }
  hex = hex.slice(0, 16).toUpperCase();
  // AF-XXXX-XXXX-XXXX
  return `AF-${hex.slice(0,4)}-${hex.slice(4,8)}-${hex.slice(8,12)}`;
}

function SuccessPage() {
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Read meta from sessionStorage if the modal saved it
  const [meta, setMeta] = useState<null | {
    buyer: { name: string; email: string; phone: string };
    ticket: { id: number; name: string; price: number; seats?: number };
    attendees: { name: string; email: string }[];
    gateway: {
      transactionReference: string;
      paymentReference: string;
      amountPaid: number;
      paidOn?: string;
    };
    serials?: string[]; // OPTIONAL: backend-provided serials (preferred)
  }>(null);

  useEffect(() => {
    setShow(true);
    try {
      const raw = sessionStorage.getItem("receipt_meta");
      if (raw) setMeta(JSON.parse(raw));
    } catch {}
  }, []);

  // Fallbacks from URL
  const fallback = {
    customerName: params.get("name") ?? "Guest",
    amountPaid: Number(params.get("amount") ?? 0),
    paymentReference: params.get("ref") ?? "N/A",
    transactionReference: params.get("txref") ?? "N/A",
    paidOn: params.get("paidOn") ?? new Date().toISOString(),
    // Either single serial or comma-separated serials
    serialParam: params.get("serials") ?? params.get("serial") ?? "",
    seats: Number(params.get("seats") ?? 1) || 1,
  };

  // Normalize attendees + seats
  const seats = meta?.ticket?.seats ?? fallback.seats;
  const attendees =
    meta?.attendees && meta.attendees.length
      ? meta.attendees
      : [{ name: meta?.buyer?.name ?? fallback.customerName, email: meta?.buyer?.email ?? "" }];

  // Build serial list (priority: meta.serials -> URL list -> generate)
  const serials: string[] = useMemo(() => {
    if (meta?.serials?.length) {
      return meta.serials.slice(0, seats);
    }
    const fromUrl = fallback.serialParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (fromUrl.length) {
      return fromUrl.slice(0, seats);
    }
    // generate deterministic serials (client-side fallback)
    const seed = `${meta?.gateway?.paymentReference ?? fallback.paymentReference}|${
      meta?.gateway?.transactionReference ?? fallback.transactionReference
    }|${seats}`;
    return Array.from({ length: seats }, (_, i) => hashToSerial(seed, i));
  }, [meta, seats, fallback.paymentReference, fallback.transactionReference, fallback.serialParam]);

  const data = useMemo(() => {
    return {
      name: meta?.buyer?.name ?? fallback.customerName,
      amount: meta?.ticket?.price ?? fallback.amountPaid,
      ref: meta?.gateway?.paymentReference ?? fallback.paymentReference,
      txref: meta?.gateway?.transactionReference ?? fallback.transactionReference,
      paidOn: meta?.gateway?.paidOn ?? fallback.paidOn,
      ticketName: meta?.ticket?.name ?? "AfroSpook 2025 Ticket",
      seats,
      attendees: attendees.slice(0, seats),
      serials,
    };
  }, [meta, fallback, seats, attendees, serials]);

  const handleDone = () => (window.location.href = "/");

  const copySerial = async (s: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10 text-sm text-white">
      <div
        className={`mx-auto w-full max-w-lg transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF3B00] to-[#B6FF00] shadow-[0_10px_30px_rgba(182,255,0,0.25)]">
            <CheckCircle className="h-9 w-9 text-black" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Payment Successful</h1>
          <p className="text-neutral-300">Welcome to AfroSpook 2025</p>
        </div>

        {/* Card Frame */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FF3B00]/40 via-white/10 to-[#B6FF00]/40 p-[1.5px] shadow-[0_0_60px_rgba(255,59,0,0.15)]">
          <div className="rounded-3xl border border-white/10 bg-neutral-950/90 px-5 py-6 backdrop-blur-xl">
            {/* Receipt Header */}
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-lime-300" />
              </div>
              <h2 className="text-base font-semibold">{data.ticketName}</h2>
              <p className="text-xs text-neutral-400">Music • Art • Culture • Food</p>
            </div>

            {/* Amount pill */}
            <div className="mt-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                <CreditCard className="h-4 w-4 text-orange-400" />
                <span className="font-semibold text-white">₦{Number(data.amount).toLocaleString()}</span>
                {data.seats > 1 && (
                  <>
                    <span className="text-white/60">•</span>
                    <span>
                      {data.seats} {data.seats > 1 ? "seats" : "seat"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Info block */}
            <div className="mt-6 space-y-2">
              <InfoRow label="Name" value={data.name} />
              <InfoRow label="Payment Ref" value={data.ref} icon={<Hash className="h-4 w-4 text-lime-300" />} />
              <InfoRow label="Transaction Ref" value={data.txref} />
              <InfoRow
                label="Date"
                value={new Date(data.paidOn).toLocaleString()}
                icon={<Calendar className="h-4 w-4 text-orange-400" />}
              />
            </div>

            {/* Serial(s) */}
            <div className="mt-6">
              <p className="mb-2 text-xs text-neutral-400">
                {data.seats > 1 ? "Serial Codes (per attendee)" : "Serial Code"}
              </p>

              {data.seats > 1 ? (
                <div className="space-y-2">
                  {data.attendees.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {a.name || `Attendee ${i + 1}`}
                        </p>
                        <p className="truncate text-[11px] text-neutral-300">{a.email || "—"}</p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <code className="rounded-md bg-black/50 px-2 py-1 font-mono text-xs text-white">
                          {data.serials[i] || hashToSerial(data.ref + data.txref, i)}
                        </code>
                        <button
                          onClick={() => copySerial(data.serials[i] || hashToSerial(data.ref + data.txref, i), i)}
                          className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-neutral-200 hover:bg-white/10"
                          title="Copy serial"
                        >
                          {copiedIdx === i ? <Check className="h-4 w-4 text-lime-300" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <code className="rounded-md bg-black/50 px-2 py-1 font-mono text-xs text-white">
                    {data.serials[0]}
                  </code>
                  <button
                    onClick={() => copySerial(data.serials[0], 0)}
                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-neutral-200 hover:bg-white/10"
                    title="Copy serial"
                  >
                    {copiedIdx === 0 ? <Check className="h-4 w-4 text-lime-300" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-neutral-300">
              <Mail className="mt-[2px] h-4 w-4 text-lime-300" />
              <p>A copy of this receipt has been sent to the email you provided. Please keep it safe.</p>
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <button
                onClick={handleDone}
                className="mx-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] px-4 py-2 font-semibold text-black shadow-[0_10px_30px_rgba(255,59,0,0.25)] transition hover:opacity-95"
              >
                <Camera className="h-4 w-4" />
                Done — Take me home
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-1 text-[11px] text-neutral-500">This will take you back to the homepage</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-500">AfroSpook 2025 • Lagos Cultural Center</p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <div className="flex items-center gap-2 text-neutral-300">
        {icon}
        <span className="font-medium">{label}:</span>
      </div>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-white">Loading receipt...</div>}>
      <SuccessPage />
    </Suspense>
  );
}
