import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, SareeMeasurements } from '../types';
import { PAYMENT_MODES } from '../mockData';
import { autoDetectPinCode } from '../utils';
import { HelpCircle, ClipboardCheck, Smartphone, Check, ArrowRight, ShieldCheck, Scissors, Landmark, FileImage, Upload, CheckCircle } from 'lucide-react';

interface CustomerSelfServiceViewProps {
  orders: Order[];
  selectedOrderNumFromLink?: string;
  onUpdateOrder: (updatedOrder: Order) => void;
  onSuccessNotice: (msg: string) => void;
}

export default function CustomerSelfServiceView({ orders, selectedOrderNumFromLink, onUpdateOrder, onSuccessNotice }: CustomerSelfServiceViewProps) {
  // Find initial order if passed from link/props
  const [selectedOrderNo, setSelectedOrderNo] = useState(selectedOrderNumFromLink || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Form states matching customer actions
  const [shippingAddress, setShippingAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [detectedLoc, setDetectedLoc] = useState<string>('');
  
  // Blouse measurements state defaults
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [frontNeck, setFrontNeck] = useState('');
  const [backNeck, setBackNeck] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Payment states
  const [paymentOption, setPaymentOption] = useState<'upi' | 'bank'>('upi');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync selected order object
  useEffect(() => {
    if (selectedOrderNo) {
      const match = orders.find(o => o.orderNumber === selectedOrderNo);
      if (match) {
        setCurrentOrder(match);
        setShippingAddress(match.customerAddress || '');
        setPinCode(match.pinCode || '');
        
        // Populate existing blouse measurements if present
        const firstBlouseSaree = match.sarees.find(s => s.blouse.added);
        if (firstBlouseSaree && firstBlouseSaree.blouse.measurements) {
          const m = firstBlouseSaree.blouse.measurements;
          setBust(m.bust || '');
          setWaist(m.waist || '');
          setShoulder(m.shoulder || '');
          setFrontNeck(m.frontNeck || '');
          setBackNeck(m.backNeck || '');
          setSleeveLength(m.sleeveLength || '');
          setCustomNotes(m.notes || '');
        }
      } else {
        setCurrentOrder(null);
      }
    } else {
      setCurrentOrder(null);
    }
  }, [selectedOrderNo, orders]);

  // Handle PIN change inside public form
  const handlePinChange = (val: string) => {
    setPinCode(val);
    const result = autoDetectPinCode(val);
    if (result) {
      setDetectedLoc(`${result.area}, ${result.city}, ${result.state}`);
      setShippingAddress(prev => `${prev ? prev + ', ' : ''}${result.area}, ${result.city}, ${result.state} - Pin: ${val}`);
    } else {
      setDetectedLoc('');
    }
  };

  // Screenshot upload simulation handler
  const handleScreenshotMockUpload = () => {
    // Generate lovely green mock transaction receipt screenshot URL
    setPaymentScreenshot('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200');
    onSuccessNotice('UPI confirmation screenshot uploaded successfully!');
  };

  const handleSelfServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) {
      alert('Please select your matching Palkhi Saree Order Number.');
      return;
    }

    setIsSubmitting(true);

    // Deep copy and map custom measurements back onto all sarees in this order that requested blouses
    const updatedSarees = currentOrder.sarees.map(saree => {
      if (!saree.blouse.added) return saree;
      return {
        ...saree,
        blouse: {
          ...saree.blouse,
          measurements: {
            bust,
            waist,
            shoulder,
            frontNeck,
            backNeck,
            sleeveLength,
            notes: customNotes
          }
        }
      };
    });

    // Simulated partial payment calculation
    let updatedPaid = currentOrder.payment.advance1;
    let updatedBal = currentOrder.payment.balanceDue;
    let updatedAdv2 = currentOrder.payment.advance2;
    let updatedAdv2Mode = currentOrder.payment.advance2Mode;

    if (paymentRefNumber) {
      const simulatedAmt = Math.min(20000, currentOrder.payment.balanceDue); // Mock client pays 20,000 or the final balance
      if (currentOrder.payment.advance2 === 0) {
        updatedAdv2 = simulatedAmt;
        updatedAdv2Mode = paymentOption === 'upi' ? 'UPI (Simulated Self-Service)' : 'Bank Transfer (Simulated Self-Service)';
      } else {
        updatedPaid += simulatedAmt;
      }
      updatedBal = Math.max(0, currentOrder.payment.total - updatedPaid - updatedAdv2);
    }

    const updatedOrder: Order = {
      ...currentOrder,
      customerAddress: shippingAddress,
      pinCode,
      sarees: updatedSarees,
      payment: {
        ...currentOrder.payment,
        advance1: updatedPaid,
        advance2: updatedAdv2,
        advance2Mode: updatedAdv2Mode,
        balanceDue: updatedBal
      }
    };

    setTimeout(() => {
      onUpdateOrder(updatedOrder);
      setIsSubmitting(false);
      setSuccess(true);
      onSuccessNotice(`Thank you! Self-service file updated for order ${currentOrder.orderNumber}`);
    }, 1500);
  };

  // Setup options for self orders select dropdown
  const customerOrdersList = orders.filter(o => o.orderType === 'online' || o.orderType === 'custom');

  return (
    <div id="customer-self-service-root" className="max-w-3xl mx-auto space-y-8 bg-white p-6 md:p-10 rounded-3xl border border-brand-cream-dark shadow-xl leading-relaxed">
      {/* Brand Header */}
      <div className="text-center space-y-3 pb-6 border-b border-brand-cream-dark/60">
        <span className="text-xs text-brand-gold font-bold uppercase tracking-widest block">CLIENT EXCLUSIVE SECURE ACCESS</span>
        <h1 className="text-3xl font-serif-display font-black text-brand-wine">Palkhi Sarees Mumbai</h1>
        <p className="text-xs text-stone-550 max-w-lg mx-auto">
          Establishment Est. 1991, Charni Road, Mumbai. Thank you for commissioning an authentic handwoven garment. Please complete your shipping addresses and fitting dimensions below.
        </p>
      </div>

      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-10 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif-display font-bold text-stone-800">Measurements Logged!</h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Your details have been synchronized with the master karkhana dashboard directly. Ismailbhai Zardosi and team will receive your final custom specs.
            </p>
            <button
              id="btn-self-service-edit-again"
              onClick={() => setSuccess(false)}
              className="mt-4 px-6 py-2 bg-brand-wine text-white text-xs font-bold rounded-full hover:bg-brand-wine-dark"
            >
              Update Measurements Again
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSelfServiceSubmit} className="space-y-8">
            {/* Step 1: Link Order File */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-wine text-xs uppercase font-extrabold tracking-widest border-b border-brand-cream-dark/55 pb-1">
                <Smartphone className="w-4 h-4 text-brand-gold" />
                <span>1. Connect to Saree Receipt</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Select your Palkhi Order Number</label>
                <select
                  value={selectedOrderNo}
                  onChange={e => setSelectedOrderNo(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-cream-dark/80 rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="">-- Choose Your Saree Commission ID --</option>
                  {customerOrdersList.map(o => (
                    <option key={o.id} value={o.orderNumber}>
                      {o.orderNumber} - Saree for {o.customerName}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">Your Order ID is printed at the top-left of your payment receipt.</span>
              </div>

              {currentOrder && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-wine-soft/40 p-4 rounded-xl border border-brand-cream-dark"
                >
                  <h4 className="text-xs font-bold text-stone-850">Connected Saree Receipt Match:</h4>
                  <p className="text-xs text-stone-600 mt-1">Customer: <strong className="text-brand-wine">{currentOrder.customerName}</strong> • Phone: <strong className="font-mono">{currentOrder.customerPhone}</strong></p>
                  <p className="text-xs text-stone-605 mt-0.5">Saree Items ordered: {currentOrder.sarees.map(s => `${s.name} (${s.type})`).join(', ')}</p>
                </motion.div>
              )}
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-wine text-xs uppercase font-extrabold tracking-widest border-b border-brand-cream-dark/55 pb-1">
                <Landmark className="w-4 h-4 text-brand-gold" />
                <span>2. Secured Mailing Registry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">ZIP code validation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400018"
                    maxLength={6}
                    value={pinCode}
                    onChange={e => handlePinChange(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-wine"
                  />
                  {detectedLoc && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">✓ Auto-fill: {detectedLoc}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Mailing Address Details</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter house, building, lane, city & state information"
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-wine"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Blouse Fitting Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-wine text-xs uppercase font-extrabold tracking-widest border-b border-brand-cream-dark/55 pb-1">
                <Scissors className="w-4 h-4 text-brand-gold" />
                <span>3. Blouse Custom Measuring Book (Inches)</span>
              </div>

              <div className="bg-pink-50/15 p-4 rounded-2xl border border-pink-100/50 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Bust Circumference</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 34&quot;"
                      value={bust}
                      onChange={e => setBust(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none focus:border-brand-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Lower Waist Circumference</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 28&quot;"
                      value={waist}
                      onChange={e => setWaist(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Shoulders Width</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14&quot;"
                      value={shoulder}
                      onChange={e => setShoulder(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Front Neck Depth</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7.5&quot;"
                      value={frontNeck}
                      onChange={e => setFrontNeck(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Back Neck Depth</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9&quot;"
                      value={backNeck}
                      onChange={e => setBackNeck(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Sleeve Length Target</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 11&quot;"
                      value={sleeveLength}
                      onChange={e => setSleeveLength(e.target.value)}
                      className="w-full bg-white border border-stone-200/90 rounded-lg px-3 py-2 text-sm text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Special Neck Designs / Dori Tassels Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Boat neck style front, velvet border lining to sleeves edge, heavy golden dori threads with pearl drops."
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    className="w-full bg-white border border-stone-200/90 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: UPI / Bank Details Gateway */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-wine text-xs uppercase font-extrabold tracking-widest border-b border-brand-cream-dark/55 pb-1">
                <Smartphone className="w-4 h-4 text-brand-gold" />
                <span>4. Secured UPI & Bank Advance Transfer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentOption('upi')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentOption === 'upi'
                      ? 'bg-brand-gold/10 border-brand-gold text-brand-gold-dark'
                      : 'bg-stone-50 border-stone-200/80 text-stone-605'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-sm font-bold flex items-center gap-1">📲 UPI GPay / BHIM Account</strong>
                    {paymentOption === 'upi' && <span className="bg-brand-gold text-white p-0.5 rounded-full"><Check className="w-3.5 h-3.5" /></span>}
                  </div>
                  <p className="text-xs text-stone-600 mt-2 font-semibold">UPI ID: <strong>palkhisareesmumbai@okhdfcbank</strong></p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Instant transaction confirmation and ledger tracking.</span>
                </div>

                <div
                  onClick={() => setPaymentOption('bank')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentOption === 'bank'
                      ? 'bg-brand-gold/10 border-brand-gold text-brand-gold-dark'
                      : 'bg-stone-50 border-stone-200/80 text-stone-605'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-sm font-bold flex items-center gap-1">🏦 Direct NetBanking (ICICI)</strong>
                    {paymentOption === 'bank' && <span className="bg-brand-gold text-white p-0.5 rounded-full"><Check className="w-3.5 h-3.5" /></span>}
                  </div>
                  <div className="text-xs text-stone-600 mt-2 font-semibold space-y-0.5">
                    <p>A/C: <strong>94011245781290</strong></p>
                    <p>IFSC: <strong>ICIC0000214</strong></p>
                    <p>Name: <strong>Palkhi Sarees Mumbai LLP</strong></p>
                  </div>
                </div>
              </div>

              {/* Upload Proof Simulator */}
              <div className="bg-brand-cream/60 p-5 rounded-2xl border border-brand-cream-dark/60 space-y-4">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Submit Verification Proof snapshot</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase">Input Bank UTN / UPI reference Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Ref: UPI9012488102"
                      value={paymentRefNumber}
                      onChange={e => setPaymentRefNumber(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-center text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      id="btn-self-service-mock-upload"
                      onClick={handleScreenshotMockUpload}
                      className="w-full border border-dashed border-stone-300 hover:border-brand-gold bg-stone-50 text-stone-600 hover:bg-stone-100 rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-stone-400" />
                      <span>{paymentScreenshot ? 'Screenshot Proof Loaded ✓' : 'Upload Receipt Screenshot'}</span>
                    </button>
                    {paymentScreenshot && (
                      <span className="text-[10px] text-green-700 italic block mt-1 text-center font-medium font-mono">
                        Mock proof preview.jpg successfully selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-stone-100 p-4 rounded-xl border border-stone-250 flex items-start gap-2.5 text-xs text-stone-600">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>SSL 256-Bit Authentication Encrypted.</strong> This self-service measurements registry is fully aligned with custom karkhana privacy guidelines. Unused specs are destroyed after order delivery.
              </span>
            </div>

            {/* Actions submit */}
            <div className="pt-4 border-t border-brand-cream-dark flex justify-end gap-3.5">
              <button
                type="submit"
                disabled={isSubmitting || !currentOrder}
                className={`px-8 py-3 rounded-full text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all shadow ${
                  currentOrder
                    ? 'bg-brand-wine hover:bg-brand-wine-dark'
                    : 'bg-stone-300 cursor-not-allowed'
                }`}
              >
                <span>{isSubmitting ? 'Syncing with Karkhana...' : 'Submit Self-Service File'}</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
