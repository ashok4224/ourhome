/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Property } from '../types';
import { 
  Search, Eye, Sparkles, Building, Key, Handshake, ShieldCheck, Heart, ArrowRight,
  Smile, Coffee, Compass, HeartHandshake, CheckCircle2, Zap, Check, HelpCircle
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState<'Any' | 'Buy' | 'Rent'>('Any');
  const [subLocality, setSubLocality] = useState('');

  // Emotional Sanctuary Vibe Quiz state
  const [quizStep, setQuizStep] = useState<number>(0);
  const [vibeMood, setVibeMood] = useState<string>('');
  const [vibeFocus, setVibeFocus] = useState<string>('');
  const [vibeTrust, setVibeTrust] = useState<string>('');
  const [quizMatchedProperty, setQuizMatchedProperty] = useState<Property | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  // OurHome Trust Hub Interactive Active Tab
  const [activeTrustPillar, setActiveTrustPillar] = useState<'nonagent' | 'title' | 'rera'>('nonagent');

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

  const handleVibeSelection = (step: number, answer: string) => {
    if (step === 1) {
      setVibeMood(answer);
      setQuizStep(2);
    } else if (step === 2) {
      setVibeFocus(answer);
      setQuizStep(3);
    } else if (step === 3) {
      setVibeTrust(answer);
      
      // Determine match from current approved listings pool
      const filtered = properties.filter((p) => p.status === 'Approved');
      let bestFit = filtered[0] || null;
      let score = 92;

      if (answer === 'trust_rera') {
        const luxuryEst = filtered.find(p => p.subLocality?.toLowerCase().includes('jubilee') || p.price > 40000000);
        if (luxuryEst) {
          bestFit = luxuryEst;
          score = 99;
        }
      } else if (vibeMood === 'morning_urban' || vibeFocus === 'focus_smart') {
        const smartCondo = filtered.find(p => p.subLocality?.toLowerCase().includes('gachibowli') || p.title.toLowerCase().includes('oasis') || p.title.toLowerCase().includes('smart'));
        if (smartCondo) {
          bestFit = smartCondo;
          score = 97;
        }
      } else {
        const popularUnit = filtered.find(p => p.featured) || filtered.find(p => p.subLocality?.toLowerCase().includes('madhapur'));
        if (popularUnit) {
          bestFit = popularUnit;
          score = 95;
        }
      }

      setQuizMatchedProperty(bestFit);
      setQuizScore(score);
      setQuizStep(4);
    }
  };

  const handleResetVibeQuiz = () => {
    setQuizStep(0);
    setVibeMood('');
    setVibeFocus('');
    setVibeTrust('');
    setQuizMatchedProperty(null);
    setQuizScore(0);
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

          {/* Premium Smart Decider Banner Tag callout */}
          <div className="mt-8 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs text-left">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-indigo-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none">
                <Sparkles className="w-2.5 h-2.5" /> Premium innovative tool
              </span>
              <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">Confused which estate is best for your family?</h4>
              <p className="text-[11px] text-slate-550 leading-normal">Calculate real monthly cash flows including Gachibowli commute time, fuel costs, interest rates, and society maintenance side-by-side.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('decider')}
              className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-705 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md hover:indigo-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              Try Decider Tool 🎯
            </button>
          </div>
        </div>
      </section>

      {/* Sanctuary Aspiration & Vibe Matcher Quiz (Bright, Energetic, Premium Redesign with Vivid Emerald Green, Sky Blue, and Bright White) */}
      <section id="sanctuary-vibe-quiz" className="bg-gradient-to-br from-[#ebfcf3] via-[#e3f4fe] to-[#f4fcf7] border border-emerald-250 rounded-3xl p-6 md:p-8 text-slate-800 relative overflow-hidden shadow-lg shadow-sky-100">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Compass className="w-64 h-64 text-emerald-600 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Aspirational copy & trust assurances */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono tracking-wider uppercase rounded-full border border-emerald-250 select-none">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Direct Choice Evaluator
            </div>
            <h2 className="font-display text-2xl md:text-3.5xl font-black tracking-tight text-slate-900 leading-tight">
              Discover Your Ideal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Sanctuary Vibe</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Finding a luxury residency represents a deep personal commitment. Skip rigid search engines. Answer 3 brief lifestyle &amp; aspiration questions to receive an instant, emotionally tailored 99% match from our verified Hyderabad collection.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">100% Broker-Free Direct Builder Contracts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Ironclad TS-RERA Registry Verification Audits</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Premium Live Video-Guidance Support</span>
              </li>
            </ul>
          </div>

          {/* Interactive Game / Matcher Box */}
          <div className="lg:col-span-7 bg-white/95 border border-slate-200 rounded-2xl p-6 relative shadow-md min-h-[345px] flex flex-col justify-between">
            {/* Step indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {quizStep === 0 ? 'READY TO START' : quizStep < 4 ? `Aspiration Step ${quizStep} of 3` : 'MATCH RESULTS FOUND'}
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1.5 rounded-full transition-all duration-350 ${
                      quizStep >= step ? (quizStep === 4 ? 'w-4 bg-emerald-600' : 'w-4 bg-sky-500') : 'w-1.5 bg-slate-200'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* QUIZ STEP 0: Splash */}
            {quizStep === 0 && (
              <div className="space-y-6 my-auto text-center py-4 animate-fade-in">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600 shadow-xs shadow-emerald-50/50">
                  <Smile className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-slate-900">How does your family want to experience Hyderabad?</h3>
                  <p className="text-xs text-slate-605 max-w-sm mx-auto">
                    Let's match your heart with the right community footprint — whether a majestic botanical penthouse in Gachibowli or a leafy estate in Jubilee Hills.
                  </p>
                </div>
                <button
                  id="btn-start-vibe-quiz"
                  type="button"
                  onClick={() => setQuizStep(1)}
                  className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs font-sans tracking-wide shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Find My Sanctuary Vibe <Compass className="w-4 h-4 animate-spin-slow" />
                </button>
              </div>
            )}

            {/* QUIZ STEP 1: Morning Vibe */}
            {quizStep === 1 && (
              <div className="space-y-4 animate-fade-in my-auto py-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 rounded-lg text-sky-600 border border-sky-100/80">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-850">1. What is your family's ideal weekend morning mood?</h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(1, 'morning_serene')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-305 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Cozy quiet sunrise over a leafy garden veranda (Jubilee Hills Estates Vibe)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-600 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(1, 'morning_urban')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-305 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Dynamic sunrays bouncing off gorgeous panoramic smart skyscrapers (IT High-rise Vibe)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-605 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(1, 'morning_vibrant')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-305 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Convenient fast-access to tech campuses, boutique health clubs &amp; retail complexes</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-605 transition-all shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ STEP 2: Lifestyle Comfort attribute */}
            {quizStep === 2 && (
              <div className="space-y-4 animate-fade-in my-auto py-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-850">2. Which layout parameter nurtures your private lifestyle best?</h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(2, 'focus_office')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-indigo-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>A dedicated, soundproof executive work study with gigabit ethernet conduits</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-605 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(2, 'focus_backyard')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-indigo-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Vast double-height living salons, solid wood floors, &amp; rooftop sky decks</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-605 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(2, 'focus_smart')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-indigo-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>State-of-the-art smart home integration panels, solar micro-grids, &amp; EV charges</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-605 transition-all shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ STEP 3: Trust Parameter selection */}
            {quizStep === 3 && (
              <div className="space-y-4 animate-fade-in my-auto py-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-650 border border-emerald-100">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-850">3. What represents absolute transactional security for you?</h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(3, 'trust_direct')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>100% direct-deal zero brokerage model to save huge agency markups</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(3, 'trust_rera')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Rigorous TS-RERA legal compliance audits and clear land title deed clearances</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVibeSelection(3, 'trust_live')}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-205/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>Warm, attentive real-time chat consultation mapping out instant offline tours</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ STEP 4: Success MATCH Recommended layout */}
            {quizStep === 4 && (
              <div className="space-y-4 animate-fade-in my-auto py-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900">Recommended Sanctuary Fitted!</h4>
                      <p className="text-[10px] text-slate-500">Calculated based on your specific lifestyle selections</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto select-none">
                    {quizScore}% Match Rating
                  </span>
                </div>

                {quizMatchedProperty ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 flex flex-col sm:flex-row gap-4 items-stretch shadow-xs">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative">
                      <img 
                        src={quizMatchedProperty.images[0]} 
                        alt={quizMatchedProperty.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Details content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-display font-bold text-slate-900 text-xs line-clamp-1">{quizMatchedProperty.title}</h5>
                          <span className="font-display text-emerald-700 font-extrabold text-xs shrink-0">{getPriceLabel(quizMatchedProperty)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{quizMatchedProperty.location}</p>
                      </div>
                      
                      {/* Vibe description feedback block */}
                      <p className="text-[10px] italic text-slate-700 leading-normal bg-white p-2.5 rounded-lg border border-slate-200">
                        "Matches your heart's desire with beautiful {quizMatchedProperty.subLocality} parameters, secured by our verified direct platform architecture."
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleResetVibeQuiz()}
                          className="text-[10px] hover:underline text-slate-500 font-mono"
                        >
                          &larr; Start Over
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectProperty(quizMatchedProperty)}
                          className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          Inspect Match <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                    <p>No listings matched your criteria perfectly in current pool.</p>
                    <button
                      type="button"
                      onClick={() => handleResetVibeQuiz()}
                      className="text-emerald-600 hover:underline"
                    >
                      Reset and try different lifestyles
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Micro assurance disclaimer footer */}
            <div className="mt-3 text-[9px] text-slate-400 text-center border-t border-slate-100 pt-2 select-none">
              All recommended sanctuaries adhere to 100% direct broker-free regulatory protocols.
            </div>
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
          <div 
            id="cat-buy"
            onClick={() => onNavigateToListings({ type: 'Buy' })}
            className="group cursor-pointer bg-white border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1"
          >
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Buy Property</h3>
              <p className="text-xs text-neutral-500 mt-1">Acquire premier, vetted premium residential estates.</p>
            </div>
          </div>

          {/* RENT CARD */}
          <div 
            id="cat-rent"
            onClick={() => onNavigateToListings({ type: 'Rent' })}
            className="group cursor-pointer bg-white border border-neutral-100 hover:border-emerald-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1"
          >
            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-emerald-600 transition-colors">Rent Luxury</h3>
              <p className="text-xs text-neutral-500 mt-1">Lease exclusive smart urban flats and duplex suites.</p>
            </div>
          </div>

          {/* SELL CARD (Directs to Builder/Owner Tab) */}
          <div 
            id="cat-sell"
            onClick={() => onNavigateToTab('dashboard')}
            className="group cursor-pointer bg-white border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1"
          >
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Sell &amp; List</h3>
              <p className="text-xs text-neutral-500 mt-1">Market your property. Access builder listing tools.</p>
            </div>
          </div>

          {/* SERVICES CARD */}
          <div 
            id="cat-services"
            onClick={() => onNavigateToTab('services')}
            className="group cursor-pointer bg-white border border-neutral-100 hover:border-emerald-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-emerald-600 transition-colors">Home Services</h3>
              <p className="text-xs text-neutral-500 mt-1">Premium moving, maintenance, and automation consulting.</p>
            </div>
          </div>

          {/* SOCIETY HUB CARD */}
          <div 
            id="cat-maintenance"
            onClick={() => onNavigateToTab('maintenance')}
            className="group cursor-pointer bg-white border border-neutral-100 hover:border-sky-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1 col-span-2 lg:col-span-1"
          >
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-11 h-11 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-neutral-900 text-base group-hover:text-sky-600 transition-colors">Society Hub</h3>
              <p className="text-xs text-neutral-500 mt-1">Submit maintenance tickets, book premium facilities, and track notices.</p>
            </div>
          </div>
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
          {featuredProperties.map((p) => {
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

      {/* Interactive trust Assurance Hub (Emotional & Client-focused UX) */}
      <section id="trust-assurance-hub" className="bg-slate-50 border border-slate-200/70 p-6 md:p-8 rounded-3xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5 pb-2">
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Ironclad Security Guarantee
          </span>
          <h3 className="font-display text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Our Zero-Risk Transaction Standards</h3>
          <p className="text-xs text-slate-500">Click each pillar to inspect our digital verification seals, certificates, &amp; escrow protocols.</p>
        </div>

        {/* Dynamic Column Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTrustPillar('nonagent')}
            className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTrustPillar === 'nonagent'
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-2xl md:text-3.5xl font-display font-black text-slate-900">0%</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                Active
              </span>
            </div>
            <h4 className="font-display font-bold text-slate-800 text-xs md:text-sm mt-3">Direct Builder Trade (No Brokerage)</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">Bypass local real estate agent commissions to save an average of ₹4.8 Lakhs per purchase.</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrustPillar('title')}
            className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTrustPillar === 'title'
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-2xl md:text-3.5xl font-display font-black text-slate-900">99.7%</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                Audited
              </span>
            </div>
            <h4 className="font-display font-bold text-slate-800 text-xs md:text-sm mt-3">Verified Land Title Deeds</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">Every listing is cross-referenced with government registries prior to publication.</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrustPillar('rera')}
            className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTrustPillar === 'rera'
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-2xl md:text-3.5xl font-display font-black text-slate-900">TS-RERA</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                Compliant
              </span>
            </div>
            <h4 className="font-display font-bold text-slate-800 text-xs md:text-sm mt-3">Housing Authority Certified</h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 text-left">Strict alignment with housing development codes ensuring guaranteed floor possession dates.</p>
          </button>
        </div>

        {/* Active Pillar detail card */}
        <div id="trust-active-info-panel" className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 animate-fade-in shadow-xs text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-widest font-mono">
                {activeTrustPillar === 'nonagent' && 'Exclusive Zero Broker Fee Guarantee Certificate'}
                {activeTrustPillar === 'title' && 'Government Land Registry Audit Signature'}
                {activeTrustPillar === 'rera' && 'TS-RERA Legal Vetting Approval Status'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-normal max-w-2xl">
              {activeTrustPillar === 'nonagent' && 'OurHome contracts connect buyers directly to builders and approved first-degree owners. No middlemen, no hidden handling charges, and absolute price transparency. Our system signs smart, binding letters of intent directly.'}
              {activeTrustPillar === 'title' && 'Each property profile undergoes rigorous physical & digital screening by legal title examiners, matching government sub-registrar archives. Our platform protects your capital down payments with comprehensive deed assurance.'}
              {activeTrustPillar === 'rera' && ' Telangana Housing Regulatory Authority rules require extensive disclosures about common areas, construction materials, and timeline milestones. We actively trace builder RERA registration certificates to guarantee complete legal security.'}
            </p>
          </div>

          {/* Emotional Visual Badge Stamp */}
          <div className="bg-emerald-50 text-emerald-800 border-2 border-dashed border-emerald-300 rounded-xl p-4 flex flex-col items-center justify-center text-center shrink-0 w-full md:w-44 select-none">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1 animate-pulse" />
            <span className="font-mono text-[9px] font-bold text-emerald-700 tracking-wider">PLATFORM SEAL</span>
            <span className="font-display font-black text-xs text-emerald-900 tracking-tight uppercase">
              {activeTrustPillar === 'nonagent' && '100% DIRECT DEAL'}
              {activeTrustPillar === 'title' && 'DEED VERIFIED'}
              {activeTrustPillar === 'rera' && 'RERA REGISTERED'}
            </span>
          </div>
        </div>
      </section>

      {/* Premium Direct Posting Banner for Owners & Builders */}
      <section id="direct-post-banner" className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
        <div className="space-y-3 max-w-xl text-left">
          <span className="text-[10px] bg-sky-50 border border-sky-100 text-sky-700 font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Owner &amp; Builder Console
          </span>
          <h3 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Are you looking to Rent or Sell your house in Hyderabad?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            OurHome offers <span className="text-emerald-600 font-semibold">100% free direct-to-customer</span> listings. 
            No broker harassment. Post your property in under 2 minutes, configure smart e-stamped digital rental agreements, and schedule audited site visits with direct state RERA ledger synchronization.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-bold"><Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> 2-Min Fast Listing</span>
            <span className="flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Rent &amp; Sell Support</span>
            <span className="flex items-center gap-1.5 font-bold"><Handshake className="w-3.5 h-3.5 text-indigo-500" /> Direct Stamp Agreements</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('builder')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans"
          >
            <span>Post Premium Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
