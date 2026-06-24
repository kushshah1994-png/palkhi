import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AccessSettings } from '../types';
import { Shield, Key, EyeOff, LayoutGrid, CheckCircle } from 'lucide-react';

interface AccessSettingsViewProps {
  settings: AccessSettings;
  onSave: (newSettings: AccessSettings) => void;
}

export default function AccessSettingsView({ settings, onSave }: AccessSettingsViewProps) {
  const [dashboard, setDashboard] = useState(settings.pages.dashboard);
  const [orders, setOrders] = useState(settings.pages.orders);
  const [stock, setStock] = useState(settings.pages.stock);
  const [online, setOnline] = useState(settings.pages.online);

  const [hideCustomRev, setHideCustomRev] = useState(settings.hideCustomRev);
  const [hideOnlineRev, setHideOnlineRev] = useState(settings.hideOnlineRev);
  const [hideEmbCost, setHideEmbCost] = useState(settings.hideEmbCost);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    const updated: AccessSettings = {
      pages: {
        dashboard,
        orders,
        stock,
        online,
      },
      hideCustomRev,
      hideOnlineRev,
      hideEmbCost,
    };
    onSave(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-brand-cream-dark">
        <div>
          <h2 className="text-2xl font-serif-display font-medium text-brand-wine">
            Staff Access Control
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Determine what is visible to users logging in using the staff password.
          </p>
        </div>
      </div>

      {showSavedToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>✓ Access settings updated successfully. Staff views are now updated restrictively.</span>
        </motion.div>
      )}

      {/* Section 1: Pages visibility */}
      <div className="bg-white border border-brand-cream-dark p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark mb-4 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          Pages allowed for Staff
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Uncheck pages you want to completely hide from staff members.
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={dashboard}
              onChange={(e) => setDashboard(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <span className="text-sm font-medium text-stone-800">Business Dashboard</span>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={orders}
              onChange={(e) => setOrders(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <span className="text-sm font-medium text-stone-800">Custom Orders Page</span>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={stock}
              onChange={(e) => setStock(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <span className="text-sm font-medium text-stone-800">Embroidery Stock Tracking</span>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={online}
              onChange={(e) => setOnline(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <span className="text-sm font-medium text-stone-800">Online Ready Orders</span>
          </label>
        </div>
      </div>

      {/* Section 2: Privacy / Financial locks */}
      <div className="bg-white border border-brand-cream-dark p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark mb-4 flex items-center gap-2">
          <EyeOff className="w-4 h-4" />
          Financial Security
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Hide revenue summary, payments, and ledger values to protect business cash statistics.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={hideCustomRev}
              onChange={(e) => setHideCustomRev(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <div>
              <span className="text-sm font-medium text-stone-800 block">
                Hide Custom Orders Revenue &amp; Payments
              </span>
              <span className="text-xs text-stone-400">
                Staff won't see advanced payments, due balance, total collected fields, or invoice bills.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={hideOnlineRev}
              onChange={(e) => setHideOnlineRev(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <div>
              <span className="text-sm font-medium text-stone-800 block">
                Hide Online Ready Orders Revenue &amp; Payments
              </span>
              <span className="text-xs text-stone-400">
                Staff won't see the platform revenue summaries, price totals, or card transaction amounts.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-brand-cream-soft rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={hideEmbCost}
              onChange={(e) => setHideEmbCost(e.target.checked)}
              className="w-4 h-4 rounded text-brand-wine focus:ring-brand-wine accent-brand-gold"
            />
            <div>
              <span className="text-sm font-medium text-stone-800 block">
                Hide Embroidery Costs on Stocks
              </span>
              <span className="text-xs text-stone-400">
                Staff can still create or update stock pieces, but the internal manufacturing cost will be hidden.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Saved Passwords reference */}
      <div className="bg-brand-cream border border-brand-gold/25 p-4 rounded-xl flex items-start gap-4">
        <Key className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
        <div className="text-xs text-stone-600 space-y-1">
          <p className="font-semibold text-brand-wine">Current Passwords Reference (Config):</p>
          <p>
            • Admin/Owner Password: <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-stone-900">Shah31419</code> (Has complete master access)
          </p>
          <p>
            • Staff Member Password: <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-stone-900">Palkhe123</code> (Enforces options saved on this page)
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-brand-wine text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-wine-light transition-colors"
        >
          Save Permissions Profile
        </button>
      </div>
    </div>
  );
}
