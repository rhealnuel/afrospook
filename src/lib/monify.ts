// lib/monnify.ts
declare global {
  interface Window {
    MonnifySDK?: any;
  }
}

export type MonnifyPaymentParams = {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentReference: string;

  // ✅ Mobile fallback: Monnify will redirect here even if onComplete doesn't fire
  redirectUrl?: string;

  // Optional extras
  metadata?: Record<string, any>;
  paymentMethods?: Array<"CARD" | "ACCOUNT_TRANSFER" | "USSD" | string>;

  onComplete: (response: any) => void;
  onClose: () => void;
};

const API_KEY = process.env.NEXT_PUBLIC_MONNIFY_API_KEY!;
const CONTRACT_CODE = process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE!;
const TEST_MODE =
  (process.env.NEXT_PUBLIC_MONNIFY_TEST_MODE ?? "true").toLowerCase() === "true";

export const triggerMonnifyPayment = ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  paymentReference,
  redirectUrl,
  metadata,
  paymentMethods,
  onComplete,
  onClose,
}: MonnifyPaymentParams) => {
  if (typeof window === "undefined" || !window.MonnifySDK) {
    alert("Monnify SDK not loaded yet.");
    return;
  }

  // Base payload (Monnify expects `reference`)
  const initPayload: any = {
    amount,
    currency: "NGN",
    reference: paymentReference,
    customerName,
    customerEmail,
    customerPhoneNumber: customerPhone,
    apiKey: API_KEY,
    contractCode: CONTRACT_CODE || "0842442340",
    paymentDescription: "Ticket Payment",
    isTestMode: TEST_MODE,
    onComplete,
    onClose,
  };

  // Optional: accepted methods
  if (paymentMethods && paymentMethods.length) {
    initPayload.paymentMethods = paymentMethods;
  }

  // Optional: metadata
  if (metadata) {
    initPayload.metadata = metadata;
  }

  // ✅ Mobile fallback redirect (support both key styles just in case)
  if (redirectUrl) {
    initPayload.redirectUrl = redirectUrl;
    initPayload.redirect_url = redirectUrl;
  }

  window.MonnifySDK.initialize(initPayload);
};
