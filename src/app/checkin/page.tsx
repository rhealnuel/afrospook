// app/checkin/page.tsx
"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ScanSearch, XCircle, Info, Loader2 } from "lucide-react";

/** tiny class combiner (clsx replacement) */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type CheckinSuccess = {
  success: true;
  serial: string;
  attendee?: { ticketName?: string };
  payment?: { amountPaid?: number };
};
type CheckinAlreadyUsed = {
  success: false;
  error: string;
  alreadyUsed: true;
  usedAt?: string;
};
type CheckinError = { success: false; error: string };

const SERIAL_REGEX = /^[A-Z0-9]{6}$/;

export default function CheckinPage() {
  const [serialRaw, setSerialRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinSuccess | CheckinAlreadyUsed | CheckinError | null>(null);

  const serial = useMemo(
    () => serialRaw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
    [serialRaw]
  );
  const isValid = SERIAL_REGEX.test(serial);

  const onSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, gate: "Main Gate" }),
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onSubmit();
  };

  const reset = () => {
    setSerialRaw("");
    setResult(null);
  };

  const success = result && "success" in result && result.success ? (result as CheckinSuccess) : null;
  const ticketName = success?.attendee?.ticketName || "Ticket";
  const price = success?.payment?.amountPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl bg-gradient-to-br from-orange-200/70 via-white to-lime-200/70 p-[1px] shadow">
          <div className="rounded-2xl bg-white p-6 md:p-7">
            {/* Header / Logo */}
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 flex h-12 w-36 items-center justify-center rounded-lg bg-black p-2">
                <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200">
                <ScanSearch className="w-6 h-6 text-[#FF3B00]" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Check-In</h1>
              <p className="text-gray-600 text-xs mt-1">Enter serial to verify & mark as used.</p>
            </div>

            {/* Input */}
            {!result && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerialRaw(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Q5J***"
                    maxLength={6}
                    inputMode="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-lg tracking-widest font-mono outline-none transition",
                      isValid
                        ? "border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                        : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full",
                      isValid ? "bg-lime-500" : "bg-gray-300"
                    )}
                  />
                </div>

                <div className="flex items-start gap-2 text-[11px] text-gray-600">
                  <Info className="h-3.5 w-3.5" />
                  <p>
                    Format: 6 chars (A–Z, 0–9). Example: <span className="font-mono">Q5J***</span>
                  </p>
                </div>

                <button
                  onClick={onSubmit}
                  disabled={!isValid || loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] text-white font-semibold py-3 transition hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>Verify & Check-In</>
                  )}
                </button>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-28 items-center justify-center rounded-md bg-black p-1.5">
                  <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
                </div>

                <CheckCircle className="text-green-600 w-10 h-10 mx-auto mb-2" />
                <h2 className="text-lg font-bold text-green-700 mb-3">Ticket Verified</h2>

                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-gray-800 space-y-2">
                  <Line label="Serial" value={success.serial} mono />
                  <Line label="Ticket" value={ticketName} />
                  <Line label="Price" value={typeof price === "number" ? `₦${price.toLocaleString()}` : "₦—"} />
                </div>

                <button
                  onClick={reset}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Scan Next
                </button>
              </div>
            )}

            {/* Already used / Not found */}
            {result && !success && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-28 items-center justify-center rounded-md bg-black p-1.5">
                  <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
                </div>

                <XCircle className="text-red-500 w-10 h-10 mx-auto mb-2" />
                <h2 className="text-lg font-bold text-red-700 mb-1">
                  {"alreadyUsed" in (result as any) ? "Already Used" : "Not Verified"}
                </h2>
                <p className="text-gray-600 text-sm">{(result as any).error || "Unable to verify this serial."}</p>

                <button
                  onClick={reset}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Try Another
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-500">Venue:  Image Garden Benin-city</p>
      </div>
    </div>
  );
}

function Line({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className={cn("font-medium", mono && "font-mono")}>{value}</span>
    </div>
  );
}
