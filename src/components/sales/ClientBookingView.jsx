import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, DollarSign, Sparkles, Send, 
  ExternalLink, ArrowRight, ShieldCheck, Zap, Plus, Phone, 
  Mail, MapPin, Globe, Check, AlertCircle, Trash2, Copy
} from 'lucide-react';

const PACKAGES = [
  {
    id: 'free_demo',
    name: '100% Free 24h Interactive Preview',
    price: 0,
    monthly: 0,
    badge: 'ZERO RISK / ZERO COST',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'We build a tailored, mobile-optimized live preview with your logo, colors, and local estimate pricing within 24 hours.',
    features: [
      '24-hour turnaround committed',
      'Mobile bedroom/bath calculator preview',
      'Branded with your company name & colors',
      'Zero upfront payment, zero obligation'
    ]
  },
  {
    id: 'turnkey_499',
    name: 'Turnkey Cleaning Web & Booking Flow',
    price: 499,
    monthly: 20,
    badge: 'MOST POPULAR',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Complete mobile-first website redesign with instant price calculator, 60-second checkout, and cloud hosting.',
    features: [
      'Mobile bedroom/bath online calculator',
      '60-second mobile customer checkout',
      'Custom branding, logo & review integration',
      'Fast cloud hosting & SSL ($20/month)',
      'Service area radius map & contact forms'
    ]
  },
  {
    id: 'pro_649',
    name: 'Pro Growth & Automated SMS Dispatch',
    price: 649,
    monthly: 20,
    badge: 'HIGH CONVERSION',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Everything in Turnkey plus automated real-time SMS dispatch alerts to cleaners and online deposit collection.',
    features: [
      'Everything in $499 Turnkey Package',
      'Automated SMS notifications on new booking',
      'Stripe / Square online deposit collection',
      'Google Reviews live synchronization',
      'Airbnb turnover & deep cleaning pricing tabs'
    ]
  },
  {
    id: 'enterprise_899',
    name: 'Enterprise Multi-Crew & Radius Expansion',
    price: 899,
    monthly: 20,
    badge: 'MULTI-LOCATION',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Full multi-crew scheduling, multi-city territory dispatch, and priority 24/7 technical maintenance.',
    features: [
      'Multi-crew dispatch & route scheduling',
      'Multi-city coverage radius selector',
      'Automated SMS + Email customer reminders',
      'Priority 24/7 cloud support & uptime guarantee',
      'Custom booking questions & add-on services'
    ]
  }
];

const ADDONS = [
  { id: 'sms_automation', name: 'Twilio Automated SMS Booking Alerts', price: 100, desc: 'Instantly SMS homeowner & crew upon booking' },
  { id: 'google_reviews', name: 'Google Business Reviews Live Widget', price: 50, desc: 'Auto-sync 5-star ratings directly to mobile' },
  { id: 'multi_city', name: 'Multi-City Service Radius Expansion', price: 150, desc: 'Support 5+ regional territories & custom pricing' }
];

