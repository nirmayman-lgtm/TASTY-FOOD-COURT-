import React, { useState } from 'react';
import { 
  Clock, 
  ChefHat, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Check, 
  AlertTriangle,
  User,
  CreditCard,
  Banknote,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface KDSViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<void>;
  onApprovePayment: (orderId: string) => Promise<void>;
  onRejectPayment: (orderId: string, reason?: string) => Promise<void>;
}

export const KDSView: React.FC<KDSViewProps> = ({
  orders,
  onUpdateStatus,
  onApprovePayment,
  onRejectPayment
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'received' | 'preparing' | 'ready' | 'completed'>('all');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Out of stock / ingredient finished');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment not received in FamPay (7016321005@fam)');

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return o.paymentMethod === 'upi' && o.paymentStatus !== 'successful';
    return o.status === filter;
  });

  const handlePrintSlip = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'preparing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ready':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 animate-pulse';
      case 'completed':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const elapsedSecs = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (elapsedSecs < 60) return `${elapsedSecs}s ago`;
    const mins = Math.floor(elapsedSecs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const pendingPaymentsCount = orders.filter(o => o.paymentMethod === 'upi' && o.paymentStatus !== 'successful' && o.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1E] p-4 rounded-2xl border border-neutral-800">
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-neutral-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Orders ({orders.length})
          </button>

          {/* Pending Approval Filter */}
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filter === 'unpaid' ? 'bg-amber-500 text-black shadow-xs font-bold' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Needs Verification ({pendingPaymentsCount})</span>
          </button>

          <button
            onClick={() => setFilter('received')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'received' ? 'bg-neutral-700 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Received ({orders.filter(o => o.status === 'received').length})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'preparing' ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Preparing ({orders.filter(o => o.status === 'preparing').length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'ready' ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Ready ({orders.filter(o => o.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'completed' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Completed ({orders.filter(o => o.status === 'completed').length})
          </button>
        </div>

        {/* Legend */}
        <div className="text-xs text-neutral-400 hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live KDS · Check FamPay (7016321005@fam) before approving</span>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#1A1A1E] rounded-3xl p-16 text-center border border-neutral-800">
          <ChefHat className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Orders In This Queue</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            When customers place orders from their phones, they will appear here instantly with sound alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const isUpi = order.paymentMethod === 'upi';
            const isPaid = order.paymentStatus === 'successful';
            const isPaymentSubmitted = order.paymentStatus === 'submitted';
            const isPaymentPending = order.paymentStatus === 'pending';
            const isUnapprovedUpi = isUpi && !isPaid;

            return (
              <div
                key={order.id}
                className={`flex flex-col bg-[#1A1A1E] rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isUnapprovedUpi
                    ? 'border-amber-500/70 ring-2 ring-amber-500/20'
                    : order.status === 'ready'
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : order.status === 'received'
                    ? 'border-[#FF6A00]/60 ring-1 ring-[#FF6A00]/20'
                    : 'border-neutral-800'
                }`}
              >
                {/* Order Card Header */}
                <div className="p-4 bg-black/40 border-b border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-white">
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {getTimeAgo(order.createdAt)}
                    </span>
                  </div>

                  {/* Print Button */}
                  <button
                    onClick={() => handlePrintSlip(order)}
                    title="Print KOT Slip"
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer & Location */}
                <div className="px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800/60 flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{order.customerName}</span>
                  </div>
                  <span className="font-mono text-amber-300 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded">
                    {order.tableOrToken || 'Stall Counter'}
                  </span>
                </div>

                {/* Cooking / Chef Notes */}
                {order.notes && (
                  <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 font-medium">
                    Note: "{order.notes}"
                  </div>
                )}

                {/* Items List */}
                <div className="p-4 flex-1 space-y-2 overflow-y-auto max-h-56">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-800/40 last:border-none">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-white bg-neutral-800 px-2 py-0.5 rounded">
                          {it.quantity}x
                        </span>
                        <span className="font-medium text-neutral-200">{it.name}</span>
                      </div>
                      <span className="font-mono tabular-nums text-neutral-400">
                        ₹{it.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* PAYMENT VERIFICATION CONTROL PANEL (FOR UPI ORDERS) */}
                {isUpi && isUnapprovedUpi && (
                  <div className="p-3.5 bg-amber-500/15 border-t border-b border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>{isPaymentSubmitted ? 'Customer Sent Payment' : 'Payment Awaiting Approval'}</span>
                      </span>
                      <span className="text-xs font-mono font-bold bg-amber-400 text-black px-2 py-0.5 rounded">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    {order.customerUtr && (
                      <div className="text-[11px] text-neutral-200 bg-black/60 p-2 rounded-lg font-mono flex items-center justify-between">
                        <span className="text-neutral-400">Customer UTR:</span>
                        <strong className="text-amber-300">{order.customerUtr}</strong>
                      </div>
                    )}

                    <p className="text-[11px] text-neutral-300 leading-tight">
                      Confirm you received <strong className="text-white">₹{order.totalAmount}</strong> in FamPay (<strong className="text-amber-300 font-mono">7016321005@fam</strong>).
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={async () => {
                          setApprovingOrderId(order.id);
                          await onApprovePayment(order.id);
                          setApprovingOrderId(null);
                        }}
                        disabled={approvingOrderId === order.id}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{approvingOrderId === order.id ? 'Approving...' : 'Approve Payment'}</span>
                      </button>

                      <button
                        onClick={() => setRejectingOrderId(order.id)}
                        className="py-2.5 px-3 bg-neutral-800 hover:bg-red-900/60 text-red-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border border-neutral-700"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Not Received</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved Payment Banner */}
                {isUpi && isPaid && (
                  <div className="px-4 py-2 bg-emerald-500/10 border-t border-emerald-500/20 text-xs text-emerald-300 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment Verified by Admin</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400/80">
                      {order.paymentTxnId || 'APPROVED'}
                    </span>
                  </div>
                )}

                {/* Payment & Total Banner */}
                <div className="px-4 py-2.5 bg-black/50 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isUpi ? (
                      <CreditCard className="w-3.5 h-3.5 text-[#FF6A00]" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="uppercase font-semibold text-neutral-400 text-[11px]">
                      {order.paymentMethod} ·
                    </span>
                    <span className={`font-bold text-[11px] ${
                      isPaid 
                        ? 'text-emerald-400' 
                        : isPaymentSubmitted 
                        ? 'text-amber-300 animate-pulse' 
                        : 'text-amber-400'
                    }`}>
                      {order.paymentStatus === 'submitted' ? 'SUBMITTED (WAITING APPROVAL)' : order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-base font-bold text-white">
                    ₹{order.totalAmount}
                  </div>
                </div>

                {/* Action Controls Workflow */}
                <div className="p-3 bg-neutral-900/90 border-t border-neutral-800/90 grid grid-cols-2 gap-2">
                  
                  {/* If UPI payment is still unapproved, prevent cooking until approved */}
                  {isUnapprovedUpi && (
                    <div className="col-span-2 py-2 px-3 bg-black/40 rounded-xl text-center text-xs text-amber-300/80 font-medium border border-amber-500/20">
                      🔒 Approve payment above to accept order for kitchen
                    </div>
                  )}

                  {/* Normal flow when payment is approved or cash */}
                  {(!isUnapprovedUpi || !isUpi) && (
                    <>
                      {order.status === 'received' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'preparing')}
                          className="col-span-2 py-2.5 px-3 bg-[#FF6A00] hover:bg-[#E05200] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Accept & Start Cooking</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'ready')}
                          className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <BellRing className="w-4 h-4" />
                          <span>Mark Ready for Collection</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, 'completed')}
                          className="col-span-2 py-2.5 px-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Hand Over & Complete</span>
                        </button>
                      )}
                    </>
                  )}

                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => setCancellingOrderId(order.id)}
                      className="col-span-2 py-1 text-[11px] text-red-400/80 hover:text-red-400 transition-colors cursor-pointer text-center"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <div className="col-span-2 py-1.5 text-center text-xs text-neutral-500 font-medium flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Order Completed</span>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="col-span-2 py-1 text-center text-xs text-red-400 font-medium">
                      Cancelled {order.cancellationReason && `(${order.cancellationReason})`}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1E] text-white rounded-2xl max-w-sm w-full p-6 border border-neutral-700 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Reject Payment for #{rejectingOrderId}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Reason for Payment Rejection
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              >
                <option value="Payment not received in FamPay (7016321005@fam)">Payment not received in FamPay (7016321005@fam)</option>
                <option value="Incorrect transfer amount">Incorrect transfer amount</option>
                <option value="Invalid UTR / Transaction reference">Invalid UTR / Transaction reference</option>
                <option value="Transaction failed on customer bank">Transaction failed on customer bank</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  await onRejectPayment(rejectingOrderId, rejectionReason);
                  setRejectingOrderId(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejectingOrderId(null)}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1E] text-white rounded-2xl max-w-sm w-full p-6 border border-neutral-700 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cancel Order #{cancellingOrderId}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Select Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              >
                <option value="Out of stock / ingredient finished">Out of stock / ingredient finished</option>
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Payment not received">Payment not received</option>
                <option value="Duplicate order submitted">Duplicate order submitted</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onUpdateStatus(cancellingOrderId, 'cancelled', cancelReason);
                  setCancellingOrderId(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable KOT */}
      {printingOrder && (
        <div className="print-only p-4 font-mono text-black text-xs max-w-xs">
          <div className="text-center pb-2 border-b border-black">
            <div className="font-bold text-base">TASTY FOOD COURT</div>
            <div>NCS Porbandar Exhibition 2026</div>
            <div className="mt-1 font-bold text-lg">ORDER #{printingOrder.id}</div>
            <div>{printingOrder.tableOrToken || 'Stall Counter'}</div>
          </div>

          <div className="py-2 border-b border-black text-[11px]">
            <div>Customer: {printingOrder.customerName}</div>
            <div>Time: {new Date(printingOrder.createdAt).toLocaleTimeString()}</div>
            {printingOrder.customerUtr && <div>UTR: {printingOrder.customerUtr}</div>}
            {printingOrder.notes && <div>NOTE: {printingOrder.notes}</div>}
          </div>

          <div className="py-2 border-b border-black space-y-1">
            {printingOrder.items.map((it, i) => (
              <div key={i} className="flex justify-between font-bold">
                <span>{it.quantity}x {it.name}</span>
                <span>₹{it.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <div className="font-bold text-sm">TOTAL: ₹{printingOrder.totalAmount}</div>
            <div className="text-[10px] mt-1">{printingOrder.paymentMethod.toUpperCase()} ({printingOrder.paymentStatus})</div>
          </div>
        </div>
      )}

    </div>
  );
};
