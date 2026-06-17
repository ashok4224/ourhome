/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Property, Appointment } from '../types';
import { 
  ArrowLeft, Calendar, Clock, DollarSign, Calculator, 
  MapPin, Check, Phone, Mail, MessageSquare, AlertCircle, Sparkles, Heart,
  Building, ShieldCheck
} from 'lucide-react';

interface PropertyDetailsViewProps {
  property: Property;
  onBack: () => void;
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onStartLiveChat?: (propertyId: string, propertyTitle: string) => void;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({
  property,
  onBack,
  onBookAppointment,
  savedIds,
  onToggleSave,
  onStartLiveChat,
}) => {
  // Image slider active index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // EMI Calculator State parameters
  const [loanVal, setLoanVal] = useState<number>(Math.round(property.price * 0.8));
  const [downPay, setDownPay] = useState<number>(Math.round(property.price * 0.2));
  const [interestRate, setInterestRate] = useState<number>(8.6);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Rental Affordability slider state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(150000);

  // WhatsApp simulation states
  const [showWhatsappSim, setShowWhatsappSim] = useState<boolean>(false);
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [chatStage, setChatStage] = useState<'typing' | 'replied'>('typing');

  // Callback simulation states
  const [callbackPhone, setCallbackPhone] = useState<string>('');
  const [callbackSubmitted, setCallbackSubmitted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(120);
  const [callbackStep, setCallbackStep] = useState<number>(1);

  // Financial Tab: Rent/Buy contextual fallback
  const [calcTab, setCalcTab] = useState<'EMI' | 'Affordability'>(
    property.rentOrBuy === 'Rent' ? 'Affordability' : 'EMI'
  );

  useEffect(() => {
    let timer: any;
    if (callbackSubmitted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          const nextVal = prev - 1;
          // Stagger simulator status steps
          if (nextVal === 110) setCallbackStep(2);
          if (nextVal === 100) setCallbackStep(3);
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callbackSubmitted, countdown]);

  // Site visit booking form
  const [visitDate, setVisitDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM - 12:30 PM');
  const [custName, setCustName] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
  const [bookingResult, setBookingResult] = useState<string>('');

  // Agent Contact form
  const [agentMsg, setAgentMsg] = useState<string>('');
  const [agentSent, setAgentSent] = useState<boolean>(false);

  // Sync downpayment + loan if needed
  useEffect(() => {
    // When loan is changed, keep downpayment in sync with property price
    const calculatedDownPay = property.price - loanVal;
    if (calculatedDownPay >= 0 && calculatedDownPay !== downPay) {
      setDownPay(calculatedDownPay);
    }
  }, [loanVal]);

  // Handle slide adjustments
  const handleDownpaymentChange = (newVal: number) => {
    setDownPay(newVal);
    const calculatedLoan = property.price - newVal;
    if (calculatedLoan >= 0) {
      setLoanVal(calculatedLoan);
    }
  };

  const handleLoanChange = (newVal: number) => {
    setLoanVal(newVal);
    const calculatedDown = property.price - newVal;
    if (calculatedDown >= 0) {
      setDownPay(calculatedDown);
    }
  };

  // Calculations
  const calcP = loanVal;
  const calcR = interestRate / 12 / 100;
  const calcN = tenureYears * 12;
  
  let monthlyEmi = 0;
  if (calcR > 0) {
    monthlyEmi = calcP * calcR * Math.pow(1 + calcR, calcN) / (Math.pow(1 + calcR, calcN) - 1);
  } else {
    monthlyEmi = calcP / calcN;
  }
  
  if (isNaN(monthlyEmi) || !isFinite(monthlyEmi)) {
    monthlyEmi = 0;
  }

  const totalAmountPayable = monthlyEmi * calcN;
  const totalInterestPayable = Math.max(0, totalAmountPayable - calcP);

  // Proportion percentages for visual ring chart representation
  const principalPercent = totalAmountPayable > 0 ? (calcP / totalAmountPayable) * 100 : 50;
  const interestPercent = totalAmountPayable > 0 ? (totalInterestPayable / totalAmountPayable) * 100 : 50;

  // Pie chart stroke calculations (Radius = 40, Circumference = 2 * PI * 40 = 251.3)
  const arcLength = 251.3;
  const principalStrokeDash = (principalPercent / 100) * arcLength;
  const interestStrokeDash = (interestPercent / 100) * arcLength;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate || !custName || !custEmail || !custPhone) {
      alert('Please fill out all mandatory scheduler details to book.');
      return;
    }

    onBookAppointment({
      propertyId: property.id,
      propertyTitle: property.title,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      date: visitDate,
      timeSlot: timeSlot,
    });

    const bookingRef = `OH-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingResult(bookingRef);
    setBookingStatus('success');
  };

  const handleContactAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentMsg.trim()) return;
    setAgentSent(true);
    setAgentMsg('');
    setTimeout(() => {
      setAgentSent(false);
      alert(`Message safely delivered to ${property.agent.name}. An agent will call you shortly on your registered number.`);
    }, 2000);
  };

  const isSaved = savedIds.includes(property.id);

  return (
    <div id="details-view" className="space-y-12 pb-16 animate-fade-in text-neutral-800">
      {/* Upper Navigation Header bar */}
      <div className="flex items-center justify-between">
        <button
          id="back-list-btn"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-neutral-400">
            ID: {property.id}
          </span>
          <button
            type="button"
            onClick={() => onToggleSave(property.id)}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-xs'
                : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Layout containing Main Photo and thumbnails */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 h-96 md:h-[480px] rounded-3xl overflow-hidden bg-neutral-100 relative group border border-neutral-100 shadow-xs">
          <img
            src={property.images[activeImageIndex]}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-md text-white font-mono text-xs py-1 px-2.5 rounded-lg border border-neutral-700">
            {property.subLocality}
          </div>
          <div className="absolute bottom-4 right-4 bg-neutral-900/80 backdrop-blur-md text-white font-mono text-xs py-1 px-3 rounded-lg border border-neutral-700">
            Image {activeImageIndex + 1} of {property.images.length}
          </div>
        </div>

        {/* Vertical thumbnails sidebar */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-20 lg:h-28 w-28 lg:w-full rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                activeImageIndex === idx
                  ? 'border-emerald-600 shadow-md ring-2 ring-emerald-100'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <img
                src={img}
                alt={`${property.title} thumbnail`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns containing core property metrics and details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-sky-50 border border-sky-100 text-sky-700 font-mono text-[10px] font-bold tracking-wider uppercase py-0.5 px-2 rounded-md">
                {property.rentOrBuy === 'Buy' ? 'Buy Estate' : 'Rent Condo'}
              </span>
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-[10px] uppercase py-0.5 px-2 rounded-md font-bold">
                RERA Vetted
              </span>
              {property.reraId && (
                <span className="bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[10px] py-0.5 px-2 rounded-md font-semibold tracking-wider">
                  TS-RERA: {property.reraId}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-4xl font-bold text-neutral-950 tracking-tight leading-none">
              {property.title}
            </h1>

            <p className="flex items-center text-sm md:text-base text-neutral-500 gap-1">
              <MapPin className="w-4 h-4 text-rose-500" /> {property.location}
            </p>
          </div>

          {/* Luxury Metric Badges Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 border border-neutral-200/50 p-5 rounded-2xl">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Pricing Valuation</p>
              <p className="font-display font-bold text-lg text-neutral-900">
                {property.rentOrBuy === 'Rent' 
                  ? `₹${property.price.toLocaleString('en-IN')}/mo` 
                  : `₹${(property.price / 10000000).toFixed(2)} Crores`}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Carpet Area</p>
              <p className="font-display font-semibold text-lg text-neutral-900">
                {property.sizeSqFt.toLocaleString('en-IN')} SQFT
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Vastu Facing</p>
              <p className="font-display font-semibold text-lg text-neutral-900">{property.facing}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Status</p>
              <p className="font-display font-semibold text-lg text-emerald-600">Available</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-neutral-950 border-b border-neutral-100 pb-2">Description</h3>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Premium Amenities Section */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-neutral-950 border-b border-neutral-100 pb-2">Luxury Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1 px-3 bg-emerald-50/40 rounded-xl border border-emerald-100/30 text-xs md:text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-750 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Proximity Section */}
          {property.proximityScores && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-neutral-950 border-b border-neutral-100 pb-2">Neighborhood Proximity & Connectivity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">METRO ACCESS</span>
                  <div>
                    <span className="font-display font-bold text-lg text-neutral-900">{property.proximityScores.metro} km</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Distance to station</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">IT WORKSPACES</span>
                  <div>
                    <span className="font-display font-bold text-lg text-neutral-900">{property.proximityScores.workspace} km</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Distance to IT Parks</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">HEALTHCARE</span>
                  <div>
                    <span className="font-display font-bold text-lg text-neutral-900">{property.proximityScores.hospital} km</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Distance to Hospital</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">EDUCATION</span>
                  <div>
                    <span className="font-display font-bold text-lg text-neutral-900">{property.proximityScores.school} km</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Distance to Schools</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div id="emi-calculator-panel" className="bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-neutral-950">Interactive Financial Planner</h3>
                  <p className="text-xs text-neutral-400">Context-aware tools by MagicBricks & NoBroker</p>
                </div>
              </div>

              {/* Segmented Tab Headers */}
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCalcTab('EMI')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    calcTab === 'EMI'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Buy: Loan EMI
                </button>
                <button
                  type="button"
                  onClick={() => setCalcTab('Affordability')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    calcTab === 'Affordability'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rent: Affordability Planner
                </button>
              </div>
            </div>

            {calcTab === 'EMI' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                {/* SLIDERS INPUT SIDE */}
                <div id="emi-sliders" className="space-y-6">
                  {/* Property cost context line */}
                  <div className="flex justify-between items-center bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-150 text-[11px] font-mono">
                    <span className="text-neutral-500">Property Valuation Costs:</span>
                    <span className="font-bold text-neutral-800">₹{property.price.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Downpayment Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-500">Downpayment Option:</span>
                      <span className="font-bold text-neutral-900">₹{downPay.toLocaleString('en-IN')} ({Math.round((downPay / property.price) * 100 || 0)}%)</span>
                    </div>
                    <input
                      type="range"
                      min={Math.round(property.price * 0.1)}
                      max={property.price}
                      step={100000}
                      value={downPay}
                      onChange={(e) => handleDownpaymentChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 text-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>10% (₹{(property.price * 0.1).toLocaleString('en-IN')})</span>
                      <span>100% (₹{property.price.toLocaleString('en-IN')})</span>
                    </div>
                  </div>

                  {/* Loan Amount Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-500">Housing Loan Required:</span>
                      <span className="font-bold text-emerald-700">₹{loanVal.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={property.price}
                      step={100000}
                      value={loanVal}
                      onChange={(e) => handleLoanChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 text-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>₹0</span>
                      <span>₹{property.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Rent/Buy segmented parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Interest Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Interest (p.a):</span>
                        <span className="font-bold text-neutral-950">{interestRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    {/* Tenure Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-500">Tenure:</span>
                        <span className="font-bold text-neutral-950">{tenureYears} Years</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC RING & STATS OUTPUT PANEL */}
                <div className="flex flex-col items-center justify-center bg-slate-800 text-white p-6 rounded-2xl space-y-4 text-center select-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 font-mono text-[8px] text-white/35">OurHome Finance Tool</div>
                  
                  {/* Visual Ring Chart representing Principal vs Interest */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="#334155"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="#38bdf8"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={`${interestStrokeDash} ${arcLength}`}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="#10b981"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={`${principalStrokeDash} ${arcLength}`}
                        strokeDashoffset={-interestStrokeDash}
                        className="transition-all duration-300"
                      />
                    </svg>
                    {/* Inside metrics label */}
                    <div className="absolute space-y-0.5 text-center">
                      <p className="text-[9px] font-mono leading-none text-neutral-400">EST. MONTHLY</p>
                      <p className="text-sm font-display font-bold text-white">
                        ₹{Math.round(monthlyEmi).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[8px] font-mono leading-none text-neutral-300">/ month</p>
                    </div>
                  </div>

                {/* Detailed numeric reports */}
                <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-700 pt-3 text-left">
                  <div id="metric-emi-p" className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> PRINCIPAL
                    </div>
                    <p className="font-mono text-xs font-semibold text-neutral-200">
                      ₹{calcP.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div id="metric-emi-i" className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400">
                      <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" /> TOTAL INTEREST
                    </div>
                    <p className="font-mono text-xs font-semibold text-neutral-200">
                      ₹{Math.round(totalInterestPayable).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Pre-Approved Certificate Requested! Our home partner banks (HDFC, SBI, ICICI) are auditing your ₹${calcP.toLocaleString('en-IN')} principal requirement.`)}
                  className="w-full bg-white text-slate-900 border border-slate-100 font-bold text-xs py-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Apply For Pre-Approved Loan
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: RENT AFFORDABILITY AND DEPOSIT MODEL (Magicbricks and NoBroker feature sets) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-6">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 space-y-3.5">
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>Monthly Rent Quote:</span>
                    <span className="font-bold text-neutral-900">₹{(property.rentOrBuy === 'Rent' ? property.price : 60000).toLocaleString('en-IN')} / mo</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-500 flex items-center">Gross Monthly Income:</span>
                      <span className="font-bold text-emerald-800">₹{monthlyIncome.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={300000}
                      step={5000}
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                      <span>₹30K</span>
                      <span>₹3.0L / month</span>
                    </div>
                  </div>
                </div>

                {/* Typical move-in costs benchmarks */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Hyderabad Move-in Timelines</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <p className="text-neutral-400 text-[9px] font-mono leading-none mb-1">SECURITY DEPOSIT (3x)</p>
                      <p className="font-bold text-slate-800">₹{((property.rentOrBuy === 'Rent' ? property.price : 60000) * 3).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <p className="text-neutral-400 text-[9px] font-mono leading-none mb-1">STAMP DUTY AGREEMENT</p>
                      <p className="font-bold text-slate-800">₹750 split</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUT RATIO ANALYST panel */}
              {(() => {
                const rentAmount = property.rentOrBuy === 'Rent' ? property.price : 60000;
                const ratio = Math.round((rentAmount / monthlyIncome) * 100);
                const isSafe = ratio <= 30;
                const isModerate = ratio > 30 && ratio <= 45;

                return (
                  <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 text-center select-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 font-mono text-[8px] text-white/35">NoBroker Affordability</div>
                    
                    <div className="space-y-1 text-center">
                      <p className="text-neutral-400 text-[10px] font-mono uppercase tracking-widest leading-none">Affordability Index</p>
                      <p className="font-display font-black text-3xl text-emerald-400">
                        {ratio}% <span className="text-xs text-neutral-300 font-normal">Income-to-Rent</span>
                      </p>
                    </div>

                    {/* Safeness bracket verdict visual indicator bar */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-[100%] bg-emerald-500" style={{ width: `${Math.min(30, ratio)}%` }} />
                      <div className="h-[100%] bg-amber-500" style={{ width: `${Math.max(0, Math.min(15, ratio - 30))}%` }} />
                      <div className="h-[100%] bg-rose-500" style={{ width: `${Math.max(0, ratio - 45)}%` }} />
                    </div>

                    <div className="text-xs space-y-1 text-center">
                      <p className={`font-bold uppercase tracking-wider text-xs ${isSafe ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'}`}>
                        {isSafe ? 'Highly Safe Zone ✓' : isModerate ? 'Moderate / Stretch Zone' : 'Overloaded Ratio Zone ⚠'}
                      </p>
                      <p className="text-slate-400 text-[10px] leading-relaxed px-1">
                        {isSafe 
                          ? 'Your lease represents less than 30% of income. Safe zone, highly approved by Hyderabad banks.' 
                          : isModerate 
                          ? 'Warning: Lease is between 30% and 45% of gross income. Manage other debt accounts carefully.'
                          : 'Ratio exceeds 45%! Renting is a substantial burden. We recommend considering roommates or lower configurations.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('Direct Rental Agreement Draft requested! Custom stamp layouts will be shared with the Arjun Builder Office.')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer text-center font-mono"
                    >
                      Draft Stamp Agreement
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
          </div>
        </div>

        {/* Right 1 Column containing Appointment Scheduler and Agent Details */}
        <div className="space-y-6">
          {/* Appointment Scheduler Box */}
          <div id="scheduler-panel" className="bg-slate-50 text-slate-850 rounded-3xl p-6 border border-slate-200 space-y-5 sticky top-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-850 text-[10px] font-mono tracking-wider rounded-md border border-emerald-200 uppercase">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Instant Schedules
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Book Secured Site Visit</h3>
              <p className="text-xs text-slate-550">Select your date. An executive will meet you at Skyline Towers.</p>
            </div>

            {bookingStatus === 'success' ? (
              <div className="bg-white border border-emerald-200 p-5 rounded-2xl text-center space-y-4 animate-scale-in">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-sm text-slate-900">Appointment Reserved!</h4>
                  <p className="text-xs text-slate-500">Your site visit slot has been logged inside database state.</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-mono text-slate-400">BOOKING REFERENCE</p>
                  <p className="text-lg font-mono font-bold tracking-widest text-emerald-700">{bookingResult}</p>
                </div>
                <div className="text-left space-y-1 text-xs font-mono text-slate-700 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200">
                  <p className="flex justify-between"><span>Date:</span> <span>{visitDate}</span></p>
                  <p className="flex justify-between"><span>Slot:</span> <span className="text-[10px] truncate max-w-[120px]">{timeSlot}</span></p>
                </div>
                <p className="text-[10px] text-slate-400">Go to "My Appointments" panel inside your User Dashboard to view active items.</p>
                <button
                  type="button"
                  onClick={() => setBookingStatus('idle')}
                  className="text-xs text-emerald-650 font-semibold hover:underline"
                >
                  Schedule Another Visit
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Date Selection */}
                <div className="space-y-1">
                  <label htmlFor="visit_date" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Preferred Date *</label>
                  <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      id="visit_date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full text-xs ml-2 bg-transparent border-none outline-none text-slate-800 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Available Slots segmented selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Available Slots *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '09:30 AM - 11:00 AM',
                      '11:00 AM - 12:30 PM',
                      '02:00 PM - 03:30 PM',
                      '04:00 PM - 05:30 PM'
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`text-[10px] font-mono py-2 px-1.5 rounded-xl border text-center transition-all ${
                          timeSlot === slot
                            ? 'bg-emerald-600 border-emerald-500 text-white font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Name */}
                <div className="space-y-1">
                  <label htmlFor="cust_name" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Full Name *</label>
                  <input
                    id="cust_name"
                    type="text"
                    required
                    placeholder="Arjun Reddy"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-800 focus:border-emerald-500 focus:ring-0"
                  />
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="cust_email" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Email Address *</label>
                    <input
                      id="cust_email"
                      type="email"
                      required
                      placeholder="arjun@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-800 focus:border-emerald-500 focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cust_phone" className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Phone Number *</label>
                    <input
                      id="cust_phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-800 focus:border-emerald-500 focus:ring-0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-colors text-center cursor-pointer shadow-md"
                >
                  Secure Appointment Visit
                </button>
              </form>
            )}
          </div>

          {/* Assigned Local Agent Details and chat */}
          <div id="agent-panel" className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="font-display font-bold text-xs text-neutral-400 uppercase tracking-widest">Builder & Owner Profile</h4>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Builder
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100 border-2 border-indigo-100 shrink-0 shadow-xs">
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h5 className="font-display font-bold text-neutral-900 text-sm">{property.agent.name}</h5>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 rounded-md text-[10px] text-neutral-600 font-medium">
                  <Building className="w-3 h-3 text-neutral-500" />
                  <span>
                    {property.agent.name.includes('Arjun') 
                      ? 'Nandan Homes & Elite Ventures' 
                      : property.agent.name.includes('Suhasini') 
                      ? 'Mehta Premier Builders Group' 
                      : 'Hyderabad Landmark Properties'}
                  </span>
                </div>
              </div>
            </div>

            {/* Clear, structured Contact Details */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
              <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 transition-colors hover:bg-neutral-100/30">
                <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">Direct Hotline / Call</span>
                <a 
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center gap-2 text-neutral-800 hover:text-indigo-600 transition-colors"
                >
                  <span className="p-1.5 bg-white rounded-lg border border-neutral-200 text-slate-500 shadow-2xs">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-mono font-bold">{property.agent.phone}</span>
                </a>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 transition-colors hover:bg-neutral-100/30">
                <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">Professional Email</span>
                <a 
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center gap-2 text-neutral-800 hover:text-indigo-600 transition-colors w-full overflow-hidden truncate"
                >
                  <span className="p-1.5 bg-white rounded-lg border border-neutral-200 text-slate-500 shadow-2xs">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-mono font-bold truncate break-all">{property.agent.email}</span>
                </a>
              </div>
            </div>

            {/* Quick contact slots */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button 
                type="button"
                onClick={() => {
                  setShowWhatsappSim(true);
                  setChatStage('typing');
                  setTimeout(() => {
                    setChatStage('replied');
                  }, 2000);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 rounded-xl text-emerald-800 font-bold cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Chat
              </button>
              <a 
                href={`tel:${property.agent.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-neutral-800 font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-400" /> Call Hotline
              </a>
            </div>

            {/* INTERACTIVE WHATSAPP SIMULATOR OVERLAY PANEL */}
            {showWhatsappSim && (
              <div className="bg-emerald-900/5 text-slate-800 p-4 rounded-2xl border border-emerald-200 space-y-3.5 animate-scale-in">
                {/* Chat header */}
                <div className="flex items-center justify-between bg-emerald-800 text-white p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white shrink-0">
                      <img src={property.agent.avatar} alt={property.agent.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold leading-none">{property.agent.name}</p>
                      <p className="text-[7.5px] font-mono text-emerald-250">Verified Builder (Online)</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowWhatsappSim(false)}
                    className="text-xs text-white/70 hover:text-white font-mono"
                  >
                    Close
                  </button>
                </div>

                {/* Message logs */}
                <div className="space-y-2 max-h-44 overflow-y-auto p-1 text-[11px] font-sans">
                  {/* Sent bubble */}
                  <div className="bg-emerald-50 self-end ml-6 p-2 rounded-xl rounded-tr-none text-slate-800 border border-emerald-100">
                    <p className="font-semibold text-[9px] text-emerald-700">You</p>
                    <p>Hello! I am interested in your property <strong>{property.title}</strong> listed with zero brokerage. Please share dynamic pricing structures.</p>
                  </div>

                  {/* Typing simulation bubble */}
                  {chatStage === 'typing' && (
                    <div className="bg-white mr-6 p-2 rounded-xl rounded-tl-none text-slate-500 italic flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span>{property.agent.name.split(' ')[0]} is typing...</span>
                    </div>
                  )}

                  {/* Replied bubble */}
                  {chatStage === 'replied' && (
                    <div className="bg-white mr-6 p-2.5 rounded-xl rounded-tl-none text-slate-800 border border-neutral-100 animate-fade-in space-y-1">
                      <p className="font-semibold text-[9px] text-indigo-600">{property.agent.name}</p>
                      <p>Namaste! Thank you for inquiring about {property.title}. Direct Zero Brokerage price has been applied.</p>
                      <p className="text-[10px] text-neutral-500 font-medium">Would you like to schedule an online video tour or request our master bedroom floorplan brochure?</p>
                    </div>
                  )}
                </div>

                {/* Quick actions inside chat */}
                {chatStage === 'replied' && (
                  <div className="flex gap-1.5 text-[10px] font-mono">
                    <button 
                      type="button"
                      onClick={() => alert("Brochure Floorplan PDF generated and downloaded to client sandbox cache!")}
                      className="bg-white border border-neutral-200 px-2 py-1 rounded-lg hover:border-emerald-500"
                    >
                      📄 Get Details PDF
                    </button>
                    <button 
                      type="button"
                      onClick={() => alert(`Direct site schedule request logged for next Sunday with Representative ${property.agent.name}!`)}
                      className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-500"
                    >
                      📅 Visit Next Sunday
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NOBROKER FASTEST 2-MINUTE OUTBOUND CALLBACK MODULE */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div>
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[8px] font-mono font-black tracking-widest px-2 py-0.5 rounded-md uppercase">
                  ⚡ Outbound Telephony
                </span>
                <h5 className="font-display font-bold text-xs text-slate-900 mt-1">Get Instant Callback in 120s</h5>
                <p className="text-[10px] text-slate-550 leading-tight">Enter your phone number; our dispatch queue triggers an outbound call node instantly.</p>
              </div>

              {!callbackSubmitted ? (
                <div className="flex gap-2">
                  <input 
                    type="tel"
                    placeholder="Enter Phone Number..."
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 outline-none text-slate-800 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!callbackPhone) {
                        alert("Please input a valid phone number to connect.");
                        return;
                      }
                      setCallbackSubmitted(true);
                      setCountdown(120);
                      setCallbackStep(1);
                    }}
                    className="bg-slate-900 text-white text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-slate-800"
                  >
                    Speak in 2m
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-amber-200 p-3 rounded-xl space-y-1.5 animate-scale-in text-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-700 animate-pulse font-bold">● CONNECTING LIVE</span>
                    <span className="font-bold text-slate-900">{countdown} seconds left</span>
                  </div>

                  {/* Simulated Telemetry status logs */}
                  <div className="bg-slate-50 p-2 rounded-lg border text-[9px] font-mono text-slate-600 space-y-1">
                    <p className="flex justify-between">
                      <span>Server Node:</span> 
                      <span className="text-emerald-700">HYD-TELEPHONY-EAST ✓</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Dispatch Action:</span>
                      <span className="font-bold text-slate-800">
                        {callbackStep === 1 
                          ? 'Enqueuing outbound route...' 
                          : callbackStep === 2 
                          ? 'Assigning broker representative...' 
                          : 'Ringing customer terminal...'}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[9px] font-mono">
                    <button 
                      type="button" 
                      onClick={() => setCallbackSubmitted(false)}
                      className="text-red-600 hover:underline"
                    >
                      Cancel Queue
                    </button>
                    <span className="text-slate-400">Arjun / Suhasini Team</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Synchronized Chat CTA */}
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  if (onStartLiveChat) {
                     onStartLiveChat(property.id, property.title);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-xs py-2.5 rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-sm select-none cursor-pointer text-center"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
                </span>
                Direct Live Inquiry (Instant Connect)
              </button>
              <p className="text-[9px] font-mono text-center text-neutral-400 mt-1 leading-none">
                🏗️ Links directly to active builder console stream
              </p>
            </div>

            {/* Quick Agent Inbox Chat form */}
            <form onSubmit={handleContactAgent} className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="I would like to request custom plans..."
                  value={agentMsg}
                  onChange={(e) => setAgentMsg(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 outline-none focus:border-emerald-500 placeholder-neutral-400 resize-none text-neutral-900 font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer text-center"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send Core Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
