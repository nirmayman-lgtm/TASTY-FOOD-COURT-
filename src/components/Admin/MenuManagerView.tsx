import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Ban, 
  Star, 
  Power, 
  Banknote, 
  AlertTriangle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { MenuItem, Category, StallSettings } from '../../types';

interface MenuManagerViewProps {
  menu: MenuItem[];
  settings: StallSettings;
  onUpdateMenu: () => void;
  onUpdateSettings: (newSettings: Partial<StallSettings>) => Promise<void>;
}

export const MenuManagerView: React.FC<MenuManagerViewProps> = ({
  menu,
  settings,
  onUpdateMenu,
  onUpdateSettings
}) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Pizzas');
  const [formPrice, setFormPrice] = useState(100);
  const [formCostPrice, setFormCostPrice] = useState(45);
  const [formDesc, setFormDesc] = useState('');
  const [formIsSignature, setFormIsSignature] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIconType, setFormIconType] = useState<MenuItem['iconType']>('food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsCreatingNew(false);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormCostPrice(item.costPrice);
    setFormDesc(item.description);
    setFormIsSignature(Boolean(item.isSignature));
    setFormImageUrl(item.imageUrl || '');
    setFormIconType(item.iconType);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsCreatingNew(true);
    setFormName('');
    setFormCategory('Pizzas');
    setFormPrice(100);
    setFormCostPrice(45);
    setFormDesc('');
    setFormIsSignature(false);
    setFormImageUrl('');
    setFormIconType('pizza');
  };

  const handleToggleSoldOut = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}/toggle-stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSoldOut: !item.isSoldOut })
      });
      onUpdateMenu();
    } catch (err) {
      console.error('Error toggling sold out:', err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isCreatingNew) {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            price: formPrice,
            costPrice: formCostPrice,
            description: formDesc,
            isSignature: formIsSignature,
            imageUrl: formImageUrl,
            iconType: formIconType,
            isSoldOut: false,
            isAvailable: true
          })
        });
      } else if (editingItem) {
        await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            price: formPrice,
            costPrice: formCostPrice,
            description: formDesc,
            isSignature: formIsSignature,
            imageUrl: formImageUrl,
            iconType: formIconType
          })
        });
      }

      setEditingItem(null);
      setIsCreatingNew(false);
      onUpdateMenu();
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      onUpdateMenu();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Stall Master Controls Bar */}
      <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800 space-y-4">
        <h3 className="text-white font-display font-bold text-base">
          Stall Exhibition Operational Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Pause Ordering */}
          <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Stall QR Ordering</span>
              <span className="text-xs text-neutral-400">
                {settings.isOrderingActive ? 'Active and accepting orders' : 'Temporarily paused for rush'}
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ isOrderingActive: !settings.isOrderingActive })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                settings.isOrderingActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{settings.isOrderingActive ? 'Ordering Open' : 'Ordering Paused'}</span>
            </button>
          </div>

          {/* Cash Payment Toggle */}
          <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Cash at Counter</span>
              <span className="text-xs text-neutral-400">
                {settings.isCashAllowed ? 'Cash option enabled for customers' : 'Cash disabled (UPI only)'}
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ isCashAllowed: !settings.isCashAllowed })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                settings.isCashAllowed
                  ? 'bg-[#FF6A00] hover:bg-[#E05200] text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>{settings.isCashAllowed ? 'Cash Enabled' : 'Cash Disabled'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Menu Header & Add Item */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1E] p-4 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-white font-display font-bold text-lg">
            Menu Items & Live Inventory
          </h2>
          <p className="text-neutral-400 text-xs">
            Toggle sold out status to instantly stop customers from ordering exhausted items.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E05200] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Items Table / Cards */}
      <div className="bg-[#1A1A1E] rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Item & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 font-mono">Selling Price</th>
                <th className="py-3.5 px-4 font-mono">Cost Price</th>
                <th className="py-3.5 px-4 font-mono">Margin</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {menu.map(item => {
                const margin = item.price - item.costPrice;
                const marginPct = Math.round((margin / item.price) * 100);

                return (
                  <tr key={item.id} className="hover:bg-neutral-900/50 transition-colors">
                    
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.name}</span>
                            {item.isSignature && (
                              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                Signature
                              </span>
                            )}
                          </div>
                          <span className="text-neutral-400 text-[11px] line-clamp-1 max-w-sm mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-neutral-300">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-white text-sm">
                      ₹{item.price}
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-400">
                      ₹{item.costPrice}
                    </td>

                    {/* Margin */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-emerald-400 font-semibold">
                      ₹{margin} ({marginPct}%)
                    </td>

                    {/* Quick Stock Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleSoldOut(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          item.isSoldOut
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.isSoldOut ? (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Item Modal */}
      {(editingItem || isCreatingNew) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1E] text-white rounded-3xl max-w-lg w-full p-6 border border-neutral-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display font-bold text-lg text-white">
                {isCreatingNew ? 'Add New Menu Item' : `Edit: ${editingItem?.name}`}
              </h3>
              <button
                onClick={() => { setEditingItem(null); setIsCreatingNew(false); }}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Oreo Dream Shake"
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="Pizzas">Pizzas</option>
                    <option value="Shakes & Coffee">Shakes & Coffee</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Artisanal Icon Style
                  </label>
                  <select
                    value={formIconType}
                    onChange={(e) => setFormIconType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="shake">Milkshake (Oreo / Cream)</option>
                    <option value="coffee">Mocha / Cold Coffee</option>
                    <option value="pizza">Pizza (Cheese / Veggie)</option>
                    <option value="puff">Golden Puff Pastry</option>
                    <option value="nachos">Loaded Nachos</option>
                    <option value="bhel">Spicy Bhel Bowl</option>
                    <option value="coco">Cold Coco (Thick Chocolate)</option>
                    <option value="chaas">Masala Chaas Matka</option>
                    <option value="food">General Food</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Cost Price (₹) for Profit Calc *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Appetizing description for customers..."
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank to use custom illustration)"
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sigCheckbox"
                  checked={formIsSignature}
                  onChange={(e) => setFormIsSignature(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6A00] focus:ring-[#FF6A00]"
                />
                <label htmlFor="sigCheckbox" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Highlight as Signature Product (e.g. Oreo Dream Shake / Veggie Blast Pizza)
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E05200] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setIsCreatingNew(false); }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1E] text-white rounded-2xl max-w-sm w-full p-6 border border-neutral-700 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Menu Item?
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove this product from the customer menu?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteItem(deletingId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
