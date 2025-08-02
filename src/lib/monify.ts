// lib/monnify.ts
declare global {
  interface Window {
    MonnifySDK: any;
  }
}

interface MonnifyPaymentParams {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentReference: string;
  onComplete: (response: any) => void;
  onClose: () => void;
}

export const triggerMonnifyPayment = ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  paymentReference,
  onComplete,
  onClose,
}: MonnifyPaymentParams) => {
  if (!window.MonnifySDK) {
    alert("Monnify SDK not loaded yet.");
    return;
  }

  window.MonnifySDK.initialize({
    amount,
    currency: "NGN",
    reference: paymentReference,
    customerName,
    customerEmail,
    customerPhoneNumber: customerPhone,
    apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY!,
    contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE!,
    paymentDescription: "Ticket Payment",
    isTestMode: true,
    onComplete,
    onClose,
  });
};
