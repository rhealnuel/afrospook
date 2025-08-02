// components/ReceiptModal.tsx
"use client";
import { useState } from "react";
import { X } from "lucide-react";

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

export default function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-center mb-4 text-amber-600">🎉 Ticket Receipt</h2>

        <div className="text-sm text-gray-800 space-y-2 border p-4 rounded-lg bg-gray-50">
          <p><strong>Name:</strong> {receipt.customerName}</p>
          <p><strong>Amount Paid:</strong> ₦{receipt.amountPaid}</p>
          <p><strong>Payment Ref:</strong> {receipt.paymentReference}</p>
          <p><strong>Transaction Ref:</strong> {receipt.transactionReference}</p>
          <p><strong>Date Paid:</strong> {receipt.paidOn}</p>
          <p>
            <strong>Serial Code:</strong>{" "}
            <span className="text-red-600 font-bold text-lg tracking-wide">{receipt.serial}</span>
          </p>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          📸 Please screenshot this receipt for your records.
        </p>

        <button
          onClick={() => setConfirmed(true)}
          className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold"
        >
          I’ve Taken Screenshot
        </button>

        {confirmed && (
          <button
            onClick={onClose}
            className="w-full mt-3 border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Close Receipt
          </button>
        )}
      </div>
    </div>
  );
}
