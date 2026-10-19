import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Download, 
  CreditCard, 
  Banknote, 
  AlertCircle, 
  PieChart, 
  Award, 
  Calculator,
  Calendar
} from 'lucide-react';
import { AnalyticsSummary, Order, StallSettings } from '../../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  orders: Order[];
  settings: StallSettings;
  onUpdateExpenses: (newExpenses: number) => Promise<void>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  orders,
  settings,
  onUpdateExpenses
}) => {
  const [customExpense, setCustomExpense] = useState<string>(settings.stallExpenses.toString());
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today'>('all');

  const handleSaveExpenses = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingExpense(true);
    await onUpdateExpenses(Number(customExpense) || 0);
    setIsSavingExpense(false);
  };

  const exportCSV = () => {
    const headers = [
      'Order ID',
      'Date Time',
      'Customer Name',
      'Table / Token',
      'Items Count',
      'Items Summary',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status'
    ];

    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customerName}"`,
      `"${o.tableOrToken || 'Counter'}"`,
      o.items.reduce((acc, it) => acc + it.quantity, 0),
      `"${o.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}"`,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasty_food_court_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analytics) {
    return (
      <div className="p-12 text-center text-neutral-400">
        Loading live stall analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Export & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1E] p-4 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-white font-display font-bold text-lg">
            Sales & Financial Performance
          </h2>
          <p className="text-neutral-400 text-xs">
            Live metrics for Navy Children's School Porbandar Exhibition 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 border border-neutral-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Headline Cards (60-30-10 palette with tabular nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            ₹{analytics.grossSales}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            From {analytics.totalOrders - analytics.cancelledOrders} paid/active orders
          </p>
        </div>

        {/* Estimated Net Profit */}
        <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
            <span>Net Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`font-mono tabular-nums text-2xl sm:text-3xl font-extrabold ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{analytics.netProfit}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            After COGS (₹{analytics.totalCost}) & Stall (₹{analytics.stallExpenses})
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalOrders}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
            <span className="text-emerald-400 font-bold">{analytics.completedOrders} completed</span>
            <span>·</span>
            <span className="text-red-400 font-bold">{analytics.cancelledOrders} cancelled</span>
          </div>
        </div>

        {/* Online vs Cash */}
        <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
            <span>UPI vs Cash</span>
            <CreditCard className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="font-mono tabular-nums text-base font-bold text-white flex justify-between">
            <span className="text-amber-300">UPI: ₹{analytics.onlineUpiSales}</span>
            <span className="text-emerald-400">Cash: ₹{analytics.cashSales}</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mt-3 flex">
            <div
              className="bg-[#FF6A00] h-full"
              style={{
                width: `${analytics.grossSales ? Math.round((analytics.onlineUpiSales / analytics.grossSales) * 100) : 50}%`
              }}
              title="UPI %"
            />
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${analytics.grossSales ? Math.round((analytics.cashSales / analytics.grossSales) * 100) : 50}%`
              }}
              title="Cash %"
            />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Profit & Cost Calculator + Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stall Profit & Loss (P&L) Configuration */}
        <div className="bg-[#1A1A1E] p-6 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#FF6A00]" />
            <h3 className="text-white font-display font-bold text-base">
              Profit & Loss Calculator (COGS & Stall Expenses)
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Configure exhibition booth fees, power, and packaging costs to calculate actual real net profit from gross sales.
          </p>

          {/* Breakdown summary */}
          <div className="space-y-2.5 p-4 bg-black/40 rounded-xl border border-neutral-800 font-mono text-xs">
            <div className="flex justify-between text-neutral-300">
              <span>Gross Sales (A):</span>
              <span className="font-bold text-white">₹{analytics.grossSales}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Cost of Goods Sold / Ingredients (B):</span>
              <span className="text-red-400">- ₹{analytics.totalCost}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-neutral-800 pt-2">
              <span>Gross Margin (A - B):</span>
              <span>₹{analytics.estimatedProfit}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Stall & Booth Overhead Expenses (C):</span>
              <span className="text-red-400">- ₹{analytics.stallExpenses}</span>
            </div>
            <div className="flex justify-between text-white font-black text-sm border-t border-neutral-700 pt-2.5">
              <span>Estimated Net Profit (A - B - C):</span>
              <span className={analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                ₹{analytics.netProfit}
              </span>
            </div>
          </div>

          {/* Update Stall Expense Form */}
          <form onSubmit={handleSaveExpenses} className="pt-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Update Stall Overhead Expenses (₹)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={customExpense}
                onChange={(e) => setCustomExpense(e.target.value)}
                placeholder="1200"
                className="flex-1 px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <button
                type="submit"
                disabled={isSavingExpense}
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E05200] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isSavingExpense ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        </div>

        {/* Best-Selling Products Leaderboard */}
        <div className="bg-[#1A1A1E] p-6 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-white font-display font-bold text-base">
                Best-Selling Products
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400">
              Ranked by quantity sold
            </span>
          </div>

          {analytics.bestSellers.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-72">
              {analytics.bestSellers.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 bg-black/40 rounded-xl border border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center font-mono text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {item.quantity} orders sold
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <span className="font-bold text-amber-300 block">₹{item.revenue}</span>
                    <span className="text-[10px] text-neutral-500">revenue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Hourly Sales Distribution */}
      {analytics.hourlySales.length > 0 && (
        <div className="bg-[#1A1A1E] p-6 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-display font-bold text-base">
              Hourly Rush Distribution
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {analytics.hourlySales.map(h => (
              <div key={h.hour} className="p-3 bg-black/40 rounded-xl border border-neutral-800 text-center">
                <span className="text-xs text-neutral-400 font-mono block">{h.hour}</span>
                <span className="text-base font-mono font-bold text-white block mt-1">₹{h.total}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{h.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
