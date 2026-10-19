import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Banknote, QrCode, AlertCircle, ShoppingBag } from 'lucide-react';
import { MenuItem, OrderItem, PaymentMethod, StallSettings } from '../types';
import { TastyLogo } from './TastyLogo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [itemId: string]: number };
  menu: MenuItem[];
  settings: StallSettings;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  menu,
  settings,
  onUpdateQuantity,
  onClearCart,
  onOrderSuccess
}) => {
  const [customerName, setCustomerName] = useState('');
  const [tableOrToken, setTableOrToken] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build itemized list
  const cartItems: OrderItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = menu.find(m => m.id === id);
      if (!item) return null;
      return {
        menuItemId: item.id,
        name: item.name,
        quantity: qty,
        unitPrice: item.price,
        subtotal: item.price * qty
      };
    })
    .filter((x): x is OrderItem => x !== null);

  const subtotal = cartItems.reduce((acc, it) => acc + it.subtotal, 0);
  const total = subtotal;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name to place the order.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items from the menu first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          tableOrToken: tableOrToken.trim() || 'Stall Counter',
          customerPhone: customerPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          items: cartItems,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      onClearCart();
      onClose();
      onOrderSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside className="w-screen max-w-md bg-[#FAF7F2] text-[#121214] shadow-2xl flex flex-col h-full border-l border-[#EAE4DC]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE4DC] bg-white">
            <div className="flex items-center gap-3">
              <TastyLogo size="sm" />
              <div>
                <h2 className="font-display font-extrabold text-base text-[#121214]">Your Order Cart</h2>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)} item(s) selected
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Ordering paused alert */}
            {!settings.isOrderingActive && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium leading-relaxed">
                Stall online ordering is temporarily paused by the manager. You can still order directly at Stall #4 counter.
              </div>
            )}

            {/* Empty cart state */}
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#E8E2D8] flex items-center justify-center mx-auto text-neutral-400">
                  <ShoppingBag className="w-8 h-8 text-[#FF7700]" />
                </div>
                <h3 className="font-display font-bold text-base text-[#121214]">Your Cart is Empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Add some delicious treats from our menu, like the signature Oreo Dream Shake or Veggie Blast Pizza!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-5 py-2.5 bg-[#FF7700] hover:bg-[#E85F00] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider pb-1">
                  <span>Selected Dishes</span>
                  <button
                    onClick={onClearCart}
                    className="text-neutral-400 hover:text-red-600 transition-colors text-[11px] font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Item cards */}
                {cartItems.map(item => (
                  <div
                    key={item.menuItemId}
                    className="p-3.5 bg-white rounded-xl border border-[#EAE4DC] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-extrabold text-sm text-[#121214] truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-neutral-500">
                          ₹{item.unitPrice} × {item.quantity}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs font-mono font-bold text-[#FF7700]">
                          ₹{item.subtotal}
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Trash */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-[#FAF6F0] border border-[#E5DFD4] rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-black rounded hover:bg-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums text-xs font-black w-5 text-center text-[#121214]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-white bg-[#FF7700] hover:bg-[#E85F00] rounded transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, 0)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Checkout Form */}
            {cartItems.length > 0 && (
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-[#EAE4DC]">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  Delivery & Contact Details
                </span>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Your Name <span className="text-[#FF7700]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Nirmay Mandaviya"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DDD6CC] rounded-xl text-[#121214] placeholder:text-neutral-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]"
                  />
                </div>

                {/* Table or Token */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Table / Token No.
                    </label>
                    <input
                      type="text"
                      value={tableOrToken}
                      onChange={(e) => setTableOrToken(e.target.value)}
                      placeholder="e.g. Table 4 / Token"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DDD6CC] rounded-xl text-[#121214] placeholder:text-neutral-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Mobile No. <span className="text-neutral-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="For order SMS/call"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DDD6CC] rounded-xl text-[#121214] placeholder:text-neutral-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]"
                    />
                  </div>
                </div>

                {/* Kitchen Preparation Notes */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Kitchen Note <span className="text-neutral-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra spicy, extra chilled shake..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DDD6CC] rounded-xl text-[#121214] placeholder:text-neutral-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Select Payment Method
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* UPI Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        paymentMethod === 'upi'
                          ? 'bg-orange-50/80 border-[#FF7700] text-[#121214] shadow-xs'
                          : 'bg-white border-[#EAE4DC] text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <QrCode className={`w-4 h-4 ${paymentMethod === 'upi' ? 'text-[#FF7700]' : 'text-neutral-400'}`} />
                        <span className="text-[10px] font-bold text-[#E85F00] uppercase">Recommended</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#121214]">UPI Payment</div>
                        <div className="text-[10px] text-neutral-500">GPay, PhonePe, Paytm, QR</div>
                      </div>
                    </button>

                    {/* Cash Option */}
                    <button
                      type="button"
                      disabled={!settings.isCashAllowed}
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        !settings.isCashAllowed
                          ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-[#EAE4DC]'
                          : paymentMethod === 'cash'
                          ? 'bg-orange-50/80 border-[#FF7700] text-[#121214] shadow-xs'
                          : 'bg-white border-[#EAE4DC] text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Banknote className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-[#FF7700]' : 'text-neutral-400'}`} />
                        <span className="text-[10px] text-neutral-500">Counter</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#121214]">Cash at Stall</div>
                        <div className="text-[10px] text-neutral-500">Pay cash at Stall #4</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Important Stall Verification Note */}
                <div className="p-3 bg-[#FAF5EE] rounded-xl border border-[#E8E2D8] text-[11px] text-neutral-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Orders are verified by Stall #4 admin before preparation starts to ensure authentic kitchen workflow.
                  </span>
                </div>
              </form>
            )}

          </div>

          {/* Footer: Price Summary & Place Order CTA */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#EAE4DC] bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#121214] font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stall Exhibition Service</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#121214] pt-2 border-t border-[#F0EBE2]">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-xl font-black text-[#FF7700]">
                    ₹{total}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !settings.isOrderingActive}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF7700] to-[#E85F00] hover:from-[#FF851A] hover:to-[#F26500] disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-[#FF7700]/25 transition-all duration-150 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <span>Place Order (₹{total})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
};
