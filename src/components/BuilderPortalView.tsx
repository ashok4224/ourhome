/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Property, Appointment, Inquiry, ChatMessage, ChatInvitation, TypingState } from '../types';
import { 
  Plus, Trash2, Eye, MessageCircle, Sliders, CheckCircle, 
  MapPin, Home, Key, ClipboardList, Sparkles, AlertCircle, TrendingUp,
  MessageSquare, FileText
} from 'lucide-react';

interface BuilderPortalViewProps {
  properties: Property[];
  appointments: Appointment[];
  inquiries: Inquiry[];
  onAddProperty: (newProp: Omit<Property, 'id' | 'views' | 'inquiries' | 'status'>) => void;
  onRemoveProperty: (id: string) => void;
  chatInvitations: ChatInvitation[];
  chatMessages: ChatMessage[];
  chatTypingStates: TypingState[];
  onOpenChat: (propertyId: string, propertyTitle: string) => void;
  onSwitchToClientWithFilter?: (title: string) => void;
}

export const BuilderPortalView: React.FC<BuilderPortalViewProps> = ({
  properties,
  appointments,
  inquiries,
  onAddProperty,
  onRemoveProperty,
  chatInvitations,
  chatMessages,
  chatTypingStates,
  onOpenChat,
  onSwitchToClientWithFilter,
}) => {
  // Arjun's portfolio filter. Arjun owns 'prop-1' and 'prop-4' in the default list
  const arjunsProperties = useMemo(() => {
    return properties.filter((p) => p.agent.name === 'Arjun Nandan');
  }, [properties]);

  // Calculations for stats card
  const totalViews = useMemo(() => {
    return arjunsProperties.reduce((sum, p) => sum + p.views, 0);
  }, [arjunsProperties]);

  const activeInquiriesCount = useMemo(() => {
    return arjunsProperties.reduce((sum, p) => sum + p.inquiries, 0);
  }, [arjunsProperties]);

  const portfolioValuation = useMemo(() => {
    // Only buy properties count toward direct valuation, let's represent in Crores
    const buyVal = arjunsProperties
      .filter((p) => p.rentOrBuy === 'Buy')
      .reduce((sum, p) => sum + p.price, 0);
    return buyVal / 10000000; // in Cr
  }, [arjunsProperties]);

  // Form State for Quick Add Property
  const [title, setTitle] = useState('');
  const [subLocality, setSubLocality] = useState('Gachibowli');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number>(15000000); // 1.5 Cr default
  const [rentOrBuy, setRentOrBuy] = useState<'Buy' | 'Rent'>('Buy');
  const [sizeSqFt, setSizeSqFt] = useState<number>(2000);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [facing, setFacing] = useState('East');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Smart Home Automation', '24/7 Security']);
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [lastCreatedTitle, setLastCreatedTitle] = useState('');

  // Available amenities matching master setup
  const ALL_AMENITIES = [
    'Swimming Pool', 'Private Gym', 'Clubhouse2', 'Rooftop Deck', '24/7 Security', 
    'Smart Home Automation', 'Private Elevator', 'Private Lawn', 'Home Theatre'
  ];

  const handleAmenityCheck = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      alert('Please fill out all core fields.');
      return;
    }

    // Default premium image matching the layout
    const houseImages = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ];

    onAddProperty({
      title,
      location,
      subLocality,
      price,
      rentOrBuy,
      sizeSqFt,
      bedrooms,
      bathrooms,
      facing,
      description,
      amenities: selectedAmenities,
      images: houseImages,
      agent: {
        name: 'Arjun Nandan',
        phone: '+91 98765 43210',
        email: 'arjun@ourhome.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
      }
    });

    setLastCreatedTitle(title);
    setFormSuccess(true);
    // Reset Form
    setTitle('');
    setLocation('');
    setDescription('');
    setTimeout(() => {
      setFormSuccess(false);
    }, 8500); // Keep it visible longer so they have time to click the preview option
  };

  const getPriceLabel = (p: Property) => {
    if (p.rentOrBuy === 'Rent') {
      return `₹${p.price.toLocaleString('en-IN')}/mo`;
    } else {
      const crVal = p.price / 10000000;
      return `₹${crVal.toFixed(2)} Cr`;
    }
  };

  return (
    <div id="builder-portal" className="space-y-8 animate-fade-in text-neutral-850">
      {/* Upper greetings banner */}
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-15 translate-x-1/4 -translate-y-12 select-none pointer-events-none">
          <TrendingUp className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px] font-mono border border-indigo-400/10 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Builder Dashboard
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-teal-200 to-indigo-100">Arjun</span>!
          </h1>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Supervise leads, inspect metrics, and quickly list newly acquired high-end residential estates in the active Hyderabad portal.
          </p>
        </div>
      </div>

      {/* Live Chat Rooms sync status notification alert banner */}
      {chatInvitations.some(inv => inv.active) && (
        <div className="bg-gradient-to-r from-teal-600 via-indigo-600 to-emerald-600 p-5 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-400/20 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[10px] font-mono tracking-widest text-emerald-200 uppercase font-black">
                  [LIVE CONNECTION INCOMING] Direct Client Inquiry
                </p>
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono text-white font-bold h-fit min-h-0 uppercase leading-none">
                  ONLINE NOW
                </span>
              </div>
              <h4 className="font-display font-bold text-sm">
                "{chatInvitations.filter(i => i.active)[0].customerName}" is waiting in live consultation for "{chatInvitations.filter(i => i.active)[0].propertyTitle}"
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const activeInv = chatInvitations.find(i => i.active);
              if (activeInv) {
                onOpenChat(activeInv.propertyId, activeInv.propertyTitle);
              }
            }}
            className="bg-white text-indigo-900 hover:bg-slate-50 font-bold font-mono text-[10px] uppercase py-2 px-4 rounded-xl cursor-pointer shadow-md transition-all shrink-0 hover:scale-[1.03]"
          >
            Join Live consultation &rarr;
          </button>
        </div>
      )}

      {/* Direct Portfolio Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT 1: Active Listings */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Active Listings</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-950">
              {arjunsProperties.length}
            </p>
            <span className="text-xs font-semibold text-emerald-600">On Air</span>
          </div>
          <p className="text-[10px] text-neutral-400">Listed under Arjun Nandan</p>
        </div>

        {/* STAT 2: Views counts */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Views</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-950">
              {totalViews.toLocaleString()}
            </p>
            <span className="text-xs font-semibold text-indigo-600">↑ 12%</span>
          </div>
          <p className="text-[10px] text-neutral-400">Total impressions from unique browsers</p>
        </div>

        {/* STAT 3: Leads */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Leads &amp; Inquiries</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-950">
              {activeInquiriesCount}
            </p>
            <span className="text-xs font-semibold text-teal-600">Active</span>
          </div>
          <p className="text-[10px] text-neutral-400">Inbound inquiries across portfolios</p>
        </div>

        {/* STAT 4: Valuation */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs font-mono">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Estimated Portfolio</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-950">
              ₹{portfolioValuation.toFixed(2)} Cr
            </p>
          </div>
          <p className="text-[10px] text-neutral-400">Based on sale-type valuation only</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Column 1: Listing portfolio manager */}
        <div className="lg:col-span-3 space-y-6">

          {/* Live Client Chat Rooms Hub */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight">Active Client Live Rooms</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Instant socket-like SSE channels</p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-indigo-300 font-bold whitespace-nowrap animate-pulse">
                {chatInvitations.length} Active Consultations
              </span>
            </div>

            {chatInvitations.length === 0 ? (
              <div className="bg-slate-950/40 p-6 text-center rounded-2xl border border-slate-800 text-slate-500 text-xs font-mono">
                No active live client rooms currently online. Visitors can trigger Live Rooms via the main Estate Details viewer.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {chatInvitations.map((inv) => {
                  const typingState = chatTypingStates.find(t => t.propertyId === inv.propertyId && t.role === 'customer');
                  const messageCount = chatMessages.filter(m => m.propertyId === inv.propertyId).length;
                  const lastMessage = chatMessages.filter(m => m.propertyId === inv.propertyId).pop();
                  return (
                    <div 
                      key={inv.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-750 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm animate-scale-in"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-xs text-white">{inv.customerName}</p>
                          <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/20 rounded uppercase font-bold">
                            ONLINE
                          </span>
                          {typingState?.isTyping && (
                            <span className="text-[8px] font-mono text-indigo-400 animate-pulse font-bold">
                              typing...
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                          Property: <strong className="text-slate-305">{inv.propertyTitle}</strong>
                        </p>
                        {lastMessage && (
                          <p className="text-[9px] text-teal-300 italic font-mono truncate max-w-[240px] leading-tight">
                            Last Msg: "{lastMessage.text}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <span className="text-[9px] font-mono bg-slate-800 text-indigo-300 border border-slate-700 px-1.5 py-0.5 rounded-lg whitespace-nowrap">
                          {messageCount} msgs
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenChat(inv.propertyId, inv.propertyTitle)}
                          className="bg-indigo-600 hover:bg-indigo-500 font-bold font-mono text-[9px] text-white py-1.5 px-3 rounded-lg flex items-center gap-0.5 whitespace-nowrap cursor-pointer hover:scale-103 transition-all"
                        >
                          Join Chat &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-neutral-950 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-neutral-400" /> Portfolio Listings
            </h3>

            {arjunsProperties.length === 0 ? (
              <div className="bg-neutral-50 p-8 text-center rounded-2xl border text-neutral-400 text-xs">
                No active properties listed under your account. Register below!
              </div>
            ) : (
              <div className="space-y-4">
                {arjunsProperties.map((p) => (
                  <div
                    id={`arj-portfolio-card-${p.id}`}
                    key={p.id}
                    className="p-4 bg-white border border-neutral-100 rounded-2xl hover:border-neutral-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 shrink-0 border">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-display font-semibold text-sm text-neutral-900 truncate">
                            {p.title}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                            p.status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" /> {p.subLocality}
                        </p>
                        {/* Impressions HUD */}
                        <div className="flex gap-3 text-[10px] font-mono text-zinc-400 mt-1">
                          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {p.views} views</span>
                          <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {p.inquiries} inquiries</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-neutral-100">
                      <span className="font-display font-semibold text-sm text-neutral-900 mr-2">
                        {getPriceLabel(p)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveProperty(p.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Site appointments summary ledger */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-neutral-950 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-neutral-400" /> Site-Visit Appointments Ledgers
            </h3>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">CUSTOMER REFERENCE SCHEDULERS</span>
                <span className="font-mono text-neutral-400">{appointments.length} Scheduled</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-4 flex flex-col md:flex-row justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900 text-sm">{appt.customerName}</p>
                      <p className="text-neutral-500 text-[11px] font-mono">
                        {appt.customerEmail} • {appt.customerPhone}
                      </p>
                      <p className="text-zinc-400 text-[10px] truncate max-w-[280px]">
                        Property: <span className="font-semibold text-neutral-700">{appt.propertyTitle}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] font-bold">
                        {appt.timeSlot.split(' - ')[0]}
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono">Date: {appt.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Quick-Add listing form (Enforces complete working workflow) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 p-6 rounded-3xl space-y-5 shadow-xs sticky top-6">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-neutral-900 flex items-center gap-1">
                <Plus className="w-4 h-4 text-indigo-600" /> Quick Add Listing
              </h3>
              <p className="text-xs text-neutral-400">Fill details. Newly created elements register automatically.</p>
            </div>

            {formSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs animate-scale-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-bold">Property Successfully Created!</p>
                  <p className="text-neutral-600 leading-normal">
                    Your property <strong className="text-neutral-900 font-bold">"{lastCreatedTitle}"</strong> has been registered under your account (Arjun Nandan) and set to <span className="bg-emerald-100 font-mono text-emerald-800 px-1 py-0.5 rounded font-bold text-[10px]">Approved</span>.
                  </p>
                  {onSwitchToClientWithFilter && (
                    <button
                      type="button"
                      onClick={() => onSwitchToClientWithFilter(lastCreatedTitle)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all mt-1"
                    >
                      <span>Preview in Client/Customer View &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="p_title" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Property Title *</label>
                <input
                  id="p_title"
                  type="text"
                  required
                  placeholder="Green Meadows 3BHK Penthouse"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none text-neutral-900 focus:border-indigo-600"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label htmlFor="p_location" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Location / Full Address *</label>
                <input
                  id="p_location"
                  type="text"
                  required
                  placeholder="e.g. Tower B, Sector II, Gachibowli, Hyderabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none text-neutral-900 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Rent or Buy */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Listing Objective *</label>
                  <div className="bg-neutral-100 p-0.5 rounded-lg flex border">
                    {(['Buy', 'Rent'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setRentOrBuy(type);
                          if (type === 'Rent' && price > 200000) {
                            setPrice(75000); // Sensible Rent default
                          } else if (type === 'Buy' && price < 100000) {
                            setPrice(18000000); // Sensible Buy default
                          }
                        }}
                        className={`flex-1 text-[10px] font-mono text-center py-1.5 rounded-md transition-all cursor-pointer ${
                          rentOrBuy === type
                            ? 'bg-white text-indigo-600 font-bold shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {type === 'Buy' ? 'For Sale' : 'For Rent'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Locality */}
                <div className="space-y-1">
                  <label htmlFor="p_sublocality" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Sublocality *</label>
                  <select
                    id="p_sublocality"
                    value={subLocality}
                    onChange={(e) => setSubLocality(e.target.value)}
                    className="w-full text-xs border border-neutral-200 rounded-xl px-2 py-1.5 outline-none bg-white text-neutral-900"
                  >
                    <option value="Gachibowli">Gachibowli</option>
                    <option value="Madhapur">Madhapur</option>
                    <option value="Jubilee Hills">Jubilee Hills</option>
                    <option value="Financial District">Financial District</option>
                    <option value="Kondapur">Kondapur</option>
                    <option value="Banjara Hills">Banjara Hills</option>
                  </select>
                </div>
              </div>

              {/* Price representation */}
              <div className="space-y-1">
                <label htmlFor="p_price" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                  {rentOrBuy === 'Rent' ? 'Monthly rent (₹) *' : 'Total valuation (₹) *'}
                </label>
                <input
                  id="p_price"
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none text-neutral-900 focus:border-indigo-600"
                />
                <p className="text-[9px] font-mono text-neutral-400">
                  Valuation reference:{' '}
                  {rentOrBuy === 'Buy' 
                    ? `₹${(price / 10000000).toFixed(2)} Crores` 
                    : `₹${(price / 1000).toFixed(0)} Thousand / month`}
                </p>
              </div>

              {/* Grid: Beds, Baths, Size, Facing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="p_size" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Size (sqft) *</label>
                  <input
                    id="p_size"
                    type="number"
                    required
                    value={sizeSqFt}
                    onChange={(e) => setSizeSqFt(Number(e.target.value))}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 outline-none text-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="p_facing" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Facing (Vastu)</label>
                  <input
                    id="p_facing"
                    type="text"
                    required
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 outline-none text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="p_beds" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">BHK Bedrooms *</label>
                  <input
                    id="p_beds"
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 outline-none text-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="p_baths" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Bathrooms *</label>
                  <input
                    id="p_baths"
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 outline-none text-neutral-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="p_desc" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Description *</label>
                <textarea
                  id="p_desc"
                  rows={3}
                  required
                  placeholder="Tell buyers about double balconies, premium Italian bathrooms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 outline-none text-neutral-900 focus:border-indigo-600 resize-none"
                />
              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">In-House Amenities</label>
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto p-1 bg-neutral-50 rounded-xl border">
                  {ALL_AMENITIES.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-[10px] text-neutral-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityCheck(amenity)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-0 w-3 h-3"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors text-center cursor-pointer shadow-sm"
              >
                Register &amp; Approve Listing
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
