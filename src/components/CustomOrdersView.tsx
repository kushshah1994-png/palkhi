import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, SareeItem, SareeSource, ShipmentStatus, AccessSettings } from '../types';
import { ALL_KARIGARS, EMBROIDERIES_TYPES_LIST, SAREE_TYPES_LIST, PAYMENT_MODES } from '../mockData';
import { formatTitleCase, generateWhatsAppOrderMsg, autoDetectPinCode } from '../utils';
import { Plus, Trash2, Search, Calendar, Phone, MapPin, CreditCard, ChevronDown, Check, Printer, Share2, Clipboard, Edit, Eye, X, RefreshCw, EyeOff, Scissors, Sparkles, AlertCircle, Instagram, Upload, Globe } from 'lucide-react';

interface CustomOrdersViewProps {
  orders: Order[];
  onAddOrder: (newOrder: Order) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  onDeleteOrder: (id: string) => void;
  searchTerm: string;
  userRole?: 'owner' | 'staff';
  accessSettings?: AccessSettings;
}

export default function CustomOrdersView({ orders, onAddOrder, onUpdateOrder, onDeleteOrder, searchTerm, userRole = 'owner', accessSettings }: CustomOrdersViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Custom Preset Photos list for luxury visual simulation
  const PRESET_PHOTOS = [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=600'
  ];

  // Core Form fields matching user's custom layout
  const [orderNumberStr, setOrderNumberStr] = useState('');
  const [shopifyNumber, setShopifyNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesHand, setSalesHand] = useState('Vaseem');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [customerAddress, setCustomerAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [orderSource, setOrderSource] = useState('Instagram');
  const [pinCode, setPinCode] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; state: string; area: string } | null>(null);

  // Delivery / Logistics
  const [deliveryDate, setDeliveryDate] = useState('');
  const [courierTracking, setCourierTracking] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus>('Pending');
  const [courierCo, setCourierCo] = useState('DTDC');

  // Multi-amount & charges states
  const [courierCharges, setCourierCharges] = useState<number>(0);
  const [blouseCharges, setBlouseCharges] = useState<number>(0);
  const [dupattaCharges, setDupattaCharges] = useState<number>(0);
  const [shippingCharges, setShippingCharges] = useState<number>(0);

  // Split payments
  const [advance1, setAdvance1] = useState<number>(0);
  const [advance1Mode, setAdvance1Mode] = useState('Cash');
  const [advance2, setAdvance2] = useState<number>(0);
  const [advance2Mode, setAdvance2Mode] = useState('');

  // Image attachments states
  const [advance1Receipt, setAdvance1Receipt] = useState('');
  const [advance2Receipt, setAdvance2Receipt] = useState('');
  const [cashMemoPhoto, setCashMemoPhoto] = useState('');
  const [voucherSlipPhoto, setVoucherSlipPhoto] = useState('');
  const [notes, setNotes] = useState('');

  const [sarees, setSarees] = useState<SareeItem[]>([]);

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

  // Saree row template initializer
  const createEmptySaree = (): SareeItem => ({
    id: `sar-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: '',
    type: 'Banarasi',
    colour: '',
    price: 0,
    source: 'Make-to-order',
    karigar: ALL_KARIGARS[0],
    barcode: '',
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

  // Open Form for Creation
  const handleOpenCreateForm = () => {
    setEditingOrder(null);
    setOrderNumberStr(`PK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setShopifyNumber('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setSalesHand('Vaseem');
    setCustomerName('');
    setCustomerPhone('');
    setCountry('India');
    setCustomerAddress('');
    setShippingPhone('');
    setInstagramHandle('');
    setOrderSource('Instagram');
    setPinCode('');
    setDetectedLocation(null);
    setDeliveryDate('');
    setCourierTracking('');
    setShipmentStatus('Pending');
    setCourierCo('DTDC');
    setCourierCharges(0);
    setBlouseCharges(0);
    setDupattaCharges(0);
    setShippingCharges(0);
    setAdvance1(0);
    setAdvance1Mode('Cash');
    setAdvance2(0);
    setAdvance2Mode('');
    setAdvance1Receipt('');
    setAdvance2Receipt('');
    setCashMemoPhoto('');
    setVoucherSlipPhoto('');
    setNotes('');
    setSarees([createEmptySaree()]);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (order: Order) => {
    setEditingOrder(order);
    setOrderNumberStr(order.orderNumber);
    setShopifyNumber(order.shopifyNumber || '');
    setOrderDate(order.createdAt || new Date().toISOString().split('T')[0]);
    setSalesHand(order.salesHand || 'Vaseem');
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCountry(order.country || 'India');
    setCustomerAddress(order.customerAddress);
    setShippingPhone(order.shippingPhone || '');
    setInstagramHandle(order.instagramHandle || '');
    setOrderSource(order.orderSource || 'Instagram');
    setPinCode(order.pinCode || '');
    if (order.pinCode) {
      const result = autoDetectPinCode(order.pinCode);
      if (result) setDetectedLocation(result);
    } else {
      setDetectedLocation(null);
    }
    setDeliveryDate(order.deliveryDate);
    setCourierTracking(order.courierTracking || '');
    setShipmentStatus(order.shipmentStatus);
    setCourierCo(order.courierCo || 'DTDC');
    setCourierCharges(order.courierCharges || 0);
    setBlouseCharges(order.blouseCharges || 0);
    setDupattaCharges(order.dupattaCharges || 0);
    setShippingCharges(order.shippingCharges || 0);
    setAdvance1(order.payment.advance1);
    setAdvance1Mode(order.payment.advance1Mode);
    setAdvance2(order.payment.advance2);
    setAdvance2Mode(order.payment.advance2Mode || '');
    setAdvance1Receipt(order.advance1Receipt || '');
    setAdvance2Receipt(order.advance2Receipt || '');
    setCashMemoPhoto(order.cashMemoPhoto || '');
    setVoucherSlipPhoto(order.voucherSlipPhoto || '');
    setNotes(order.notes || '');
    setSarees(JSON.parse(JSON.stringify(order.sarees))); // deep copy
    setIsFormOpen(true);
  };

  // Handle Saree row updates
  const updateSareeItem = (sareeId: string, updates: Partial<SareeItem>) => {
    setSarees(prev => prev.map(s => {
      if (s.id !== sareeId) return s;
      
      const newSaree = { ...s, ...updates };
      
      // Auto capitalization constraints
      if (updates.name !== undefined) newSaree.name = formatTitleCase(updates.name);
      if (updates.colour !== undefined) newSaree.colour = formatTitleCase(updates.colour);
      if (updates.supplier !== undefined) newSaree.supplier = formatTitleCase(updates.supplier);
      
      return newSaree;
    }));
  };

  // Toggle embroidery type checkbox
  const toggleEmbroideryType = (sareeId: string, type: string) => {
    setSarees(prev => prev.map(s => {
      if (s.id !== sareeId) return s;
      const types = s.embroideryTypes.includes(type)
        ? s.embroideryTypes.filter(t => t !== type)
        : [...s.embroideryTypes, type];
      return { ...s, embroideryTypes: types };
    }));
  };

  // Image selector mapping simulator
  const handleSelectRandomPhoto = (type: string, sIdx?: number, sareeId?: string) => {
    const randomUrl = PRESET_PHOTOS[Math.floor(Math.random() * PRESET_PHOTOS.length)];
    if (type === 'sareePhoto' && sareeId) {
      updateSareeItem(sareeId, { sareePhoto: randomUrl });
    } else if (type === 'embroideryPhoto' && sareeId) {
      updateSareeItem(sareeId, { embroideryPhoto: randomUrl });
    } else if (type === 'blouseFront' && sareeId) {
      setSarees(prev => prev.map(s => {
        if (s.id !== sareeId) return s;
        const m = s.blouse.measurements || {};
        return { ...s, blouse: { ...s.blouse, measurements: { ...m, frontPhoto: randomUrl } } };
      }));
    } else if (type === 'blouseBack' && sareeId) {
      setSarees(prev => prev.map(s => {
        if (s.id !== sareeId) return s;
        const m = s.blouse.measurements || {};
        return { ...s, blouse: { ...s.blouse, measurements: { ...m, backPhoto: randomUrl } } };
      }));
    } else if (type === 'blouseSleeve' && sareeId) {
      setSarees(prev => prev.map(s => {
        if (s.id !== sareeId) return s;
        const m = s.blouse.measurements || {};
        return { ...s, blouse: { ...s.blouse, measurements: { ...m, sleevePhoto: randomUrl } } };
      }));
    } else if (type === 'blouseSketch' && sareeId) {
      setSarees(prev => prev.map(s => {
        if (s.id !== sareeId) return s;
        const m = s.blouse.measurements || {};
        return { ...s, blouse: { ...s.blouse, measurements: { ...m, sketchPhoto: randomUrl } } };
      }));
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

  // Calculations for Order Totals (incorporating additional luxury custom fee fields)
  const calculateTotals = () => {
    const totalSareePrice = sarees.reduce((sum, s) => {
      let runSum = s.price || 0;
      if (s.blouse.added) runSum += (s.blouse.charge || 0);
      if (s.dupatta.added) runSum += (s.dupatta.charge || 0);
      return sum + runSum;
    }, 0);
    
    const extraCharges = (blouseCharges || 0) + (dupattaCharges || 0) + (shippingCharges || 0) + (courierCharges || 0);
    const grossTotal = totalSareePrice + extraCharges;
    const balanceDue = grossTotal - (advance1 || 0) - (advance2 || 0);
    return {
      total: grossTotal,
      balanceDue: balanceDue < 0 ? 0 : balanceDue
    };
  };

  const totals = calculateTotals();

  // Save/Submit Form handler
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || sarees.length === 0) {
      alert('Please fill customer details and add at least one saree.');
      return;
    }

    const { total, balanceDue } = totals;
    
    const orderPayload: Order = {
      id: editingOrder ? editingOrder.id : `order-${Date.now()}`,
      orderNumber: orderNumberStr || `PK-2026-${Math.floor(100 + Math.random() * 900)}`,
      orderType: 'custom',
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
        advance1,
        advance1Mode,
        advance2,
        advance2Mode,
        balanceDue
      },
      createdAt: orderDate || (editingOrder ? editingOrder.createdAt : new Date().toISOString().split('T')[0]),
      // Luxury Layout Advanced Fields
      shopifyNumber,
      salesHand,
      country,
      shippingCountry: country,
      shippingPhone,
      instagramHandle,
      orderSource,
      courierCo,
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
      onUpdateOrder(orderPayload);
    } else {
      onAddOrder(orderPayload);
    }
    
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  // Print system handler
  const triggerPrintInvoice = (order: Order) => {
    const printContent = document.getElementById(`print-invoice-layout-${order.id}`);
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printHtml = printContent.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>PALKHE Mumbai Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white !important; margin: 40px; color: black; }
            h1, h2, h3 { font-family: 'Cormorant Garamond', serif; }
            .header { text-align: center; border-bottom: 2px solid #5c061e; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 28px; font-weight: bold; color: #5c061e; letter-spacing: 2px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 35px; }
            .row-saree { border-bottom: 1px solid #eee; padding: 15px 0; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
            .table-fees { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table-fees th, .table-fees td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
            .total-due { background-color: #fcf8e3; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printHtml}
          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #777;">
            Thank you for purchasing heirloom craftsmanship at Palkhi Sarees Mumbai.<br/>
            Questions? Contact Support at +91 98200 12345 or visit Mumbai, India.
          </div>
        </body>
      </html>
    `;
    
    window.print();
    // restore original
    window.location.reload();
  };

  // Filter custom orders list based on top bar search
  const filteredOrders = orders.filter(o => {
    if (o.orderType !== 'custom') return false;
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerPhone.includes(searchLower) ||
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.sarees.some(s => s.name?.toLowerCase().includes(searchLower) || s.type?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div id="custom-orders-view-root" className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-cream-dark/60 shadow-sm leading-tight">
        <div>
          <h2 className="text-2xl font-serif-display font-bold text-brand-wine">Custom Embroidery Commissions</h2>
          <p className="text-xs text-gray-500">Bespoke heirloom saree logs, karigar allocations, and balances due.</p>
        </div>
        <button
          id="btn-create-commission"
          onClick={handleOpenCreateForm}
          className="bg-brand-wine hover:bg-brand-wine-light active:scale-95 text-white font-medium text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brand-gold" />
          <span>New Custom Order</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-brand-gold/30">
            <p className="text-gray-400 italic font-serif-display text-lg">No custom order records match your query.</p>
            <p className="text-xs text-gray-400 mt-1">Try another client name, telephone, or create a brand-new order entry.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isOutstanding = order.payment.balanceDue > 0;
            return (
              <motion.div
                id={`custom-order-card-${order.id}`}
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-brand-cream-dark shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Header Banner */}
                <div className="bg-brand-cream-dark/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-brand-cream-dark/60 gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif-display font-extrabold text-brand-wine text-lg tracking-wide">{order.orderNumber}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-wine-soft text-brand-wine rounded-md">CUSTOM DECREE</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                      order.shipmentStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      order.shipmentStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                      order.shipmentStatus === 'Received by customer' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-stone-100 text-stone-800'
                    }`}>
                      {order.shipmentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-gray-500">
                    <span>Issued: {order.createdAt}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-brand-wine font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      Delivery: {order.deliveryDate || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Primary Content Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Customer Information Column */}
                  <div className="lg:col-span-4 space-y-4 border-r border-stone-100 lg:pr-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Ledger Address</h4>
                      <h3 className="text-lg font-serif-display font-medium text-stone-900 mt-1">{order.customerName}</h3>
                      <p className="text-sm font-medium text-brand-wine flex items-center gap-1 mt-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-brand-gold" />
                        {order.customerPhone}
                      </p>
                      <p className="text-xs text-stone-500 flex items-start gap-1 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                        <span>{order.customerAddress || 'No billing address provided.'}</span>
                      </p>
                    </div>

                    {/* Simple Payment Overview */}
                    {userRole === 'staff' && accessSettings?.hideCustomRev ? (
                      <div className="bg-brand-cream/60 p-4 rounded-xl border border-brand-cream-dark/50 flex flex-col items-center justify-center py-6 text-center">
                        <EyeOff className="w-5 h-5 text-brand-gold mb-1" />
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Financials Hidden</span>
                      </div>
                    ) : (
                      <div className="bg-brand-cream/60 p-4 rounded-xl border border-brand-cream-dark/50 space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commission Payment Status</h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Total Price:</span>
                          <strong className="text-stone-800">₹{order.payment.total.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs text-emerald-700">
                          <span>Deposited Advance 1:</span>
                          <span>₹{order.payment.advance1.toLocaleString('en-IN')} ({order.payment.advance1Mode})</span>
                        </div>
                        {order.payment.advance2 > 0 && (
                          <div className="flex justify-between items-center text-xs text-teal-700">
                            <span>Deposit Advance 2:</span>
                            <span>₹{order.payment.advance2.toLocaleString('en-IN')} ({order.payment.advance2Mode})</span>
                          </div>
                        )}
                        <div className="border-t border-stone-200/50 pt-2 flex justify-between items-center">
                          <span className="text-xs font-bold text-brand-wine">Balance Due:</span>
                          <strong className={`text-sm ${isOutstanding ? 'text-rose-700' : 'text-emerald-700'} font-bold`}>
                            ₹{order.payment.balanceDue.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sarees Detail Row List */}
                  <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Commissioned Artisan Masterpieces ({order.sarees.length})</h4>
                    <div className="space-y-4">
                      {order.sarees.map((saree, sIdx) => (
                        <div key={saree.id} id={`order-saree-card-${sIdx}`} className="bg-stone-50 p-4 rounded-xl border border-stone-200/45 space-y-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                                <span>{sIdx + 1}. {saree.name}</span>
                                <span className="bg-brand-gold-light/20 text-brand-gold-dark font-mono text-[9px] px-1.5 py-0.5 rounded">
                                  {saree.type}
                                </span>
                              </h4>
                              <p className="text-xs text-stone-500">Colour: <strong>{saree.colour}</strong> • Fabric Cost: <strong>₹{saree.price.toLocaleString('en-IN')}</strong></p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-stone-200 text-stone-700 rounded-md">
                                Source: {saree.source}
                              </span>
                              {saree.source === 'Ready stock' && (
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">BC: {saree.barcode}</p>
                              )}
                              {saree.source === 'Make-to-order' && (
                                <p className="text-[10px] text-gray-400 mt-0.5">Artisan: <strong className="text-brand-wine">{saree.karigar}</strong></p>
                              )}
                              {saree.source === 'Direct from supplier' && (
                                <p className="text-[10px] text-gray-400 mt-0.5">Supplier: {saree.supplier}</p>
                              )}
                            </div>
                          </div>

                          {/* Extra accessories additions if any */}
                          {(saree.blouse.added || saree.dupatta.added) && (
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed border-stone-200 text-[11px]">
                              {saree.blouse.added && (
                                <span className="bg-pink-50 border border-pink-100 text-pink-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow-sm">
                                  <Scissors className="w-3 h-3 text-pink-500" /> Blouse Stitching Added (+₹{saree.blouse.charge})
                                </span>
                              )}
                              {saree.dupatta.added && (
                                <span className="bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow-sm animate-pulse-slow">
                                  ✨ Dupatta Added (+₹{saree.dupatta.charge}): {saree.dupatta.colour} ({saree.dupatta.fabric})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Embroidery details */}
                          <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-100 italic">
                            <span className="font-bold not-italic text-[10px] text-brand-gold uppercase block mb-1">DESIGN WORK DETAILS</span>
                            {saree.description || 'No work description provided.'}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {saree.embroideryTypes.map(tag => (
                                <span key={tag} className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Tracking checkbox timeline */}
                          <div className="flex flex-col sm:flex-row justify-between gap-2.5 pt-2 border-t border-stone-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">Embroidery Tracking Path</span>
                            <div className="flex flex-wrap gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-stone-600 select-none">
                                <span className={`p-0.5 rounded duration-200 ${saree.tracking.plainSareeReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-400'}`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                </span>
                                <span>Plain Saree Received</span>
                              </label>

                              <label className="flex items-center gap-1.5 text-xs text-stone-600 select-none">
                                <span className={`p-0.5 rounded duration-200 ${saree.tracking.givenToKarigar ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-400'}`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                </span>
                                <div>
                                  <span>Given to Karigar</span>
                                  {saree.tracking.givenToKarigar && <span className="block text-[9px] font-mono text-gray-400">({saree.tracking.givenToKarigarDate})</span>}
                                </div>
                              </label>

                              <label className="flex items-center gap-1.5 text-xs text-stone-600 select-none">
                                <span className={`p-0.5 rounded duration-200 ${saree.tracking.receivedFromKarigar ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-400'}`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                </span>
                                <div>
                                  <span>Received back from Karkhana</span>
                                  {saree.tracking.receivedFromKarigar && <span className="block text-[9px] font-mono text-gray-400">({saree.tracking.receivedFromKarigarDate})</span>}
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-brand-cream/30 border-t border-stone-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3 no-print">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-view-${order.id}`}
                      onClick={() => setViewingOrder(order)}
                      className="bg-stone-100 hover:bg-stone-200 p-2 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-stone-500" />
                      <span>View Receipt</span>
                    </button>
                    <button
                      id={`btn-edit-${order.id}`}
                      onClick={() => handleOpenEditForm(order)}
                      className="bg-brand-gold/10 hover:bg-brand-gold/20 p-2 text-brand-gold-dark rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Order</span>
                    </button>
                    <button
                      id={`btn-delete-${order.id}`}
                      onClick={() => {
                        if (confirm(`Are you absolutely sure you want to delete order ${order.orderNumber}? This action is irreversible.`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-print-${order.id}`}
                      onClick={() => triggerPrintInvoice(order)}
                      className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-stone-400" />
                      <span>Print Invoice</span>
                    </button>
                    <a
                      id={`btn-wa-${order.id}`}
                      href={generateWhatsAppOrderMsg(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-4 h-4 text-brand-cream" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>

                {/* Printable Hidden Bill Template */}
                <div id={`print-invoice-layout-${order.id}`} className="hidden print-only">
                  <div className="header">
                    <div className="brand">PALKHI SAREES MUMBAI</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Heritage Sarees & Artisan Embroidery • Established 1991</div>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2>ORDER COMISSION BILL / INVOICE</h2>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Invoice Number: {order.orderNumber}</span>
                  </div>

                  <div className="meta-grid">
                    <div>
                      <strong>CUSTOMER DETAILS</strong><br/>
                      Client Name: {order.customerName}<br/>
                      Telephone: {order.customerPhone}<br/>
                      Billing Address: {order.customerAddress}<br/>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>BILL SUMMARY</strong><br/>
                      Date Registered: {order.createdAt}<br/>
                      Target Delivery: {order.deliveryDate || 'TBD'}<br/>
                      Order Class: Custom Karkhana Commission<br/>
                    </div>
                  </div>

                  <hr style={{ border: '0', borderTop: '2px solid #5c061e', margin: '20px 0' }} />

                  <h3>ORDERED ITEMS & SPECIFICATIONS</h3>
                  {order.sarees.map((saree, sax) => (
                    <div key={saree.id} className="row-saree">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ fontSize: '15px' }}>{sax+1}. {saree.name} ({saree.type})</strong><br/>
                          Fabric Colour: {saree.colour} | Source: {saree.source}<br/>
                          Work Focus: <span style={{ fontStyle: 'italic', color: '#444' }}>{saree.description}</span><br/>
                          Embroidery Types: {saree.embroideryTypes.join(', ') || 'Standard handstitch'}<br/>
                          {saree.blouse.added && (
                            <span style={{ fontSize: '11px', color: '#b91c1c' }}>* Includes Custom Blouse stitching + Fitting</span>
                          )}
                          {saree.dupatta.added && (
                            <span style={{ fontSize: '11px', color: '#b45309' }}><br/>* Includes custom dupatta: {saree.dupatta.colour} ({saree.dupatta.fabric})</span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{saree.price.toLocaleString('en-IN')}<br/>
                          {saree.blouse.added && <span>Blouse: ₹{saree.blouse.charge.toLocaleString('en-IN')}<br/></span>}
                          {saree.dupatta.added && <span>Dupatta: ₹{saree.dupatta.charge.toLocaleString('en-IN')}<br/></span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  <table className="table-fees" style={{ width: '40%', marginLeft: 'auto', marginTop: '30px' }}>
                    <tbody>
                      <tr>
                        <td>Gross total</td>
                        <td className="right">₹{order.payment.total.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td>Advance 1 received</td>
                        <td className="right" style={{ color: 'green' }}>-₹{order.payment.advance1.toLocaleString('en-IN')}</td>
                      </tr>
                      {order.payment.advance2 > 0 && (
                        <tr>
                          <td>Advance 2 received</td>
                          <td className="right" style={{ color: 'green' }}>-₹{order.payment.advance2.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      <tr className="total-due">
                        <td>BALANCE DUE AT DELIVERY</td>
                        <td className="right">₹{order.payment.balanceDue.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: '50px', borderTop: '1px dashed #ddd', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div>
                      <br/><br/>
                      ______________________<br/>
                      Customer Signature
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <br/><br/>
                      ______________________<br/>
                      Palkhi Sarees Mumbai Auth
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Slide-over Order Creation Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div id="form-overlay" className="fixed inset-0 z-50 overflow-y-auto no-print bg-stone-900/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
              className="bg-[#fbfaf7] w-full max-w-4xl min-h-screen shadow-2xl p-6 md:p-8 relative flex flex-col border-l border-brand-cream-dark/60"
            >
              <div className="flex justify-between items-center bg-white p-5 -mx-6 md:-mx-8 -mt-6 md:-mt-8 border-b border-brand-cream-dark/60">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-brand-wine-soft text-brand-wine rounded-xl">
                    <Sparkles className="w-5 h-5 text-brand-wine" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-serif-display font-bold text-stone-800 leading-tight">Order form</h3>
                    <p className="text-xs text-stone-500">Fill in the details below and save the order.</p>
                  </div>
                </div>
                <button
                  id="btn-close-form"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-stone-500" />
                </button>
              </div>

              {/* Form container scroll area */}
              <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto pt-6 space-y-8 pr-1">
                
                {/* ID & Date Header block */}
                <div className="bg-white p-5 rounded-2xl border border-brand-cream-dark/50 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Order number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PK-2026-121"
                      value={orderNumberStr}
                      onChange={e => setOrderNumberStr(e.target.value)}
                      className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-4 py-2 text-sm text-brand-wine font-bold focus:outline-none focus:border-brand-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Shopify number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop-1025"
                      value={shopifyNumber}
                      onChange={e => setShopifyNumber(e.target.value)}
                      className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Order Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={e => setOrderDate(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-wine font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 1: Customer Bio */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/50 shadow-sm space-y-5">
                  <h4 className="text-xs font-extrabold uppercase text-brand-gold tracking-widest border-b border-brand-cream-dark/50 pb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-brand-gold rounded-full"></span>
                    <span>1. Customer Details</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Customer name"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        onBlur={() => setCustomerName(formatTitleCase(customerName))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-wine"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Phone no. *</label>
                      <div className="flex rounded-xl overflow-hidden border border-stone-200">
                        <span className="bg-[#fcfbf9] border-r border-stone-200 px-3 py-2.5 text-sm text-stone-500 flex items-center font-semibold">+91</span>
                        <input
                          type="tel"
                          required
                          placeholder="98200 42202"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-white px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="e.g. India, USA, UAE"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Full shipping address</label>
                      <textarea
                        rows={2}
                        placeholder="House/Flat, Street, Area, City, State, Country, ZIP code..."
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Shipping phone (optional - if different)</label>
                      <div className="flex rounded-xl overflow-hidden border border-stone-200">
                        <span className="bg-[#fcfbf9] border-r border-stone-200 px-3 py-2.5 text-sm text-stone-500 flex items-center font-semibold">+91</span>
                        <input
                          type="tel"
                          placeholder="Same as customer phone"
                          value={shippingPhone}
                          onChange={e => setShippingPhone(e.target.value)}
                          className="w-full bg-white px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Instagram handle / Website profile link</label>
                      <div className="flex rounded-xl overflow-hidden border border-stone-200">
                        <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 border-r border-stone-200 px-3 py-2.5 text-white flex items-center"><Instagram className="w-4 h-4" /></span>
                        <input
                          type="text"
                          placeholder="Website or Instagram profile username"
                          value={instagramHandle}
                          onChange={e => setInstagramHandle(e.target.value)}
                          className="w-full bg-white px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Delivery Location PINC / ZIP Code</label>
                      <div className="flex rounded-xl overflow-hidden border border-stone-200">
                        <span className="bg-[#fcfbf9] border-r border-stone-200 px-3 py-2.5 text-stone-400 flex items-center"><Globe className="w-4 h-4" /></span>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 400049"
                          value={pinCode}
                          onChange={e => handlePinCodeChange(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white px-4 py-2.5 text-sm focus:outline-none font-mono"
                        />
                      </div>
                      {detectedLocation && (
                        <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 rounded px-2.5 py-1 flex items-center gap-1.5 font-medium border border-emerald-100">
                          <Check className="w-3 h-3 text-emerald-800 shrink-0" />
                          <span>Detected: {detectedLocation.area}, {detectedLocation.city}, {detectedLocation.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Order Details */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/50 shadow-sm space-y-5">
                  <h4 className="text-xs font-extrabold uppercase text-brand-gold tracking-widest border-b border-brand-cream-dark/50 pb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-brand-gold rounded-full"></span>
                    <span>2. Order Details</span>
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-2">Modes of order</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'Instagram', label: 'Instagram', icon: Instagram },
                          { id: 'Website', label: 'Website', icon: Globe },
                          { id: 'Exhibition', label: 'Exhibition', icon: Sparkles },
                          { id: 'WhatsApp', label: 'WhatsApp', icon: Phone }
                        ].map(mode => {
                          const isSelected = orderSource === mode.id;
                          const IconComp = mode.icon;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setOrderSource(mode.id)}
                              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-xs font-bold transition-all gap-1.5 ${
                                isSelected
                                  ? 'bg-brand-wine text-white border-brand-wine shadow-sm scale-[1.02]'
                                  : 'bg-[#fcfbf9] text-stone-600 border-stone-200/80 hover:bg-stone-50'
                              }`}
                            >
                              <IconComp className={`w-5 h-5 ${isSelected ? 'text-brand-gold' : 'text-stone-400'}`} />
                              <span>{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Sales Hand / Executive (Staff Name)</label>
                      <input
                        type="text"
                        placeholder="e.g. Vaseem, Sohail, Shafi"
                        value={salesHand}
                        onChange={e => setSalesHand(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-wine"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Saree rows */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-brand-cream-dark/50 pb-2">
                    <h4 className="text-xs font-extrabold uppercase text-brand-gold tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-brand-gold rounded-full"></span>
                      <span>3. Sarees in this order ({sarees.length})</span>
                    </h4>
                    <button
                      type="button"
                      id="btn-add-repeater"
                      onClick={() => setSarees(prev => [...prev, createEmptySaree()])}
                      className="text-xs text-brand-wine hover:text-brand-wine-dark font-extrabold flex items-center gap-1 transition-colors px-3 py-1.5 bg-brand-wine-soft rounded-lg"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Add Saree</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {sarees.map((saree, sIdx) => (
                      <div
                        id={`repeater-row-${sIdx}`}
                        key={saree.id}
                        className="bg-white p-5 rounded-2xl border border-brand-cream-dark shadow-sm relative space-y-4"
                      >
                        {/* Remove saree row */}
                        {sarees.length > 1 && (
                          <button
                            type="button"
                            id={`btn-remove-repeater-row-${sIdx}`}
                            onClick={() => setSarees(prev => prev.filter(s => s.id !== saree.id))}
                            className="absolute top-4 right-4 p-1.5 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-brand-wine font-semibold text-xs text-brand-gold rounded-full flex items-center justify-center font-mono">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs font-extrabold text-stone-400 uppercase tracking-wider">Saree {sIdx + 1} Specifications</span>
                        </div>

                        {/* Saree Row Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Saree Name / Material Label</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Unwashed Lavender Georgette Handcraft"
                              value={saree.name}
                              onChange={e => updateSareeItem(saree.id, { name: e.target.value })}
                              className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-wine"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Saree Base Style / Category</label>
                            <select
                              value={saree.type}
                              onChange={e => updateSareeItem(saree.id, { type: e.target.value })}
                              className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-wine font-medium"
                            >
                              {SAREE_TYPES_LIST.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Colour shade</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Lavender, Cherry Peach"
                              value={saree.colour}
                              onChange={e => updateSareeItem(saree.id, { colour: e.target.value })}
                              className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-wine"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Est Price / Work Charge (₹) *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="e.g. 18500"
                              value={saree.price || ''}
                              onChange={e => updateSareeItem(saree.id, { price: Number(e.target.value) })}
                              className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-wine font-mono text-brand-wine font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Saree Work Style</label>
                            <select
                              value={saree.source}
                              onChange={e => updateSareeItem(saree.id, { source: e.target.value as SareeSource })}
                              className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-wine font-bold"
                            >
                              <option value="Make-to-order">Make to order (karkhana / artisan)</option>
                              <option value="Ready stock">Ready stock (In House)</option>
                              <option value="Direct from supplier">Supplier direct</option>
                            </select>
                          </div>

                          {/* Dynamic procurement field */}
                          <div className="md:col-span-3 bg-[#fcfbf9] p-3 rounded-xl border border-stone-100">
                            {saree.source === 'Ready stock' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-extrabold text-amber-700 uppercase mb-0.5">Ready Inventory Barcode</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. PK-7701"
                                    value={saree.barcode || ''}
                                    onChange={e => updateSareeItem(saree.id, { barcode: e.target.value })}
                                    className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                                  />
                                </div>
                                <div className="text-[11px] text-stone-500 mt-4 flex items-center">
                                  <span>Piece will be dispatched directly from in-house catalog storage.</span>
                                </div>
                              </div>
                            )}

                            {saree.source === 'Make-to-order' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-extrabold text-stone-600 uppercase mb-0.5">Assigned Karigar / Artisan</label>
                                  <select
                                    value={saree.karigar || ''}
                                    onChange={e => updateSareeItem(saree.id, { karigar: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
                                  >
                                    {ALL_KARIGARS.map(k => (
                                      <option key={k} value={k}>{k}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="text-[11px] text-stone-500 mt-4 flex items-center">
                                  <span>Assigned to artisan workshops for custom handloom embroidery.</span>
                                </div>
                              </div>
                            )}

                            {saree.source === 'Direct from supplier' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-extrabold text-stone-600 uppercase mb-0.5">Supplier Business Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Surat Wholesale, Banaras Weavers"
                                    value={saree.supplier || ''}
                                    onChange={e => updateSareeItem(saree.id, { supplier: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                                  />
                                </div>
                                <div className="text-[11px] text-stone-500 mt-4 flex items-center">
                                  <span>Purchased directly from external supplier catalogs.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Embroidery technique checkboxes */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Embroidery Technique Specialties</label>
                          <div className="flex flex-wrap gap-1.5">
                            {EMBROIDERIES_TYPES_LIST.map(type => {
                              const isChecked = saree.embroideryTypes.includes(type);
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => toggleEmbroideryType(saree.id, type)}
                                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all font-semibold ${
                                    isChecked
                                      ? 'bg-brand-gold/15 border-brand-gold text-brand-gold-dark'
                                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                                  }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Work Description / Design details</label>
                          <textarea
                            rows={2}
                            placeholder="Detail work borders width, border motifs, thread density, specific patterns requested by client..."
                            value={saree.description}
                            onChange={e => updateSareeItem(saree.id, { description: e.target.value })}
                            className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                          />
                        </div>

                        {/* Image presets simulator */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="bg-[#fcfbf9] border border-stone-200/60 p-3 rounded-xl flex items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="block text-[9px] font-bold text-stone-500 uppercase">Saree Fabric Photo</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRandomPhoto('sareePhoto', sIdx, saree.id)}
                                  className="text-[10px] bg-brand-wine hover:bg-brand-wine-light text-white font-bold py-1 px-2.5 rounded flex items-center gap-1 shrink-0"
                                >
                                  <Upload className="w-3 h-3 text-brand-gold" />
                                  <span>Simulate Saree Image</span>
                                </button>
                              </div>
                              {saree.sareePhoto ? (
                                <p className="text-[9px] text-emerald-700 truncate">{saree.sareePhoto}</p>
                              ) : (
                                <p className="text-[9px] text-stone-400 italic">No attachment loaded yet</p>
                              )}
                            </div>
                            {saree.sareePhoto && (
                              <img src={saree.sareePhoto} alt="Saree" referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                            )}
                          </div>

                          <div className="bg-[#fcfbf9] border border-stone-200/60 p-3 rounded-xl flex items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="block text-[9px] font-bold text-stone-500 uppercase">Embroidery design reference</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRandomPhoto('embroideryPhoto', sIdx, saree.id)}
                                  className="text-[10px] bg-brand-wine hover:bg-brand-wine-light text-white font-bold py-1 px-2.5 rounded flex items-center gap-1 shrink-0"
                                >
                                  <Upload className="w-3 h-3 text-brand-gold" />
                                  <span>Simulate Pattern Image</span>
                                </button>
                              </div>
                              {saree.embroideryPhoto ? (
                                <p className="text-[9px] text-emerald-700 truncate">{saree.embroideryPhoto}</p>
                              ) : (
                                <p className="text-[9px] text-stone-400 italic">No attachment loaded yet</p>
                              )}
                            </div>
                            {saree.embroideryPhoto && (
                              <img src={saree.embroideryPhoto} alt="Embroidery" referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                            )}
                          </div>
                        </div>

                        {/* Embassy Tracking checkpoints */}
                        <div className="bg-brand-gold-light/10 border border-brand-gold/20 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] font-extrabold uppercase text-brand-gold-dark tracking-wider block">Embroidery Tracking</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={saree.tracking.plainSareeReceived}
                                onChange={e => updateSareeItem(saree.id, {
                                  tracking: { ...saree.tracking, plainSareeReceived: e.target.checked }
                                })}
                                className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4.5 h-4.5 mt-0.5"
                              />
                              <div className="text-xs">
                                <span className="font-bold text-stone-700 block">Plain saree received</span>
                                <span className="text-[9px] text-stone-400 block font-mono">Assigned initially</span>
                              </div>
                            </label>

                            <div className="space-y-1.5">
                              <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={saree.tracking.givenToKarigar}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    const todayStr = checked ? new Date().toISOString().split('T')[0] : '';
                                    updateSareeItem(saree.id, {
                                      tracking: { ...saree.tracking, givenToKarigar: checked, givenToKarigarDate: todayStr }
                                    });
                                  }}
                                  className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4.5 h-4.5 mt-0.5"
                                />
                                <div className="text-xs">
                                  <span className="font-bold text-stone-700 block">Given to Karigar</span>
                                  <span className="text-[9px] text-stone-400 block">Artisan workshop</span>
                                </div>
                              </label>
                              {saree.tracking.givenToKarigar && (
                                <input
                                  type="date"
                                  value={saree.tracking.givenToKarigarDate}
                                  onChange={e => updateSareeItem(saree.id, {
                                    tracking: { ...saree.tracking, givenToKarigarDate: e.target.value }
                                  })}
                                  className="w-full text-xs bg-white border border-stone-200 px-2 py-1 rounded-md font-mono focus:ring-1 focus:ring-brand-wine"
                                />
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={saree.tracking.receivedFromKarigar}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    const todayStr = checked ? new Date().toISOString().split('T')[0] : '';
                                    updateSareeItem(saree.id, {
                                      tracking: { ...saree.tracking, receivedFromKarigar: checked, receivedFromKarigarDate: todayStr }
                                    });
                                  }}
                                  className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4.5 h-4.5 mt-0.5"
                                />
                                <div className="text-xs">
                                  <span className="font-bold text-stone-700 block">Received from Karigar</span>
                                  <span className="text-[9px] text-stone-400 block font-light">Finished work base</span>
                                </div>
                              </label>
                              {saree.tracking.receivedFromKarigar && (
                                <input
                                  type="date"
                                  value={saree.tracking.receivedFromKarigarDate}
                                  onChange={e => updateSareeItem(saree.id, {
                                    tracking: { ...saree.tracking, receivedFromKarigarDate: e.target.value }
                                  })}
                                  className="w-full text-xs bg-white border border-stone-200 px-2 py-1 rounded-md font-mono focus:ring-1 focus:ring-brand-wine"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Blouse requested */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/50 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-brand-cream-dark/50 pb-2">
                    <h4 className="text-xs font-extrabold uppercase text-pink-700 tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-pink-500 rounded-full"></span>
                      <span>4. Blouse Stitching</span>
                    </h4>
                    <label className="flex items-center gap-2 text-xs font-extrabold text-pink-700 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sarees[0]?.blouse?.added || false}
                        onChange={e => {
                          const checked = e.target.checked;
                          // Update first saree's blouse toggle
                          if (sarees[0]) {
                            updateSareeItem(sarees[0].id, {
                              blouse: {
                                ...sarees[0].blouse,
                                added: checked,
                                charge: checked ? (blouseCharges || 4500) : 0
                              }
                            });
                            if (checked && blouseCharges === 0) {
                              setBlouseCharges(4500);
                            } else if (!checked) {
                              setBlouseCharges(0);
                            }
                          }
                        }}
                        className="rounded text-pink-600 focus:ring-pink-500 border-stone-300 w-4.5 h-4.5"
                      />
                      <span className="flex items-center gap-1 uppercase tracking-wider">Blouse requested (stitching)</span>
                    </label>
                  </div>

                  {sarees[0]?.blouse?.added && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-pink-50/20 p-4 rounded-xl border border-pink-100">
                        {[
                          { key: 'bust', label: 'Bust size' },
                          { key: 'waist', label: 'Waist size' },
                          { key: 'hip', label: 'Hip size' },
                          { key: 'armhole', label: 'Armhole' },
                          { key: 'shoulder', label: 'Shoulder width' },
                          { key: 'frontNeck', label: 'Front neck depth' },
                          { key: 'backNeck', label: 'Back neck depth' },
                          { key: 'sleeveLength', label: 'Sleeve length' }
                        ].map(measure => (
                          <div key={measure.key}>
                            <label className="block text-[10px] font-bold text-pink-800 uppercase mb-1">{measure.label} (Inches)</label>
                            <input
                              type="text"
                              placeholder='e.g. 36"'
                              value={(sarees[0]?.blouse?.measurements as any)?.[measure.key] || ''}
                              onChange={e => {
                                if (sarees[0]) {
                                  const measurements = { ...sarees[0].blouse.measurements, [measure.key]: e.target.value };
                                  updateSareeItem(sarees[0].id, { blouse: { ...sarees[0].blouse, measurements } });
                                }
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Stitching specifications & Backness/Hook Tassels</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Backless neck hook fastener, side zipper, gold glass beads tassels..."
                          value={sarees[0]?.blouse?.measurements?.notes || ''}
                          onChange={e => {
                            if (sarees[0]) {
                              const measurements = { ...sarees[0].blouse.measurements, notes: e.target.value };
                              updateSareeItem(sarees[0].id, { blouse: { ...sarees[0].blouse, measurements } });
                            }
                          }}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-brand-wine"
                        />
                      </div>

                      {/* Blouse photo upload list */}
                      <span className="block text-[10px] font-bold text-stone-500 uppercase mt-2">Blouse specification sketch uploads</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { key: 'blouseFront', label: 'Front design', photo: sarees[0]?.blouse?.measurements?.frontPhoto },
                          { key: 'blouseBack', label: 'Back design', photo: sarees[0]?.blouse?.measurements?.backPhoto },
                          { key: 'blouseSleeve', label: 'Sleeve design', photo: sarees[0]?.blouse?.measurements?.sleevePhoto },
                          { key: 'blouseSketch', label: 'Sketch specification', photo: sarees[0]?.blouse?.measurements?.sketchPhoto }
                        ].map(sketch => (
                          <div key={sketch.key} className="bg-stone-50 p-3 rounded-lg border border-stone-200/80 flex flex-col justify-between items-center text-center gap-2">
                            <span className="text-[9px] font-bold text-stone-600 block">{sketch.label}</span>
                            {sketch.photo ? (
                              <img src={sketch.photo} alt={sketch.label} referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded-md border" />
                            ) : (
                              <div className="w-14 h-14 bg-stone-200/50 rounded-md border border-stone-300 border-dashed flex items-center justify-center text-[10px] text-stone-400 font-light font-sans">No attachment</div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSelectRandomPhoto(sketch.key, 0, sarees[0]?.id)}
                              className="text-[9px] bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                              <Upload className="w-2.5 h-2.5" />
                              <span>Select Photo</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Order tracking status */}
                <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/50 shadow-sm space-y-5">
                  <h4 className="text-xs font-extrabold uppercase text-brand-gold tracking-widest border-b border-brand-cream-dark/50 pb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-brand-gold rounded-full"></span>
                    <span>5. Order status (Tracking - Client delivery)</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shipmentStatus !== 'Pending'}
                            onChange={e => {
                              if (!e.target.checked) setShipmentStatus('Pending');
                            }}
                            className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4 h-4"
                          />
                          <span>Logged/Booked</span>
                        </label>
                        <input
                          type="date"
                          value={orderDate}
                          onChange={e => setOrderDate(e.target.value)}
                          className="w-full text-xs bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg font-mono"
                        />
                      </div>

                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shipmentStatus === 'Received by customer' || shipmentStatus === 'Review taken'}
                            onChange={e => {
                              if (e.target.checked) setShipmentStatus('Received by customer');
                            }}
                            className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4 h-4"
                          />
                          <span>Assembly/packing finished</span>
                        </label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={e => setDeliveryDate(e.target.value)}
                          className="w-full text-xs bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg font-mono"
                        />
                      </div>

                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shipmentStatus === 'Dispatched'}
                            onChange={e => {
                              if (e.target.checked) setShipmentStatus('Dispatched');
                            }}
                            className="rounded text-brand-wine focus:ring-brand-wine border-stone-300 w-4 h-4"
                          />
                          <span>Shipped/dispatched</span>
                        </label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={e => setDeliveryDate(e.target.value)}
                          className="w-full text-xs bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Courier / Express Logistics Company</label>
                        <select
                          value={courierCo}
                          onChange={e => setCourierCo(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-4 py-2 text-sm font-semibold text-stone-700 focus:outline-none"
                        >
                          <option value="DTDC">DTDC Courier</option>
                          <option value="Blue Dart">Blue Dart</option>
                          <option value="Delhivery">Delhivery Express</option>
                          <option value="DHL Express">DHL Express Int</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tracking number / Express code</label>
                        <input
                          type="text"
                          placeholder="e.g. BD-8911-30"
                          value={courierTracking}
                          onChange={e => setCourierTracking(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 6: Payments & advances */}
                {userRole === 'staff' && accessSettings?.hideCustomRev ? null : (
                  <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark/50 shadow-sm space-y-6">
                    <h4 className="text-xs font-extrabold uppercase text-brand-wine tracking-widest border-b border-brand-cream-dark/50 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-brand-wine rounded-full"></span>
                      <span>6. Payments & advances ledger</span>
                    </h4>

                    {/* Cost ledger list */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-cream/20 p-4 rounded-xl border border-brand-cream-dark/40 border-dashed">
                      <div>
                        <span className="block text-[9px] font-bold text-stone-500 uppercase">Saree Base Subtotal</span>
                        <span className="text-sm font-mono font-bold text-stone-800">
                          ₹{sarees.reduce((sum, s) => sum + (s.price || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-pink-700 uppercase">Blouse stitching fee (₹)</span>
                        <input
                          type="number"
                          value={blouseCharges || ''}
                          placeholder="0"
                          onChange={e => setBlouseCharges(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-amber-700 uppercase">Dupatta style accessories (₹)</span>
                        <input
                          type="number"
                          value={dupattaCharges || ''}
                          placeholder="0"
                          onChange={e => setDupattaCharges(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-stone-500 uppercase">Courier shipping charges (₹)</span>
                        <input
                          type="number"
                          value={shippingCharges || ''}
                          placeholder="0"
                          onChange={e => setShippingCharges(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5"
                        />
                      </div>
                    </div>

                    <div className="bg-[#fcfbf9] p-4 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <span className="text-xs text-stone-500 font-bold uppercase block">Gross grand total computed</span>
                        <span className="text-2xl font-serif-display font-black text-stone-950 font-mono">₹{totals.total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            onChange={e => {
                              if (e.target.checked) {
                                setAdvance1(totals.total);
                                setAdvance1Mode('UPI');
                                setAdvance2(0);
                                setAdvance2Mode('');
                              } else {
                                setAdvance1(0);
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 w-4.5 h-4.5"
                          />
                          <div className="text-xs">
                            <span className="font-extrabold text-stone-700 block uppercase tracking-wider">Fully clear payment settled</span>
                            <span className="text-[10px] text-stone-400 block font-light">Client cleared dues directly</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Double advance payment layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Advance 1 */}
                      <div className="bg-[#fbfcfa] p-4 rounded-xl border border-stone-200/80 space-y-3">
                        <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                          <span className="text-[11px] font-extrabold text-stone-600 uppercase">Advance Payment 1</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Initiation deposit</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-stone-500 uppercase">Deposit Amount (₹)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="₹ Amount"
                              value={advance1 || ''}
                              onChange={e => setAdvance1(Number(e.target.value))}
                              className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-mono font-extrabold text-emerald-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-stone-500 uppercase">Settlement Mode</label>
                            <select
                              value={advance1Mode}
                              onChange={e => setAdvance1Mode(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-none"
                            >
                              {PAYMENT_MODES.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Upload receipt simulator */}
                        <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-200/60 text-xs gap-3">
                          <span className="text-[9.5px] font-bold text-stone-500 uppercase block truncate">Transfer Voucher Receipt 1</span>
                          <button
                            type="button"
                            onClick={() => handleSelectRandomPhoto('advance1Receipt')}
                            className="bg-brand-gold hover:bg-brand-gold/80 text-white font-bold px-2 py-1 rounded text-[10px] shrink-0"
                          >
                            Simulate Attachment
                          </button>
                        </div>
                        {advance1Receipt && (
                          <div className="flex items-center gap-2 bg-emerald-50 text-[10.5px] p-2 rounded text-emerald-800 border border-emerald-100">
                            <span className="truncate flex-1">{advance1Receipt}</span>
                            <img src={advance1Receipt} className="w-8 h-8 rounded border object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Advance 2 */}
                      <div className="bg-[#fbfcfa] p-4 rounded-xl border border-stone-200/80 space-y-3">
                        <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                          <span className="text-[11px] font-extrabold text-stone-600 uppercase">Advance Payment 2</span>
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase">Stitch Finish deposit</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-stone-500 uppercase">Deposit Amount (₹)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="₹ Amount"
                              value={advance2 || ''}
                              onChange={e => setAdvance2(Number(e.target.value))}
                              className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-mono font-extrabold text-sky-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-stone-500 uppercase">Settlement Mode</label>
                            <select
                              value={advance2Mode}
                              onChange={e => setAdvance2Mode(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded px-1.5 py-1 text-xs font-semibold focus:outline-none"
                            >
                              <option value="">No second advance</option>
                              {PAYMENT_MODES.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Upload receipt 2 */}
                        <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-200/60 text-xs gap-3">
                          <span className="text-[9.5px] font-bold text-stone-500 uppercase block truncate">Transfer Voucher Receipt 2</span>
                          <button
                            type="button"
                            onClick={() => handleSelectRandomPhoto('advance2Receipt')}
                            className="bg-brand-gold hover:bg-brand-gold/80 text-white font-bold px-2 py-1 rounded text-[10px] shrink-0"
                          >
                            Simulate Attachment
                          </button>
                        </div>
                        {advance2Receipt && (
                          <div className="flex items-center gap-2 bg-emerald-50 text-[10.5px] p-2 rounded text-emerald-800 border border-emerald-100">
                            <span className="truncate flex-1">{advance2Receipt}</span>
                            <img src={advance2Receipt} className="w-8 h-8 rounded border object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Balance Due block */}
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-800 uppercase block tracking-wider">Outstanding Balance Due</span>
                        <span className="text-xs text-stone-400 font-light block">Calculated at completion target date</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-rose-700">₹{totals.balanceDue.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Extra photo assets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="bg-[#fcfbf9] border p-3 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-stone-500 uppercase block">Cash Memo Photo Attachment</span>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectRandomPhoto('cashMemoPhoto')}
                            className="text-[10px] bg-brand-wine text-white font-bold px-2 py-1.5 rounded"
                          >
                            Upload Memo Photo
                          </button>
                          {cashMemoPhoto && <img src={cashMemoPhoto} className="w-8 h-8 object-cover rounded border" />}
                        </div>
                        {cashMemoPhoto && <p className="text-[9px] text-emerald-700 truncate">{cashMemoPhoto}</p>}
                      </div>

                      <div className="bg-[#fcfbf9] border p-3 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-stone-500 uppercase block">Voucher Slip Photo Attachment</span>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectRandomPhoto('voucherSlipPhoto')}
                            className="text-[10px] bg-brand-wine text-white font-bold px-2 py-1.5 rounded"
                          >
                            Upload Slip Photo
                          </button>
                          {voucherSlipPhoto && <img src={voucherSlipPhoto} className="w-8 h-8 object-cover rounded border" />}
                        </div>
                        {voucherSlipPhoto && <p className="text-[9px] text-emerald-700 truncate">{voucherSlipPhoto}</p>}
                      </div>
                    </div>

                    {/* General specifications text */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">General specifications notes / terms</label>
                      <textarea
                        rows={2}
                        placeholder="Any special terms, packaging constraints, or extra custom remarks..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button row */}
                <div className="pt-6 border-t border-brand-cream-dark/60 flex justify-end gap-3 pb-8 no-print">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-full font-medium text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-brand-wine text-white rounded-full font-medium text-sm hover:bg-brand-wine-dark transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer pointer-events-auto"
                  >
                    <Check className="w-4 h-4 text-brand-gold shrink-0" />
                    <span>Save Order File</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Viewing details aesthetic popup */}
      <AnimatePresence>
        {viewingOrder && (
          <div id="viewing-popup" className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-brand-cream-dark flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
                <div>
                  <h3 className="font-serif-display font-bold text-xl text-brand-wine">{viewingOrder.orderNumber} Saree Order Details</h3>
                  <p className="text-xs text-stone-400">Archived on {viewingOrder.createdAt}</p>
                </div>
                <button onClick={() => setViewingOrder(null)} className="p-1 rounded-full hover:bg-stone-100 transition-colors">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1 scrollbar-thin">
                <div className="grid grid-cols-2 gap-4 bg-brand-cream/40 p-4 rounded-xl border border-brand-cream-dark/30">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">CLIENT NAME</span>
                    <strong className="text-sm text-stone-800">{viewingOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">CONTACT TEL</span>
                    <strong className="text-sm font-mono text-brand-wine">{viewingOrder.customerPhone}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">CORRESPONDENCE ADRESSE</span>
                    <span className="text-xs text-stone-700">{viewingOrder.customerAddress || 'No shipment address logged.'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">Itemized Karkhana Pieces ({viewingOrder.sarees.length})</h4>
                  {viewingOrder.sarees.map((s, idx) => (
                    <div key={s.id} className="p-4 rounded-xl border border-stone-100 bg-stone-50 space-y-3">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs text-stone-900">{idx+1}. {s.name} ({s.type})</strong>
                        <span className="font-mono text-xs font-bold text-stone-800">₹{s.price.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg italic">
                        &ldquo;{s.description}&rdquo;
                      </div>

                      {/* Display image placeholders if not provided, else beautiful Unsplash cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Saree Image Asset</span>
                          <img
                            src={s.sareePhoto || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"}
                            alt={s.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-24 object-cover rounded-lg border border-stone-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Embroidery Reference Spec</span>
                          <img
                            src={s.embroideryPhoto || "https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600"}
                            alt="Reference"
                            referrerPolicy="no-referrer"
                            className="w-full h-24 object-cover rounded-lg border border-stone-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {userRole === 'staff' && accessSettings?.hideCustomRev ? (
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50 flex flex-col items-center justify-center py-4 text-center">
                    <EyeOff className="w-5 h-5 text-brand-gold mb-1" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Financials Hidden</span>
                  </div>
                ) : (
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/50 space-y-2">
                    <h4 className="text-xs font-bold text-stone-700 uppercase">Payment Summary Card</h4>
                    <div className="flex justify-between text-xs">
                      <span>Summary Price Total:</span>
                      <span>₹{viewingOrder.payment.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-500">
                      <span>Deposited Advance 1:</span>
                      <span>-₹{viewingOrder.payment.advance1.toLocaleString('en-IN')}</span>
                    </div>
                    {viewingOrder.payment.advance2 > 0 && (
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>Deposited Advance 2:</span>
                        <span>-₹{viewingOrder.payment.advance2.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-brand-wine">
                      <span>Outstanding Balance:</span>
                      <span>₹{viewingOrder.payment.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex justify-end">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-6 py-2 bg-brand-wine text-white text-xs font-semibold rounded-full hover:bg-brand-wine-dark"
                >
                  Close Receipt View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
