import React, { useState } from 'react';
import { Clock, ChefHat, BellRing, CheckCircle2, Search, ArrowLeft, RefreshCw, XCircle, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { TastyLogo } from './TastyLogo';

interface OrderStatusTrackerProps {
  activeOrder: Order | null;
  onBackToMenu: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  activeOrder,
  onBackToMenu,
  onSelectOrder
}) => {
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setIsSearching(true);
    setLookupError(null);

    try {
      const cleanId = lookupId.trim().toUpperCase();
      const res = await fetch(`/api/orders/${cleanId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found with that reference');
      }

      onSelectOrder(data);
    } catch (err: any) {
      setLookupError(err.message || 'Could not find order. Please check the ID.');
    } finally {
      setIsSearching(false);
    }
  };

  const steps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'received', label: 'Order Received', desc: 'Sent to Stall #4 kitchen', icon: Clock },
    { key: 'preparing', label: 'Preparing Food', desc: 'Chefs are cooking fresh', icon: ChefHat },
    { key: 'ready', label: 'Ready for Collection', desc: 'Pick up at Stall #4 Counter', icon: BellRing },
    { key: 'completed', label: 'Completed', desc: 'Enjoy your delicious food!', icon: CheckCircle2 }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return -1;
    }
  };

  const currentIndex = activeOrder ? getStepIndex(activeOrder.status) : -1;
  const isCancelled = activeOrder?.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Bar with Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-[#FF7700] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF7700]" />
          <span>Back to Digital Menu</span>
        </button>

        <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Stall Monitor
        </span>
      </div>

      {/* Order Lookup Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE4DC] shadow-xs">
        <form onSubmit={handleLookup} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Search order reference (e.g. TFC-2601)"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#DDD6CC] rounded-xl text-[#121214] placeholder:text-neutral-400 focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-[#FF7700] hover:bg-[#E85F00] disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            {isSearching ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {lookupError && (
          <p className="mt-2 text-xs text-red-600 font-medium">{lookupError}</p>
        )}
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          
          {/* Main Status Hero Card */}
          <div className="bg-white text-[#121214] rounded-3xl p-6 sm:p-8 border border-[#EAE4DC] shadow-md relative overflow-hidden">
            
            {/* Header with order number & time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE2]">
              <div className="flex items-start gap-3.5">
                <TastyLogo size="md" />
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E85F00] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7700]" />
                    <span>NCS Porbandar Exhibition 2026 · Stall #4</span>
                  </div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-[#121214] mt-0.5">
                    Order #{activeOrder.id}
                  </h1>
                  <p className="text-xs text-neutral-500 mt-1">
                    Customer: <strong className="text-[#121214]">{activeOrder.customerName}</strong> · Location: <span className="text-[#FF7700] font-bold">{activeOrder.tableOrToken || 'Stall Counter'}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right">
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-bold">
                    <XCircle className="w-4 h-4" /> Cancelled
                  </span>
                ) : activeOrder.status === 'ready' ? (
                  <div className="inline-flex flex-col items-start sm:items-end">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7700] to-[#E85F00] text-white text-xs font-black animate-pulse shadow-md shadow-[#FF7700]/30">
                      <BellRing className="w-4 h-4" /> Ready for Collection!
                    </span>
                    <span className="text-[11px] text-[#E85F00] font-bold mt-1">
                      Please collect from Stall #4 counter now
                    </span>
                  </div>
                ) : activeOrder.status === 'completed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[#E85F00] text-xs font-bold">
                    <Clock className="w-4 h-4 text-[#FF7700] animate-spin" /> In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Payment status banner */}
            <div className="py-4 border-b border-[#F0EBE2] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium">Payment:</span>
                <span className="font-extrabold text-[#121214] uppercase">{activeOrder.paymentMethod}</span>
                <span className="text-neutral-300">·</span>
                {activeOrder.paymentStatus === 'successful' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified & Paid
                  </span>
                ) : activeOrder.paymentStatus === 'submitted' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Stall Admin Approval
                  </span>
                ) : activeOrder.paymentStatus === 'failed' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Payment Unverified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold">
                    Pending at Counter
                  </span>
                )}
              </div>

              <div className="text-xs font-mono">
                <span className="text-neutral-500">Total: </span>
                <span className="text-[#FF7700] font-black text-base">₹{activeOrder.totalAmount}</span>
              </div>
            </div>

            {/* Stepper (4 Stages) */}
            {!isCancelled && (
              <div className="pt-8 pb-4">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-[#EAE4DC] z-0">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7700] to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
                    />
                  </div>

                  {/* Stepper items */}
                  <div className="grid grid-cols-4 gap-2 relative z-10">
                    {steps.map((step, idx) => {
                      const Icon = step.icon;
                      const isPast = idx < currentIndex;
                      const isCurrent = idx === currentIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isPast
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-[#FF7700] text-white ring-4 ring-[#FF7700]/25 shadow-md shadow-[#FF7700]/30'
                                : 'bg-[#FAF6F0] text-neutral-400 border border-[#E0D9CE]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <span
                            className={`mt-2.5 text-xs font-extrabold ${
                              isCurrent
                                ? 'text-[#FF7700]'
                                : isPast
                                ? 'text-[#121214]'
                                : 'text-neutral-400'
                            }`}
                          >
                            {step.label}
                          </span>

                          <span className="hidden sm:block text-[10px] text-neutral-500 mt-0.5 max-w-[100px]">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled notice */}
            {isCancelled && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                <h4 className="font-bold text-sm mb-1 text-red-900">Order Was Cancelled</h4>
                <p>{activeOrder.cancellationReason || 'Please speak to Stall #4 staff if you have any questions.'}</p>
              </div>
            )}

            {/* Special Callout when Ready */}
            {activeOrder.status === 'ready' && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7700]/20 text-[#FF7700] flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#121214]">Your Order is Ready for Collection!</h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Please proceed to <strong>Stall #4 Central Counter</strong> and show order #{activeOrder.id}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Itemized Order Summary */}
          <div className="bg-white text-[#121214] rounded-3xl p-6 border border-[#EAE4DC] shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-base text-[#121214]">
              Items Ordered
            </h3>

            <div className="divide-y divide-[#F0EBE2]">
              {activeOrder.items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-[#FAF5EE] text-[#121214] font-mono font-bold flex items-center justify-center text-[11px] border border-[#E8E2D8]">
                      {it.quantity}×
                    </span>
                    <div>
                      <span className="font-bold text-[#121214] block">{it.name}</span>
                      <span className="text-[11px] text-neutral-500 font-mono">₹{it.unitPrice} each</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#121214] tabular-nums">
                    ₹{it.subtotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#F0EBE2] flex justify-between items-center text-sm font-bold">
              <span className="text-neutral-500">Grand Total</span>
              <span className="font-mono text-xl text-[#FF7700] font-black">
                ₹{activeOrder.totalAmount}
              </span>
            </div>
          </div>

          {/* Quick Collection Help Box */}
          <div className="p-4 bg-white rounded-2xl border border-[#EAE4DC] text-xs text-neutral-600 flex items-center justify-between shadow-2xs">
            <div>
              <span className="font-bold text-[#121214] block">Need assistance?</span>
              <span>Visit Stall #4 at Navy Children's School exhibition grounds or ask our stall crew.</span>
            </div>
            <button
              onClick={onBackToMenu}
              className="px-4 py-2 bg-[#FAF5EE] hover:bg-neutral-100 text-[#121214] rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 border border-[#E5DFD4]"
            >
              Order More
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white text-[#121214] rounded-3xl p-12 text-center border border-[#EAE4DC] shadow-xs">
          <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-[#121214]">No Order Selected</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Place an order from our digital menu, or enter your Order ID above to track the live preparation status.
          </p>
          <button
            onClick={onBackToMenu}
            className="mt-6 px-5 py-2.5 bg-[#FF7700] hover:bg-[#E85F00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Browse Menu & Order
          </button>
        </div>
      )}

    </div>
  );
};
