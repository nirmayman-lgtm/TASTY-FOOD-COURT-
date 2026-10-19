import React from 'react';
import { ShoppingBag, ChefHat } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigate: (view: 'menu' | 'track' | 'admin' | 'info') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onNavigate,
  currentView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] px-4 sm:px-8 py-3 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 sm:gap-8">
        
        {/* Zone 1: Official Circular Brand Logo & Wordmark */}
        <button
          onClick={() => onNavigate('menu')}
          className="text-left shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7700] rounded-xl transition-transform active:scale-98"
          aria-label="Tasty Food Court Home"
        >
          <BrandLogo size="md" showTagline={true} theme="light" />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-neutral-700">
          <button
            onClick={() => onNavigate('menu')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#FF7700] pb-1 border-b-2 ${
              currentView === 'menu' ? 'text-[#FF7700] border-[#FF7700]' : 'border-transparent'
            }`}
          >
            Digital Menu
          </button>
          <button
            onClick={() => onNavigate('track')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#FF7700] pb-1 border-b-2 ${
              currentView === 'track' ? 'text-[#FF7700] border-[#FF7700]' : 'border-transparent'
            }`}
          >
            Track Order
          </button>
          <button
            onClick={() => onNavigate('info')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#FF7700] pb-1 border-b-2 ${
              currentView === 'info' ? 'text-[#FF7700] border-[#FF7700]' : 'border-transparent'
            }`}
          >
            Exhibition Stall
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer hover:text-[#FF7700] pb-1 border-b-2 ${
              currentView === 'admin' ? 'text-[#FF7700] border-[#FF7700]' : 'border-transparent'
            }`}
          >
            <ChefHat className="w-4 h-4 text-[#FF7700]" />
            Kitchen KDS (Laptop)
          </button>
        </nav>

        {/* Zone 3: Primary Action (Cart Drawer Trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile KDS Icon */}
          <button
            onClick={() => onNavigate('admin')}
            title="Kitchen Admin Dashboard"
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Admin Dashboard"
          >
            <ChefHat className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#FF7700] to-[#E85F00] hover:from-[#FF851A] hover:to-[#F26500] text-white rounded-xl text-sm font-bold shadow-md shadow-[#FF7700]/25 transition-all duration-150 active:scale-95 cursor-pointer"
            aria-label="View shopping cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#121214] text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="whitespace-nowrap">
              {cartCount > 0 ? (
                <>Cart <span className="font-mono tabular-nums text-white font-extrabold ml-1">₹{cartTotal}</span></>
              ) : (
                'View Cart'
              )}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
