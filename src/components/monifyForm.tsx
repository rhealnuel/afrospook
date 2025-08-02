"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { triggerMonnifyPayment } from "@/lib/monify";
import ModalPortal from "./modalPortal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: number;
    name: string;
    price: number;
    color: string;
  } | null;
}

export default function PaymentModal({ isOpen, onClose, ticket }: PaymentModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", email: "", phone: "" });
      setFocusedField(null);
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = form.name && form.email && form.phone;

  const handleVerifyPayment = async (res: any) => {
    setIsVerifying(true);
    try {
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionReference: res.transactionReference,
          paymentReference: res.paymentReference,
          amountPaid: res.amountPaid,
          customerName: res.customerName,
          customerEmail: res.customerEmail,
          paidOn: res.paidOn,
          raw: res,
        }),
      });

      const data = await verifyRes.json();

      if (data.success) {
        window.location.href =
          `/receipt?name=${encodeURIComponent(form.name)}&amount=${ticket?.price}&ref=${res.paymentReference}&txref=${res.transactionReference}&paidOn=${encodeURIComponent(new Date().toLocaleString())}&serial=${data.serial}`
        
      } else {
        alert("Payment verified, but receipt failed.");
        onClose();
      }
    } catch (error) {
      console.error("Verification failed", error);
      alert("Something went wrong while verifying payment.");
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid || !ticket) {
      alert("Please fill all fields.");
      return;
    }

    setIsLoading(true);

    triggerMonnifyPayment({
      amount: ticket.price,
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      paymentReference: "REF-" + Date.now(),
      onComplete: (res: any) => {
        setIsLoading(false);

        if (res.paymentStatus === "PAID" && res.status === "SUCCESS") {
          handleVerifyPayment(res); // Run async logic separately
        } else {
          alert("Payment failed.");
          onClose();
        }
      },
      onClose: () => {
        setIsLoading(false);
        console.log("User closed Monnify modal.");
        onClose();
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <ModalPortal>
          <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-lg text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-3 shadow-lg">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Purchase</h2>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ₦{ticket.price.toLocaleString()}
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {["name", "email", "phone"].map((field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field === "name" ? "Full Name" : field === "email" ? "Email Address" : "Phone Number"}
                      value={form[field as keyof typeof form]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 bg-white/60 border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isLoading || isVerifying}
                  whileHover={isFormValid && !isLoading && !isVerifying ? { scale: 1.02 } : {}}
                  whileTap={isFormValid && !isLoading && !isVerifying ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 ${
                    isFormValid && !isLoading && !isVerifying
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-2xl"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {(isLoading || isVerifying) ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>{isVerifying ? "Verifying..." : "Processing..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Now - ₦{ticket.price.toLocaleString()}</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
