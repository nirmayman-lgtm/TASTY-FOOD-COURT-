export type Category = 'Pizzas' | 'Shakes & Coffee' | 'Snacks' | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  costPrice: number; // for profit analytics
  description: string;
  isSignature?: boolean;
  isSoldOut: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  iconType: 'shake' | 'coffee' | 'pizza' | 'puff' | 'nachos' | 'bhel' | 'chaas' | 'coco' | 'food';
  dietary?: 'veg' | 'jain-available';
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'submitted' | 'successful' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'cash';

export interface Order {
  id: string; // e.g. "TFC-2601"
  orderNumber: number;
  customerName: string;
  tableOrToken?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number; // for COGS analytics
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTxnId?: string;
  customerUtr?: string; // e.g. UTR / transaction ref submitted by customer
  paymentSubmittedAt?: string;
  verifiedByAdmin?: boolean;
  paymentRejectionReason?: string;
  status: OrderStatus;
  cancellationReason?: string;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface StallSettings {
  stallName: string;
  tagline: string;
  exhibitionName: string;
  year: number;
  upiId: string;
  merchantName: string;
  isOrderingActive: boolean;
  isCashAllowed: boolean;
  stallExpenses: number; // e.g. stall fee, gas, packaging
  announcement?: string;
  hasCustomPassword?: boolean;
}

export interface AnalyticsSummary {
  totalOrders: number;
  grossSales: number;
  totalCost: number;
  estimatedProfit: number;
  stallExpenses: number;
  netProfit: number;
  onlineUpiSales: number;
  cashSales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  bestSellers: { name: string; quantity: number; revenue: number }[];
  hourlySales: { hour: string; count: number; total: number }[];
}
