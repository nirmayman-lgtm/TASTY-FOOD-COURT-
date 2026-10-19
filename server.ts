import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MenuItem, Order, StallSettings, AnalyticsSummary } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'foodcourt_db.json');

app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  settings: StallSettings;
  menu: MenuItem[];
  orders: Order[];
  nextOrderSeq: number;
  adminPassword?: string;
}

const defaultMenu: MenuItem[] = [
  {
    id: 'shake-oreo',
    name: 'Oreo Dream Shake',
    category: 'Shakes & Coffee',
    price: 100,
    costPrice: 45,
    description: 'Thick creamy vanilla ice-cream shake blended with crushed Oreos, topped with whipped cream, chocolate drizzle and an Oreo biscuit.',
    isSignature: true,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    iconType: 'shake',
    dietary: 'veg'
  },
  {
    id: 'coffee-midnight-mocha',
    name: 'Midnight Mocha Coffee',
    category: 'Shakes & Coffee',
    price: 110,
    costPrice: 48,
    description: 'Rich dark espresso blend infused with velvety dark chocolate mocha, chilled milk, and a dusting of Dutch cocoa.',
    isSignature: false,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    iconType: 'coffee',
    dietary: 'veg'
  },
  {
    id: 'pizza-cheese-volcano',
    name: 'Cheese Volcano Pizza',
    category: 'Pizzas',
    price: 150,
    costPrice: 65,
    description: 'Bursting cheese pull crust loaded with pure bubbling mozzarella, cheddar molten pool, and aromatic Italian herbs.',
    isSignature: false,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    iconType: 'pizza',
    dietary: 'veg'
  },
  {
    id: 'pizza-veggie-blast',
    name: 'Veggie Blast Pizza',
    category: 'Pizzas',
    price: 180,
    costPrice: 75,
    description: 'Crisp artisanal crust loaded with colorful bell peppers, sweetcorn, black olives, red onions, and baked mozzarella.',
    isSignature: true,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    iconType: 'pizza',
    dietary: 'veg'
  },
  {
    id: 'snack-golden-puff',
    name: 'Golden Crunch Puff',
    category: 'Snacks',
    price: 30,
    costPrice: 12,
    description: 'Hot flaky golden-layered puff pastry packed with savoury mildly-spiced potato, sweet corn, and vegetable filling.',
    isSignature: false,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    iconType: 'puff',
    dietary: 'veg'
  },
  {
    id: 'snack-spicy-bhel',
    name: 'Surat Spicy Bhel',
    category: 'Snacks',
    price: 60,
    costPrice: 22,
    description: 'Authentic crunchy puffed rice tossed with fiery garlic chutney, sweet dates sauce, crispy papdi, nylon sev, and peanuts.',
    isSignature: false,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    iconType: 'bhel',
    dietary: 'veg'
  },
  {
    id: 'bev-masala-chaas',
    name: 'Royal Masala Chaas',
    category: 'Beverages',
    price: 20,
    costPrice: 8,
    description: 'Traditional cooling spiced buttermilk tempered with roasted cumin, rock salt, fresh mint sprig, and green coriander.',
    isSignature: false,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    iconType: 'chaas',
    dietary: 'veg'
  },
  {
    id: 'bev-cold-coco',
    name: 'Special Cold Coco',
    category: 'Beverages',
    price: 80,
    costPrice: 32,
    description: 'Rich, velvety thick chilled chocolate drink loaded with dark cocoa and topped with crunchy chocolate shavings.',
    isSignature: true,
    isSoldOut: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
    iconType: 'coco',
    dietary: 'veg'
  }
];

const defaultSettings: StallSettings = {
  stallName: 'TASTY FOOD COURT',
  tagline: 'Since 2024 — Quality You Can Taste',
  exhibitionName: "Navy Children's School Porbandar Exhibition 2026",
  year: 2026,
  upiId: '7016321005@fam',
  merchantName: 'TASTY FOOD COURT',
  isOrderingActive: true,
  isCashAllowed: true,
  stallExpenses: 1200, // booth setup, packaging & exhibition stall fee
  announcement: "Welcome to Stall #4! Order via QR code or counter pickup."
};

