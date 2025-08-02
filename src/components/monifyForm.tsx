// Updated imports
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Shield, X, Lock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { triggerMonnifyPayment } from "@/lib/monify";
import ModalPortal from "./modalPortal";
import ReceiptModal from "./ReceiptModal";
import { useRouter } from "next/navigation";

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
const [showReceipt, setShowReceipt] = useState(false);
const [receiptData, setReceiptData] = useState<any>(null);
const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", email: "", phone: "" });
      setFocusedField(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone || !ticket) {
      alert("All fields are required");
      return;
    }

    setIsLoading(true);

   triggerMonnifyPayment({
  amount: ticket.price,
  customerName: form.name,
  customerEmail: form.email,
  customerPhone: form.phone,
  paymentReference: "REF-" + Date.now(),
  onComplete: (res) => {
  setIsLoading(false);

  if (res.paymentStatus === "PAID" && res.status === "SUCCESS") {
    (async () => {
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
            router.push(`/receipt?name=${encodeURIComponent(form.name)}&amount=${ticket.price}&ref=${res.paymentReference}&txref=${res.transactionReference}&paidOn=${encodeURIComponent(new Date().toLocaleString())}&serial=${data.serial}`);

        } else {
          alert("Payment successful but could not verify.");
          onClose();
        }
      } catch (err) {
        console.error("Verification error:", err);
        alert("Payment succeeded but something went wrong.");
        onClose();
      }
    })();
  } else {
    alert("Payment failed.");
    onClose();
  }
},

  onClose: () => {
    setIsLoading(false);
    console.log("User closed payment");
    onClose();
  },
});
  };

  const isFormValid = form.name && form.email && form.phone;

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <ModalPortal>
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur-xl opacity-20" />
              
              {/* Main modal */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {/* Header gradient */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60" />
                
                {/* Close button */}
                <motion.button 
                  onClick={onClose} 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 shadow-lg text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <div className="relative p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-3 shadow-lg">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Complete Purchase
                    </h2>
                    
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                      <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        ₦{ticket.price.toLocaleString()}
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4 mb-6">
                    {[
                      { name: 'name', placeholder: 'Full Name', type: 'text' },
                      { name: 'email', placeholder: 'Email Address', type: 'email' },
                      { name: 'phone', placeholder: 'Phone Number', type: 'tel' }
                    ].map((field) => (
                      <div key={field.name} className="relative">
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                            focusedField === field.name
                              ? 'border-amber-400 ring-2 ring-amber-100 bg-white/80'
                              : form[field.name as keyof typeof form]
                              ? 'border-green-300 bg-green-50/30'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        />
                        
                        {form[field.name as keyof typeof form] && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Security info */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-800 font-medium">Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">SSL Protected</span>
                    </div>
                  </div>

                  {/* Payment button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isLoading}
                    whileHover={isFormValid && !isLoading ? { scale: 1.02 } : {}}
                    whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
                    className={`relative w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all duration-300 overflow-hidden ${
                      isFormValid && !isLoading
                        ? `bg-gradient-to-r ${ticket.color} hover:shadow-2xl`
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {/* Shine effect */}
                    {isFormValid && !isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Pay Now - ₦{ticket.price.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* Trust indicators */}
                  <div className="flex justify-center items-center space-x-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <span>Instant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
                <ReceiptModal
  isOpen={showReceipt}
  onClose={() => setShowReceipt(false)}
  receipt={receiptData}
/>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}