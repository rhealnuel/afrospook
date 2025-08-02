'use client';
import { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, ScanSearch } from 'lucide-react';
import Modal from '@/components/Modal';

export default function VerifySerialPage() {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!serial.trim()) {
      setError('Please enter a valid serial code.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('/api/verify-serial', { serial });
      setResult(res.data);
      setOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 border border-amber-200">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <ScanSearch className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Ticket Verification
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Enter your 6-character serial code to confirm your ticket.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            maxLength={6}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Verifying...' : 'Verify Serial'}
          </button>
        </div>
      </div>

      {open && result && (
        <Modal onClose={() => setOpen(false)}>
          {result.success ? (
            <div className="text-center">
              <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-green-700 mb-2">Payment Verified</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {result.customerName}</p>
                <p><strong>Amount Paid:</strong> ₦{Number(result.amountPaid).toLocaleString()}</p>
                <p><strong>Serial:</strong> <span className="font-mono text-base">{result.serial}</span></p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="text-red-500 w-12 h-12 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-red-700 mb-2">Payment Not Found</h2>
              <p className="text-gray-600 text-sm">No record found for serial <strong>{serial}</strong>.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
