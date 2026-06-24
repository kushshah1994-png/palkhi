import React from 'react';
import { motion } from 'motion/react';
import { Order, EmbroideryStockItem, AccessSettings } from '../types';
import { Landmark, Users, Clock, ShoppingCart, AlertCircle, Calendar, IndianRupee, ArrowUpRight, Search } from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  embroideryItems: EmbroideryStockItem [];
  onNavigateToTab: (tab: string) => void;
  onSelectOrder: (order: Order) => void;
  userRole?: 'owner' | 'staff';
  accessSettings?: AccessSettings;
}

export default function DashboardView({ orders, embroideryItems, onNavigateToTab, onSelectOrder, userRole = 'owner', accessSettings }: DashboardViewProps) {

  // Aggregate Metrics
  const outstandingPayments = orders.reduce((sum, o) => sum + o.payment.balanceDue, 0);
  
  // Custom + Online sarees currently at karigar
  const sareesAtKarigar = orders.reduce((count, o) => {
    return count + o.sarees.filter(s => s.tracking.givenToKarigar && !s.tracking.receivedFromKarigar).length;
  }, 0);
  
  // Embroidery stock items currently at karigar
  const stockAtKarigar = embroideryItems.filter(item => item.status === 'Given to karigar').length;
  const totalPiecesWithKarigars = sareesAtKarigar + stockAtKarigar;

  const ordersInProgress = orders.filter(o => o.shipmentStatus === 'Pending' || o.shipmentStatus === 'Dispatched').length;
  const onlineToShip = orders.filter(o => o.orderType === 'online' && o.shipmentStatus === 'Pending').length;

  // Alerts logic
  const now = new Date();
  
  // Deliveries approaching (within 5 days)
  const approachingDeliveries = orders.filter(o => {
    if (!o.deliveryDate) return false;
    const delDate = new Date(o.deliveryDate);
    const diffTime = delDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -2 && diffDays <= 5 && o.shipmentStatus !== 'Received by customer' && o.shipmentStatus !== 'Review taken';
  });

  // Payments due alert: deliveries in 7 days where balanceDue > 0
  const paymentsDueAlerts = orders.filter(o => {
    if (o.payment.balanceDue <= 0) return false;
    if (!o.deliveryDate) return false;
    const delDate = new Date(o.deliveryDate);
    const diffTime = delDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  // Overdue from Karigars:
  // If given to karigar was more than 7 days ago and still not received, OR delivery is less than 4 days and still at karigar
  const overdueKarigarsList: { name: string; type: string; karigar: string; deliveryDate: string; details: string; parentOrder?: Order; itemRef?: EmbroideryStockItem }[] = [];

  orders.forEach(o => {
    o.sarees.forEach(s => {
      if (s.tracking.givenToKarigar && !s.tracking.receivedFromKarigar) {
        let isOverdue = false;
        let reason = '';
        
        if (s.tracking.givenToKarigarDate) {
          const givenDate = new Date(s.tracking.givenToKarigarDate);
          const elapsedDays = Math.ceil((now.getTime() - givenDate.getTime()) / (1000 * 60 * 60 * 24));
          if (elapsedDays > 8) {
            isOverdue = true;
            reason = `With karigar for ${elapsedDays} days`;
          }
        }
        
        if (o.deliveryDate) {
          const delDate = new Date(o.deliveryDate);
          const daysToDel = Math.ceil((delDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToDel <= 4) {
            isOverdue = true;
            reason = reason ? `${reason} (Delivery in ${daysToDel} days!)` : `Delivery in ${daysToDel} days`;
          }
        }

        if (isOverdue) {
          overdueKarigarsList.push({
            name: s.name,
            type: s.type,
            karigar: s.karigar || 'Unassigned',
            deliveryDate: o.deliveryDate,
            details: reason,
            parentOrder: o
          });
        }
      }
    });
  });

  // Also add embroidery stock items with Given to Karigar which are old
  embroideryItems.forEach(item => {
    if (item.status === 'Given to karigar') {
      const parsedDate = new Date(item.lastUpdated);
      const days = Math.ceil((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 10) {
        overdueKarigarsList.push({
          name: `Stock Piece: ${item.barcode}`,
          type: item.type.replace(/_/g, ' '),
          karigar: item.karigar,
          deliveryDate: 'No delivery cap',
          details: `Unreturned for ${days} days`,
          itemRef: item
        });
      }
    }
  });

  // Card stats config
  const statCards = [
    {
      id: 'stat-outstanding',
      title: 'Outstanding Payments',
      value: (userRole === 'staff' && accessSettings?.hideCustomRev) ? '🔒 Hidden' : `₹${outstandingPayments.toLocaleString('en-IN')}`,
      icon: Landmark,
      borderColor: 'border-l-[#5d191d]',
      textColor: 'text-brand-wine',
      tab: 'Custom Orders',
      subtitle: (userRole === 'staff' && accessSettings?.hideCustomRev) ? 'Internal Confidential' : 'Click to view customer ledgers'
    },
    {
      id: 'stat-karigars',
      title: 'Pieces with Karigars',
      value: totalPiecesWithKarigars.toString(),
      icon: Users,
      borderColor: 'border-l-[#b8860b]',
      textColor: 'text-[#2c1810]',
      tab: 'Embroidery Sarees',
      subtitle: `${sareesAtKarigar} custom sarees • ${stockAtKarigar} stock items`
    },
    {
      id: 'stat-progress',
      title: 'Orders in Progress',
      value: ordersInProgress.toString(),
      icon: Clock,
      borderColor: 'border-l-stone-300',
      textColor: 'text-[#2c1810]',
      tab: 'Custom Orders',
      subtitle: 'Awaiting completion / delivery'
    },
    {
      id: 'stat-online',
      title: 'Online Orders to Ship',
      value: onlineToShip.toString(),
      icon: ShoppingCart,
      borderColor: 'border-l-[#5d191d]',
      textColor: 'text-[#2c1810]',
      tab: 'Online Orders',
      subtitle: 'Immediate dispatch required'
    }
  ];

  return (
    <div id="dashboard-view-root" className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-brand-wine p-6 rounded-2xl text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 font-serif-display text-9xl pointer-events-none transform translate-x-12 -translate-y-6">PALKHE</div>
        <div className="relative z-10 space-y-2">
          <p className="text-brand-gold font-medium uppercase tracking-wider text-xs">MUMBAI • SINCE 1991</p>
          <h2 className="text-3xl font-serif-display font-medium tracking-tight">Karkhana Overview & Alerts</h2>
          <p className="text-brand-cream/80 text-sm max-w-xl font-light">
            Welcome to PALKHE command hub. Manage your heirloom sarees, coordinate artisans, track advances, and monitor premium custom bridal commissions.
          </p>
        </div>
        <div className="mt-4 md:mt-0 relative z-10 flex flex-col items-end text-right">
          <span className="text-xs text-brand-gold-light font-mono px-3 py-1 bg-white/10 rounded-full">
            UTC {now.toISOString().split('T')[0]}
          </span>
          <p className="text-lg font-serif-display text-brand-cream mt-2">Palkhi Sarees Admin Console</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              id={stat.id}
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onNavigateToTab(stat.tab)}
              className={`p-5 rounded-2xl border border-brand-cream-dark border-l-4 ${stat.borderColor} bg-white shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-brand-wine-soft text-brand-wine">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400"><ArrowUpRight className="w-4 h-4 text-brand-gold" /></span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider">{stat.title}</span>
                <span className={`text-2xl font-serif-display font-medium ${stat.textColor} mt-1 block`}>{stat.value}</span>
              </div>
              <div className="border-t border-brand-cream-dark pt-3 mt-4 text-[11px] text-gray-400 font-medium italic flex items-center justify-between">
                <span>{stat.subtitle}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alerts Sections */}
      <div className={`grid grid-cols-1 ${userRole === 'staff' && accessSettings?.hideCustomRev ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
        {/* Karigar Overdue List */}
        <div id="overdue-karigars-box" className="bg-white p-6 rounded-2xl border border-brand-cream-dark shadow-sm flex flex-col h-[420px]">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-serif-display font-bold text-lg text-brand-wine">Overdue from Artisans</h3>
              <p className="text-xs text-gray-500">Unreturned pieces or upcoming deadlines</p>
            </div>
            <span className="ml-auto bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {overdueKarigarsList.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 scrollbar-thin">
            {overdueKarigarsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-gray-400 italic">All karigars operating within timeline boundaries.</p>
              </div>
            ) : (
              overdueKarigarsList.map((item, index) => (
                <div
                  id={`overdue-karigar-item-${index}`}
                  key={index}
                  onClick={() => {
                    if (item.parentOrder) {
                      onSelectOrder(item.parentOrder);
                      onNavigateToTab(item.parentOrder.orderType === 'custom' ? 'Custom Orders' : 'Online Orders');
                    } else if (item.itemRef) {
                      onNavigateToTab('Embroidery Sarees');
                    }
                  }}
                  className="bg-white hover:bg-brand-wine/5 p-3 rounded-xl border border-brand-cream-dark transition-all duration-200 cursor-pointer space-y-1 group"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-xs text-stone-800 line-clamp-1 group-hover:text-brand-wine">{item.name}</span>
                    <span className="text-[10px] uppercase bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                      Overdue
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 flex justify-between">
                    <span>Artisan: <strong className="text-brand-wine">{item.karigar}</strong></span>
                    <span className="text-[10px] text-stone-400 font-mono">Deliv: {item.deliveryDate}</span>
                  </p>
                  <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1 font-medium select-none">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{item.details}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payments Due List */}
        {!(userRole === 'staff' && accessSettings?.hideCustomRev) && (
          <div id="payments-due-box" className="bg-white p-6 rounded-2xl border border-brand-cream-dark shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <IndianRupee className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-serif-display font-bold text-lg text-brand-wine">Payments Outstanding</h3>
                <p className="text-xs text-gray-500">Approaching delivery date with due balance</p>
              </div>
              <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {paymentsDueAlerts.length}
              </span>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {paymentsDueAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm text-gray-400 italic">No pending collections are currently urgent.</p>
                </div>
              ) : (
                paymentsDueAlerts.map(order => (
                  <div
                    id={`payment-due-item-${order.id}`}
                    key={order.id}
                    onClick={() => {
                      onSelectOrder(order);
                      onNavigateToTab(order.orderType === 'custom' ? 'Custom Orders' : 'Online Orders');
                    }}
                    className="bg-white hover:bg-brand-gold/5 p-3 rounded-xl border border-brand-cream-dark transition-all duration-200 cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex justify-between items-center bg-brand-cream p-1.5 rounded-lg border border-brand-cream-dark/55">
                      <strong className="text-xs font-mono text-brand-wine">{order.orderNumber}</strong>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">{order.orderType} order</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-stone-800 group-hover:text-brand-wine">{order.customerName}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">{order.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-amber-800">₹{order.payment.balanceDue.toLocaleString('en-IN')}</p>
                        <p className="text-[9px] text-gray-400">of ₹{order.payment.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 border-t border-stone-100 pt-1.5 font-mono">
                      <span>Deliv: {order.deliveryDate}</span>
                      <span className="text-red-700 bg-red-50 px-1.5 rounded text-[9px] font-bold">Collect Before dispatch</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Deliveries Approaching List */}
        <div id="deliveries-due-box" className="bg-white p-6 rounded-2xl border border-brand-cream-dark shadow-sm flex flex-col h-[420px]">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-serif-display font-bold text-lg text-brand-wine">Deliveries Scheduled</h3>
              <p className="text-xs text-gray-500">Orders to dispatch within 5 days</p>
            </div>
            <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {approachingDeliveries.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 scrollbar-thin">
            {approachingDeliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-gray-400 italic">No urgent deliveries scheduled for this week.</p>
              </div>
            ) : (
              approachingDeliveries.map(order => (
                <div
                  id={`delivery-item-${order.id}`}
                  key={order.id}
                  onClick={() => {
                    onSelectOrder(order);
                    onNavigateToTab(order.orderType === 'custom' ? 'Custom Orders' : 'Online Orders');
                  }}
                  className="bg-white hover:bg-emerald-50/40 p-3 rounded-xl border border-brand-cream-dark transition-all duration-200 cursor-pointer space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-800 group-hover:text-brand-wine">{order.customerName}</span>
                    <span className="text-[10px] font-mono font-bold text-brand-gold-dark">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px] items-center bg-brand-cream border border-brand-cream-dark p-2 rounded-lg">
                    <span className="text-stone-500 font-mono">Date: <strong>{order.deliveryDate}</strong></span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      order.shipmentStatus === 'Dispatched' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.shipmentStatus}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">Items: {order.sarees.map(s => `${s.type} (${s.colour})`).join(', ')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