// Seed an initial demo order so laptop admin immediately sees a working live board
const initialOrders: Order[] = [
  {
    id: 'TFC-2601',
    orderNumber: 2601,
    customerName: 'Aarav Sharma',
    tableOrToken: 'Table 3',
    customerPhone: '9876543210',
    notes: 'Please make the shake extra chilled!',
    items: [
      {
        menuItemId: 'shake-oreo',
        name: 'Oreo Dream Shake',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      },
      {
        menuItemId: 'snack-crunch-nachos',
        name: 'Crunch Riot Nachos',
        quantity: 1,
        unitPrice: 90,
        subtotal: 90
      }
    ],
    totalAmount: 190,
    totalCost: 83,
    paymentMethod: 'upi',
    paymentStatus: 'successful',
    paymentTxnId: 'UPI-NCS-98124',
    status: 'preparing',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'TFC-2602',
    orderNumber: 2602,
    customerName: 'Pooja Patel',
    tableOrToken: 'Stall Counter',
    customerPhone: '9822334455',
    items: [
      {
        menuItemId: 'pizza-veggie-blast',
        name: 'Veggie Blast Pizza',
        quantity: 1,
        unitPrice: 180,
        subtotal: 180
      },
      {
        menuItemId: 'bev-masala-chaas',
        name: 'Royal Masala Chaas',
        quantity: 2,
        unitPrice: 20,
        subtotal: 40
      }
    ],
    totalAmount: 220,
    totalCost: 91,
    paymentMethod: 'cash',
    paymentStatus: 'successful',
    status: 'ready',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
];

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.adminPassword) {
        parsed.adminPassword = process.env.ADMIN_PASSWORD || '2026';
        saveDatabase(parsed);
      }
      return parsed;
    } catch (err) {
      console.error('Failed to parse db file, re-initializing', err);
    }
  }

  const initialData: DatabaseSchema = {
    settings: defaultSettings,
    menu: defaultMenu,
    orders: initialOrders,
    nextOrderSeq: 2603,
    adminPassword: process.env.ADMIN_PASSWORD || '2026'
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// Server-Sent Events subscribers
type SSEClient = { id: string; res: Response };
let sseClients: SSEClient[] = [];

function broadcastEvent(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (err) {
      // client disconnected
    }
  });
}

// SSE stream endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Initial welcome event
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Periodic heartbeat to keep SSE alive
setInterval(() => {
  sseClients.forEach(client => {
    try {
      client.res.write(':keepalive\n\n');
    } catch {
      // ignore
    }
  });
}, 15000);

// --- REST API Endpoints ---

// Get Menu & Settings
app.get('/api/menu', (req: Request, res: Response) => {
  res.json({
    menu: db.menu,
    settings: db.settings
  });
});

// Admin Add Menu Item
app.post('/api/menu', (req: Request, res: Response) => {
  const { name, category, price, costPrice, description, isSignature, isSoldOut, isAvailable, iconType, imageUrl } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const newItem: MenuItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: String(name).trim(),
    category,
    price: Number(price),
    costPrice: Number(costPrice) || Math.round(Number(price) * 0.45),
    description: String(description || '').trim(),
    isSignature: Boolean(isSignature),
    isSoldOut: Boolean(isSoldOut),
    isAvailable: isAvailable !== false,
    iconType: iconType || 'food',
    imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
    dietary: 'veg'
  };

  db.menu.push(newItem);
  saveDatabase(db);
  broadcastEvent('menu_updated', { menu: db.menu });
  res.status(201).json(newItem);
});

// Admin Update Menu Item
app.put('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.menu.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const existing = db.menu[index];
  const updated: MenuItem = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent id overwrite
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : existing.costPrice,
    isSoldOut: req.body.isSoldOut !== undefined ? Boolean(req.body.isSoldOut) : existing.isSoldOut,
    isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : existing.isAvailable,
  };

  db.menu[index] = updated;
  saveDatabase(db);
  broadcastEvent('menu_updated', { menu: db.menu });
  res.json(updated);
});

// Quick toggle stock (sold out / available)
app.patch('/api/menu/:id/toggle-stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.menu.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  if (req.body.isSoldOut !== undefined) {
    item.isSoldOut = Boolean(req.body.isSoldOut);
  } else {
    item.isSoldOut = !item.isSoldOut;
  }

  saveDatabase(db);
  broadcastEvent('menu_updated', { menu: db.menu });
  res.json(item);
});

