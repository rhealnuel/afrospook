"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Camera,
  ArrowRight,
  Mail,
  Hash,
  Calendar,
  CreditCard,
  Copy,
  Check,
  MapPin,
} from "lucide-react";

const ORANGE = "#FF3B00";
const LIME = "#B6FF00";

function hashToSerial(seed: string, index = 0) {
  let h = 2166136261 ^ index;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let hex = (h >>> 0).toString(16).padStart(8, "0");
  for (let i = 0; i < seed.length && hex.length < 16; i++) {
    hex += (seed.charCodeAt(i) & 0xff).toString(16).padStart(2, "0");
  }
  hex = hex.slice(0, 16).toUpperCase();
  return `AF-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

function SuccessPage() {
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    setShow(true);
    try {
      const raw = sessionStorage.getItem("receipt_meta");
      if (raw) setMeta(JSON.parse(raw));
    } catch {}
  }, []);

  const fallback = {
    customerName: params.get("name") ?? "Guest",
    amountPaid: Number(params.get("amount") ?? 0),
    paymentReference: params.get("ref") ?? "N/A",
    transactionReference: params.get("txref") ?? "N/A",
    paidOn: params.get("paidOn") ?? new Date().toISOString(),
    serialParam: params.get("serials") ?? params.get("serial") ?? "",
    seats: Number(params.get("seats") ?? 1) || 1,
  };

  const seats = meta?.ticket?.seats ?? fallback.seats;
  const attendees =
    meta?.attendees?.length
      ? meta.attendees
      : [{ name: meta?.buyer?.name ?? fallback.customerName, email: meta?.buyer?.email ?? "" }];

  const serials: string[] = useMemo(() => {
    if (meta?.serials?.length) return meta.serials.slice(0, seats);
    const fromUrl = fallback.serialParam.split(",").map(s => s.trim()).filter(Boolean);
    if (fromUrl.length) return fromUrl.slice(0, seats);
    const seed = `${meta?.gateway?.paymentReference ?? fallback.paymentReference}|${
      meta?.gateway?.transactionReference ?? fallback.transactionReference
    }|${seats}`;
    return Array.from({ length: seats }, (_, i) => hashToSerial(seed, i));
  }, [meta, seats, fallback.paymentReference, fallback.transactionReference, fallback.serialParam]);

  const data = useMemo(() => ({
    name: meta?.buyer?.name ?? fallback.customerName,
    amount: meta?.ticket?.price ?? fallback.amountPaid,
    ref: meta?.gateway?.paymentReference ?? fallback.paymentReference,
    txref: meta?.gateway?.transactionReference ?? fallback.transactionReference,
    paidOn: meta?.gateway?.paidOn ?? fallback.paidOn,
    ticketName: meta?.ticket?.name ?? "AfroSpook 2025 Ticket",
    seats,
    attendees: attendees.slice(0, seats),
    serials,
  }), [meta, fallback, seats, attendees, serials]);

  // Pair each attendee with its serial for rendering
  const entries = useMemo(
    () =>
      Array.from({ length: data.seats }, (_, i) => ({
        name: data.attendees[i]?.name || `Attendee ${i + 1}`,
        email: data.attendees[i]?.email || "—",
        serial: data.serials[i] || "",
      })),
    [data.seats, data.attendees, data.serials]
  );

  const handleDone = () => (window.location.href = "/");

  const copySerial = async (s: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-lime-50 px-4 py-8 text-sm text-gray-900">
      <div
        className={`mx-auto w-full max-w-xl transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
            <CheckCircle className="h-8 w-8" style={{ color: LIME }} />
          </div>
          {/* Logo on black for contrast */}
          <div className="mx-auto mb-2 flex h-14 w-40 items-center justify-center rounded-lg bg-black p-2">
            <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold">Payment Successful</h1>
          <p className="text-gray-600 text-xs">Welcome to AfroSpook 2025</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-200/70 via-white to-lime-200/70 p-[1px] shadow">
          <div className="rounded-2xl bg-white px-5 py-5">
            {/* Ticket title + amount */}
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{data.ticketName}</span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" style={{ color: ORANGE }} />
                ₦{Number(data.amount).toLocaleString()}
              </span>
            </div>

            {/* Info compact */}
            <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-3.5 w-3.5" style={{ color: ORANGE }} />
                {new Date(data.paidOn).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Hash className="h-3.5 w-3.5" style={{ color: LIME }} /> {data.ref}
              </div>
              <div className="col-span-2 truncate text-gray-600">Tx: {data.txref}</div>
              <div className="col-span-2 font-medium text-gray-800">{data.name}</div>
            </div>

            {/* Event address (always visible) */}
            <div className="mt-3 flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
              <MapPin className="h-3.5 w-3.5" style={{ color: ORANGE }} />
              Elegushi Beach, Lagos
            </div>

            {/* Attendees + serials */}
            <div className="mt-4">
              <p className="mb-1 text-xs text-gray-500">
                {data.seats > 1 ? "Attendees & Serial Codes" : "Attendee & Serial Code"}
              </p>

              <div className={`grid gap-2 ${data.seats > 1 ? "grid-cols-1" : "grid-cols-1"}`}>
                {entries.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {row.name}
                        </p>
                        <p className="truncate text-[11px] text-gray-600">
                          {row.email}
                        </p>
                      </div>

                      <div className="ml-3 flex items-center gap-2">
                        <code className="rounded bg-white px-2 py-1 text-[11px] border border-gray-200 font-mono">
                          {row.serial}
                        </code>
                        <button
                          onClick={() => copySerial(row.serial, i)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Copy serial"
                        >
                          {copiedIdx === i ? (
                            <Check className="h-3.5 w-3.5" style={{ color: LIME }} />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-700">
              <Mail className="mt-[1px] h-3.5 w-3.5" style={{ color: LIME }} />
              <p>Receipt has been sent to your email.</p>
            </div>

            {/* CTA */}
            <div className="mt-4 text-center">
              <button
                onClick={handleDone}
                className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow"
                style={{ background: "linear-gradient(90deg, #FF3B00 0%, #B6FF00 100%)" }}
              >
                <Camera className="h-3.5 w-3.5" />
                Done
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Small footer */}
        <p className="mt-3 text-center text-[10px] text-gray-500">
          AfroSpook 2025 • Lagos Cultural Center
        </p>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-600">Loading receipt...</div>}>
      <SuccessPage />
    </Suspense>
  );
}
