import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmbroideryStockItem, EmbroideryPieceStatus, AccessSettings } from '../types';
import { ALL_KARIGARS, SAREE_TYPES_LIST, COLOURS_LIST } from '../mockData';
import { generateWhatsAppKarigarMsg, formatTitleCase } from '../utils';
import { Share2, Plus, Filter, Search, RotateCcw, ChevronRight, X, Clock, HelpCircle, AlertCircle, FileText, CheckCircle2, EyeOff, Calendar, Link, Receipt } from 'lucide-react';

interface EmbroideryStockViewProps {
  items: EmbroideryStockItem[];
  onAddItem: (newItem: EmbroideryStockItem) => void;
  onUpdateItemStatus: (id: string, newStatus: EmbroideryPieceStatus) => void;
  onDeleteItem: (id: string) => void;
  userRole?: 'owner' | 'staff';
  accessSettings?: AccessSettings;
}

export default function EmbroideryStockView({ items, onAddItem, onUpdateItemStatus, onDeleteItem, userRole = 'owner', accessSettings }: EmbroideryStockViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [filterKarigar, setFilterKarigar] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterColour, setFilterColour] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form Mode: Single / Multiple
  const [formMode, setFormMode] = useState<'single' | 'multiple'>('single');

  // Common Header State
  const [partyName, setPartyName] = useState('');
  const [purpose, setPurpose] = useState('Stock');

  // Single Piece State
  const [singleBarcode, setSingleBarcode] = useState('');
  const [singleSareeType, setSingleSareeType] = useState('');
  const [singleColour, setSingleColour] = useState('');
  const [singleEmbroideryType, setSingleEmbroideryType] = useState('');
  const [singleQty, setSingleQty] = useState(1);
  const [singlePiecePhoto, setSinglePiecePhoto] = useState('');
  const [singleRefPhoto, setSingleRefPhoto] = useState('');

  // Multiple Pieces State (Initializing with 2 pieces by default as in Slide 2)
  const [multiplePieces, setMultiplePieces] = useState<Array<{
    id: string;
    partyName: string;
    barcode: string;
    sareeType: string;
    colour: string;
    embroideryType: string;
    piecePhoto: string;
  }>>([
    { id: '1', partyName: '', barcode: '', sareeType: '', colour: '', embroideryType: '', piecePhoto: '' },
    { id: '2', partyName: '', barcode: '', sareeType: '', colour: '', embroideryType: '', piecePhoto: '' }
  ]);

  // Karigar State (from presets & manual input)
  const [assignedKarigar, setAssignedKarigar] = useState('Jigariya/Aashiq');

  // Status & Dates State
  const [currentStatus, setCurrentStatus] = useState<EmbroideryPieceStatus>('Given to karigar');
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturn, setExpectedReturn] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [costValue, setCostValue] = useState<number>(0);
  const [finishedPiecePhoto, setFinishedPiecePhoto] = useState('');

  // Notes state
  const [notes, setNotes] = useState('');

  const PRESET_PHOTOS = [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
  ];

  const handleResetFilters = () => {
    setFilterKarigar('');
    setFilterType('');
    setFilterColour('');
    setFilterStatus('');
  };

  const handleSelectRandomPhoto = (type: 'singlePiece' | 'singleRef' | 'finished' | number) => {
    const randomUrl = PRESET_PHOTOS[Math.floor(Math.random() * PRESET_PHOTOS.length)];
    const customUrl = prompt('Enter image URL or press OK to assign a premium artisan saree placeholder:', randomUrl);
    if (customUrl === null) return; // user cancelled

    if (type === 'singlePiece') {
      setSinglePiecePhoto(customUrl);
    } else if (type === 'singleRef') {
      setSingleRefPhoto(customUrl);
    } else if (type === 'finished') {
      setFinishedPiecePhoto(customUrl);
    } else if (typeof type === 'number') {
      setMultiplePieces(prev =>
        prev.map((p, idx) => (idx === type ? { ...p, piecePhoto: customUrl } : p))
      );
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (formMode === 'single') {
      if (!singleBarcode || !singleSareeType || !singleColour) {
        alert('Please fill out Barcode number, Saree type, and Colour.');
        return;
      }

      const totalCostVal = Number(costValue) || 0;
      // Synthesize sub-costs for master ledger (e.g. 30% materials, 50% wages, 20% cloth for preview simulation)
      const synWages = Math.round(totalCostVal * 0.5);
      const synMaterials = Math.round(totalCostVal * 0.3);
      const synCloth = totalCostVal - synWages - synMaterials;

      const newItem: EmbroideryStockItem = {
        id: `emb-${Date.now()}`,
        barcode: singleBarcode.toUpperCase(),
        type: `${formatTitleCase(singleSareeType)} (${formatTitleCase(singleEmbroideryType || 'Zari')})`,
        colour: formatTitleCase(singleColour),
        karigar: assignedKarigar || 'Custom Karigar',
        status: currentStatus,
        photo: singlePiecePhoto || 'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
        notes: notes || `Saree piece supplied by ${partyName || 'Stock'}.`,
        lastUpdated: new Date().toISOString().split('T')[0],
        clothPrice: synCloth > 0 ? synCloth : 0,
        karigarWages: synWages > 0 ? synWages : 0,
        materialsCost: synMaterials > 0 ? synMaterials : 0,
        totalCost: totalCostVal,
        expectedDeliveryDate: expectedReturn || new Date().toISOString().split('T')[0],
        associatedOrderNumber: purpose === 'Stock' ? 'Stock' : 'Custom Order'
      };

      onAddItem(newItem);
    } else {
      // Multiple Mode submission
      const validPieces = multiplePieces.filter(p => p.barcode.trim() !== '' && p.sareeType.trim() !== '' && p.colour.trim() !== '');
      if (validPieces.length === 0) {
        alert('Please fill out at least one piece card with Barcode, Saree type, and Colour.');
        return;
      }

      const totalCostVal = Number(costValue) || 0;
      const parsedQty = validPieces.length;
      const averageCostPerPiece = Math.round(totalCostVal / parsedQty);
      
      const synWages = Math.round(averageCostPerPiece * 0.5);
      const synMaterials = Math.round(averageCostPerPiece * 0.3);
      const synCloth = averageCostPerPiece - synWages - synMaterials;

      validPieces.forEach((p, idx) => {
        const newItem: EmbroideryStockItem = {
          id: `emb-${Date.now()}-${idx}`,
          barcode: p.barcode.toUpperCase(),
          type: `${formatTitleCase(p.sareeType)} (${formatTitleCase(p.embroideryType || 'Zari')})`,
          colour: formatTitleCase(p.colour),
          karigar: assignedKarigar || 'Custom Karigar',
          status: currentStatus,
          photo: p.piecePhoto || 'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
          notes: notes || `Saree piece supplied by ${p.partyName || partyName || 'Stock'}.`,
          lastUpdated: new Date().toISOString().split('T')[0],
          clothPrice: synCloth > 0 ? synCloth : 0,
          karigarWages: synWages > 0 ? synWages : 0,
          materialsCost: synMaterials > 0 ? synMaterials : 0,
          totalCost: averageCostPerPiece,
          expectedDeliveryDate: expectedReturn || new Date().toISOString().split('T')[0],
          associatedOrderNumber: purpose === 'Stock' ? 'Stock' : 'Custom Order'
        };
        onAddItem(newItem);
      });
    }

    setIsModalOpen(false);

    // Reset All states
    setPartyName('');
    setPurpose('Stock');
    setSingleBarcode('');
    setSingleSareeType('');
    setSingleColour('');
    setSingleEmbroideryType('');
    setSingleQty(1);
    setSinglePiecePhoto('');
    setSingleRefPhoto('');
    setMultiplePieces([
      { id: '1', partyName: '', barcode: '', sareeType: '', colour: '', embroideryType: '', piecePhoto: '' },
      { id: '2', partyName: '', barcode: '', sareeType: '', colour: '', embroideryType: '', piecePhoto: '' }
    ]);
    setAssignedKarigar('Jigariya/Aashiq');
    setCurrentStatus('Given to karigar');
    setDateGiven(new Date().toISOString().split('T')[0]);
    setExpectedReturn('');
    setDateReceived('');
    setCostValue(0);
    setFinishedPiecePhoto('');
    setNotes('');
  };

  // Status transitions sequences
  const STATUS_CYCLE: EmbroideryPieceStatus[] = ['Pending', 'Given to karigar', 'Received from karigar', 'Ready'];
  
  const getNextStatus = (current: EmbroideryPieceStatus): EmbroideryPieceStatus | null => {
    const idx = STATUS_CYCLE.indexOf(current);
    if (idx === -1 || idx === STATUS_CYCLE.length - 1) return null;
    return STATUS_CYCLE[idx + 1];
  };

  const getStatusBadgeStyles = (status: EmbroideryPieceStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Given to karigar':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Received from karigar':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Ready':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  // Apply filters
  const filteredItems = items.filter(item => {
    if (filterKarigar && item.karigar !== filterKarigar) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterType && !item.type.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (filterColour && !item.colour.toLowerCase().includes(filterColour.toLowerCase())) return false;
    return true;
  });

  return (
    <div id="embroidery-stock-root" className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-brand-cream-dark/60 shadow-sm leading-tight">
        <div>
          <h2 className="text-2xl font-serif-display font-bold text-brand-wine">Karkhana Embroidery Stock & Pieces</h2>
          <p className="text-xs text-gray-500">Track raw silk segments dispatched to weavers and zardosi specialists.</p>
        </div>
        <button
          id="btn-register-piece"
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-gold hover:bg-brand-gold-dark text-stone-900 active:scale-95 font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Register New Piece</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-2xl border border-brand-cream-dark/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-wine font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-2">
          <Filter className="w-4 h-4 text-brand-gold" />
          <span>Lookup Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Weaving Artisan</label>
            <select
              value={filterKarigar}
              onChange={e => setFilterKarigar(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-wine"
            >
              <option value="">All Artisans</option>
              {ALL_KARIGARS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Embroidery Type Match</label>
            <input
              type="text"
              placeholder="e.g. Zardosi / Butis"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-wine"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Color Match</label>
            <input
              type="text"
              value={filterColour}
              onChange={e => setFilterColour(e.target.value)}
              placeholder="e.g. Maroon"
              className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Status Step</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-xs rounded-xl px-3 py-2"
            >
              <option value="">All Levels</option>
              <option value="Pending">Pending Assignment</option>
              <option value="Given to karigar">Given to karigar</option>
              <option value="Received from karigar">Received from karigar</option>
              <option value="Ready">Ready for dispatch</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs py-2 rounded-xl border border-stone-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Queries</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of pieces items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-4 bg-white p-12 rounded-3xl text-center border border-dashed border-brand-gold/30">
            <p className="text-gray-400 italic font-serif-display text-lg">No stock embroidery pieces match your active filter criteria.</p>
            <p className="text-xs text-gray-400 mt-0.5">Please try loosening filters or register a custom segment.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const nextStatus = getNextStatus(item.status);
            return (
              <motion.div
                id={`embroidery-card-${item.id}`}
                key={item.id}
                layout
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-brand-cream-dark shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Photo and Barcode Badge overlay */}
                <div className="relative h-44 bg-stone-100">
                  <img
                    src={item.photo}
                    alt={item.barcode}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 text-white font-mono text-[10px] font-bold tracking-widest px-2.5 py-1 rounded">
                    {item.barcode}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className={`text-[10px] font-mono px-2.5 py-1 border rounded-lg font-bold shadow-sm uppercase ${getStatusBadgeStyles(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Saree Description Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 font-serif-display truncate">{item.type.replace(/_/g, ' ')}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Colour Specification: <strong>{item.colour}</strong></p>
                    
                    {/* Scheduling Details */}
                    <div className="mt-2 grid grid-cols-2 gap-1 bg-stone-50 p-2 rounded-xl text-[10px] border border-stone-100 font-serif">
                      <span className="text-stone-500 flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                        Target: <strong className="text-stone-800 font-sans">{item.expectedDeliveryDate || item.lastUpdated}</strong>
                      </span>
                      <span className="text-stone-500 flex items-center gap-1 truncate justify-end">
                        <Link className="w-3 h-3 text-brand-gold shrink-0" />
                        Ref: <strong className="text-brand-wine font-mono text-[9px] truncate">{item.associatedOrderNumber || 'Stock'}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed bg-brand-cream/35 p-2 rounded-xl border border-brand-cream-dark/10 italic">
                      &ldquo;{item.notes || 'No design notes.'}&rdquo;
                    </p>

                    {/* Costing breakdown with staff financial lockout protection */}
                    {userRole === 'staff' && accessSettings?.hideEmbCost ? (
                      <div className="mt-2.5 p-2 bg-stone-100 border border-stone-200/50 rounded-xl text-[10px] text-center italic text-stone-500 flex items-center justify-center gap-1">
                        <EyeOff className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Financial Costs Locked</span>
                      </div>
                    ) : (
                      <div className="mt-2.5 p-2.5 bg-brand-cream-dark/10 border border-brand-cream-dark/30 rounded-xl space-y-1 font-mono text-[10px]">
                        <div className="text-[9px] uppercase font-bold text-stone-500 border-b border-stone-200/50 pb-1 mb-1 tracking-wider">Manufacturing Ledger</div>
                        <div className="flex justify-between text-stone-600">
                          <span>Plain Cloth:</span>
                          <span>₹{(item.clothPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Karigar Wages:</span>
                          <span>₹{(item.karigarWages || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Materials:</span>
                          <span>₹{(item.materialsCost || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-brand-wine font-bold border-t border-dashed border-stone-300 pt-1 mt-1 text-[11px]">
                          <span>Total Piece Cost:</span>
                          <span>₹{(item.totalCost || (item.clothPrice || 0) + (item.karigarWages || 0) + (item.materialsCost || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-stone-100 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Artisan: <strong className="text-stone-800">{item.karigar}</strong></span>
                      <span className="font-mono text-[9px]">Upd: {item.lastUpdated}</span>
                    </div>

                    {/* Next step transition button */}
                    {nextStatus && (
                      <button
                        id={`btn-transition-${item.id}`}
                        onClick={() => onUpdateItemStatus(item.id, nextStatus)}
                        className="w-full bg-stone-50 hover:bg-brand-wine-soft hover:text-brand-wine border border-stone-200 p-2 rounded-lg text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Mark as &quot;{nextStatus}&quot;</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-brand-cream/20 border-t border-stone-100 p-3 flex gap-2">
                  <a
                    id={`btn-wa-sar-${item.id}`}
                    href={generateWhatsAppKarigarMsg(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <Share2 className="w-4 h-4 text-brand-cream" />
                    <span>WhatsApp Artisan</span>
                  </a>
                  <button
                    id={`btn-delete-sar-${item.id}`}
                    onClick={() => {
                      if (confirm(`Confirm physical deletion of barcode stock segment ${item.barcode}?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="text-stone-400 hover:text-red-600 p-2 border border-stone-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Modal for Addition (Styled to exactly match user's custom layout) */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="add-piece-modal" className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-cream w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-brand-cream-dark/60 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start border-b border-brand-cream-dark pb-3 mb-4">
                <div>
                  <h3 className="font-serif-display font-medium text-lg text-brand-wine">Add embroidery piece</h3>
                  <p className="text-[10px] text-stone-500">Trace a piece given for embroidery - for stock or against an order.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-5 overflow-y-auto pr-1 flex-1 scrollbar-thin">
                
                {/* SECTION 1: ✦ PIECE DETAILS */}
                <div className="space-y-3.5 border-b border-stone-200/60 pb-5">
                  <div className="text-[11px] font-extrabold uppercase text-stone-800 tracking-wider flex items-center gap-1.5">
                    <span className="text-brand-gold text-xs font-serif">✦</span> PIECE DETAILS
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-extrabold text-stone-600 uppercase mb-1">
                        Party name <span className="text-stone-400 font-sans font-normal lowercase">(default - each piece can have its own below)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Supplier / party name"
                        value={partyName}
                        onChange={e => setPartyName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold text-stone-600 uppercase mb-1">Purpose</label>
                      <select
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                      >
                        <option value="Stock">Stock</option>
                        <option value="Custom Order">Against Order</option>
                      </select>
                    </div>
                  </div>

                  {/* Mode toggle Selector */}
                  <div className="bg-stone-50/50 p-2.5 rounded-2xl border border-stone-200/40 space-y-2">
                    <span className="block text-[9px] font-extrabold text-stone-600 uppercase">Input Mode</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMode('single')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                          formMode === 'single'
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        Single piece
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMode('multiple')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                          formMode === 'multiple'
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        Multiple pieces
                      </button>
                    </div>
                    {formMode === 'multiple' && (
                      <p className="text-[9px] text-brand-wine leading-tight italic">
                        Multiple pieces - (give context of different sarees (such as yarn barcode, colour, design) to one karigar at once)
                      </p>
                    )}
                  </div>

                  {/* Single Piece Mode Form fields */}
                  {formMode === 'single' ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Barcode number</label>
                          <input
                            type="text"
                            placeholder="Store barcode"
                            value={singleBarcode}
                            onChange={e => setSingleBarcode(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Saree type</label>
                          <input
                            type="text"
                            placeholder="e.g. Banarasi"
                            value={singleSareeType}
                            onChange={e => setSingleSareeType(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                            {SAREE_TYPES_LIST.map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setSingleSareeType(st)}
                                className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${
                                  singleSareeType === st ? 'bg-brand-wine text-white border-brand-wine' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Colour</label>
                          <input
                            type="text"
                            placeholder="e.g. Maroon"
                            value={singleColour}
                            onChange={e => setSingleColour(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-brand-wine"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                            {COLOURS_LIST.map(col => (
                              <button
                                key={col}
                                type="button"
                                onClick={() => setSingleColour(col)}
                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-medium border transition-all ${
                                  singleColour === col ? 'bg-brand-wine text-white border-brand-wine' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                                }`}
                              >
                                {col}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Embroidery type</label>
                          <input
                            type="text"
                            placeholder="e.g. Zari"
                            value={singleEmbroideryType}
                            onChange={e => setSingleEmbroideryType(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-brand-wine"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={singleQty}
                            onChange={e => setSingleQty(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2 py-2 text-xs text-center focus:outline-none focus:border-brand-wine"
                          />
                        </div>
                      </div>

                      {/* Photo upload simulator */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Piece photo (given for embroidery)</label>
                          <div
                            onClick={() => handleSelectRandomPhoto('singlePiece')}
                            className="border border-dashed border-stone-300 rounded-xl bg-white p-3.5 text-center cursor-pointer hover:bg-stone-50 hover:border-brand-gold transition-all group flex flex-col items-center justify-center min-h-[75px]"
                          >
                            {singlePiecePhoto ? (
                              <div className="relative w-full h-[60px] flex items-center justify-center gap-1">
                                <img src={singlePiecePhoto} alt="Piece" className="h-full w-auto rounded object-cover shadow" />
                                <span className="text-[8px] text-stone-400 absolute bottom-0 right-0 bg-white/80 p-0.5 rounded">Change</span>
                              </div>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 text-stone-400 group-hover:text-brand-gold mb-1" />
                                <span className="text-[10px] text-stone-500 font-sans">Tap to select photo</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-semibold text-stone-600 mb-1">Reference photo (optional - up to 4 images)</label>
                          <div
                            onClick={() => handleSelectRandomPhoto('singleRef')}
                            className="border border-dashed border-stone-300 rounded-xl bg-white p-3.5 text-center cursor-pointer hover:bg-stone-50 hover:border-brand-gold transition-all group flex flex-col items-center justify-center min-h-[75px]"
                          >
                            {singleRefPhoto ? (
                              <div className="relative w-full h-[60px] flex items-center justify-center gap-1">
                                <img src={singleRefPhoto} alt="Reference" className="h-full w-auto rounded object-cover shadow" />
                                <span className="text-[8px] text-stone-400 absolute bottom-0 right-0 bg-white/80 p-0.5 rounded">Change</span>
                              </div>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 text-stone-400 group-hover:text-brand-gold mb-1" />
                                <span className="text-[10px] text-stone-500 font-sans">Tap to add reference photo</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Multiple Pieces Mode Dynamic Form list */
                    <div className="space-y-4">
                      <p className="text-[9.5px] text-stone-500 font-medium">Add each piece below — every piece gets its own barcode & Qty. They share the party, karigar & dates:</p>
                      
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                        {multiplePieces.map((piece, index) => (
                          <div key={piece.id || index} className="bg-white p-3.5 rounded-2xl border border-stone-200/70 space-y-3 relative">
                            <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                              <span className="text-[10px] font-bold text-brand-wine">Piece {index + 1}</span>
                              {multiplePieces.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMultiplePieces(prev => prev.filter(p => p.id !== piece.id))}
                                  className="text-[9px] text-red-500 hover:underline mr-1"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Supplier / party</label>
                                <input
                                  type="text"
                                  placeholder="Supplier / party name"
                                  value={piece.partyName || partyName}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, partyName: val } : p));
                                  }}
                                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Barcode</label>
                                <input
                                  type="text"
                                  placeholder="Store barcode"
                                  value={piece.barcode}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, barcode: val } : p));
                                  }}
                                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none font-mono uppercase"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Saree type</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Banarasi"
                                  value={piece.sareeType}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, sareeType: val } : p));
                                  }}
                                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none"
                                />
                                <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                                  {SAREE_TYPES_LIST.map(st => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, sareeType: st } : p))}
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-medium border transition-all ${
                                        piece.sareeType === st ? 'bg-brand-wine text-white border-brand-wine' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Colour</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Maroon"
                                  value={piece.colour}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, colour: val } : p));
                                  }}
                                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none"
                                />
                                <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                                  {COLOURS_LIST.map(col => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, colour: col } : p))}
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-medium border transition-all ${
                                        piece.colour === col ? 'bg-brand-wine text-white border-brand-wine' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Embroidery type</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Zari"
                                  value={piece.embroideryType}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setMultiplePieces(prev => prev.map(p => p.id === piece.id ? { ...p, embroideryType: val } : p));
                                  }}
                                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[8px] font-bold text-stone-500 uppercase mb-0.5">Piece photo</label>
                                <div
                                  onClick={() => handleSelectRandomPhoto(index)}
                                  className="border border-dashed border-stone-200 rounded-lg bg-stone-50/40 p-1 text-center cursor-pointer hover:bg-stone-100 flex items-center justify-center h-8"
                                >
                                  {piece.piecePhoto ? (
                                    <img src={piece.piecePhoto} alt="Piece Thumbnail" className="h-6 w-auto rounded shadow-sm object-cover" />
                                  ) : (
                                    <span className="text-[8px] text-stone-500 leading-tight">Tap to add piece photo</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newId = String(Date.now());
                            setMultiplePieces(prev => [...prev, { id: newId, partyName: '', barcode: '', sareeType: '', colour: '', embroideryType: '', piecePhoto: '' }]);
                          }}
                          className="flex-1 py-1 px-3 border border-stone-300 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[10px] font-semibold transition-colors"
                        >
                          + Add another piece
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (multiplePieces.length > 1) {
                              setMultiplePieces(prev => prev.slice(0, -1));
                            }
                          }}
                          className="py-1 px-3 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-500 text-[10px] transition-colors"
                        >
                          Remove last piece
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Karigar Select section */}
                  <div className="bg-brand-cream-dark/5 p-3.5 rounded-2xl border border-brand-cream-dark/25 space-y-3 mt-4">
                    <label className="block text-[9.5px] font-extrabold text-stone-700 uppercase tracking-wide">
                      Select Karigar / Artisan
                    </label>

                    {/* Quick Select Buttons Grid (Directly mirroring the screenshot) */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...ALL_KARIGARS,
                        'Custom Karigar'
                      ].map(name => {
                        const isSelected = assignedKarigar === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setAssignedKarigar(name);
                              if (name !== 'Custom Karigar') {
                                // Automatically sync target input
                                setAssignedKarigar(name);
                              } else {
                                // Clear input for custom typing
                                setAssignedKarigar('');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-medium border transition-all ${
                              isSelected || (name === 'Custom Karigar' && !ALL_KARIGARS.includes(assignedKarigar))
                                ? 'bg-brand-gold border-brand-gold text-stone-900 shadow-sm'
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Karigar name"
                        value={assignedKarigar}
                        onChange={e => setAssignedKarigar(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine mt-1 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ✦ STATUS & DATES */}
                <div className="space-y-3.5 border-b border-stone-200/60 pb-5">
                  <div className="text-[11px] font-extrabold uppercase text-stone-800 tracking-wider flex items-center gap-1.5">
                    <span className="text-brand-gold text-xs font-serif">✦</span> STATUS & DATES
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-stone-600 mb-1">Current status</label>
                    <select
                      value={currentStatus}
                      onChange={e => setCurrentStatus(e.target.value as EmbroideryPieceStatus)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                    >
                      <option value="Given to karigar">Given to karigar</option>
                      <option value="Received from karigar">Received from karigar</option>
                      <option value="Ready">Ready for Sale (Ready)</option>
                      <option value="Pending">Pending Assignment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-semibold text-stone-600 mb-1">Date given to karigar</label>
                      <input
                        type="date"
                        value={dateGiven}
                        onChange={e => setDateGiven(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-stone-600 mb-1">Expected return</label>
                      <input
                        type="date"
                        value={expectedReturn}
                        onChange={e => setExpectedReturn(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-semibold text-stone-600 mb-1">Date received back</label>
                      <input
                        type="date"
                        value={dateReceived}
                        onChange={e => setDateReceived(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-stone-600 mb-1">Cost / value (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={costValue || ''}
                        onChange={e => setCostValue(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-wine font-mono"
                      />
                    </div>
                  </div>

                  {/* Photo when received back */}
                  <div>
                    <label className="block text-[9px] font-semibold text-stone-600 mb-1">Photo when received back (finished piece)</label>
                    <div
                      onClick={() => handleSelectRandomPhoto('finished')}
                      className="border border-dashed border-stone-300 rounded-xl bg-white p-3.5 text-center cursor-pointer hover:bg-stone-50 hover:border-brand-gold transition-all group flex flex-col items-center justify-center min-h-[70px]"
                    >
                      {finishedPiecePhoto ? (
                        <div className="relative w-full h-[55px] flex items-center justify-center gap-1">
                          <img src={finishedPiecePhoto} alt="Finished embroidery" className="h-full w-auto rounded object-cover shadow" />
                          <span className="text-[8px] text-stone-400 absolute bottom-0 right-0 bg-white/80 p-0.5 rounded">Change</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-stone-400 group-hover:text-brand-gold mb-1" />
                          <span className="text-[10px] text-stone-500 font-sans">Tap to add finished-piece photo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ✦ NOTES */}
                <div className="space-y-3.5">
                  <div className="text-[11px] font-extrabold uppercase text-stone-800 tracking-wider flex items-center gap-1.5">
                    <span className="text-brand-gold text-xs font-serif">✦</span> NOTES
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Any notes about this piece..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-xs focus:outline-none focus:border-brand-wine font-sans resize-none"
                    />
                  </div>
                </div>

                {/* Submit bar matching screenshot layout */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full bg-stone-900 border border-stone-900 hover:bg-stone-850 text-white font-extrabold text-[11px] uppercase tracking-wider py-3 rounded-xl transition-all shadow hover:shadow-md active:scale-[0.99]"
                  >
                    {formMode === 'single' ? 'SAVE PIECE' : `SAVE ALL PIECES (${multiplePieces.filter(p => p.barcode.trim() !== '').length} ITEMS)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-[10px] uppercase py-2 rounded-xl transition-colors"
                  >
                    Cancel
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
