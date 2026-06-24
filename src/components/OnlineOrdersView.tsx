import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, SareeItem, SareeSource, ShipmentStatus, AccessSettings } from '../types';
import { ALL_KARIGARS, EMBROIDERIES_TYPES_LIST, SAREE_TYPES_LIST, PAYMENT_MODES } from '../mockData';
import { formatTitleCase, generateWhatsAppOrderMsg, PINCODE_DIRECTORY, autoDetectPinCode } from '../utils';
import { Plus, Trash2, Search, Calendar, Phone, MapPin, CreditCard, ChevronDown, Check, Printer, Share2, Clipboard, Edit, Eye, EyeOff, X, Mail, Scissors, Sparkles, Sliders, AlertCircle, Instagram, Upload, CheckCircle2, Globe } from 'lucide-react';

interface OnlineOrdersViewProps {
  orders: Order[];
  onAddOrder: (newOrder: Order) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  onDeleteOrder: (id: string) => void;
  searchTerm: string;
  onNavigateToTab: (tab: string, simulatedOrder?: Order) => void;
  userRole?: 'owner' | 'staff';
  accessSettings?: AccessSettings;
}

export default function OnlineOrdersView({ orders, onAddOrder, onUpdateOrder, onDeleteOrder, searchTerm, onNavigateToTab, userRole = 'owner', accessSettings }: OnlineOrdersViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Custom Preset Photos list for high fidelity visuals
  const PRESET_PHOTOS = [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600'
  ];

  // Core Form variables matching the custom screenshot layout
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; state: string; area: string } | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [courierTracking, setCourierTracking] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>('Pending');
  const [sarees, setSarees] = useState<SareeItem[]>([]);
  
  // Advanced fields states matching user's custom layout
  const [orderNumberStr, setOrderNumberStr] = useState('');
  const [shopifyNumber, setShopifyNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [salesHand, setSalesHand] = useState('Vaseem');
  const [country, setCountry] = useState('India');
  const [shippingCountry, setShippingCountry] = useState('India');
  const [shippingPhone, setShippingPhone] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [orderSource, setOrderSource] = useState('Instagram');

  // Multi-amount & charges states
  const [courierCharges, setCourierCharges] = useState<number>(0);
  const [blouseCharges, setBlouseCharges] = useState<number>(0);
  const [dupattaCharges, setDupattaCharges] = useState<number>(0);
  const [shippingCharges, setShippingCharges] = useState<number>(0);

  // Split payments
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('UPI (Razorpay Storefront)');
  const [paidAmount2, setPaidAmount2] = useState<number>(0);
  const [paymentMode2, setPaymentMode2] = useState('Bank Transfer');

  // Image attachment states
  const [advance1Receipt, setAdvance1Receipt] = useState('');
  const [advance2Receipt, setAdvance2Receipt] = useState('');
  const [cashMemoPhoto, setCashMemoPhoto] = useState('');
  const [voucherSlipPhoto, setVoucherSlipPhoto] = useState('');
  const [notes, setNotes] = useState('');

  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Auto detect PIN action
  const handlePinCodeChange = (val: string) => {
    setPinCode(val);
    const result = autoDetectPinCode(val);
    if (result) {
      setDetectedLocation(result);
      // Auto populate address with area details
      setCustomerAddress(prev => {
        const base = prev.split(', Pin:')[0]; // clean old auto fills
        return `${base ? base + ', ' : ''}${result.area}, ${result.city}, ${result.state} - Pin: ${val}`;
      });
    } else {
      setDetectedLocation(null);
    }
  };

  const createEmptySaree = (): SareeItem => ({
    id: `sar-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: '',
    type: 'Banarasi',
    colour: '',
    price: 0,
    source: 'Ready stock',
    barcode: 'BC-' + Math.floor(100000 + Math.random() * 900000),
    karigar: '',
    supplier: '',
    embroideryTypes: [],
    description: '',
    sareePhoto: '',
    embroideryPhoto: '',
    tracking: {
      plainSareeReceived: true,
      givenToKarigar: false,
      givenToKarigarDate: '',
      receivedFromKarigar: false,
      receivedFromKarigarDate: ''
    },
    blouse: {
      added: false,
      charge: 0,
      measurements: {
        bust: '',
        waist: '',
        shoulder: '',
        frontNeck: '',
        backNeck: '',
        sleeveLength: '',
        notes: ''
      }
    },
    dupatta: {
      added: false,
      colour: '',
      fabric: '',
      embroidery: '',
      charge: 0,
      photo: ''
    }
  });

  const handleSelectRandomPhoto = (type: string, sIdx?: number) => {
    const randomUrl = PRESET_PHOTOS[Math.floor(Math.random() * PRESET_PHOTOS.length)];
    if (type === 'sareePhoto' && typeof sIdx === 'number') {
      updateSareeItemByIndex(sIdx, { sareePhoto: randomUrl });
    } else if (type === 'blouseFront') {
      const m = sarees[0]?.blouse.measurements || {};
      updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, frontPhoto: randomUrl } } });
    } else if (type === 'blouseBack') {
      const m = sarees[0]?.blouse.measurements || {};
      updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, backPhoto: randomUrl } } });
    } else if (type === 'blouseSleeve') {
      const m = sarees[0]?.blouse.measurements || {};
      updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, sleevePhoto: randomUrl } } });
    } else if (type === 'blouseSketch') {
      const m = sarees[0]?.blouse.measurements || {};
      updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, sketchPhoto: randomUrl } } });
    } else if (type === 'advance1Receipt') {
      setAdvance1Receipt(randomUrl);
    } else if (type === 'advance2Receipt') {
      setAdvance2Receipt(randomUrl);
    } else if (type === 'cashMemoPhoto') {
      setCashMemoPhoto(randomUrl);
    } else if (type === 'voucherSlipPhoto') {
      setVoucherSlipPhoto(randomUrl);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingOrder(null);
    setOrderNumberStr(`ON-${1100 + Math.floor(Math.random() * 900)}`);
    setShopifyNumber('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setSalesHand('Vaseem');
    setCustomerName('');
    setCustomerPhone('');
    setCountry('India');
    setCustomerAddress('');
    setShippingCountry('India');
    setShippingPhone('');
    setInstagramHandle('');
    setOrderSource('Instagram');
    setPinCode('');
    setDetectedLocation(null);
    setDeliveryDate('');
    setCourierTracking('');
    setShipmentStatus('Pending');
    setSarees([createEmptySaree()]);
    
    setCourierCharges(0);
    setBlouseCharges(0);
    setDupattaCharges(0);
    setShippingCharges(0);
    
    setPaidAmount(0);
    setPaymentMode('UPI (Razorpay Storefront)');
    setPaidAmount2(0);
    setPaymentMode2('Bank Transfer');
    
    setAdvance1Receipt('');
    setAdvance2Receipt('');
    setCashMemoPhoto('');
    setVoucherSlipPhoto('');
    setNotes('');
    
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (order: Order) => {
    setEditingOrder(order);
    setOrderNumberStr(order.orderNumber);
    setShopifyNumber(order.shopifyNumber || '');
    setOrderDate(order.createdAt.split('T')[0]);
    setSalesHand(order.salesHand || 'Vaseem');
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCountry(order.country || 'India');
    setCustomerAddress(order.customerAddress);
    setShippingCountry(order.shippingCountry || 'India');
    setShippingPhone(order.shippingPhone || '');
    setInstagramHandle(order.instagramHandle || '');
    setOrderSource(order.orderSource || 'Instagram');
    setPinCode(order.pinCode || '');
    setDeliveryDate(order.deliveryDate || '');
    setCourierTracking(order.courierTracking || '');
    setShipmentStatus(order.shipmentStatus);
    
    setSarees(JSON.parse(JSON.stringify(order.sarees)));
    
    setCourierCharges(order.courierCharges || 0);
    setBlouseCharges(order.blouseCharges || 0);
    setDupattaCharges(order.dupattaCharges || 0);
    setShippingCharges(order.shippingCharges || 0);
    
    setPaidAmount(order.payment.advance1 || 0);
    setPaymentMode(order.payment.advance1Mode || 'UPI (Razorpay Storefront)');
    setPaidAmount2(order.payment.advance2 || 0);
    setPaymentMode2(order.payment.advance2Mode || 'Bank Transfer');
    
    setAdvance1Receipt(order.advance1Receipt || '');
    setAdvance2Receipt(order.advance2Receipt || '');
    setCashMemoPhoto(order.cashMemoPhoto || '');
    setVoucherSlipPhoto(order.voucherSlipPhoto || '');
    setNotes(order.notes || '');
    
    setIsFormOpen(true);
  };

  const updateSareeItem = (sareeId: string, updates: Partial<SareeItem>) => {
    setSarees(prev => prev.map(s => {
      if (s.id !== sareeId) return s;
      const newSaree = { ...s, ...updates };
      if (updates.name !== undefined) newSaree.name = formatTitleCase(updates.name);
      if (updates.colour !== undefined) newSaree.colour = formatTitleCase(updates.colour);
      return newSaree;
    }));
  };

  const updateSareeItemByIndex = (index: number, updates: Partial<SareeItem>) => {
    setSarees(prev => prev.map((s, idx) => {
      if (idx !== index) return s;
      const newSaree = { ...s, ...updates };
      if (updates.name !== undefined) newSaree.name = formatTitleCase(updates.name);
      if (updates.colour !== undefined) newSaree.colour = formatTitleCase(updates.colour);
      return newSaree;
    }));
  };

  const toggleEmbroideryType = (sareeId: string, type: string) => {
    setSarees(prev => prev.map(s => {
      if (s.id !== sareeId) return s;
      const types = s.embroideryTypes.includes(type)
        ? s.embroideryTypes.filter(t => t !== type)
        : [...s.embroideryTypes, type];
      return { ...s, embroideryTypes: types };
    }));
  };

  const calculateTotals = () => {
    const sareesPriceTotal = sarees.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const finalTotal = sareesPriceTotal + 
                       Number(blouseCharges || 0) + 
                       Number(dupattaCharges || 0) + 
                       Number(shippingCharges || 0) + 
                       Number(courierCharges || 0);
    const totalPaid = Number(paidAmount || 0) + Number(paidAmount2 || 0);
    const balance = finalTotal - totalPaid;
    return { total: finalTotal, balance: balance < 0 ? 0 : balance, totalPaid };
  };

  const totals = calculateTotals();

  // Save Handlers
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || sarees.length === 0) {
      alert('Fill out customer name, phone, and add a saree row.');
      return;
    }

    const { total, balance } = totals;
    
    const payload: Order = {
      id: editingOrder ? editingOrder.id : `order-${Date.now()}`,
      orderNumber: orderNumberStr || (editingOrder ? editingOrder.orderNumber : `ON-${1100 + Math.floor(Math.random() * 900)}`),
      orderType: 'online',
      customerName: formatTitleCase(customerName),
      customerPhone,
      customerAddress,
      pinCode,
      deliveryDate,
      courierTracking,
      shipmentStatus,
      sarees,
      payment: {
        total,
        advance1: paidAmount,
        advance1Mode: paymentMode,
        advance2: paidAmount2,
        advance2Mode: paymentMode2,
        balanceDue: balance
      },
      createdAt: orderDate || (editingOrder ? editingOrder.createdAt : new Date().toISOString().split('T')[0]),
      
      shopifyNumber,
      salesHand,
      country,
      shippingCountry,
      shippingPhone,
      instagramHandle,
      orderSource,
      courierCharges,
      blouseCharges,
      dupattaCharges,
      shippingCharges,
      advance1Receipt,
      advance2Receipt,
      cashMemoPhoto,
      voucherSlipPhoto,
      notes
    };

    if (editingOrder) {
      onUpdateOrder(payload);
    } else {
      onAddOrder(payload);
    }

    setIsFormOpen(false);
    setEditingOrder(null);
  };

  // Label Printing Utility
  const triggerPrintLabel = (order: Order) => {
    const printContent = document.getElementById(`print-label-layer-${order.id}`);
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printHtml = printContent.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>PALKHE — Shipping Label</title>
          <style>
            body { font-family: 'Inter', sans-serif; background: white; padding: 20px; display: flex; justify-content: center; }
            .label-border { width: 420px; border: 4px solid #1a1510; padding: 20px; border-radius: 12px; }
            .barcode { font-family: 'Courier New', monospace; letter-spacing: 5px; font-weight: bold; background: #eee; padding: 10px; text-align: center; font-size: 18px; border: 2px dashed #333; margin: 15px 0; }
            .sender { font-size: 11px; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
            .receiver { font-size: 15px; line-height: 1.5; font-weight: bold; }
            .meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-top: 15px; border-top: 2px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          ${printHtml}
        </body>
      </html>
    `;

    window.print();
    window.location.reload();
  };

  // Generate public custom portal link
  const generatePortalLink = (order: Order) => {
    return `${window.location.origin}?portal=true&orderNum=${order.orderNumber}`;
  };

  const copyToClipboard = (order: Order) => {
    const link = generatePortalLink(order);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 3000);
    });
  };

  const filteredOrders = orders.filter(o => {
    if (o.orderType !== 'online') return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerPhone.includes(searchLower) ||
      o.orderNumber.toLowerCase().includes(searchLower) ||
      (o.pinCode && o.pinCode.includes(searchLower))
    );
  });

  return (
    <div id="online-orders-root" className="space-y-6">
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-cream-dark/60 shadow-sm leading-tight">
        <div>
          <h2 className="text-2xl font-serif-display font-bold text-brand-wine">Online Retail Storefront Orders</h2>
          <p className="text-xs text-gray-500">Track eCommerce shipping lists, auto-detect postal metrics, and generate digital client portals.</p>
        </div>
        <button
          id="btn-new-online-order"
          onClick={handleOpenCreateForm}
          className="bg-brand-wine hover:bg-brand-text active:scale-95 text-white font-medium text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-brand-gold" />
          <span>New Online Order</span>
        </button>
      </div>

      {/* Online List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-brand-gold/30">
            <p className="text-gray-400 italic font-serif-display text-lg">No online orders found matching filter keys.</p>
            <p className="text-xs text-gray-400 mt-1">Add an entry or look up another postal PIN.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const hasOverdueMeasurements = order.sarees.some(
              s => s.blouse.added && (!s.blouse.measurements?.bust || !s.blouse.measurements?.waist)
            );
            return (
              <motion.div
                id={`online-order-card-${order.id}`}
                key={order.id}
                layout
                className="bg-white rounded-2xl border border-brand-cream-dark shadow-sm overflow-hidden"
              >
                {/* Banner */}
                <div className="bg-brand-cream-dark/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-cream-dark/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-800 border border-slate-200 uppercase px-2 py-0.5 rounded font-bold">
                      E-Store Front
                    </span>
                    <strong className="font-serif-display text-brand-wine text-lg">{order.orderNumber}</strong>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      order.shipmentStatus === 'Dispatched' ? 'bg-indigo-50 text-indigo-700' :
                      order.shipmentStatus === 'Received by customer' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {order.shipmentStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Badges Total / Paid / Balance */}
                  {userRole === 'staff' && accessSettings?.hideOnlineRev ? (
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2.5 py-1 rounded-xl font-semibold italic flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      Financials Locked
                    </span>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1 rounded font-semibold">Total: ₹{order.payment.total.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-semibold">Paid: ₹{order.payment.advance1.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] px-2 py-1 rounded font-semibold ${
                        order.payment.balanceDue > 0 ? 'bg-rose-50 text-rose-700' : 'bg-green-50 text-green-750'
                      }`}>
                        Bal: ₹{order.payment.balanceDue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                                {/* Main Content Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Delivery specifications */}
                  <div className="lg:col-span-4 space-y-4 border-r border-stone-100 pr-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Client Credentials</span>
                        <h3 className="text-base font-serif-display font-bold text-stone-800 mt-0.5">{order.customerName}</h3>
                        <p className="text-xs text-brand-wine font-mono mt-0.5">{order.customerPhone}</p>
                        {order.instagramHandle && (
                          <div className="flex items-center gap-1 text-[11px] text-pink-600 font-semibold mt-1">
                            <Instagram className="w-3 h-3 text-pink-500" />
                            <span>@{order.instagramHandle}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {order.shopifyNumber && (
                          <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-mono mb-1">
                            {order.shopifyNumber}
                          </span>
                        )}
                        <span className="block text-[10px] text-stone-500 font-semibold">
                          Via {order.orderSource || 'Instagram'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-150 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-gray-450 uppercase">Mailing Address Spec</span>
                        {order.country && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 rounded font-bold">
                            {order.country}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-750 font-medium leading-relaxed">{order.customerAddress}</p>
                      {order.shippingPhone && (
                        <p className="text-[11px] text-stone-550 mt-1">
                          Shipping Tel: <span className="font-mono text-stone-800">{order.shippingPhone}</span>
                        </p>
                      )}
                      {order.pinCode && (
                        <div className="text-[10px] text-brand-gold-dark font-semibold mt-1 font-mono">
                          📍 Postal ZIP detected: {order.pinCode}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-dashed border-stone-100 pt-2.5">
                      <div>
                        <span className="block text-[9px] text-stone-400 font-bold uppercase">Sales Hand</span>
                        <span className="font-bold text-stone-800">{order.salesHand || 'Vaseem'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-stone-400 font-bold uppercase">Dispatch Target</span>
                        <span className="font-bold text-stone-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                          {order.deliveryDate || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Alert for client measurements */}
                    {hasOverdueMeasurements && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl flex items-start gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <strong className="block font-bold">Blouse Measurements Pending</strong>
                          <span className="text-[11px] text-rose-700">Client has not yet provided custom dimensions for matching blouse. Use customer portal link below.</span>
                        </div>
                      </div>
                    )}
                  </div>     </div>

                  {/* Saree List */}
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Registered Shopping Cart Items</span>
                    {order.sarees.map((s, sIdx) => (
                      <div key={s.id} className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                            <span>{sIdx+1}. {s.name}</span>
                            <span className="bg-stone-200 text-stone-700 font-mono text-[9px] px-1.5 rounded">{s.type}</span>
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-1">Shade: <strong>{s.colour}</strong> • Code: <strong className="font-mono text-stone-700">{s.barcode || 'N/A'}</strong></p>
                          
                          {/* Blouse stitching detail preview */}
                          {s.blouse.added && (
                            <p className="text-[10px] text-pink-600 mt-1 font-mono select-none">
                              ✂️ Blouse custom requested (Fitting: {s.blouse.measurements?.bust ? `${s.blouse.measurements.bust} Bust, ${s.blouse.measurements.waist} Waist` : 'Awaiting Inputs'})
                            </p>
                          )}
                        </div>
                        <div className="text-right font-mono text-xs font-bold text-stone-900">
                          {userRole === 'staff' && accessSettings?.hideOnlineRev ? '🔒 Hidden' : `₹${s.price.toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-brand-cream/15 px-6 py-4 border-t border-stone-100 flex flex-wrap justify-between items-center gap-4">
                  {/* Personalised Customer Form Button */}
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`btn-portal-sim-${order.id}`}
                      onClick={() => onNavigateToTab('Customer Portal', order)}
                      className="bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold-dark font-bold text-xs p-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Simulate Customer Form Submission</span>
                    </button>

                    <button
                      id={`btn-copy-link-${order.id}`}
                      onClick={() => copyToClipboard(order)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs p-2 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-stone-500" />
                      <span>{copiedOrderId === order.id ? 'Copied Link!' : 'Copy Portal Link'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-printable-label-${order.id}`}
                      onClick={() => triggerPrintLabel(order)}
                      className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-stone-400" />
                      <span>Print Label</span>
                    </button>

                    <button
                      id={`btn-edit-online-${order.id}`}
                      onClick={() => handleOpenEditForm(order)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 p-2 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4 text-stone-500" />
                      <span>Edit Order</span>
                    </button>
                    
                    <button
                      id={`btn-delete-online-${order.id}`}
                      onClick={() => {
                        if (confirm(`Instantly remove online order ${order.orderNumber}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="text-stone-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Shipping Label Invisible Template */}
                <div id={`print-label-layer-${order.id}`} className="hidden">
                  <div className="label-border">
                    <div className="sender">
                      <strong>SENDER DETAILS:</strong><br/>
                      Palkhi Sarees Mumbai Estate (Est 1991)<br/>
                      Karkhana House, Fort Arcade, Mumbai - 400001
                    </div>
                    <div className="receiver">
                      <strong>SHIP TO:</strong><br/>
                      {order.customerName}<br/>
                      {order.customerAddress}<br/>
                      Mobile: {order.customerPhone}<br/>
                    </div>
                    <div className="barcode">
                      {order.orderNumber}
                    </div>
                    <div className="meta">
                      <div>METHOD: BlueDart Air Express</div>
                      <div>WEIGHT: Balanced Cloth package</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Saree Form Drawer Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div id="online-form-overlay" className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="bg-brand-cream w-full max-w-4xl h-screen shadow-2xl relative flex flex-col border-l border-brand-cream-dark"
            >
              {/* Premium Luxury Sticky Header */}
              <div className="flex justify-between items-center bg-stone-900 px-6 py-4 border-b border-brand-gold/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-gold/15 text-brand-gold rounded-xl border border-brand-gold/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif-display font-medium text-brand-cream tracking-tight">
                      {editingOrder ? 'Edit Online Order' : 'New online order'}
                    </h3>
                    <p className="text-[11px] text-stone-300 font-mono tracking-wider">
                      FOR LUXURY PRODUCTS SOLD ONLINE
                    </p>
                  </div>
                </div>
                <button
                  id="btn-close-online-form"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Scroll Area */}
              <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pr-4">
                
                {/* 1. ORDER & CUSTOMER */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/65 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <span className="text-xs bg-stone-900 text-stone-100 font-mono px-2 py-0.5 rounded font-bold">1</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-wine-dark">ORDER & CUSTOMER</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Online Order No / No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ON-1100"
                        value={orderNumberStr}
                        onChange={e => setOrderNumberStr(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Shopify No (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop-1025"
                        value={shopifyNumber}
                        onChange={e => setShopifyNumber(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Order Date</label>
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={e => setOrderDate(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Sales Hand / Executive</label>
                      <select
                        value={salesHand}
                        onChange={e => setSalesHand(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 font-bold focus:bg-white focus:outline-brand-gold"
                      >
                        <option value="Vaseem">Vaseem</option>
                        <option value="Irfan">Irfan</option>
                        <option value="Abdul">Abdul</option>
                        <option value="Amina">Amina</option>
                        <option value="Meera">Meera</option>
                        <option value="Staff">Generic Staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Raveena Tandon"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        onBlur={() => setCustomerName(formatTitleCase(customerName))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Customer Phone *</label>
                      <div className="flex gap-1.5">
                        <span className="bg-stone-100 border border-stone-200 text-stone-600 rounded-lg px-2.5 py-2 text-xs font-mono flex items-center select-none">+91</span>
                        <input
                          type="tel"
                          required
                          placeholder="91204 44558"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:outline-brand-gold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="e.g. India"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Postal ZIP Code (Auto-Region Mapping)</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 400018"
                        value={pinCode}
                        onChange={e => handlePinCodeChange(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-amber-50/50 border border-brand-gold/30 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-brand-gold"
                      />
                      {detectedLocation && (
                        <p className="text-[10px] text-emerald-700 font-bold mt-1">
                          ✓ Auto Recognised: {detectedLocation.area}, {detectedLocation.city} ({detectedLocation.state})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Shipping destination address</label>
                      <textarea
                        rows={2}
                        placeholder="Address block..."
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Shipping Phone (Optional, if different)</label>
                      <div className="flex gap-1.5">
                        <span className="bg-stone-100 border border-stone-200 text-stone-600 rounded-lg px-2.5 py-2 text-xs font-mono flex items-center select-none">+</span>
                        <input
                          type="tel"
                          placeholder="e.g. 91204 44558"
                          value={shippingPhone}
                          onChange={e => setShippingPhone(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:outline-brand-gold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Instagram Handle / website link</label>
                      <div className="flex gap-1.5">
                        <span className="bg-stone-100 border border-stone-200 text-pink-600 rounded-lg px-2.5 py-2 text-xs font-mono flex items-center"><Instagram className="w-3.5 h-3.5" /></span>
                        <input
                          type="text"
                          placeholder="e.g. raveena_official"
                          value={instagramHandle}
                          onChange={e => setInstagramHandle(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-brand-gold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 tracking-wider mb-1">Order Source</label>
                      <select
                        value={orderSource}
                        onChange={e => setOrderSource(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 font-bold focus:bg-white focus:outline-brand-gold"
                      >
                        <option value="Instagram">Instagram Direct Messenger</option>
                        <option value="Website">Shopify Store website</option>
                        <option value="WhatsApp">WhatsApp Business line</option>
                        <option value="Store">In-store Walkin</option>
                        <option value="Exhibition">Exhibition stock outlet</option>
                        <option value="Custom Order">Highly customized atelier request</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. SAREES & BLOCK PRINT */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/65 shadow-xs space-y-5">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-stone-900 text-stone-100 font-mono px-2 py-0.5 rounded font-bold">2</span>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-wine-dark">SAREES & BLOCK PRINT</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSarees(prev => [...prev, createEmptySaree()])}
                      className="bg-brand-wine text-white hover:bg-brand-text text-normal-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer select-none transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Saree Item</span>
                    </button>
                  </div>
                  
                  <p className="text-xs text-stone-500 italic">
                    Select which saree with embroidery, block prints etc. the customer wants. The actual total ends up here.
                  </p>

                  <div className="space-y-6">
                    {sarees.map((saree, sIdx) => (
                      <div key={saree.id} className="relative bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80 space-y-4">
                        {sarees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSarees(prev => prev.filter(s => s.id !== saree.id))}
                            className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 px-2.5 py-0.5 bg-stone-200 rounded">
                            Saree {sIdx + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Fabric Saree Name / Type</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Lavender Georgette Handcrafted"
                              value={saree.name}
                              onChange={e => updateSareeItemByIndex(sIdx, { name: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-brand-gold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Saree Fabric Base</label>
                            <select
                              value={saree.type}
                              onChange={e => updateSareeItemByIndex(sIdx, { type: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-brand-gold"
                            >
                              {SAREE_TYPES_LIST.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Colour shade</label>
                            <input
                              type="text"
                              placeholder="e.g. Magenta Pink"
                              value={saree.colour}
                              onChange={e => updateSareeItemByIndex(sIdx, { colour: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-brand-gold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-650 mb-1">Price (₹) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="Price"
                              value={saree.price || ''}
                              onChange={e => updateSareeItemByIndex(sIdx, { price: Number(e.target.value) })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-right font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-650 mb-1">Saree Work Style</label>
                            <select
                              value={saree.source} // using source for style
                              onChange={e => updateSareeItemByIndex(sIdx, { source: e.target.value as SareeSource })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700"
                            >
                              <option value="Ready stock">Ready work</option>
                              <option value="Make-to-order">Custom work</option>
                              <option value="Direct from supplier">Supplier Block Print</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-650 mb-1">Barcode ID</label>
                            <input
                              type="text"
                              placeholder="PK-BAR-XXXX"
                              value={saree.barcode || ''}
                              onChange={e => updateSareeItemByIndex(sIdx, { barcode: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase text-stone-650 mb-1">Saree Status</label>
                            <select
                              value={saree.tracking.plainSareeReceived ? 'Received from karigar' : 'Pending'}
                              onChange={e => {
                                const val = e.target.value;
                                updateSareeItemByIndex(sIdx, {
                                  tracking: {
                                    ...saree.tracking,
                                    plainSareeReceived: val === 'Received from karigar',
                                    givenToKarigar: val === 'GivenToKarigar' || val === 'Received from karigar',
                                    receivedFromKarigar: val === 'Received from karigar'
                                  }
                                });
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700"
                            >
                              <option value="Pending">Pending</option>
                              <option value="GivenToKarigar">Given to Karigar</option>
                              <option value="Received from karigar">Ready / Received</option>
                            </select>
                          </div>
                        </div>

                        {/* Blouse toggle checkbox and saree photo */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2.5 border-t border-dashed border-stone-200">
                          <div className="md:col-span-8">
                            <label className="flex items-center gap-2.5 text-xs font-semibold text-rose-750 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={saree.blouse.added}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  updateSareeItemByIndex(sIdx, {
                                    blouse: {
                                      ...saree.blouse,
                                      added: checked,
                                      charge: checked ? (saree.blouse.charge || 4000) : 0,
                                      measurements: checked ? (saree.blouse.measurements || { notes: '' }) : undefined
                                    }
                                  });
                                  // Update blouse charges preset sum
                                  if (checked && blouseCharges === 0) {
                                    setBlouseCharges(4000);
                                  }
                                }}
                                className="rounded text-rose-600 border-stone-300 w-4 h-4"
                              />
                              <span className="flex items-center gap-1">
                                <Scissors className="w-3.5 h-3.5 text-pink-600" />
                                Custom Blouse Stitching requested for Saree {sIdx+1}?
                              </span>
                            </label>
                          </div>

                          <div className="md:col-span-4 flex justify-end">
                            <div className="flex items-center gap-3">
                              {saree.sareePhoto ? (
                                <div className="relative w-12 h-12 rounded-lg border border-stone-300 bg-cover bg-center" style={{ backgroundImage: `url(${saree.sareePhoto})` }}>
                                  <button
                                    type="button"
                                    onClick={() => updateSareeItemByIndex(sIdx, { sareePhoto: '' })}
                                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSelectRandomPhoto('sareePhoto', sIdx)}
                                  className="border border-dashed border-stone-300 hover:border-brand-gold hover:bg-amber-50/40 p-2.5 rounded-lg text-stone-400 hover:text-brand-gold text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Fabric Photo</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. BLOUSE MEASUREMENT (stitching) */}
                {sarees.some(s => s.blouse.added) && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-brand-cream-dark/65 shadow-xs space-y-5"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                      <span className="text-xs bg-stone-900 text-stone-100 font-mono px-2 py-0.5 rounded font-bold">3</span>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-wine-dark">BLOUSE MEASUREMENT</h4>
                    </div>

                    <p className="text-xs text-stone-500 italic block">
                      Blouse request is enabled. Please enter dimensions in inches and upload sketch specifications.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Bust (Inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 36"
                          value={sarees[0]?.blouse.measurements?.bust || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, bust: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Waist (Inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 32"
                          value={sarees[0]?.blouse.measurements?.waist || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, waist: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Hip (Inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 38"
                          value={sarees[0]?.blouse.measurements?.hip || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, hip: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Blouse Length</label>
                        <input
                          type="text"
                          placeholder="e.g. 14"
                          value={sarees[0]?.blouse.measurements?.sleeveLength || ''} // re-using sleeveLength as general length
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, sleeveLength: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Shoulder width</label>
                        <input
                          type="text"
                          placeholder="e.g. 14.5"
                          value={sarees[0]?.blouse.measurements?.shoulder || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, shoulder: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Armhole size</label>
                        <input
                          type="text"
                          placeholder="e.g. 16"
                          value={sarees[0]?.blouse.measurements?.armhole || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, armhole: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Front Neck Depth</label>
                        <input
                          type="text"
                          placeholder="e.g. 7.5"
                          value={sarees[0]?.blouse.measurements?.frontNeck || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, frontNeck: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Back Neck Depth</label>
                        <input
                          type="text"
                          placeholder="e.g. 9.5"
                          value={sarees[0]?.blouse.measurements?.backNeck || ''}
                          onChange={e => {
                            const m = sarees[0]?.blouse.measurements || {};
                            updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, backNeck: e.target.value } } });
                          }}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-center font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Fabric styling notes & designer remarks</label>
                      <textarea
                        rows={2}
                        placeholder="Padding: yes • Hook position: Back hook • Dori: simple string with latkan tassels • Neckline: sweet-heart shape front, round back."
                        value={sarees[0]?.blouse.measurements?.notes || ''}
                        onChange={e => {
                          const m = sarees[0]?.blouse.measurements || {};
                          updateSareeItemByIndex(0, { blouse: { ...sarees[0].blouse, measurements: { ...m, notes: e.target.value } } });
                        }}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:bg-white"
                      />
                    </div>

                    {/* Blouse Reference photo simulator slots */}
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-2">Blouse specification photos (Upload Simulator)</label>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Box 1: Front */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed text-center rounded-xl bg-stone-50">
                          {sarees[0]?.blouse.measurements?.frontPhoto ? (
                            <div className="relative w-full h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${sarees[0].blouse.measurements.frontPhoto})` }}>
                              <button type="button" onClick={() => handleSelectRandomPhoto('blouseFront')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('blouseFront')} className="text-gray-400 hover:text-brand-gold text-[10px] font-bold py-2">
                              + Front
                            </button>
                          )}
                        </div>
                        {/* Box 2: Back */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed text-center rounded-xl bg-stone-50">
                          {sarees[0]?.blouse.measurements?.backPhoto ? (
                            <div className="relative w-full h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${sarees[0].blouse.measurements.backPhoto})` }}>
                              <button type="button" onClick={() => handleSelectRandomPhoto('blouseBack')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('blouseBack')} className="text-gray-400 hover:text-brand-gold text-[10px] font-bold py-2">
                              + Back
                            </button>
                          )}
                        </div>
                        {/* Box 3: Sleeve */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed text-center rounded-xl bg-stone-50">
                          {sarees[0]?.blouse.measurements?.sleevePhoto ? (
                            <div className="relative w-full h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${sarees[0].blouse.measurements.sleevePhoto})` }}>
                              <button type="button" onClick={() => handleSelectRandomPhoto('blouseSleeve')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('blouseSleeve')} className="text-gray-400 hover:text-brand-gold text-[10px] font-bold py-2">
                              + Sleeve
                            </button>
                          )}
                        </div>
                        {/* Box 4: Sketch */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed text-center rounded-xl bg-stone-50">
                          {sarees[0]?.blouse.measurements?.sketchPhoto ? (
                            <div className="relative w-full h-16 rounded bg-cover bg-center" style={{ backgroundImage: `url(${sarees[0].blouse.measurements.sketchPhoto})` }}>
                              <button type="button" onClick={() => handleSelectRandomPhoto('blouseSketch')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('blouseSketch')} className="text-gray-400 hover:text-brand-gold text-[10px] font-bold py-2">
                              + Sketch
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* 4. PAYMENT & LOGISTICS */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/65 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <span className="text-xs bg-stone-900 text-stone-100 font-mono px-2 py-0.5 rounded font-bold">4</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-wine-dark">PAYMENT & LOGISTICS</h4>
                  </div>

                  <p className="text-xs text-stone-500 italic">
                    Log various styling charges, taxes, deposits, and split gateway digital transfers.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Courier Charges (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 350"
                        value={courierCharges || ''}
                        onChange={e => setCourierCharges(Number(e.target.value))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Blouse Margin/Stitch Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 4000"
                        value={blouseCharges || ''}
                        onChange={e => setBlouseCharges(Number(e.target.value))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Dupatta charges (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1200"
                        value={dupattaCharges || ''}
                        onChange={e => setDupattaCharges(Number(e.target.value))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Shipping Charges (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 500"
                        value={shippingCharges || ''}
                        onChange={e => setShippingCharges(Number(e.target.value))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono text-right"
                      />
                    </div>
                  </div>

                  {/* Split payments deposits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
                    {/* Advance 1 */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <h5 className="text-[10px] font-extrabold uppercase text-stone-700 tracking-wider">Deposit Advance 1</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Deposit 1"
                            value={paidAmount || ''}
                            onChange={e => setPaidAmount(Number(e.target.value))}
                            className="w-full bg-white border border-stone-200 rounded-md px-2.5 py-1 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Mode</label>
                          <select
                            value={paymentMode}
                            onChange={e => setPaymentMode(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-md px-1.5 py-1 text-[11px] text-stone-700 font-semibold"
                          >
                            <option value="UPI (Razorpay Storefront)">UPI Digital</option>
                            <option value="Bank Transfer">Direct Bank</option>
                            <option value="Cash">Cash Drawer</option>
                            <option value="Card (Razorpay)">POS Card</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Deposit 1 Receipt upload */}
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-150">
                        <span className="text-[10px] text-stone-500 font-semibold">Gateway Digital Slip</span>
                        <div className="flex items-center gap-2">
                          {advance1Receipt ? (
                            <div className="relative w-8 h-8 rounded bg-cover bg-center border" style={{ backgroundImage: `url(${advance1Receipt})` }}>
                              <button type="button" onClick={() => setAdvance1Receipt('')} className="absolute -top-1 -right-1 bg-rose-500 text-blue-50 rounded-full p-0.5"><X className="w-1.5 h-1.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('advance1Receipt')} className="text-stone-400 hover:text-brand-gold text-[9px] font-bold font-mono">
                              + Link Slip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Advance 2 */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <h5 className="text-[10px] font-extrabold uppercase text-stone-700 tracking-wider">Deposit Advance 2 (Split)</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Deposit 2"
                            value={paidAmount2 || ''}
                            onChange={e => setPaidAmount2(Number(e.target.value))}
                            className="w-full bg-white border border-stone-200 rounded-md px-2.5 py-1 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Mode</label>
                          <select
                            value={paymentMode2}
                            onChange={e => setPaymentMode2(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-md px-1.5 py-1 text-[11px] text-stone-700 font-semibold"
                          >
                            <option value="UPI (Razorpay Storefront)">UPI Digital</option>
                            <option value="Bank Transfer">Direct Bank</option>
                            <option value="Cash">Cash Drawer</option>
                            <option value="Card (Razorpay)">POS Card</option>
                          </select>
                        </div>
                      </div>

                      {/* Deposit 2 Receipt upload */}
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-150">
                        <span className="text-[10px] text-stone-500 font-semibold">Gateway Digital Slip</span>
                        <div className="flex items-center gap-2">
                          {advance2Receipt ? (
                            <div className="relative w-8 h-8 rounded bg-cover bg-center border" style={{ backgroundImage: `url(${advance2Receipt})` }}>
                              <button type="button" onClick={() => setAdvance2Receipt('')} className="absolute -top-1 -right-1 bg-rose-500 text-blue-50 rounded-full p-0.5"><X className="w-1.5 h-1.5" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => handleSelectRandomPhoto('advance2Receipt')} className="text-stone-400 hover:text-brand-gold text-[9px] font-bold font-mono">
                              + Link Slip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash Memo slip simulator slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-stone-50/50 p-4 rounded-xl border border-stone-150">
                    <div className="col-span-2">
                      <span className="block text-xs font-extrabold text-stone-700">Digital cash memo invoice attachment</span>
                      <span className="block text-[11px] text-stone-400">Attach digital physical store copy or POS billing slip</span>
                    </div>
                    <div className="flex justify-end">
                      {cashMemoPhoto ? (
                        <div className="relative w-28 h-12 rounded border bg-cover bg-center" style={{ backgroundImage: `url(${cashMemoPhoto})` }}>
                          <button type="button" onClick={() => setCashMemoPhoto('')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleSelectRandomPhoto('cashMemoPhoto')} className="border border-dashed border-stone-300 hover:border-brand-gold hover:bg-white text-stone-500 hover:text-brand-gold font-bold text-[10px] px-4 py-2 rounded-lg transition-colors">
                          + Attach Cash Memo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ledger summary banner */}
                  <div className="bg-brand-gold-soft p-5 rounded-2xl border border-brand-gold/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-stone-850">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Live order settlement ledger</span>
                      <div className="font-mono text-xs mt-1 text-stone-600 block leading-tight">
                        • Product basket subtotal: ₹{sarees.reduce((sum, s) => sum + (Number(s.price) || 0), 0).toLocaleString('en-IN')}<br/>
                        • Extra services (Blouse + Dupatta + Logistics): ₹{(Number(blouseCharges) + Number(dupattaCharges) + Number(shippingCharges) + Number(courierCharges)).toLocaleString('en-IN')}<br/>
                        • Combined split paid deposits: ₹{(Number(paidAmount) + Number(paidAmount2)).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold text-stone-500 uppercase">Grand Total (₹)</span>
                        <div className="text-xl font-mono font-bold text-stone-900">₹{totals.total.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="text-right border-l border-brand-gold/30 pl-6">
                        <span className="text-[10px] font-extrabold text-brand-wine-dark uppercase">Outstanding Balance (₹)</span>
                        <div className="text-2xl font-mono font-extrabold text-brand-wine">₹{totals.balance.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-stone-600 mb-1">Administrative private comments (Retail notes)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. VIP client, delivery requested by morning express. Package wrapped in custom velvet pouch."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-brand-gold"
                    />
                  </div>
                </div>

                {/* 5. SHIPPING */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/65 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <span className="text-xs bg-stone-900 text-stone-100 font-mono px-2 py-0.5 rounded font-bold">5</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-wine-dark">SHIPPING & LOGISTICS</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Fulfillment Status</label>
                      <select
                        value={shipmentStatus}
                        onChange={e => setShipmentStatus(e.target.value as ShipmentStatus)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 font-bold focus:bg-white"
                      >
                        <option value="Pending">Created / Awaiting Dispatch</option>
                        <option value="Dispatched">Dispatched via carrier</option>
                        <option value="Received by customer">Delivered / Received by customer</option>
                        <option value="Review taken">Delivered & Review taken</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Courier Carrier Service</label>
                      <select
                        value={courierTracking ? (editingOrder?.courierCo || 'BlueDart') : 'BlueDart'}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold text-stone-700 focus:bg-white"
                      >
                        <option value="BlueDart">BlueDart Air Express</option>
                        <option value="DHL">DHL Worldwide express</option>
                        <option value="DTDC">DTDC Premium Cargo</option>
                        <option value="Professional">Professional Express Service</option>
                        <option value="FedEx">FedEx courier service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-stone-605 mb-1">Waybill tracking airway consignment barcode No</label>
                      <input
                        type="text"
                        placeholder="e.g. BD-BLUE-788012"
                        value={courierTracking}
                        onChange={e => setCourierTracking(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Consignment voucher upload slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-stone-50/50 p-4 rounded-xl border border-stone-150">
                    <div className="col-span-2">
                      <span className="block text-xs font-extrabold text-stone-700">Consignment Slip / Carrier Label Copy</span>
                      <span className="block text-[11px] text-stone-400">Copy of booking slip or barcode voucher generated by Courier</span>
                    </div>
                    <div className="flex justify-end">
                      {voucherSlipPhoto ? (
                        <div className="relative w-28 h-12 rounded border bg-cover bg-center" style={{ backgroundImage: `url(${voucherSlipPhoto})` }}>
                          <button type="button" onClick={() => setVoucherSlipPhoto('')} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleSelectRandomPhoto('voucherSlipPhoto')} className="border border-dashed border-stone-300 hover:border-brand-gold hover:bg-white text-stone-500 hover:text-brand-gold font-bold text-[10px] px-4 py-2 rounded-lg transition-colors">
                          + Attach Dispatch Slip
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Actions bottom sticky row */}
                <div className="pt-6 border-t border-brand-cream-dark/50 flex flex-col gap-3 pb-12">
                  <button
                    type="submit"
                    className="w-full h-12 bg-stone-900 border border-stone-950 hover:bg-stone-950 active:scale-99 text-white hover:text-brand-gold text-xs tracking-widest font-extrabold uppercase rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                    <span>SAVE ONLINE ORDER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-full h-11 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full text-xs font-extrabold uppercase transition-all"
                  >
                    Cancel / Discard Change
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
