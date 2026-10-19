import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Landmark, 
  Radio,
  Clock,
  Send,
  XCircle
} from 'lucide-react';
import { Order, StallSettings } from '../types';
import { TastyLogo } from './TastyLogo';

interface PaymentModalProps {
  order: Order;
  settings: StallSettings;
  isOpen: boolean;
  onClose: () => void;
  onPaymentVerified: (updatedOrder: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onPaymentVerified
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'famx' | 'bank'>('famx');
  const [utrInput, setUtrInput] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const upiId = settings.upiId || '7016321005@fam';

  // Standard UPI URI format accepted by Google Pay, PhonePe, Paytm, BHIM, FamPay
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(settings.merchantName || settings.stallName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${order.id}`)}`;

  const isSubmitted = order.paymentStatus === 'submitted';
  const isApproved = order.paymentStatus === 'successful';
  const isFailed = order.paymentStatus === 'failed';

  // Generate QR
  useEffect(() => {
    if (isOpen && order.paymentMethod === 'upi') {
      QRCode.toDataURL(upiUrl, {
        width: 340,
        margin: 2,
        color: {
          dark: '#161517',
          light: '#F6F0EA'
        },
        errorCorrectionLevel: 'H'
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate UPI QR code', err));
    }
  }, [isOpen, order.id, order.paymentMethod, order.totalAmount, upiUrl]);

  // When order payment is approved by admin via SSE, trigger success callback
  useEffect(() => {
    if (isApproved) {
      const timer = setTimeout(() => {
        onPaymentVerified(order);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isApproved, order, onPaymentVerified]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProof(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: utrInput.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment verification request');
      }

      // Order status updated on server; SSE will also notify
    } catch (err: any) {
      setSubmitError(err.message || 'Error notifying stall admin. Please try again.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121215] text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-800">
        
        {/* Top Header */}
        <div className="bg-[#18181D] px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TastyLogo size="sm" />
            <div>
              <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">UPI Checkout</span>
              <h3 className="font-display font-bold text-base text-white">
                Order #{order.id}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-medium text-neutral-400 block uppercase">Amount to Pay</span>
            <span className="font-mono tabular-nums text-xl font-black text-[#FF7700]">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {order.paymentMethod === 'upi' ? (
            <>
              {/* STATE 1: APPROVED BY ADMIN (CELEBRATION SUCCESS) */}
              {isApproved ? (
                <div className="py-8 px-4 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white">
                      Payment Approved by Stall Admin!
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto leading-relaxed">
                      Your payment of <strong className="text-white">₹{order.totalAmount}</strong> has been verified. The kitchen is now preparing your food.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified & Confirmed</span>
                  </div>
                </div>
              ) : isSubmitted ? (
                /* STATE 2: WAITING FOR ADMIN APPROVAL (RADAR / LIVE LISTENER) */
                <div className="bg-[#18181D] rounded-2xl p-6 border border-neutral-800 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#FF6A00]/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/40 flex items-center justify-center text-[#FF6A00]">
                      <Radio className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-2">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Awaiting Admin Approval</span>
                    </div>

                    <h4 className="font-display font-bold text-lg text-white">
                      Payment Submitted to Stall #4
                    </h4>

                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                      Our team at Stall #4 is confirming receipt of <strong className="text-white font-mono">₹{order.totalAmount}</strong> in FamPay (<strong className="text-amber-300 font-mono">{upiId}</strong>).
                    </p>

                    {order.customerUtr && (
                      <p className="text-[11px] text-neutral-400 font-mono mt-1">
                        Submitted UTR: <span className="text-white">{order.customerUtr}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-neutral-800 text-xs text-neutral-400 text-left space-y-1">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Live Real-Time Sync</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      You do not need to refresh. As soon as the stall manager approves your payment on their laptop, this screen will advance automatically!
                    </p>
                  </div>

                  {isFailed && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs">
                      Payment was rejected: {order.paymentRejectionReason || 'Not received in stall account'}. Please check with Stall #4 counter.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close & Keep Tracking in Background
                  </button>
                </div>
              ) : (
                /* STATE 3: CUSTOMER SCANS QR AND SUBMITS PAYMENT */
                <>
                  {/* FamX Scanner Card */}
                  <div className="bg-gradient-to-b from-[#1E1E24] via-[#16161A] to-[#0E0E11] rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-xl flex flex-col items-center relative overflow-hidden">
                    
                    {/* Floating graphic accents in corners */}
                    <div className="absolute top-2 left-2 text-emerald-500/20 text-xs font-mono font-bold select-none pointer-events-none">
                      ₹ 100
                    </div>
                    <div className="absolute bottom-16 right-3 text-amber-500/20 text-xs font-mono font-bold select-none pointer-events-none">
                      ₹ 500
                    </div>

                    {/* FamX / Bank Segmented Toggle Header */}
                    <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-full border border-neutral-700/80 mb-4 z-10">
                      <button
                        type="button"
                        onClick={() => setActiveTab('famx')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTab === 'famx'
                            ? 'bg-[#2A2A32] text-white shadow-sm border border-neutral-600'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#E58A1F] fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 12c4-1 7.5-5 11-10 1 4 2.5 7.5 8 9-5 2-7.5 5.5-9 11-1.5-5-4.5-8.5-10-10z" />
                        </svg>
                        <span>FamX</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('bank')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTab === 'bank'
                            ? 'bg-[#2A2A32] text-white shadow-sm border border-neutral-600'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Bank</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </button>
                    </div>

                    {/* QR Code Container with Central FamX Bird Insignia */}
                    <div className="relative p-2.5 bg-[#F6F0EA] rounded-2xl border-2 border-neutral-700 shadow-2xl z-10">
                      {qrDataUrl ? (
                        <div className="relative">
                          <img 
                            src={qrDataUrl} 
                            alt="FamX UPI QR Scanner" 
                            className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-xl"
                          />
                          {/* Central FamX Emblem */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-[#D97D1A] border-2 border-[#F6F0EA] flex items-center justify-center shadow-lg">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 12c4-1 7.5-5 11-10 1 4 2.5 7.5 8 9-5 2-7.5 5.5-9 11-1.5-5-4.5-8.5-10-10z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center text-neutral-600">
                          <Loader2 className="w-8 h-8 animate-spin text-[#FF6A00]" />
                        </div>
                      )}
                    </div>

                    {/* Bottom UPI ID Capsule */}
                    <div className="mt-4 flex items-center gap-2 z-10 w-full justify-center">
                      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-black/70 hover:bg-black/90 border border-neutral-700 rounded-full text-xs font-mono text-white transition-colors">
                        <span className="font-bold tracking-wide">{upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 hover:text-[#FF6A00] transition-colors cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-300" />}
                        </button>
                      </div>

                      <a
                        href={upiUrl}
                        className="p-2.5 bg-black/70 hover:bg-black/90 border border-neutral-700 rounded-full text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Pay via UPI App"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {copied && (
                      <span className="text-[11px] text-emerald-400 font-semibold mt-1.5 animate-pulse">
                        UPI ID copied to clipboard!
                      </span>
                    )}
                  </div>

                  {/* Tap to Pay Direct Link for Mobile */}
                  <div className="w-full">
                    <a
                      href={upiUrl}
                      className="w-full py-3 px-4 bg-[#FF6A00] hover:bg-[#E05200] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Tap to Open GPay / PhonePe / Paytm / FamPay</span>
                    </a>
                  </div>

                  {/* Customer Payment Submission Form */}
                  <form onSubmit={handleSubmitPaymentProof} className="bg-[#18181D] p-4 rounded-2xl border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Confirm Transfer to Stall Admin
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Admin Approval Required
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      After sending <strong className="text-white">₹{order.totalAmount}</strong> to <strong className="text-amber-300 font-mono">{upiId}</strong>, click below. Our stall manager will verify the funds and approve your order.
                    </p>

                    <div>
                      <input
                        type="text"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="UPI Ref / UTR / Last 4 digits (optional)"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00] placeholder:text-neutral-500"
                      />
                    </div>

                    {submitError && (
                      <div className="p-2 bg-red-500/20 text-red-300 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingProof}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmittingProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting to Stall Admin...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>I Have Sent Payment (Submit for Admin Approval)</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            /* Cash on Collection Selected */
            <div className="bg-[#18181D] p-6 rounded-2xl border border-neutral-800 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-white">Cash on Collection Selected</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Please keep exact cash of <strong className="font-mono text-white">₹{order.totalAmount}</strong> ready at Stall #4 Counter.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#FF6A00] hover:bg-[#E05200] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Track My Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
