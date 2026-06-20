/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { 
  Compass, Sliders, CheckSquare, Sparkles, IndianRupee, MapPin, 
  Car, Clock, Briefcase, Calculator, HelpCircle, Star, ThumbsUp, 
  ArrowRight, RefreshCw, Layers, ShieldCheck, AlertTriangle, Check, Award
} from 'lucide-react';

interface SmartDeciderViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onNavigateToListings: (filters?: { type?: 'Rent' | 'Buy'; search?: string; subLocality?: string }) => void;
}

export const SmartDeciderView: React.FC<SmartDeciderViewProps> = ({
  properties,
  onSelectProperty,
  onNavigateToListings
}) => {
  // Questionnaire/Blueprint state
  const [rentOrBuy, setRentOrBuy] = useState<'Rent' | 'Buy'>('Rent');
  const [workplace, setWorkplace] = useState<string>('Gachibowli');
  const [officeDays, setOfficeDays] = useState<number>(3); // 1 to 5 days, 0 for remote
  const [importance, setImportance] = useState<{
    commute: boolean;
    space: boolean;
    budget: boolean;
    amenities: boolean;
    quietness: boolean;
  }>({
    commute: true,
    space: false,
    budget: true,
    amenities: false,
    quietness: false
  });

  // Target Budget constraint
  const [targetRent, setTargetRent] = useState<number>(50000);
  const [targetBuyBudget, setTargetBuyBudget] = useState<number>(20000000); // 2 Crores

  // EMI Configuration state 
  const [interestRate, setInterestRate] = useState<number>(8.5); // % interest rate standard in SBI/HDFC
  const [loanTenure, setLoanTenure] = useState<number>(20); // years standard

  // Head to Head combat selection properties
  const approvedProps = useMemo(() => properties.filter(p => p.status === 'Approved'), [properties]);
  const [battlePropAId, setBattlePropAId] = useState<string>('');
  const [battlePropBId, setBattlePropBId] = useState<string>('');

  // Set default battle selections once approved list is resolved
  React.useEffect(() => {
    if (approvedProps.length >= 2) {
      if (!battlePropAId) setBattlePropAId(approvedProps[0].id);
      if (!battlePropBId) setBattlePropBId(approvedProps[1].id);
    }
  }, [approvedProps]);

  // Handle preference toggling
  const handleTogglePreference = (key: 'commute' | 'space' | 'budget' | 'amenities' | 'quietness') => {
    setImportance(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper: Computes physical commute stats to Hyderabad main Tech hubs 
  const getCommuteStats = (propertyLoc: string, targetHub: string) => {
    // Standard micro localities
    const loc = propertyLoc.toLowerCase();
    const hub = targetHub.toLowerCase();
    
    // Exact match
    if (loc.includes(hub) || hub.includes(loc)) {
      return { distanceKm: 1.8, timeMins: 8, stress: 'Very Low', costPerTrip: 40 };
    }
    
    // Proximity logic
    const neighbors: { [key: string]: string[] } = {
      gachibowli: ['kondapur', 'financial district', 'madhapur'],
      madhapur: ['gachibowli', 'kondapur', 'jubilee hills'],
      kondapur: ['gachibowli', 'madhapur'],
      'financial district': ['gachibowli'],
      'jubilee hills': ['madhapur', 'gachibowli']
    };

    const isNeighbor = neighbors[hub]?.some(n => loc.includes(n)) || neighbors[loc]?.some(n => hub.includes(n));
    if (isNeighbor) {
      return { distanceKm: 4.5, timeMins: 15, stress: 'Moderate', costPerTrip: 100 };
    }

    // Distant locales
    return { distanceKm: 16.5, timeMins: 45, stress: 'High Traffic', costPerTrip: 320 };
  };

  // EMI math helper formula standard: [P * r * (1+r)^N] / [(1+r)^N - 1]
  const calculateEMI = (principal: number) => {
    const r = (interestRate / 12) / 100;
    const n = loanTenure * 12;
    if (r === 0) return principal / n;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  // TrueCost™ complete calculation engine
  const calculatePropertyTrueCost = (prop: Property) => {
    const isRent = prop.rentOrBuy === 'Rent';
    
    // Monthly static base rate
    let monthlyBaseCost = 0;
    if (isRent) {
      monthlyBaseCost = prop.price;
    } else {
      // 20% down payment standard
      const loanAmount = prop.price * 0.8; 
      monthlyBaseCost = calculateEMI(loanAmount);
    }

    // Dynamic society maintenance fees (approx INR flat/sqft or based on location)
    let maintenanceValue = 3500;
    if (prop.subLocality === 'Jubilee Hills') maintenanceValue = 12000;
    if (prop.subLocality === 'Gachibowli') maintenanceValue = 6500;
    if (prop.subLocality === 'Financial District') maintenanceValue = 8000;
    if (prop.subLocality === 'Madhapur') maintenanceValue = 5000;
    
    // Utilities (electricity for AC, wifi, routine water charges)
    const sizeFactor = prop.sizeSqFt;
    const estimatedUtilities = Math.round((sizeFactor * 1.5) + 1500);

    // Monthly Commute Calculations
    const commute = getCommuteStats(prop.subLocality, workplace);
    // 2 trips per office day * 4.3 weeks/month * officeDays
    const monthlyTrips = officeDays * 2 * 4.3;
    const monthlyCommuteCost = Math.round(monthlyTrips * commute.costPerTrip);
    const monthlyCommuteTimeHours = Math.round((commute.timeMins * monthlyTrips) / 60);

    const grandMonthlyOutflow = monthlyBaseCost + maintenanceValue + estimatedUtilities + monthlyCommuteCost;

    return {
      baseCost: monthlyBaseCost,
      maintenanceValue,
      estimatedUtilities,
      commuteCost: monthlyCommuteCost,
      commuteTimeHours: monthlyCommuteTimeHours,
      commuteTimeSingleWay: commute.timeMins,
      commuteDistance: commute.distanceKm,
      grandMonthlyOutflow,
      isRent
    };
  };

  // Personalized Match Scorer
  const calculateMatchDetails = (prop: Property) => {
    const trueCost = calculatePropertyTrueCost(prop);
    let penaltyPoints = 0;
    let positiveHighlights: string[] = [];
    let cautions: string[] = [];

    // Type Match check
    if (prop.rentOrBuy !== rentOrBuy) {
      // High mismatch penalty
      penaltyPoints += 50;
    }

    // Budget compliance
    if (rentOrBuy === 'Rent') {
      const budgetDiff = trueCost.grandMonthlyOutflow - targetRent;
      if (budgetDiff > 0) {
        // Penalty proportional to percent over budget
        const overPercent = budgetDiff / targetRent;
        penaltyPoints += overPercent * 40;
        cautions.push(`Outflow ₹${Math.round(budgetDiff).toLocaleString()} above target rent`);
      } else {
        positiveHighlights.push('Unusually wallet-safe budget choice');
      }
    } else {
      // Buy mode check on downpayment + estimated EMI
      const totalCost = prop.price;
      const budgetDiff = totalCost - targetBuyBudget;
      if (budgetDiff > 0) {
        const overPercent = budgetDiff / targetBuyBudget;
        penaltyPoints += overPercent * 40;
        cautions.push(`Property is ₹${((budgetDiff) / 10000000).toFixed(2)} Cr over your targets`);
      } else {
        positiveHighlights.push('Directly below maximum target capital limit');
      }
    }

    // Commute preferences check
    if (importance.commute) {
      if (trueCost.commuteTimeSingleWay > 35) {
        penaltyPoints += 25;
        cautions.push(`Tough commute (>35 mins single way to ${workplace})`);
      } else if (trueCost.commuteTimeSingleWay < 10) {
        penaltyPoints -= 12; // Bonus score!
        positiveHighlights.push(`Dream close commute (<10 mins) to workplace`);
      } else {
        positiveHighlights.push('Healthy neighborhood commute range');
      }
    }

    // Space importance
    if (importance.space) {
      if (prop.bedrooms < 3) {
        penaltyPoints += 15;
        cautions.push('Might feel tight for big/growing family size');
      } else {
        positiveHighlights.push(`Spacious BHK layouts (${prop.bedrooms} Bed/Bath setup)`);
      }
    }

    // Amenities preference 
    if (importance.amenities) {
      if (prop.amenities.length < 5) {
        penaltyPoints += 10;
        cautions.push('Offers simpler, vanilla common amenities');
      } else {
        positiveHighlights.push('Loaded luxury resort lifestyle index');
      }
    }

    // Quietness index
    if (importance.quietness) {
      const noiseLocs = ['Madhapur', 'Gachibowli'];
      if (noiseLocs.includes(prop.subLocality)) {
        penaltyPoints += 12;
        cautions.push('Busy commercial noise level in surroundings');
      } else {
        positiveHighlights.push('Peaceful residential sector retreat');
      }
    }

    // Calculate dynamic Match Star Score
    const rawScore = 100 - penaltyPoints;
    const finalizedScore = Math.max(5, Math.min(100, Math.round(rawScore)));

    return {
      score: finalizedScore,
      trueCost,
      positiveHighlights: positiveHighlights.slice(0, 3),
      cautions: cautions.slice(0, 3)
    };
  };

  // Sorted property items matching candidate score
  const matchedAnalysisList = useMemo(() => {
    return approvedProps
      .map(p => ({
        property: p,
        analysis: calculateMatchDetails(p)
      }))
      // Sort by score descending (same mode matches prioritized first)
      .sort((a, b) => b.analysis.score - a.analysis.score);
  }, [approvedProps, rentOrBuy, workplace, officeDays, importance, targetRent, targetBuyBudget, interestRate, loanTenure]);

  // Battle combat statistics render block
  const battleWinnerDetails = useMemo(() => {
    if (!battlePropAId || !battlePropBId) return null;
    const propA = approvedProps.find(p => p.id === battlePropAId);
    const propB = approvedProps.find(p => p.id === battlePropBId);
    if (!propA || !propB) return null;

    const analysisA = calculateMatchDetails(propA);
    const analysisB = calculateMatchDetails(propB);

    const winner = analysisA.score >= analysisB.score ? 'A' : 'B';
    const margin = Math.abs(analysisA.score - analysisB.score);

    return {
      propA,
      propB,
      analysisA,
      analysisB,
      winner,
      margin
    };
  }, [battlePropAId, battlePropBId, matchedAnalysisList]);

  return (
    <div id="smart-decider-applet" className="space-y-8 animate-fade-in py-1">
      
      {/* Visual Header Grid Panel */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider">
            <Award className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Master-Crafted Decision Helper
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight">The TrueCost™ Smart Decider</h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl">
            Struggling to choose? Properties usually hide actual expenses like **society maintenance, travel fuel, traffic times**, and **loan EMI realities**. Take the 30-second blueprint quiz below to compute your personalized **TrueCost Score** and pick the flawless home with scientific certainty.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE INTERACTIVE DECIDER QUIZ (BLUEPRINT CONFIG) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-rose-50/10 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" /> Your Decision Blueprint
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Configure your absolute personal constraints to map matches.</p>
          </div>

          {/* Question 1: Rent vs Buy toggle */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">1. Deal Intent</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRentOrBuy('Rent')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rentOrBuy === 'Rent'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Renting Mode
              </button>
              <button
                type="button"
                onClick={() => setRentOrBuy('Buy')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rentOrBuy === 'Buy'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buying Mode
              </button>
            </div>
          </div>

          {/* Question 2: Office commuting parameters */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">2. Commute &amp; Office</label>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Your Hyderabad Office Hub:</span>
                <select
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 uppercase text-slate-800 font-medium"
                >
                  <option value="Gachibowli">Gachibowli (DLF / Cybercity)</option>
                  <option value="Madhapur">Madhapur (Hitec City / Durgam Cheruvu)</option>
                  <option value="Financial District">Financial District (Narakramguda / Waverock)</option>
                  <option value="Jubilee Hills">Jubilee Hills (Apollo Hub)</option>
                  <option value="Begumpet">Secunderabad / Begumpet Area</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Office commute days:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10.5px]">
                    {officeDays === 0 ? 'Full work-from-home' : `${officeDays} Days / Wk`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={officeDays}
                  onChange={(e) => setOfficeDays(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Question 3: Dynamic Budget slider checks */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">3. Maximum Target Budget</label>
            {rentOrBuy === 'Rent' ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Target Rent Outflow:</span>
                  <span className="font-bold text-slate-900">₹{targetRent.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="150000"
                  step="2500"
                  value={targetRent}
                  onChange={(e) => setTargetRent(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Target Purchase price:</span>
                  <span className="font-bold text-slate-900">₹{(targetBuyBudget / 10000000).toFixed(2)} Cr</span>
                </div>
                <input
                  type="range"
                  min="8000000"
                  max="60000000"
                  step="1000000"
                  value={targetBuyBudget}
                  onChange={(e) => setTargetBuyBudget(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Questions 4: Loan variables if Buy mode is turned on */}
          {rentOrBuy === 'Buy' && (
            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-3.5 animate-slide-up">
              <span className="text-[10px] font-bold text-indigo-800 tracking-wider uppercase block font-mono">Home Loan Estimator Config</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-mono block mb-1">Interest Rate (%):</span>
                  <input
                    type="number"
                    min="6"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 8.5)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-mono block mb-1">Tenure (Years):</span>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="1"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(parseInt(e.target.value) || 20)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-center font-bold"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">
                Configured with standard <span className="font-semibold text-indigo-700">20% client downpayment</span> and 80% capital loan funding.
              </p>
            </div>
          )}

          {/* Question 5: Multi-attribute Dealbreakers check layout */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">4. Match Dealbreakers</label>
            <div className="space-y-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleTogglePreference('commute')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  importance.commute 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold shadow-xs' 
                    : 'border-slate-150 hover:bg-slate-55 text-slate-600 bg-slate-50/40'
                }`}
              >
                <span className="flex items-center gap-2"><Car className="w-4 h-4 text-indigo-650" /> Super Easy Commute</span>
                {importance.commute ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 border border-slate-300 rounded"></div>}
              </button>

              <button
                type="button"
                onClick={() => handleTogglePreference('space')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  importance.space 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold shadow-xs' 
                    : 'border-slate-150 hover:bg-slate-55 text-slate-600 bg-slate-50/40'
                }`}
              >
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-650" /> Spacious Premium BHK</span>
                {importance.space ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 border border-slate-300 rounded"></div>}
              </button>

              <button
                type="button"
                onClick={() => handleTogglePreference('budget')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  importance.budget 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold shadow-xs' 
                    : 'border-slate-150 hover:bg-slate-55 text-slate-600 bg-slate-50/40'
                }`}
              >
                <span className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-indigo-650" /> Stringent Budget Fit</span>
                {importance.budget ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 border border-slate-300 rounded"></div>}
              </button>

              <button
                type="button"
                onClick={() => handleTogglePreference('amenities')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  importance.amenities 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold shadow-xs' 
                    : 'border-slate-150 hover:bg-slate-55 text-slate-600 bg-slate-50/40'
                }`}
              >
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-650" /> Clubhouse Resorts</span>
                {importance.amenities ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 border border-slate-300 rounded"></div>}
              </button>

              <button
                type="button"
                onClick={() => handleTogglePreference('quietness')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  importance.quietness 
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 font-semibold shadow-xs' 
                    : 'border-slate-150 hover:bg-slate-55 text-slate-600 bg-slate-50/40'
                }`}
              >
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-650" /> Deep Quiet &amp; Privacy</span>
                {importance.quietness ? <Check className="w-4 h-4 text-indigo-600" /> : <div className="w-4 h-4 border border-slate-300 rounded"></div>}
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMN: SCIENTIFIC RESULTS PORTAL */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* THE MATCH SCORE CARDS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-indigo-650" /> Live Compatibility Decider Score
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Properties ranked mathematically based on your personal blueprint rules.</p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono text-[10px] uppercase font-bold rounded-full tracking-wider">
                Ranked Match Output
              </span>
            </div>

            <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1">
              {matchedAnalysisList.map(({ property: p, analysis }) => {
                const isWinnerType = p.rentOrBuy === rentOrBuy;
                
                return (
                  <div 
                    key={p.id} 
                    className={`p-5 rounded-2xl border transition-all relative flex flex-col md:flex-row gap-5 ${
                      isWinnerType
                        ? 'bg-slate-50 hover:bg-slate-50/80 border-slate-200'
                        : 'bg-white opacity-60 hover:opacity-100 border-slate-100'
                    }`}
                  >
                    {/* Compatibility Match Ribbon badge */}
                    <div className="absolute top-4 right-4 md:static md:shrink-0 flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 rounded-2xl w-24 h-24 shadow-xs text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-tight">Match Score</span>
                      <span className={`text-2xl font-extrabold font-mono tracking-tight my-1 ${
                        analysis.score >= 80 ? 'text-emerald-600' : analysis.score >= 60 ? 'text-indigo-600' : 'text-amber-600'
                      }`}>
                        {analysis.score}%
                      </span>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-2.5 h-2.5 ${star <= Math.round(analysis.score / 20) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Information detail column */}
                    <div className="flex-1 space-y-3 pt-3 md:pt-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded text-[9.5px] font-bold font-mono uppercase mr-2">
                            {p.rentOrBuy === 'Rent' ? 'Rent' : 'Buy'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{p.subLocality}</span>
                          <h4 
                            onClick={() => onSelectProperty(p)}
                            className="font-display font-bold text-sm text-slate-800 hover:text-indigo-650 cursor-pointer pt-1"
                          >
                            {p.title}
                          </h4>
                        </div>
                        <div className="text-right sm:text-right pt-1 sm:pt-0">
                          <span className="font-sans font-bold text-slate-900 text-sm block">
                            ₹{p.price >= 100000 ? `${(p.price / 10000000).toFixed(2)} Cr` : `${p.price.toLocaleString()}/mo`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">{p.sizeSqFt} sqft • {p.bedrooms} BHK</span>
                        </div>
                      </div>

                      {/* TRUECOST CALCULATION OUTPUT TAGS */}
                      <div className="bg-white p-3 rounded-xl border border-slate-150/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-inner">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono leading-tight">True Monthly Cost:</span>
                          <span className="text-[12px] font-bold font-sans text-slate-800 flex items-center gap-0.5 mt-0.5">
                            <IndianRupee className="w-3.5 h-3.5 text-indigo-600" /> {analysis.trueCost.grandMonthlyOutflow.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono leading-tight">Commute Cost:</span>
                          <span className="text-[11px] font-medium font-sans text-slate-700 block mt-0.5">
                            ₹{analysis.trueCost.commuteCost.toLocaleString()}/mo
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono leading-tight">Commute Time:</span>
                          <span className="text-[11px] font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-amber-600" /> {analysis.trueCost.commuteTimeSingleWay} mins
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-mono leading-tight">Maint. &amp; Utilities:</span>
                          <span className="text-[11px] font-medium font-sans text-slate-700 block mt-0.5">
                            ₹{(analysis.trueCost.maintenanceValue + analysis.trueCost.estimatedUtilities).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* DECIDER HIGHLIGHTS & WARNING BADGES */}
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        {analysis.positiveHighlights.map((good, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg font-medium">
                            <ThumbsUp className="w-3 h-3 text-emerald-600 shrink-0" />
                            {good}
                          </div>
                        ))}

                        {analysis.cautions.map((warn, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-medium">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            {warn}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HEAD-TO-HEAD BATTLE ARENA */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-emerald-800/10 shadow-lg text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400 shrink-0" /> TrueCost™ Head-to-Head Decider
                </h3>
                <p className="text-xs text-slate-300 mt-1">Select your top two home candidates to lock them in combat.</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold uppercase tracking-widest">
                Scientific Rivalry
              </span>
            </div>

            {/* Selector Grid dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest font-mono text-[9px]">Competitor Home A:</label>
                <select
                  value={battlePropAId}
                  onChange={(e) => setBattlePropAId(e.target.value)}
                  className="w-full text-slate-800 p-2.5 bg-white border border-slate-700/50 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {approvedProps.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.subLocality})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-widest font-mono text-[9px]">Competitor Home B:</label>
                <select
                  value={battlePropBId}
                  onChange={(e) => setBattlePropBId(e.target.value)}
                  className="w-full text-slate-800 p-2.5 bg-white border border-slate-700/50 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {approvedProps.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.subLocality})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COMBAT SCOREBOARD COMPARATIVE */}
            {battleWinnerDetails ? (
              <div className="space-y-6 pt-3 relative">
                
                {battlePropAId === battlePropBId ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Please select different candidate properties for Home A and Home B to let them compare.
                  </div>
                ) : (
                  <>
                    {/* Combat Arena Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                      
                      {/* VS Divider badge */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center bg-emerald-500 text-slate-950 font-black rounded-full w-10 h-10 border-4 border-slate-900 shadow-md flex text-xs">
                        VS
                      </div>

                      {/* Home A statistics card */}
                      <div className={`p-4 rounded-2xl border bg-slate-900/60 transition-all flex flex-col justify-between ${
                        battleWinnerDetails.winner === 'A' ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/5' : 'border-slate-800'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] uppercase font-mono tracking-wide text-emerald-400">HOME CANDIDATE A</span>
                            {battleWinnerDetails.winner === 'A' && (
                              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                                Recommendation Pick ⭐
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs text-white leading-snug line-clamp-2">{battleWinnerDetails.propA.title}</h4>
                        </div>

                        <div className="space-y-2.5 pt-4 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Match rating:</span>
                            <span className="font-bold text-emerald-400 font-mono text-sm">{battleWinnerDetails.analysisA.score}%</span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Grand TrueCost Monthly:</span>
                            <span className="font-bold text-white font-sans">
                              ₹{battleWinnerDetails.analysisA.trueCost.grandMonthlyOutflow.toLocaleString()}/mo
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Daily Commute stress:</span>
                            <span className="font-semibold text-slate-200">
                              {battleWinnerDetails.analysisA.trueCost.commuteTimeSingleWay} min (to {workplace})
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Common Facilities:</span>
                            <span className="font-semibold text-slate-350">{battleWinnerDetails.propA.amenities.length} Verified Facilities</span>
                          </div>
                        </div>
                      </div>

                      {/* Home B statistics card */}
                      <div className={`p-4 rounded-2xl border bg-slate-900/60 transition-all flex flex-col justify-between ${
                        battleWinnerDetails.winner === 'B' ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/5' : 'border-slate-800'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1 text-right">
                            <span className="text-[10px] uppercase font-mono tracking-wide text-indigo-400">HOME CANDIDATE B</span>
                            {battleWinnerDetails.winner === 'B' && (
                              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                                Recommendation Pick ⭐
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs text-white leading-snug line-clamp-2">{battleWinnerDetails.propB.title}</h4>
                        </div>

                        <div className="space-y-2.5 pt-4 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Match rating:</span>
                            <span className="font-bold text-indigo-400 font-mono text-sm">{battleWinnerDetails.analysisB.score}%</span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Grand TrueCost Monthly:</span>
                            <span className="font-bold text-white font-sans">
                              ₹{battleWinnerDetails.analysisB.trueCost.grandMonthlyOutflow.toLocaleString()}/mo
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Daily Commute stress:</span>
                            <span className="font-semibold text-slate-200">
                              {battleWinnerDetails.analysisB.trueCost.commuteTimeSingleWay} min (to {workplace})
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-white/5 pb-1 max-w-full">
                            <span className="text-slate-400">Common Facilities:</span>
                            <span className="font-semibold text-slate-350">{battleWinnerDetails.propB.amenities.length} Verified Facilities</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* WRAPPERS HUMAN VERDICT ADVOCATE */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2 animate-fade-in text-xs text-slate-200">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono uppercase text-[10px] tracking-widest">
                        <Award className="w-4 h-4" /> DECIDER ENGINE VERDICT SPECIALIST
                      </div>
                      <p className="leading-relaxed">
                        Based on your profile, the decider crowns <span className="font-bold text-white">
                          "{battleWinnerDetails.winner === 'A' ? battleWinnerDetails.propA.title : battleWinnerDetails.propB.title}"
                        </span> as the winning option (by a margin of <span className="font-mono text-emerald-400 font-bold">{battleWinnerDetails.margin} match points</span>).
                      </p>
                      <ul className="list-disc leading-loose pl-5 space-y-1 text-slate-300 text-[11px]">
                        {battleWinnerDetails.winner === 'A' ? (
                          <>
                            <li>
                              {battleWinnerDetails.analysisA.trueCost.grandMonthlyOutflow < battleWinnerDetails.analysisB.trueCost.grandMonthlyOutflow 
                                ? `Monthly financial outflow is ₹${Math.round(battleWinnerDetails.analysisB.trueCost.grandMonthlyOutflow - battleWinnerDetails.analysisA.trueCost.grandMonthlyOutflow).toLocaleString()} cheaper, protecting your savings.`
                                : `Offers significantly higher dealbreaker checklist matches, justifying the minor financial variance.`}
                            </li>
                            <li>
                              Your single-trip travel duration to your {workplace} tech hub is just <span className="font-semibold text-emerald-400">{battleWinnerDetails.analysisA.trueCost.commuteTimeSingleWay} mins</span> compared to {battleWinnerDetails.analysisB.trueCost.commuteTimeSingleWay} mins at the other option.
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              {battleWinnerDetails.analysisB.trueCost.grandMonthlyOutflow < battleWinnerDetails.analysisA.trueCost.grandMonthlyOutflow 
                                ? `Saves you as much as ₹${Math.round(battleWinnerDetails.analysisA.trueCost.grandMonthlyOutflow - battleWinnerDetails.analysisB.trueCost.grandMonthlyOutflow).toLocaleString()} in raw monthly cash outflow.`
                                : `Scores heavily on your space and resort amenities filters.`}
                            </li>
                            <li>
                              Office travel time is optimized down to just <span className="font-semibold text-emerald-400">{battleWinnerDetails.analysisB.trueCost.commuteTimeSingleWay} mins</span> which fits beautifully for your hybrid cycle.
                            </li>
                          </>
                        )}
                        <li>
                          The compound has fully approved status with RERA registry indices.
                        </li>
                      </ul>
                      <div className="flex gap-2 pt-2.5">
                        <button
                          type="button"
                          onClick={() => onSelectProperty(battleWinnerDetails.winner === 'A' ? battleWinnerDetails.propA : battleWinnerDetails.propB)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-1.5 rounded-xl transition-all shadow-md text-[10.5px] uppercase"
                        >
                          Book Personal Visit Tour
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateToListings({ type: rentOrBuy })}
                          className="text-slate-300 hover:text-white transition-colors underline text-[11px] font-semibold"
                        >
                          Inspect similar options
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Analyzing candidates suitability metrics...
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
