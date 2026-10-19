import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  Flame, 
  MapPin, 
  Clock, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  QrCode,
  UtensilsCrossed,
  CheckCircle2,
  ChevronRight,
  Star,
  ShoppingBag
} from 'lucide-react';
import { MenuItem, Category, Order, StallSettings, AnalyticsSummary } from './types';
import { Navbar } from './components/Navbar';
import { MenuCard } from './components/MenuCard';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderStatusTracker } from './components/OrderStatusTracker';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { BrandLogo } from './components/BrandLogo';
import { TastyLogo } from './components/TastyLogo';
import { kitchenChime } from './utils/sound';

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'track' | 'admin' | 'info'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<StallSettings>({
    stallName: 'TASTY FOOD COURT',
    tagline: 'Since 2024 — Quality You Can Taste',
    exhibitionName: "Navy Children's School Porbandar Exhibition 2026",
    year: 2026,
    upiId: '7016321005@fam',
    merchantName: 'TASTY FOOD COURT',
    isOrderingActive: true,
    isCashAllowed: true,
    stallExpenses: 1200,
    announcement: "Stall #4 · Live at NCS Porbandar Exhibition 2026"
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Cart state: { [itemId]: quantity }
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active / current customer order tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentPendingOrder, setPaymentPendingOrder] = useState<Order | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [menuRes, ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/orders'),
        fetch('/api/analytics')
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenu(menuData.menu || []);
        if (menuData.settings) setSettings(menuData.settings);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Error loading stall data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Connect to Server-Sent Events (SSE) for instant real-time synchronization
  useEffect(() => {
    let evtSource: EventSource | null = null;

    try {
      evtSource = new EventSource('/api/events');

      evtSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'connected') {
            setIsRealtimeConnected(true);
          } else if (payload.type === 'order_created') {
            const newOrder: Order = payload.data.order;
            setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
            kitchenChime.playNewOrderChime();
            fetch('/api/analytics').then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
          } else if (payload.type === 'order_updated') {
            const updated: Order = payload.data.order;
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setActiveOrder(prev => (prev?.id === updated.id ? updated : prev));
            fetch('/api/analytics').then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
          } else if (payload.type === 'menu_updated') {
            setMenu(payload.data.menu);
          } else if (payload.type === 'settings_updated') {
            setSettings(payload.data.settings);
          }
        } catch (err) {
          // ignore keepalive
        }
      };

      evtSource.onerror = () => {
        setIsRealtimeConnected(false);
      };
    } catch (e) {
      console.warn('SSE connection error', e);
    }

    return () => {
      evtSource?.close();
    };
  }, []);

  // Cart helpers
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    showToast(`Added ${item.name} to cart`);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (newQty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = newQty;
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // When order is placed from CartDrawer
  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    if (order.paymentMethod === 'upi' && order.paymentStatus === 'pending') {
      setPaymentPendingOrder(order);
    } else {
      setCurrentView('track');
    }
  };

  const handlePaymentVerified = (verifiedOrder: Order) => {
    setActiveOrder(verifiedOrder);
    setPaymentPendingOrder(null);
    setCurrentView('track');
  };

  // Filter menu items
  const categories: (Category | 'All')[] = ['All', 'Pizzas', 'Shakes & Coffee', 'Snacks', 'Beverages'];

  const filteredMenuItems = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const signatureItems = menu.filter(item => item.isSignature);

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        orders={orders}
        menu={menu}
        settings={settings}
        analytics={analytics}
        onRefreshData={fetchData}
        onExitAdmin={() => setCurrentView('menu')}
        isRealtimeConnected={isRealtimeConnected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121214] flex flex-col font-sans selection:bg-[#FF7700] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#121214] text-white border border-[#FF7700] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FF7700]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Exhibition Trust Marker */}
      <div className="bg-[#121214] text-white py-2 px-4 text-xs font-medium border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-neutral-300">
            <MapPin className="w-3.5 h-3.5 text-[#FF7700]" />
            <span>Navy Children's School Porbandar Exhibition 2026 · Stall #4</span>
          </div>

          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">Live Stall Ordering Active</span>
            <span className="text-neutral-500">·</span>
            <span className="text-amber-300 font-mono">Scan QR · Instant UPI & Cash</span>
          </div>

          <div className="hidden sm:block text-neutral-400 text-[11px]">
            Timings: 09:00 AM – 06:00 PM
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(v) => setCurrentView(v)}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'menu' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
            
            {/* HERO SECTION: Logo Shade Palette (Warm Cream, White, Signature Orange & Black) */}
            <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EAE4DC] shadow-md p-6 sm:p-10 lg:p-12">
              
              {/* Radial ambient glow in brand orange */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7700]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Left Column: Headlines, Logo, & Call to Actions */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Brand Tag Pill with Logo */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#E85F00] text-xs font-bold uppercase tracking-wider shadow-2xs">
                    <TastyLogo size="xs" />
                    <span>Navy Children's School Porbandar Exhibition 2026</span>
                  </div>

                  {/* Bold Headline as Requested */}
                  <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[#121214]">
                    Your Cravings. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7700] via-[#FF851A] to-[#E85F00]">
                      Our Speciality.
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
                    Welcome to <strong className="text-[#121214]">TASTY FOOD COURT</strong> at Stall #4. Freshly baked artisanal pizzas with bubbling golden cheese pulls, rich signature shakes, chilled Gujarati cold coco, and crunchy street snacks.
                  </p>

                  {/* Prominent Orange "Order Now" Button & Trust Badges */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('menu-items-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3.5 bg-gradient-to-r from-[#FF7700] to-[#E85F00] hover:from-[#FF851A] hover:to-[#F26500] text-white rounded-xl text-sm font-black shadow-lg shadow-[#FF7700]/30 transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2.5"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const el = document.getElementById('instructions-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3.5 bg-[#FAF5EE] hover:bg-neutral-100 text-[#121214] rounded-xl text-sm font-bold border border-[#E5DFD4] transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>How to Order</span>
                      <ChevronRight className="w-4 h-4 text-[#FF7700]" />
                    </button>
                  </div>

                  {/* Quality Assurance Strip */}
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      100% Pure Vegetarian
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span>Hygienic Fresh Preparation</span>
                    <span className="text-neutral-300">·</span>
                    <span>Instant UPI & Cash</span>
                  </div>

                </div>

                {/* Right Column: Hero Visual Composition with Prominent Logo */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-[#EAE4DC] shadow-xl group bg-[#FAF5EE]">
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
                      alt="Tasty Food Court signature delicacies"
                      className="w-full h-72 sm:h-84 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Official Large Circular Logo Stamp Overlay */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white">
                      <TastyLogo size="md" />
                    </div>

                    {/* Floating Brand Badge on Hero Image */}
                    <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-white flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF7700] flex items-center justify-center text-white font-black text-sm shadow-md">
                          #4
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#121214]">Exhibition Stall #4</div>
                          <div className="text-[11px] text-neutral-500">Navy Children's School Porbandar</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold">
                        Open Now
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </section>

            {/* SECTION: TODAY'S SPECIAL & SIGNATURE ITEMS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF7700] uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-[#FF7700]" />
                    <span>Chef's Choice</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121214] mt-0.5">
                    Today's Exhibition Specials
                  </h2>
                </div>
                <span className="text-xs text-neutral-500 hidden sm:block font-medium">
                  Handcrafted fresh at Stall #4
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {signatureItems.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    cartQuantity={cart[item.id] || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateCartQuantity}
                  />
                ))}
              </div>
            </section>

            {/* SECTION: CLEAR ORDERING & COLLECTION INSTRUCTIONS */}
            <section id="instructions-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4DC] shadow-sm space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs font-bold text-[#FF7700] uppercase tracking-wider">
                  How It Works
                </span>
                <h2 className="font-display font-black text-2xl text-[#121214]">
                  Quick & Contactless Ordering at NCS Exhibition
                </h2>
                <p className="text-xs text-neutral-500">
                  Four easy steps from scanning our stall QR code to enjoying hot & fresh food.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Step 1 */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] relative">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF7700] font-mono font-black text-xs flex items-center justify-center mb-3 border border-orange-200">
                    01
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">1. Scan & Choose</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Scan the table QR code or browse our digital menu on your phone from anywhere in the exhibition.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] relative">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF7700] font-mono font-black text-xs flex items-center justify-center mb-3 border border-orange-200">
                    02
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">2. Pay UPI or Cash</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Scan UPI QR via Google Pay, PhonePe, Paytm, or choose to pay cash at Stall #4 counter.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] relative">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF7700] font-mono font-black text-xs flex items-center justify-center mb-3 border border-orange-200">
                    03
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">3. Live Kitchen Tracker</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Watch your order status update in real-time from "Received" to "Preparing" on our laptop KDS.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] relative">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-black text-xs flex items-center justify-center mb-3 border border-emerald-200">
                    04
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">4. Collect at Stall #4</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Walk up to Stall #4 counter when "Ready for Collection" flashes on your screen and enjoy!
                  </p>
                </div>

              </div>
            </section>

            {/* SECTION: FULL DIGITAL MENU (WITH PHOTOS & CATEGORY TABS) */}
            <div id="menu-items-section" className="space-y-6 pt-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-4">
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-[#121214]">
                    Explore Complete Menu
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    All items are 100% pure vegetarian and freshly prepared at Stall #4
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pizzas, shakes, bhel..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DDD6CC] rounded-xl focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700] focus:outline-none placeholder:text-neutral-400 text-[#121214] shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-black cursor-pointer font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Segmented Control */}
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#EAE4DC] overflow-x-auto shadow-2xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#FF7700] text-white shadow-sm shadow-[#FF7700]/25'
                        : 'text-neutral-600 hover:text-[#121214] hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-[#EAE4DC]">
                  <Search className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-lg text-[#121214]">No Menu Items Found</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    We couldn't find any dishes matching "{searchQuery}". Try selecting another category or resetting filters.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="mt-5 px-5 py-2.5 bg-[#FF7700] text-white text-xs font-bold rounded-xl hover:bg-[#E85F00] transition-colors cursor-pointer shadow-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenuItems.map(item => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      cartQuantity={cart[item.id] || 0}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateCartQuantity}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Exhibition Trust & Quality Section */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE4DC] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#FF7700] shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">Freshly Made to Order</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Every pizza, thick shake, and snack is freshly made right at Stall #4 using top-grade ingredients.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">100% Pure Veg & Hygienic</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Prepared strictly following clean school exhibition food hygiene standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#121214]">Instant UPI & Cash</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Pay securely in seconds with Google Pay, PhonePe, Paytm, or at Stall Counter #4.
                  </p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Track Order View */}
        {currentView === 'track' && (
          <OrderStatusTracker
            activeOrder={activeOrder}
            onBackToMenu={() => setCurrentView('menu')}
            onSelectOrder={(order) => setActiveOrder(order)}
          />
        )}

        {/* Exhibition Stall Info View */}
        {currentView === 'info' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-[#EAE4DC] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FF7700] uppercase tracking-wider">
                    Exhibition Showcase
                  </span>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-[#121214] mt-1">
                    TASTY FOOD COURT at NCS Porbandar 2026
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                    Established in 2024 with the motto <strong className="text-[#121214]">“Quality You Can Taste”</strong>, Tasty Food Court brings chef-crafted comfort dining to Navy Children's School Porbandar Exhibition 2026. Designed with a mobile-first QR ordering experience, customers can place orders right from exhibition seating and track live preparation progress.
                  </p>
                </div>
                <div className="shrink-0">
                  <TastyLogo size="lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F0EBE2]">
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC]">
                  <span className="text-xs text-neutral-500 font-semibold block">Stall Location</span>
                  <span className="font-display font-bold text-[#121214] text-base mt-0.5 block">
                    Stall #4 · Central Food Pavilion
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Navy Children's School Grounds, Porbandar, Gujarat
                  </span>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC]">
                  <span className="text-xs text-neutral-500 font-semibold block">Operating Hours</span>
                  <span className="font-display font-bold text-[#121214] text-base mt-0.5 block">
                    09:00 AM – 06:00 PM
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    During Exhibition Days 2026
                  </span>
                </div>
              </div>

              <div className="p-5 bg-[#121214] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <TastyLogo size="sm" />
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">Ready to taste our signature hits?</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Try the Oreo Dream Shake and Veggie Blast Pizza!</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('menu')}
                  className="px-5 py-2.5 bg-[#FF7700] hover:bg-[#E85F00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button for Mobile */}
      {cartCount > 0 && currentView === 'menu' && (
        <div className="fixed bottom-4 inset-x-4 z-30 md:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-[#FF7700] to-[#E85F00] text-white rounded-2xl shadow-2xl flex items-center justify-between font-bold text-sm cursor-pointer border border-[#FF9133]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white text-[#121214] text-xs flex items-center justify-center font-mono font-black">
                {cartCount}
              </span>
              <span>View Cart & Checkout</span>
            </div>
            <span className="font-mono tabular-nums text-white font-black text-base">
              ₹{cartTotal}
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        menu={menu}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderCreated}
      />

      {/* Payment Modal */}
      {paymentPendingOrder && (
        <PaymentModal
          order={paymentPendingOrder}
          settings={settings}
          isOpen={Boolean(paymentPendingOrder)}
          onClose={() => {
            setPaymentPendingOrder(null);
            setCurrentView('track');
          }}
          onPaymentVerified={handlePaymentVerified}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#EAE4DC] mt-16 py-8 px-4 sm:px-8 text-neutral-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TastyLogo size="xs" />
            <span className="font-display font-extrabold text-[#121214]">TASTY FOOD COURT</span>
            <span>·</span>
            <span>Since 2024 — Quality You Can Taste</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Navy Children's School Porbandar Exhibition 2026</span>
            <span>·</span>
            <button
              onClick={() => setCurrentView('admin')}
              className="text-[#FF7700] hover:underline font-bold cursor-pointer"
            >
              Stall Laptop KDS (Admin)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
