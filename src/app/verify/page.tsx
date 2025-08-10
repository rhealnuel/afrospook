'use client';
import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  XCircle,
  ScanSearch,
  Info,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import Modal from '@/components/Modal';

const ORANGE = '#FF3B00';
const LIME = '#B6FF00';
const SERIAL_REGEX = /^[A-Z0-9]{6}$/; // e.g. Q5JAAG

export default function VerifySerialPage() {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sanitizedSerial = useMemo(() => {
    // Uppercase, allow only A-Z/0-9, clamp to 6 chars
    return serial.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  }, [serial]);

  const isValid = SERIAL_REGEX.test(sanitizedSerial);

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      setError('Serial must be 6 characters (A–Z, 0–9), e.g. Q5JAAG.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('/api/verify-serial', { serial: sanitizedSerial });
      setResult(res.data);
      setOpen(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }, [isValid, sanitizedSerial]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Frame */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-200/70 via-white to-lime-200/70 p-[1px] shadow">
          <div className="rounded-2xl bg-white p-6 md:p-7">
            {/* Logo + Title */}
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 flex h-12 w-36 items-center justify-center rounded-lg bg-black p-2">
                <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200">
                <ScanSearch className="w-6 h-6" style={{ color: ORANGE }} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Ticket Verification</h1>
              <p className="text-gray-600 text-xs mt-1">
                Enter your 6-character serial to confirm authenticity.
              </p>
            </div>

            {/* Input */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={sanitizedSerial}
                  onChange={(e) => setSerial(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Q5J***"
                  className={`w-full rounded-xl border px-4 py-3 text-lg tracking-widest font-mono outline-none transition
                    ${error ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20'}`}
                  maxLength={6}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                />
                {/* Validity dot */}
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full
                    ${isValid ? 'bg-lime-500' : 'bg-gray-300'}`}
                />
              </div>

              <div className="flex items-start gap-2 text-[11px] text-gray-600">
                <Info className="h-3.5 w-3.5" />
                <p>
                  Format: <span className="font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-200">Q5J***</span> — letters & numbers only.
                </p>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || !isValid}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF3B00] to-[#B6FF00] text-white font-semibold py-3 transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>Verify Serial</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Venue */}
        <p className="mt-3 text-center text-[11px] text-gray-500">Venue: Elegushi Beach, Lagos</p>
      </div>

      {/* Result Modal */}
      {open && result && (
        <Modal onClose={() => setOpen(false)}>
          {result.success ? (
            <div className="text-center">
              {/* Logo on black for contrast */}
              <div className="mx-auto mb-3 flex h-10 w-28 items-center justify-center rounded-md bg-black p-1.5">
                <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
              </div>

              <CheckCircle className="text-green-600 w-10 h-10 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-green-700 mb-2">Payment Verified</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-2 text-sm text-gray-800">
                <Row label="Name" value={result.customerName} />
                <Row label="Amount Paid" value={`₦${Number(result.amountPaid).toLocaleString()}`} />
                <Row
                  label="Serial"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-base">{result.serial}</span>
                      <button
                        onClick={() => copyToClipboard(result.serial)}
                        className="inline-flex items-center justify-center rounded border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50"
                        title="Copy serial"
                      >
                        {copied ? <Check className="h-4 w-4 text-lime-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </span>
                  }
                />
              </div>

              <p className="mt-3 text-[11px] text-gray-600">Show this serial at the entrance.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-28 items-center justify-center rounded-md bg-black p-1.5">
                <img src="/afrospook-logo.png" alt="AfroSpook" className="h-full w-auto object-contain" />
              </div>

              <XCircle className="text-red-500 w-10 h-10 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-red-700 mb-2">Payment Not Found</h2>
              <p className="text-gray-600 text-sm">
                No record found for serial <strong>{sanitizedSerial}</strong>.
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/** Small label/value row for the modal */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