// Delete Menu Item
app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = db.menu.length;
  db.menu = db.menu.filter(m => m.id !== id);
  if (db.menu.length === initialLen) {
    return res.status(404).json({ error: 'Item not found' });
  }

  saveDatabase(db);
  broadcastEvent('menu_updated', { menu: db.menu });
  res.json({ success: true, id });
});

// Get Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings);
});

// Update Settings
app.post('/api/settings', (req: Request, res: Response) => {
  db.settings = {
    ...db.settings,
    ...req.body
  };
  saveDatabase(db);
  broadcastEvent('settings_updated', { settings: db.settings });
  res.json(db.settings);
});

// Get Orders (all for admin, or filtered)
app.get('/api/orders', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  let result = [...db.orders];
  if (statusFilter && statusFilter !== 'all') {
    result = result.filter(o => o.status === statusFilter);
  }
  // Sort most recent first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

// Get Single Order (public tracking for customer)
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create Order (customer placed)
app.post('/api/orders', (req: Request, res: Response) => {
  if (!db.settings.isOrderingActive) {
    return res.status(400).json({ error: 'Online ordering is temporarily paused by the stall. Please order at the counter.' });
  }

  const { customerName, tableOrToken, customerPhone, notes, items, paymentMethod } = req.body;

  if (!customerName || !String(customerName).trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  if (paymentMethod === 'cash' && !db.settings.isCashAllowed) {
    return res.status(400).json({ error: 'Cash payment is currently disabled. Please pay via UPI.' });
  }

  // Server-side validation of items, prices, and stock
  let totalAmount = 0;
  let totalCost = 0;
  const verifiedItems = [];

  for (const requestedItem of items) {
    const menuItem = db.menu.find(m => m.id === requestedItem.menuItemId);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${requestedItem.name || requestedItem.menuItemId}` });
    }
    if (!menuItem.isAvailable) {
      return res.status(400).json({ error: `Item "${menuItem.name}" is currently unavailable.` });
    }
    if (menuItem.isSoldOut) {
      return res.status(400).json({ error: `Sorry, "${menuItem.name}" is sold out!` });
    }

    const qty = Math.max(1, Math.min(20, Math.floor(Number(requestedItem.quantity) || 1)));
    const subtotal = menuItem.price * qty;
    const subtotalCost = menuItem.costPrice * qty;

    totalAmount += subtotal;
    totalCost += subtotalCost;

    verifiedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: qty,
      unitPrice: menuItem.price,
      subtotal
    });
  }

  const orderNum = db.nextOrderSeq;
  db.nextOrderSeq += 1;
  const orderId = `TFC-${orderNum}`;

  const isCash = paymentMethod === 'cash';

  const newOrder: Order = {
    id: orderId,
    orderNumber: orderNum,
    customerName: String(customerName).trim(),
    tableOrToken: tableOrToken ? String(tableOrToken).trim() : 'Counter Pickup',
    customerPhone: customerPhone ? String(customerPhone).trim() : undefined,
    notes: notes ? String(notes).trim() : undefined,
    items: verifiedItems,
    totalAmount,
    totalCost,
    paymentMethod: isCash ? 'cash' : 'upi',
    paymentStatus: isCash ? 'pending' : 'pending', // UPI remains pending until verified
    status: 'received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  // Broadcast to kitchen dashboard in real-time
  broadcastEvent('order_created', { order: newOrder });

  res.status(201).json(newOrder);
});

// Customer Submits UPI Payment (Awaiting Admin Approval)
app.post('/api/orders/:id/submit-payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { utr } = req.body;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = 'submitted';
  order.customerUtr = utr ? String(utr).trim() : undefined;
  order.paymentSubmittedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastEvent('order_updated', { order, alertType: 'payment_submitted' });

  res.json({ success: true, order });
});

// Admin Approves Verified Payment (Only Admin Can Confirm Receipt)
app.post('/api/orders/:id/approve-payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = 'successful';
  order.verifiedByAdmin = true;
  order.paymentTxnId = `FAMX-VERIFIED-${Date.now().toString(36).toUpperCase()}`;
  order.paymentRejectionReason = undefined;
  order.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastEvent('order_updated', { order, alertType: 'payment_approved' });

  res.json({ success: true, order });
});

// Admin Rejects Unverified Payment
app.post('/api/orders/:id/reject-payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = 'failed';
  order.verifiedByAdmin = false;
  order.paymentRejectionReason = reason ? String(reason).trim() : 'Payment was not received in stall UPI account.';
  order.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastEvent('order_updated', { order, alertType: 'payment_rejected' });

  res.json({ success: true, order });
});

// Update Order Status (Admin KDS workflow)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, cancellationReason, paymentStatus } = req.body;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (status) {
    order.status = status;
  }
  if (cancellationReason) {
    order.cancellationReason = cancellationReason;
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }
  order.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastEvent('order_updated', { order });

  res.json(order);
});

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const currentPassword = db.adminPassword || process.env.ADMIN_PASSWORD || '2026';
  
  if (password && String(password).trim() === String(currentPassword).trim()) {
    return res.json({
      success: true,
      token: 'tfc-admin-token-porbandar-2026',
      user: {
        role: 'admin',
        name: 'Stall Manager'
      }
    });
  }
  return res.status(401).json({ error: 'Incorrect admin password. Access denied.' });
});

// Admin Change Password
app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const actualPassword = db.adminPassword || process.env.ADMIN_PASSWORD || '2026';

  if (!currentPassword || String(currentPassword).trim() !== String(actualPassword).trim()) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  if (!newPassword || String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters.' });
  }

  db.adminPassword = String(newPassword).trim();
  saveDatabase(db);

  res.json({ success: true, message: 'Admin password changed successfully. Only you know this password now.' });
});

// Analytics & Sales Summary
app.get('/api/analytics', (req: Request, res: Response) => {
  const nonCancelledOrders = db.orders.filter(o => o.status !== 'cancelled');
  const totalOrders = db.orders.length;
  const completedOrders = db.orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = db.orders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = db.orders.filter(o => o.status === 'received' || o.status === 'preparing').length;

  let grossSales = 0;
  let totalCost = 0;
  let onlineUpiSales = 0;
  let cashSales = 0;

  const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
  const hourlyMap: Record<string, { hour: string; count: number; total: number }> = {};

  for (const order of nonCancelledOrders) {
    // Only count if payment is successful or order completed/ready
    if (order.paymentStatus === 'successful' || order.status === 'completed' || order.status === 'ready') {
      grossSales += order.totalAmount;
      totalCost += (order.totalCost || 0);

      if (order.paymentMethod === 'upi') {
        onlineUpiSales += order.totalAmount;
      } else {
        cashSales += order.totalAmount;
      }

      // Tally items
      for (const it of order.items) {
        if (!itemCounts[it.menuItemId]) {
          itemCounts[it.menuItemId] = { name: it.name, quantity: 0, revenue: 0 };
        }
        itemCounts[it.menuItemId].quantity += it.quantity;
        itemCounts[it.menuItemId].revenue += it.subtotal;
      }

      // Tally hours
      const date = new Date(order.createdAt);
      const hourStr = `${date.getHours().toString().padStart(2, '0')}:00`;
      if (!hourlyMap[hourStr]) {
        hourlyMap[hourStr] = { hour: hourStr, count: 0, total: 0 };
      }
      hourlyMap[hourStr].count += 1;
      hourlyMap[hourStr].total += order.totalAmount;
    }
  }

  const bestSellers = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity);
  const hourlySales = Object.values(hourlyMap).sort((a, b) => a.hour.localeCompare(b.hour));

  const estimatedProfit = grossSales - totalCost;
  const stallExpenses = db.settings.stallExpenses || 0;
  const netProfit = estimatedProfit - stallExpenses;

  const summary: AnalyticsSummary = {
    totalOrders,
    grossSales,
    totalCost,
    estimatedProfit,
    stallExpenses,
    netProfit,
    onlineUpiSales,
    cashSales,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    bestSellers,
    hourlySales
  };

  res.json(summary);
});

// Public Menu URL for QR code
app.get('/api/qr-url', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const url = `${protocol}://${host}/`;
  res.json({
    url,
    stallName: db.settings.stallName,
    exhibition: db.settings.exhibitionName
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TASTY FOOD COURT] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
