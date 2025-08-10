// components/ReceiptModal.tsx
"use client";
import { useMemo, useState } from "react";
import { X, Copy, CheckCircle2 } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    customerName: string;
    amountPaid: number;
    paymentReference: string;
    transactionReference: string;
    paidOn: string;
    serial: string;
  };
}

const ACCENT_ORANGE = "#FF3B00";
const ACCENT_LIME = "#7FD700";

export default function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedAmount = useMemo(
    () => `₦${Number(receipt.amountPaid ?? 0).toLocaleString()}`,
    [receipt.amountPaid]
  );

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl">
        {/* Gradient frame */}
        <div className="rounded-3xl bg-gradient-to-br from-orange-200/70 via-white to-lime-200/70 p-[1.25px] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
          <div className="relative rounded-3xl bg-white">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 transition hover:bg-white hover:shadow-sm"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header with logo */}
            <div className="px-6 pt-8">
              <div className="mx-auto flex w-full max-w-[220px] items-center justify-center">
                <img
                  src="/afrospook-logo.png"
                  alt="AfroSpook"
                  className="h-14 w-auto object-contain"
                />
              </div>

              <h2 className="mt-3 text-center text-2xl font-bold text-gray-900">
                Ticket Receipt
              </h2>

              {/* Paid badge */}
              <div className="mt-3 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-gray-900"
                  style={{
                    background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Payment Confirmed
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 pt-5">
              {/* Amount + Serial highlight */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-900">{formattedAmount}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="flex items-center justify-between text-xs text-gray-500">
                    <span>Serial Code</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("serial", receipt.serial)}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                      {copiedKey === "serial" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </p>
                  <p
                    className="mt-1 break-all rounded-xl px-3 py-2 text-center text-lg font-bold tracking-wide text-gray-900"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,59,0,0.08), rgba(127,215,0,0.08))",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {receipt.serial}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-5 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                  <DetailRow label="Name" value={receipt.customerName} />
                  <DetailRow label="Date Paid" value={receipt.paidOn} />
                  <DetailRow
                    label="Payment Reference"
                    value={receipt.paymentReference}
                    onCopy={() => handleCopy("paymentRef", receipt.paymentReference)}
                    copied={copiedKey === "paymentRef"}
                  />
                  <DetailRow
                    label="Transaction Reference"
                    value={receipt.transactionReference}
                    onCopy={() => handleCopy("txRef", receipt.transactionReference)}
                    copied={copiedKey === "txRef"}
                  />
                </div>
              </div>

              {/* Note */}
              <p className="mt-4 text-center text-[12px] text-gray-500">
                Please screenshot or save this receipt. You’ll need your{" "}
                <span className="font-semibold text-gray-700">Serial Code</span> at the entrance.
              </p>

              {/* Actions */}
              {!confirmed ? (
                <button
                  onClick={() => setConfirmed(true)}
                  className="mt-6 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition"
                  style={{
                    background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)",
                  }}
                >
                  I’ve Taken a Screenshot
                </button>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={onClose}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white"
                  >
                    Close Receipt
                  </button>
                  <a
                    href={`/receipt?ref=${encodeURIComponent(
                      receipt.paymentReference
                    )}&txref=${encodeURIComponent(receipt.transactionReference)}&amount=${Number(
                      receipt.amountPaid
                    )}`}
                    className="w-full rounded-2xl px-5 py-3.5 text-center text-sm font-semibold text-white shadow-lg transition"
                    style={{
                      background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)",
                    }}
                  >
                    View Full Receipt Page
                  </a>
                </div>
              )}

              {/* Footer stripe */}
              <div
                className="mt-6 h-1 w-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FF3B00 0%, #7FD700 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: rows with optional copy */
function DetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string | number;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="border-b border-gray-200 p-4 last:border-b-0 md:border-b-0 md:border-r">
      <p className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>{label}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        )}
      </p>
      <p className="break-words text-[15px] font-medium text-gray-900">{String(value)}</p>
    </div>
  );
}
