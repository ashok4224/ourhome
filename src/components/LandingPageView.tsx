/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState } from 'react';
import { Property } from '../types';
import { Search, Eye, Sparkles, Building, Key, Handshake, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { FilterDrawer } from '../components/FilterDrawer';

interface LandingPageViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onNavigateToListings: (initialFilters?: { type?: 'Rent' | 'Buy'; search?: string; subLocality?: string }) => void;
  onNavigateToTab: (tab: string) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  properties,
  onSelectProperty,
  onNavigateToListings,
  onNavigateToTab,
  savedIds,
  onToggleSave,
}) => {
  const [filteredProperties, setFilteredProperties] = React.useState<Property[]>(properties);
  const [filterOpen, setFilterOpen] = React.useState<boolean>(false);

  // Sync filtered list when original properties change
  React.useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState<'Any' | 'Buy' | 'Rent'>('Any');
  const [subLocality, setSubLocality] = useState('');

  const featuredProperties = properties.filter((p) => p.featured && p.status === 'Approved');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToListings({
      type: propertyType === 'Any' ? undefined : propertyType,
      search: searchQuery,
      subLocality: subLocality === '' ? undefined : subLocality,
    });
  };

  const getPriceLabel = (p: Property) => {
    if (p.rentOrBuy === 'Rent') {
      return `₹${p.price.toLocaleString('en-IN')} / mo`;
    } else {
      const crVal = p.price / 10000000;
      return `₹${crVal.toFixed(2)} Cr`;
    }
  };

  return (
    <div id="landing-container" className="space-y-16 pb-16 animate-fade-in">
      {/* Premium Hero Banner Section */}
      <section 
        id="hero-section"
        className="relative bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100/50 border border-emerald-100 rounded-3xl overflow-hidden py-24 px-6 md:px-12 text-center text-slate-800"
        style={{
          backgroundImage: `linear-gradient(rgba(240, 253, 250, 0.8), rgba(240, 249, 255, 0.95)), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 backdrop-blur-md rounded-full border border-emerald-200 text-xs font-mono tracking-wider uppercase text-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Defining Premium Living in Hyderabad
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight text-slate-900">
            Discover Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-650 via-teal-600 to-sky-600">Sanctuary</span>
          </h1>
          
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Beautifully curated high-end residential estates, smart flats, and luxury penthouses across Gachibowli, Madhapur, & Jubilee Hills.
          </p>

          {/* Integrated Dynamic Search Console */}
          <form 
            onSubmit={handleSearch}
            className="mt-10 bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-2xl max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-2 text-slate-800 shadow-xl shadow-slate-200/50"
          >
            {/* Rent/Buy segmented control */}
            <div className="bg-emerald-50/50 p-1 rounded-xl flex items-center md:col-span-1 border border-emerald-100">
              {(['Any', 'Buy', 'Rent'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(type)}
                  className={`flex-1 py-1 px-2 text-xs font-medium rounded-lg transition-all ${
                    propertyType === type
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Keyword Input */}
            <div className="relative md:col-span-2 flex items-center bg-white/95 rounded-xl border border-slate-200 px-3 py-1.5 shadow-inner">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search penthouses, estates, pool..."
                className="w-full text-sm ml-2 bg-transparent border-none outline-none focus:ring-0 text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              Search
            </button>
            {/* Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm py-2 px-4 rounded-xl shadow"
            >
              Filters
            </button>
          </form>

          {/* Quick Sublocalities Tag Links */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-xs font-mono text-slate-600">
            <span>Popular:</span>
            {['Gachibowli', 'Madhapur', 'Jubilee Hills', 'Financial District'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onNavigateToListings({ subLocality: loc })}
                className="px-2.5 py-1 rounded-full border border-slate-200 bg-white/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors text-slate-700"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Category Navigation Section */}
      <section id="category-section" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Our Core Offerings</h2>
          <p className="text-xs md:text-sm text-neutral-500">Access exclusive home listings, services, and advanced monitoring panels in one click.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* BUY CARD */}
          <GlassCard id="cat-buy" onClick={() => onNavigateToListings({ type: 'Buy' })} className="group cursor-pointer bg-white/30 border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 glass-card">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Buy Property</h3>
              <p className="text-xs text-neutral-500 mt-1">Acquire premier, vetted premium residential estates.</p>
            </div>
          </GlassCard>

          {/* RENT CARD */}
          <GlassCard id="cat-rent" onClick={() => onNavigateToListings({ type: 'Rent' })} className="group cursor-pointer bg-white/30 border border-neutral-100 hover:border-emerald-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 glass-card">
            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-emerald-600 transition-colors">Rent Luxury</h3>
              <p className="text-xs text-neutral-500 mt-1">Lease exclusive smart urban flats and duplex suites.</p>
            </div>
          </GlassCard>

          {/* SELL CARD (Directs to Builder/Owner Tab) */}
          <GlassCard id="cat-sell" onClick={() => onNavigateToTab('dashboard')} className="group cursor-pointer bg-white/30 border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 glass-card">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Sell &amp; List</h3>
              <p className="text-xs text-neutral-500 mt-1">Market your property. Access builder listing tools.</p>
            </div>
          </GlassCard>

          {/* SERVICES CARD */}
          <GlassCard id="cat-services" onClick={() => { alert("OurHome Elite Services: Dynamic Interior Decorating, Handpicked Movers, Facility Auditing, and Smart Automation setups are currently available for pre-booking inside active property chats!"); }} className="group cursor-pointer bg-white/30 border border-neutral-100 hover:border-emerald-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 glass-card">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-emerald-600 transition-colors">Home Services</h3>
              <p className="text-xs text-neutral-500 mt-1">Premium moving, maintenance, and automation consulting.</p>
            </div>
          </GlassCard>

          {/* CONTROL CENTER CARD */}
          <GlassCard id="cat-admin" onClick={() => onNavigateToTab('admin')} className="group cursor-pointer bg-white/30 border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 col-span-2 lg:col-span-1 glass-card">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Admin Panel</h3>
              <p className="text-xs text-neutral-500 mt-1">Audit verification requests &amp; supervise platform health.</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Featured Properties Section (Visual rhythm, elegant micro-animations) */}
      <section id="featured-section" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Featured Collections</h2>
            <p className="text-xs md:text-sm text-neutral-500">Meticulously inspected premium listings with guaranteed title deeds.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToListings()}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group py-1"
          >
            View All Properties <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProperties.map((p) => {
            const isSaved = savedIds.includes(p.id);
            return (
              <div 
                id={`featured-card-${p.id}`}
                key={p.id}
                className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Photo Header */}
                <div className="relative h-56 overflow-hidden bg-neutral-100">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating badging */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase py-0.5 px-2 rounded-md shadow-xs">
                      {p.rentOrBuy === 'Buy' ? 'For Sale' : 'To Rent'}
                    </span>
                    {p.sizeSqFt > 3000 && (
                      <span className="bg-slate-700/80 backdrop-blur-xs text-white font-mono text-[10px] py-0.5 px-1.5 rounded-md">
                        Elite Series
                      </span>
                    )}
                  </div>

                  <button
                    id={`fav-btn-${p.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(p.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow-xs transition-colors ${
                      isSaved 
                        ? 'bg-rose-50 border-rose-100 text-rose-500' 
                        : 'bg-white/70 border-white/20 text-neutral-700 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-neutral-950/70 backdrop-blur-xs text-white font-mono text-xs py-1 px-2 rounded-lg border border-white/10">
                    {p.subLocality}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-display font-medium text-neutral-950 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {p.title}
                      </h3>
                      <span className="font-display font-bold text-neutral-900 text-[15px] shrink-0">
                        {getPriceLabel(p)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2">
                      {p.location}
                    </p>

                    {/* Meta stats bar */}
                    <div className="flex items-center gap-3 py-2 text-[11px] font-mono text-neutral-500 border-t border-b border-neutral-50/70">
                      <span>{p.bedrooms} BHK</span>
                      <span className="text-neutral-300">|</span>
                      <span>{p.bathrooms} Bath</span>
                      <span className="text-neutral-300">|</span>
                      <span>{p.sizeSqFt.toLocaleString('en-IN')} sqft</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectProperty(p)}
                      className="text-xs font-semibold text-neutral-900 group-hover:text-emerald-600 hover:underline inline-flex items-center gap-1"
                    >
                      Inspect Details <Eye className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Views: {p.views}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Luxury Brand Trust Stats Info Card */}
      <section id="trust-banner" className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-neutral-50 border border-neutral-200/60 p-8 rounded-3xl">
        <div className="space-y-1">
          <p className="text-3xl font-display font-bold text-neutral-950">99.7%</p>
          <h4 className="font-display font-medium text-sm text-neutral-800">Verified Deeds</h4>
          <p className="text-xs text-neutral-500">Every single listing is audited by our rigorous title verification committee.</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-display font-bold text-neutral-950">₹3,400 Cr+</p>
          <h4 className="font-display font-medium text-sm text-neutral-800">Transacted Assets</h4>
          <p className="text-xs text-neutral-500">Supervising secure transactions with elite trust escrow systems.</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-display font-bold text-neutral-950">24 mins</p>
          <h4 className="font-display font-medium text-sm text-neutral-800">Avg. Response</h4>
          <p className="text-xs text-neutral-500">Unmatched agent SLA ensuring active real-time call handling.</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-display font-bold text-neutral-950">RERA</p>
          <h4 className="font-display font-medium text-sm text-neutral-800">100% Compliant</h4>
          <p className="text-xs text-neutral-500">Complete compliance with housing development regulatory authorities.</p>
        </div>
      </section>

      {/* Elegant Elite Customer Review Block */}
      <section id="testimonial-section" className="relative p-12 bg-gradient-to-br from-emerald-600 to-sky-700 rounded-3xl overflow-hidden text-white/95">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <Building className="w-96 h-96" />
        </div>
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex py-1 px-2 rounded-lg bg-white/20 text-xs font-mono text-emerald-100 border border-white/25 uppercase tracking-wider">
            Premium Experience
          </div>
          <p className="font-display text-xl md:text-2xl font-light italic leading-relaxed text-emerald-50">
            "We wanted more than just an apartment; we searched for a penthouse that redefined luxury, perched right above our workplace in Gachibowli. OurHome made discovering and scheduling the site visit to Skyline Oasis a absolute fluid dream. The EMI interactive simulator gave us instant pricing courage."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-400 overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Client"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-display font-medium text-white text-sm">Meera &amp; Rohan Hegde</p>
              <p className="text-xs font-mono text-emerald-200">Founders, MindArc Labs / Skyline Oasis Residents</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
