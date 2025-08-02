"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle, Camera, ArrowRight, Mail, CreditCard,
  Calendar, Hash, Receipt
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const [show, setShow] = useState(false);

  const receiptData = {
    customerName: params.get("name") ?? "Guest",
    amountPaid: Number(params.get("amount") ?? 0),
    paymentReference: params.get("ref") ?? "N/A",
    transactionReference: params.get("txref") ?? "N/A",
    paidOn: params.get("paidOn") ?? new Date().toISOString(),
    serial: params.get("serial") ?? "N/A",
  };

  useEffect(() => {
    setShow(true);
  }, []);

  const handleScreenshotTaken = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start text-sm">
      <div className={`w-full max-w-md transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Success Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-green-700 mt-2">Payment Successful</h1>
          <p className="text-gray-600">Welcome to AfroSpook 2025</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-lg shadow border border-gray-100 px-4 py-6 space-y-4">
          {/* Receipt Header */}
          <div className="text-center mb-2">
            <div className="flex justify-center mb-1">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-800 text-base">AfroSpook 2025 Ticket</h2>
            <p className="text-xs text-gray-500">Halloween Extravaganza</p>
          </div>

          {/* Serial Code */}
          <div className="bg-emerald-100 border border-emerald-300 rounded p-3 text-center">
            <p className="text-xs font-medium text-emerald-700">Your Serial Code</p>
            <p className="text-lg font-bold text-emerald-900 font-mono tracking-wider">{receiptData.serial}</p>
          </div>

          {/* Payment Info */}
          <div className="space-y-2">
            <InfoRow label="Name" value={receiptData.customerName} />
            <InfoRow label="Amount" value={`₦${receiptData.amountPaid.toLocaleString()}`} />
            <InfoRow label="Payment Ref" value={receiptData.paymentReference} />
            <InfoRow label="Transaction Ref" value={receiptData.transactionReference} />
            <InfoRow label="Date" value={new Date(receiptData.paidOn).toLocaleString()} />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 p-3 rounded text-blue-800 text-xs">
            <Mail className="w-4 h-4 mt-[2px]" />
            <p>A copy of this receipt has been sent to the email you provided. Please keep it safe.</p>
          </div>

          {/* Screenshot Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleScreenshotTaken}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto gap-2 text-sm"
            >
              <Camera className="w-4 h-4" />
              I Have Taken Screenshot
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 mt-1">This will take you back to the homepage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-700 border-b border-gray-100 pb-1">
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
