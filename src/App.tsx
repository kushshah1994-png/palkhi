/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, EmbroideryStockItem, EmbroideryPieceStatus, AccessSettings } from './types';
import { INITIAL_ORDERS, INITIAL_EMBROIDERY_STOCK } from './mockData';
import { ordersRef, stockRef, settingsRef } from './firebase';
import { onSnapshot, setDoc, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';

// Modular UI Imports
import DashboardView from './components/DashboardView';
import CustomOrdersView from './components/CustomOrdersView';
import EmbroideryStockView from './components/EmbroideryStockView';
import OnlineOrdersView from './components/OnlineOrdersView';
import CustomerSelfServiceView from './components/CustomerSelfServiceView';
import AccessSettingsView from './components/AccessSettingsView';

import { Search, Flame, Sparkles, AlertCircle, ShoppingBag, Compass, HelpCircle, Scissors, Users, Landmark, Bell, Shield, Lock, EyeOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  
  // Persistence state
  const [orders, setOrders] = useState<Order[]>([]);
  const [embroideryItems, setEmbroideryItems] = useState<EmbroideryStockItem[]>([]);
  
  // Simulation routing context
  const [selectedOrderNoLink, setSelectedOrderNoLink] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth gate definitions
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'owner' | 'staff'>('owner');
  const [showNeutralPage, setShowNeutralPage] = useState<boolean>(false);
  const [showCustomerPortalOnly, setShowCustomerPortalOnly] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [accessSettings, setAccessSettings] = useState<AccessSettings>({
    pages: { dashboard: true, orders: true, stock: true, online: true },
    hideCustomRev: true,
    hideOnlineRev: true,
    hideEmbCost: true
  });

  // Hydrate states from Firestore on mounting
  useEffect(() => {
    const cachedOrders = localStorage.getItem('PALKHE_ORDERS');
    const cachedStock = localStorage.getItem('PALKHE_STOCK');
    const cachedAccess = localStorage.getItem('PALKHE_ACCESS');

    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    if (cachedStock) setEmbroideryItems(JSON.parse(cachedStock));
    if (cachedAccess) {
      try {
        const parsed = JSON.parse(cachedAccess);
        setAccessSettings({
          ...parsed,
          pages: { dashboard: true, orders: true, stock: true, online: true, ...(parsed.pages || {}) }
        });
      } catch(e) {}
    }

    // Real-time Firestore sync
    const unsubscribeOrders = onSnapshot(ordersRef, async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const ord of INITIAL_ORDERS) {
            await setDoc(doc(ordersRef, ord.id), ord);
          }
        } catch (err) {
          console.error('Error seeding orders:', err);
        }
      } else {
        const liveOrders = snapshot.docs.map(d => d.data() as Order);
        setOrders(liveOrders);
        localStorage.setItem('PALKHE_ORDERS', JSON.stringify(liveOrders));
      }
    }, (error) => {
      console.error('Firestore orders error:', error);
    });

    const unsubscribeStock = onSnapshot(stockRef, async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const item of INITIAL_EMBROIDERY_STOCK) {
            await setDoc(doc(stockRef, item.id), item);
          }
        } catch (err) {
          console.error('Error seeding stock:', err);
        }
      } else {
        const liveStock = snapshot.docs.map(d => d.data() as EmbroideryStockItem);
        const existingIds = new Set(liveStock.map(i => i.id));
        const missingItems = INITIAL_EMBROIDERY_STOCK.filter(i => !existingIds.has(i.id));

        if (missingItems.length > 0) {
          missingItems.forEach(item => {
            setDoc(doc(stockRef, item.id), item).catch(e => console.error(e));
          });
        }
        const fullStock = missingItems.length > 0 ? [...liveStock, ...missingItems] : liveStock;
        setEmbroideryItems(fullStock);
        localStorage.setItem('PALKHE_STOCK', JSON.stringify(fullStock));
      }
    }, (error) => {
      console.error('Firestore stock error:', error);
    });

    // Routing parameter calculations
    const params = new URLSearchParams(window.location.search);
    const isCustomerForm = params.get('customerform') === '1';

    // Check existing role selection
    const savedAuth = localStorage.getItem('palkhe_auth');
    if (savedAuth === 'staff') {
      setUserRole('staff');
    } else {
      setUserRole('owner');
    }

    if (isCustomerForm) {
      setShowCustomerPortalOnly(true);
      setActiveTab('Customer Portal');
    } else {
      setShowCustomerPortalOnly(false);
      setShowNeutralPage(false);
    }

    return () => {
      unsubscribeOrders();
      unsubscribeStock();
    };
  }, []);

  // Sync state modifications back to physical cookie/local storage
  const saveOrdersToCache = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('PALKHE_ORDERS', JSON.stringify(newOrders));
  };

  const saveStockToCache = (newStock: EmbroideryStockItem[]) => {
    setEmbroideryItems(newStock);
    localStorage.setItem('PALKHE_STOCK', JSON.stringify(newStock));
  };

  // Toast triggers
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Orders Actions Managers (Firestore persistent)
  const handleAddOrder = async (newOrder: Order) => {
    saveOrdersToCache([newOrder, ...orders]);
    try {
      await setDoc(doc(ordersRef, newOrder.id), newOrder);
      triggerToast(`Order ${newOrder.orderNumber} created in cloud database!`);
    } catch (err) {
      console.error('Error adding order to Firestore:', err);
      triggerToast(`Saved locally (Cloud sync warning)`);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    saveOrdersToCache(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    try {
      await setDoc(doc(ordersRef, updatedOrder.id), updatedOrder);
      triggerToast(`Order ${updatedOrder.orderNumber} synchronized to backend.`);
    } catch (err) {
      console.error('Error updating Firestore order:', err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    saveOrdersToCache(orders.filter(o => o.id !== id));
    try {
      await deleteDoc(doc(ordersRef, id));
      if (orderToDelete) triggerToast(`Order ${orderToDelete.orderNumber} deleted from database.`);
    } catch (err) {
      console.error('Error deleting order from Firestore:', err);
    }
  };

  // Embroidery stock Actions Managers (Firestore persistent)
  const handleAddStockItem = async (newItem: EmbroideryStockItem) => {
    saveStockToCache([newItem, ...embroideryItems]);
    try {
      await setDoc(doc(stockRef, newItem.id), newItem);
      triggerToast(`Stock item ${newItem.barcode} recorded to database.`);
    } catch (err) {
      console.error('Error adding stock item:', err);
    }
  };

  const handleUpdateStockItemStatus = async (id: string, newStatus: EmbroideryPieceStatus) => {
    const targetItem = embroideryItems.find(item => item.id === id);
    if (!targetItem) return;
    const updatedObj = {
      ...targetItem,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    saveStockToCache(embroideryItems.map(item => item.id === id ? updatedObj : item));
    try {
      await setDoc(doc(stockRef, id), updatedObj);
      triggerToast(`Piece ${targetItem.barcode} status advanced to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating stock status:', err);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    const itemToDelete = embroideryItems.find(item => item.id === id);
    saveStockToCache(embroideryItems.filter(item => item.id !== id));
    try {
      await deleteDoc(doc(stockRef, id));
      if (itemToDelete) triggerToast(`Barcode stock item ${itemToDelete.barcode} successfully purged.`);
    } catch (err) {
      console.error('Error purging stock:', err);
    }
  };

  // Quick route helper
  const handlePortalSimulationNavigate = (tab: string, simulatedOrder?: Order) => {
    setActiveTab(tab);
    if (simulatedOrder) {
      setSelectedOrderNoLink(simulatedOrder.orderNumber);
      triggerToast(`Opened client self-service playground for receipt ${simulatedOrder.orderNumber}`);
    }
  };

  const selectOrderOnDashboard = (order: Order) => {
    setGlobalSearch(order.orderNumber);
    triggerToast(`Filtered for order ${order.orderNumber}`);
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'owner' ? 'staff' : 'owner';
    setUserRole(nextRole);
    localStorage.setItem('palkhe_auth', nextRole);
    triggerToast(`Switched to ${nextRole === 'owner' ? 'Owner Mode' : 'Staff Mode'}!`);
  };

  const handleSaveAccessSettings = (newSettings: AccessSettings) => {
    setAccessSettings(newSettings);
    localStorage.setItem('PALKHE_ACCESS', JSON.stringify(newSettings));
  };


  // Dynamic Tab list based on role and permissions
  const tabsList = [
    { name: 'Dashboard', icon: Compass, key: 'dashboard' },
    { name: 'Custom Orders', icon: Landmark, key: 'orders' },
    { name: 'Embroidery Sarees', icon: Users, key: 'stock' },
    { name: 'Online Orders', icon: ShopContainerIcon, key: 'online' },
    { name: 'Customer Portal', icon: Scissors, key: 'portal', badge: 'Client Portal' }
  ].filter(tab => {
    if (userRole === 'staff') {
      if (tab.key === 'portal') return true;
      const staffAllowed = accessSettings.pages[tab.key as keyof AccessSettings['pages']] !== false;
      return staffAllowed;
    }
    return true;
  });

  if (userRole === 'owner') {
    tabsList.push({ name: 'Access', icon: Shield, key: 'access', badge: 'Admin Profile' });
  }

  // Auto redirection if current activeTab is not permitted
  useEffect(() => {
    if (isAuthenticated && !showCustomerPortalOnly && !showNeutralPage) {
      const allowedTabNames = tabsList.map(t => t.name);
      if (allowedTabNames.length > 0 && !allowedTabNames.includes(activeTab)) {
        if (activeTab === 'Embroidery Stock' && allowedTabNames.includes('Embroidery Sarees')) {
          setActiveTab('Embroidery Sarees');
        } else {
          setActiveTab(allowedTabNames[0]);
        }
      }
    }
  }, [isAuthenticated, userRole, accessSettings, showCustomerPortalOnly, showNeutralPage, activeTab]);

  if (showCustomerPortalOnly) {
    return (
      <div className="min-h-screen bg-brand-cream text-stone-900 pb-16 relative font-sans antialiased">
        {/* Decorative top gold rim line */}
        <div className="h-1 bg-brand-gold w-full no-print" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <CustomerSelfServiceView
            orders={orders}
            selectedOrderNumFromLink={selectedOrderNoLink}
            onUpdateOrder={handleUpdateOrder}
            onSuccessNotice={triggerToast}
          />
        </div>
      </div>
    );
  }

  if (showNeutralPage) {
    return (
      <div className="min-h-screen bg-brand-cream text-stone-900 flex items-center justify-center p-6 relative font-sans antialiased">
        <div className="h-1.5 bg-brand-gold absolute top-0 left-0 right-0 w-full" />
        <div className="max-w-md w-full bg-white border border-brand-cream-dark p-8 md:p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-brand-wine text-brand-gold rounded-2xl flex items-center justify-center font-serif-display font-extrabold text-2xl mx-auto shadow-md border border-brand-gold select-none transform rotate-3 animate-pulse">
            P
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif-display font-medium text-brand-wine tracking-tight">
              Palkhi Sarees Mumbai
            </h2>
            <p className="text-[10px] tracking-[0.2em] uppercase text-brand-gold font-sans font-semibold">
              Heritage Embroidery • Est. 1991
            </p>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
            Please use the secure private link shared with you by our karkhana staff to coordinate address registries, fitting dimensions, or commission progress.
          </p>
          <div className="pt-4 border-t border-brand-cream-dark/65 text-[9px] text-stone-400 font-mono italic">
            Secure client ledger system. All rights reserved.
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-brand-cream text-stone-900 pb-16 relative font-sans antialiased">
      {/* Decorative top gold rim line */}
      <div className="h-1 bg-brand-gold w-full no-print" />

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        
        {/* Luxury top Header Section */}
        <header className="bg-brand-wine text-brand-cream px-8 py-5 flex flex-col md:flex-row items-center justify-between shadow-lg border-b-2 border-brand-gold rounded-2xl gap-4 no-print">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif-display font-medium tracking-tighter leading-none text-brand-cream">
              PALKHE
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold-light mt-1.5 font-sans opacity-90">
              Heritage Embroidery • Est. 1991
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center md:text-right">
              <span className="text-[11px] font-bold text-brand-gold bg-white/10 px-3 py-1 rounded-full border border-brand-gold/30">
                Palkhi Sarees Mumbai — {userRole === 'owner' ? 'Owner Mode' : 'Staff Mode'}
              </span>
              <p className="text-[10px] text-brand-cream/70 font-mono italic mt-1">Karkhana Head, Mumbai, India</p>
            </div>
            <button 
              onClick={handleToggleRole}
              title="Switch Owner/Staff Mode"
              className="w-10 h-10 rounded-full bg-brand-gold text-brand-cream flex items-center justify-center font-serif italic text-lg shadow-inner select-none font-bold hover:bg-brand-gold-dark transition-colors cursor-pointer"
            >
              P
            </button>
          </div>
        </header>

        {/* Global Navigation Tabs (Geometric Board styled) */}
        <nav className="no-print bg-white border border-brand-cream-dark p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1 leading-none pointer-events-auto select-none">
          {tabsList.map(tab => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                id={`tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setActiveTab(tab.name);
                  if (tab.name !== 'Customer Portal') {
                    setSelectedOrderNoLink('');
                  }
                }}
                className={`flex-1 min-w-[110px] py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 pointer-events-auto cursor-pointer ${
                  isTabActive
                    ? 'bg-brand-wine text-white shadow-md border border-brand-gold/30'
                    : 'text-stone-600 hover:text-brand-wine hover:bg-brand-cream/60'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isTabActive ? 'text-brand-gold' : 'text-stone-400'}`} />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="text-[8px] bg-brand-gold text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Search Bar below navigation */}
        {activeTab !== 'Customer Portal' && activeTab !== 'Access' && (
          <div className="relative max-w-2xl mx-auto no-print">
            <div className="absolute left-4 top-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-brand-wine/50" />
            </div>
            <input
              id="global-search-input"
              type="text"
              placeholder="Search all orders by customer name, phone, or order ID..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-brand-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-wine/20 text-sm italic shadow-sm placeholder:text-stone-400 text-stone-800"
            />
            <div className="absolute right-3.5 top-3.5">
              {globalSearch && (
                <button
                  id="btn-clear-search"
                  onClick={() => setGlobalSearch('')}
                  className="p-0.5 bg-gray-100 hover:bg-gray-200 text-stone-500 rounded-full text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Screen Content Render */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'Dashboard' && (
                <DashboardView
                  orders={orders}
                  embroideryItems={embroideryItems}
                  onNavigateToTab={setActiveTab}
                  onSelectOrder={selectOrderOnDashboard}
                  userRole={userRole}
                  accessSettings={accessSettings}
                />
              )}

              {activeTab === 'Custom Orders' && (
                <CustomOrdersView
                  orders={orders}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  searchTerm={globalSearch}
                  userRole={userRole}
                  accessSettings={accessSettings}
                />
              )}

              {(activeTab === 'Embroidery Sarees' || activeTab === 'Embroidery Stock') && (
                <EmbroideryStockView
                  items={embroideryItems}
                  onAddItem={handleAddStockItem}
                  onUpdateItemStatus={handleUpdateStockItemStatus}
                  onDeleteItem={handleDeleteStockItem}
                  userRole={userRole}
                  accessSettings={accessSettings}
                />
              )}

              {activeTab === 'Online Orders' && (
                <OnlineOrdersView
                  orders={orders}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  searchTerm={globalSearch}
                  onNavigateToTab={handlePortalSimulationNavigate}
                  userRole={userRole}
                  accessSettings={accessSettings}
                />
              )}

              {activeTab === 'Customer Portal' && (
                <CustomerSelfServiceView
                  orders={orders}
                  selectedOrderNumFromLink={selectedOrderNoLink}
                  onUpdateOrder={handleUpdateOrder}
                  onSuccessNotice={triggerToast}
                />
              )}

              {activeTab === 'Access' && userRole === 'owner' && (
                <AccessSettingsView
                  settings={accessSettings}
                  onSave={handleSaveAccessSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Section */}
        <footer className="mt-12 px-8 py-4 border-t border-brand-cream-dark flex justify-between items-center no-print bg-[#f9f6f0]/30 rounded-xl">
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-semibold text-center w-full">
            © {new Date().getFullYear()} Palkhi Sarees Mumbai • System Version 4.2.1-Gold
          </p>
        </footer>
      </div>

      {/* Persistent Beautiful iOS Sourced Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-brand-gold/30 text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <div className="p-1 px-1.5 bg-brand-wine/50 text-brand-gold border border-brand-gold/20 rounded-lg">
              <Bell className="w-3.5 h-3.5 text-brand-gold" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple placeholder shop components icon
function ShopContainerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={props.className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
    </svg>
  );
}