export const ClientBookingView = ({ settings = {}, onAddConversation }) => {
  const [selectedPackage, setSelectedPackage] = useState('turnkey_499');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    clientName: '',
    companyName: '',
    clientEmail: '',
    clientPhone: '',
    city: '',
    websiteUrl: '',
    preferredDate: '',
    notes: ''
  });

  // Load existing bookings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('infratechai_client_bookings');
      if (saved) {
        setBookings(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load bookings:', e.message);
    }
  }, []);

  const saveBookings = (newList) => {
    setBookings(newList);
    try {
      localStorage.setItem('infratechai_client_bookings', JSON.stringify(newList));
    } catch (e) {
      console.warn('Could not save bookings:', e.message);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Calculate pricing
  const currentPkg = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[1];
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);
  const totalPrice = currentPkg.price + addonsTotal;

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!form.companyName || !form.clientEmail) {
      showToast('⚠️ Please enter Company Name and Email.');
      return;
    }

    const newBooking = {
      id: `book-${Date.now()}`,
      clientName: form.clientName || 'Owner / Manager',
      companyName: form.companyName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone || 'N/A',
      city: form.city || 'United States',
      websiteUrl: form.websiteUrl || 'N/A',
      preferredDate: form.preferredDate || 'Within 24 Hours',
      notes: form.notes,
      packageId: currentPkg.id,
      packageName: currentPkg.name,
      totalPrice,
      monthlyHosting: currentPkg.monthly,
      addons: selectedAddons.map(id => ADDONS.find(a => a.id === id)?.name).filter(Boolean),
      status: currentPkg.price === 0 ? 'Free Demo In Production' : 'Booked — Pending Onboarding',
      createdAt: new Date().toISOString()
    };

    const updated = [newBooking, ...bookings];
    saveBookings(updated);

    // If conversation hook exists, log into pipeline
    if (onAddConversation) {
      onAddConversation({
        companyName: form.companyName,
        contactName: form.clientName || 'Client',
        contactEmail: form.clientEmail,
        stage: currentPkg.price === 0 ? 'demo_in_progress' : 'negotiating',
        dealValue: totalPrice || 499,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'prospect',
            senderName: form.clientName || form.companyName,
            text: `Booked ${currentPkg.name} ($${totalPrice}). Notes: ${form.notes || 'Ready for 24h preview walk-through.'}`,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }

    setForm({
      clientName: '',
      companyName: '',
      clientEmail: '',
      clientPhone: '',
      city: '',
      websiteUrl: '',
      preferredDate: '',
      notes: ''
    });
    setSelectedAddons([]);

    showToast(`🎉 Booking confirmed for ${newBooking.companyName}! Work order created.`);
  };

  const handleDeleteBooking = (id) => {
    const updated = bookings.filter(b => b.id !== id);
    saveBookings(updated);
    showToast('🗑️ Booking removed.');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 animate-slideUp flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Pricing Calculator & 60-Second Booking System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Client Bookings & 24h Custom Demo Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Configure turn-key website setups, calculate custom scopes ($499 - $899 USD), or schedule a 100% free 24-hr interactive mobile preview with custom branding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://housecleaning-998d3.web.app/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Live Base Demo</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Packages & Add-on Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Select Turnkey Service Package</h2>
                <p className="text-xs text-slate-500">Pick the configuration that fits the cleaning company's scale</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                Turnkey SLA: 24 Hours
              </span>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                          {pkg.badge}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900">
                          {pkg.price === 0 ? 'FREE' : `$${pkg.price}`}
                        </span>
                        {pkg.price > 0 && <span className="text-[10px] text-slate-500 font-bold ml-1">one-time</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {pkg.monthly === 0 ? '0 obligation' : `+ $${pkg.monthly}/mo hosting`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Addons List */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Optional Upgrades & Automation Add-ons
              </h3>
              <div className="space-y-2">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-50/50' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 pointer-events-none"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{addon.name}</div>
                          <div className="text-[11px] text-slate-500">{addon.desc}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 font-mono">+${addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Antigravity Autonomous Cloner Box */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-800/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Antigravity Autonomous Clone & Edit Engine</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When a cleaning prospect confirms interest, Antigravity clones the base cleaning repo (`housecleaning-998d3.web.app`), updates the client's logo, colors, pricing calculator, and business photos, and runs QA tests until it is 100% bug-free before dispatching the link!
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full automated build, test & deploy pipeline supported</span>
            </div>
          </div>

        </div>

        {/* Right Column: 60-Second Booking Submission Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Instant Booking & Work Order</h2>
              <p className="text-xs text-slate-500">Provide business details for 24h custom build</p>
            </div>

            {/* Price Summary Pill */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider block">Estimated Total</span>
                <span className="text-xs font-medium text-slate-600">{currentPkg.name}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-900">
                  {totalPrice === 0 ? 'FREE' : `$${totalPrice} USD`}
                </span>
                {currentPkg.monthly > 0 && (
                  <span className="block text-[10px] text-slate-500">+$20/mo hosting</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cleaning Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin Clean Team"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Austin, TX"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Client Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. service@austinclean.com"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(512) 555-0199"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Website / FB</label>
                  <input
                    type="text"
                    placeholder="austinclean.com"
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Requirements / Brand Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pull colors from our FB page, include Airbnb turnover prices, launch within 24h"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentPkg.price === 0 
                    ? 'Request 100% Free 24h Preview' 
                    : `Confirm Booking ($${totalPrice} USD)`}
                </span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Bookings & Work Orders History Table */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Active Client Bookings & Production Queue ({bookings.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Live Pipeline Synced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Package / Scope</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{b.companyName}</div>
                      <div className="text-[10px] text-slate-400">{b.city}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700">{b.clientName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{b.clientEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{b.packageName}</span>
                      {b.addons?.length > 0 && (
                        <div className="text-[10px] text-indigo-600 font-medium">+{b.addons.join(', ')}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {b.totalPrice === 0 ? 'FREE' : `$${b.totalPrice}`}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
