import React from 'react';
import { Plus, Minus, Ban, Flame } from 'lucide-react';
import { MenuItem } from '../types';
import { FoodVisual } from './FoodVisual';

interface MenuCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity
}) => {
  const isAvailable = item.isAvailable && !item.isSoldOut;

  return (
    <article className="group relative flex flex-col bg-white text-[#121214] rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#FF7700]/50 transition-all duration-300">
      
      {/* Product Image Container (65% visual weight) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF5EE]">
        <FoodVisual
          type={item.iconType}
          name={item.name}
          imageUrl={item.imageUrl}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Signature Callout Tag */}
        {item.isSignature && (
          <div className="absolute top-3 left-3 bg-[#121214]/90 backdrop-blur-md text-[#FFC480] text-[11px] font-bold px-2.5 py-1 rounded-lg border border-[#FF7700]/40 flex items-center gap-1.5 shadow-md">
            <Flame className="w-3.5 h-3.5 text-[#FF7700] fill-[#FF7700]" />
            <span>Chef's Special</span>
          </div>
        )}

        {/* FSSAI Indian Pure Veg indicator (green square with circle) */}
        <div 
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-1.5 rounded-md shadow-md border border-neutral-200 flex items-center justify-center" 
          title="100% Pure Vegetarian"
        >
          <div className="w-3 h-3 border border-emerald-600 flex items-center justify-center p-[1px]">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
          </div>
        </div>

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="flex items-center gap-1.5 text-white bg-red-600/90 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-xl border border-red-500/50">
              <Ban className="w-3.5 h-3.5" />
              Sold Out
            </div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Category metadata */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold mb-1 uppercase tracking-wider">
          <span className="text-[#FF7700]">{item.category}</span>
          <span className="text-emerald-700 font-semibold">100% Pure Veg</span>
        </div>

        {/* Product Name */}
        <h3 className="font-display font-extrabold text-[#121214] text-lg leading-snug group-hover:text-[#FF7700] transition-colors mt-0.5">
          {item.name}
        </h3>

        {/* Product Description */}
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Bottom Row: Price & Actions */}
        <div className="mt-5 pt-4 border-t border-[#F0EBE2] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Price</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#FF7700]">₹</span>
              <span className="font-mono tabular-nums text-xl font-black text-[#121214]">
                {item.price}
              </span>
            </div>
          </div>

          {/* Action / Stepper Controls */}
          <div>
            {!isAvailable ? (
              <span className="text-xs text-neutral-400 font-semibold px-2 py-1 bg-neutral-100 rounded-lg">
                Unavailable
              </span>
            ) : cartQuantity === 0 ? (
              <button
                onClick={() => onAddToCart(item)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF7700] to-[#E85F00] hover:from-[#FF851A] hover:to-[#F26500] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#FF7700]/25 transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center bg-[#FAF6F0] border border-[#E5DFD4] rounded-xl p-1 gap-2 shadow-2xs">
                <button
                  onClick={() => onUpdateQuantity(item.id, cartQuantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-700 hover:text-black border border-neutral-200/80 shadow-2xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono tabular-nums text-xs font-black w-5 text-center text-[#121214]">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, cartQuantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#FF7700] hover:bg-[#E85F00] transition-colors cursor-pointer text-white shadow-2xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </article>
  );
};
