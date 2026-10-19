import React, { useState } from 'react';
import { 
  ChefHat, 
  TrendingUp, 
  UtensilsCrossed, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Lock, 
  LogOut, 
  ArrowLeft,
  Radio,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  X
} from 'lucide-react';
import { Order, MenuItem, StallSettings, AnalyticsSummary, OrderStatus } from '../../types';
import { KDSView } from './KDSView';
import { AnalyticsView } from './AnalyticsView';
import { MenuManagerView } from './MenuManagerView';
import { QRCodeView } from './QRCodeView';
import { kitchenChime } from '../../utils/sound';
import { TastyLogo } from '../TastyLogo';

interface AdminDashboardProps {
  orders: Order[];
  menu: MenuItem[];
  settings: StallSettings;
  analytics: AnalyticsSummary | null;
  onRefreshData: () => void;
  onExitAdmin: () => void;
  isRealtimeConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  menu,
  settings,
  analytics,
  onRefreshData,
  onExitAdmin,
  isRealtimeConnected
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tfc_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'kds' | 'analytics' | 'menu' | 'qr'>('kds');
  const [isMuted, setIsMuted] = useState(false);

  // Change password modal state
  const [isChangePwModalOpen, setIsChangePwModalOpen] = useState(false);
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSuccess, setChangePwSuccess] = useState<string | null>(null);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect admin password. Access denied.');
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('tfc_admin_auth', 'true');
      setPasscode('');
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect admin password. Access denied.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tfc_admin_auth');
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    kitchenChime.isMuted = next;
    if (!next) {
      kitchenChime.playNewOrderChime();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellationReason: reason })
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleApprovePayment = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}/approve-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to approve payment:', err);
    }
  };

  const handleRejectPayment = async (orderId: string, reason?: string) => {
    try {
      await fetch(`/api/orders/${orderId}/reject-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to reject payment:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<StallSettings>) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      onRefreshData();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleUpdateExpenses = async (expenses: number) => {
    await handleUpdateSettings({ stallExpenses: expenses });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    setChangePwSuccess(null);

    if (newPwInput !== confirmPwInput) {
      setChangePwError('New passwords do not match.');
      return;
    }

    if (newPwInput.length < 4) {
      setChangePwError('Password must be at least 4 characters long.');
      return;
    }

    setIsChangingPw(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPwInput.trim(),
          newPassword: newPwInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setChangePwSuccess('Password successfully updated! Only you know this password now.');
      setCurrentPwInput('');
      setNewPwInput('');
      setConfirmPwInput('');
      setTimeout(() => {
        setIsChangePwModalOpen(false);
        setChangePwSuccess(null);
      }, 2000);
    } catch (err: any) {
      setChangePwError(err.message || 'Error updating password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121214] text-white flex items-center justify-center p-4">
        <div className="bg-[#1A1A1E] p-8 rounded-3xl border border-neutral-800 shadow-2xl max-w-md w-full space-y-6">
          
          <div className="text-center space-y-3">
            <TastyLogo size="lg" className="mx-auto" />
            <h2 className="font-display font-extrabold text-2xl text-white">
              Stall Laptop Admin Access
            </h2>
            <p className="text-xs text-neutral-400">
              TASTY FOOD COURT · Navy Children's School Porbandar 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full pl-4 pr-11 py-3 bg-black/60 border border-neutral-700 rounded-xl text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#FF6A00] hover:bg-[#E05200] disabled:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md"
            >
              {isLoggingIn ? 'Verifying...' : 'Unlock Kitchen Dashboard'}
            </button>
          </form>

          <div className="pt-3 border-t border-neutral-800/80 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
            >
              Return to Customer Menu
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white flex flex-col">
      
      {/* Top Laptop Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1A1E]/95 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Live Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Return to Customer View"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <TastyLogo size="xs" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-base text-white">
                    TASTY <span className="text-[#FF7700]">KITCHEN</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#FF7700]/20 text-amber-300 border border-[#FF7700]/40 px-2 py-0.5 rounded-md">
                    LAPTOP KDS
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Radio className={`w-3 h-3 ${isRealtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                    {isRealtimeConnected ? 'Live Real-Time' : 'Syncing'}
                  </span>
                  <span>·</span>
                  <span>Stall #4 Porbandar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kds' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Display</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-amber-200 font-mono text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sales & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'menu' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qr' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Stall QR Poster</span>
            </button>
          </nav>

          {/* Right Tools (Change Password, Sound, Logout) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsChangePwModalOpen(true);
                setChangePwError(null);
                setChangePwSuccess(null);
              }}
              title="Change Admin Password"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Password</span>
            </button>

            <button
              onClick={toggleSound}
              title={isMuted ? 'Sound Notifications Muted' : 'Sound Notifications Active'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Chime On'}</span>
            </button>

            <button
              onClick={handleLogout}
              title="Lock Admin Dashboard"
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden items-center justify-between gap-1 mt-3 pt-3 border-t border-neutral-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'kds' ? 'bg-[#FF6A00] text-white' : 'text-neutral-400'}`}
          >
            KDS ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'analytics' ? 'bg-[#FF6A00] text-white' : 'text-neutral-400'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'menu' ? 'bg-[#FF6A00] text-white' : 'text-neutral-400'}`}
          >
            Menu & Stock
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'qr' ? 'bg-[#FF6A00] text-white' : 'text-neutral-400'}`}
          >
            QR Poster
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'kds' && (
          <KDSView
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            orders={orders}
            settings={settings}
            onUpdateExpenses={handleUpdateExpenses}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManagerView
            menu={menu}
            settings={settings}
            onUpdateMenu={onRefreshData}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'qr' && (
          <QRCodeView settings={settings} />
        )}
      </main>

      {/* Change Password Modal */}
      {isChangePwModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1E] text-white rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Change Admin Password
                </h3>
              </div>
              <button
                onClick={() => setIsChangePwModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Set a private secret password so that only you can access the kitchen display and business analytics.
            </p>

            {changePwError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs">
                {changePwError}
              </div>
            )}

            {changePwSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{changePwSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPwInput}
                  onChange={(e) => setCurrentPwInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  New Secret Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPwInput}
                    onChange={(e) => setNewPwInput(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={confirmPwInput}
                  onChange={(e) => setConfirmPwInput(e.target.value)}
                  placeholder="Re-enter new secret password"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E05200] disabled:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isChangingPw ? 'Updating...' : 'Save Secret Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangePwModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
