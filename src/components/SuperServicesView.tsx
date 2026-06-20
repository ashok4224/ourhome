/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import { 
  Building2, Sparkles, FileText, PenTool, IndianRupee, MapPin, 
  Calculator, CheckCircle2, ShieldCheck, Star, RefreshCw, Send, 
  ArrowUpRight, AlertCircle, Phone, ArrowUpDown, ChevronRight, Check, Trash2, Globe
} from 'lucide-react';

interface SuperServicesViewProps {
  properties: Property[];
  onNavigateToListings: (filters?: { type?: 'Rent' | 'Buy'; search?: string; subLocality?: string }) => void;
  onSelectProperty: (property: Property) => void;
  savedIds: string[];
}

export const SuperServicesView: React.FC<SuperServicesViewProps> = ({
  properties,
  onNavigateToListings,
  onSelectProperty,
  savedIds
}) => {
  // Graceful visual toast triggered if registered, falls back to native alert
  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    if ((window as any).triggerOurHomeToast) {
      (window as any).triggerOurHomeToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // Phase Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'nobroker' | 'magicbricks' | 'societysync'>('nobroker');

  // Local state persistence keys (We synchronize with society management's local storage)
  const [societyBills, setSocietyBills] = useState<any[]>([]);
  const [societyNotices, setSocietyNotices] = useState<any[]>([]);
  const [societyComplaints, setSocietyComplaints] = useState<any[]>([]);

  useEffect(() => {
    // Load society stats directly from society hub storage context to achieve Real Cross-Linking!
    const loadedBills = localStorage.getItem('ohm_bills');
    const loadedNotices = localStorage.getItem('ohm_notices');
    const loadedComplaints = localStorage.getItem('ohm_complaints');

    if (loadedBills) setSocietyBills(JSON.parse(loadedBills));
    if (loadedNotices) setSocietyNotices(JSON.parse(loadedNotices));
    if (loadedComplaints) setSocietyComplaints(JSON.parse(loadedComplaints));
  }, []);

  // ==========================================
  // PHASE 1: NOBROKER ZERO-BROKERAGE HUB STATE
  // ==========================================
  
  // Direct Owner Contact List Helper
  const [requestedOwnerIds, setRequestedOwnerIds] = useState<string[]>([]);
  const [isRequestingContactId, setIsRequestingContactId] = useState<string | null>(null);
  const [ownerVerificationCode, setOwnerVerificationCode] = useState<string>('');
  const [successContactDetails, setSuccessContactDetails] = useState<{ [key: string]: { name: string; phone: string; email: string } }>({});

  const handleRequestOwnerContact = (propertyId: string) => {
    setIsRequestingContactId(propertyId);
    // Generate a random mock 4-digit code simulating NoBroker instant SMS security token
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOwnerVerificationCode(code);
  };

  const handleVerifyOwnerCode = (propertyId: string, enteredCode: string) => {
    if (enteredCode === ownerVerificationCode) {
      const matchedProp = properties.find(p => p.id === propertyId);
      const ownerInfo = {
        name: matchedProp?.agent?.name || 'Direct Owner',
        phone: matchedProp?.agent?.phone || '+91 98877 66554',
        email: matchedProp?.agent?.email || 'owner.direct@ourhome.in'
      };
      setSuccessContactDetails(prev => ({
        ...prev,
        [propertyId]: ownerInfo
      }));
      setRequestedOwnerIds(prev => [...prev, propertyId]);
      setIsRequestingContactId(null);
      setOwnerVerificationCode('');
      triggerToast('Direct verification verified! Owner details unlocked below.', 'success');
    } else {
      triggerToast('Invalid security verification pass code. Kindly check the generated SMS badge simulation!', 'error');
    }
  };

  // E-Rental Agreement Maker state 
  const [agreementTenant, setAgreementTenant] = useState('');
  const [agreementOwner, setAgreementOwner] = useState('');
  const [agreementRent, setAgreementRent] = useState('25000');
  const [agreementDeposit, setAgreementDeposit] = useState('100000');
  const [agreementDuration, setAgreementDuration] = useState('11');
  const [agreementProperty, setAgreementProperty] = useState('');
  const [signaturePath, setSignaturePath] = useState<boolean>(false);
  const [generatedAgreement, setGeneratedAgreement] = useState<any | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas signature drawing pad
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#059669'; // Emerald-600
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setSignaturePath(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignaturePath(false);
  };

  const handleGenerateAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementTenant || !agreementOwner || !agreementProperty) {
      triggerToast('Please fill out all agreement details first.', 'warning');
      return;
    }
    const stampNo = `IN-AP${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setGeneratedAgreement({
      tenant: agreementTenant,
      owner: agreementOwner,
      rent: agreementRent,
      deposit: agreementDeposit,
      duration: agreementDuration,
      property: agreementProperty,
      stampNo,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    });
    triggerToast('Rental Agreement generated on e-Stamp stamp paper! Locate stamp details and apply your digital pen signature below.', 'success');
  };

  // Packers & Movers Calculator state
  const [moverBhk, setMoverBhk] = useState<'1BHK' | '2BHK' | '3BHK' | 'Penthouse'>('2BHK');
  const [moverFloor, setMoverFloor] = useState('Ground');
  const [moverElevator, setMoverElevator] = useState<boolean>(true);
  const [moverPackType, setMoverPackType] = useState<'Standard' | 'Premium'>('Standard');
  const [moverEstimate, setMoverEstimate] = useState<number>(0);
  const [moverBooked, setMoverBooked] = useState(false);

  useEffect(() => {
    let basePrice = 4500;
    if (moverBhk === '2BHK') basePrice = 6500;
    if (moverBhk === '3BHK') basePrice = 9000;
    if (moverBhk === 'Penthouse') basePrice = 14500;

    let floorMultiplier = 1;
    if (moverFloor === '1-4th Floor' && !moverElevator) floorMultiplier = 1.15;
    if (moverFloor === '5th+ Floor' && !moverElevator) floorMultiplier = 1.30;
    if (moverFloor === '1-4th Floor' && moverElevator) floorMultiplier = 1.05;
    if (moverFloor === '5th+ Floor' && moverElevator) floorMultiplier = 1.10;

    const packingCost = moverPackType === 'Premium' ? basePrice * 0.25 : 0;
    const calculated = Math.round(basePrice * floorMultiplier + packingCost);
    setMoverEstimate(calculated);
  }, [moverBhk, moverFloor, moverElevator, moverPackType]);


  // ==========================================
  // PHASE 2: 99ACRES & MAGICBRICKS TREND REVIEWS
  // ==========================================

  // Pricing Trends Data
  const microMarketTrends = [
    { name: 'Gachibowli', currentPrice: 8550, lastYearPrice: 7705, change: '+10.9%', volume: 'Very High', reraRatio: '94%', demandIndex: 9.2 },
    { name: 'Madhapur', currentPrice: 9100, lastYearPrice: 8350, change: '+8.9%', volume: 'High', reraRatio: '96%', demandIndex: 8.8 },
    { name: 'Jubilee Hills', currentPrice: 16500, lastYearPrice: 15100, change: '+9.2%', volume: 'Stable', reraRatio: '98%', demandIndex: 7.9 },
    { name: 'Financial District', currentPrice: 9800, lastYearPrice: 8750, change: '+12.0%', volume: 'Very High', reraRatio: '92%', demandIndex: 9.5 },
    { name: 'Kondapur', currentPrice: 7900, lastYearPrice: 7280, change: '+8.5%', volume: 'High', reraRatio: '91%', demandIndex: 8.4 }
  ];

  const [activeTrendLoc, setActiveTrendLoc] = useState('Gachibowli');

  // Resident Review board persistence
  const [reviews, setReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem('ohm_locality_reviews');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, locality: 'Gachibowli', user: 'Chandra Vardhan', rating: 5, comments: 'Extremely close to outer ring road. Zero power-cuts and the community matches high-profile IT setups. Water is slightly hard but society purification stands out.', date: '2 days ago' },
      { id: 2, locality: 'Madhapur', user: 'Nitya Menon', rating: 4, comments: 'Metro station access is fantastic! Parking is cramped and high noise during peak office hours, otherwise elite living state.', date: '1 week ago' },
      { id: 3, locality: 'Jubilee Hills', user: 'Harsha Reddy', rating: 5, comments: 'Premium luxury residential feel with amazing green cover and privacy. Maintenance costs are high but completely worth it.', date: '3 days ago' },
      { id: 4, locality: 'Financial District', user: 'Sriram Krishnan', rating: 5, comments: 'Upcoming world-class skyscraper projects. Very clean, quiet lanes. Excellent security patrols.', date: 'Yesterday' }
    ];
  });

  const [newReviewLoc, setNewReviewLoc] = useState('Gachibowli');
  const [newReviewUser, setNewReviewUser] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewUser || !newReviewComment) {
      triggerToast('Please fill out Name and Review content.', 'warning');
      return;
    }
    const freshReview = {
      id: Date.now(),
      locality: newReviewLoc,
      user: newReviewUser,
      rating: newReviewRating,
      comments: newReviewComment,
      date: 'Just now'
    };
    const updated = [freshReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('ohm_locality_reviews', JSON.stringify(updated));
    setNewReviewUser('');
    setNewReviewComment('');
    triggerToast('Review posted successfully! Your real feedback is instantly updated for other home seekers.', 'success');
  };

  // Property Comparison Matrix State
  const [comparePropIds, setComparePropIds] = useState<string[]>(['prop-1', 'prop-2']);

  const handleToggleCompareSelection = (id: string) => {
    if (comparePropIds.includes(id)) {
      setComparePropIds(prev => prev.filter(pId => pId !== id));
    } else {
      if (comparePropIds.length >= 3) {
        triggerToast('Comparison limit reached! You can compare a maximum of 3 properties side-by-side.', 'warning');
        return;
      }
      setComparePropIds(prev => [...prev, id]);
    }
  };


  // ==========================================
  // PHASE 3: SOCIETY SYNC & WALK-IN VISITOR GENERATOR
  // ==========================================
  const [selectedSocietyPropId, setSelectedSocietyPropId] = useState<string>('prop-1');
  const [visitorName, setVisitorName] = useState('');
  const [visitorDate, setVisitorDate] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('Property Walk-In View');
  const [generatedVisitorPass, setGeneratedVisitorPass] = useState<any | null>(null);

  const matchedSocietyProperty = properties.find(p => p.id === selectedSocietyPropId) || properties[0];

  const handleGenerateWalkInPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorDate) {
      triggerToast('Kindly provide the Visitor Name and Date to issue a security Gatepass.', 'warning');
      return;
    }
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    const mockCheckInTimes = ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];
    
    setGeneratedVisitorPass({
      name: visitorName,
      date: visitorDate,
      purpose: visitorPurpose,
      passcode,
      property: matchedSocietyProperty.title,
      society: matchedSocietyProperty.subLocality + ' Elite Hub',
      qrCode: `OHM-PASS-${passcode}`
    });

    // Fire simulated telemetry log status
    console.log(`Gatepass issued for walkthrough at ${matchedSocietyProperty.title}`);
  };

  // Logic calculation for society state checks
  const getSublocalityCompliance = (subLoc: string) => {
    // Dynamically query based on typical localized telemetry inside society management
    const resCount = subLoc === 'Gachibowli' ? 48 : subLoc === 'Madhapur' ? 32 : subLoc === 'Jubilee Hills' ? 12 : 24;
    const pendingDues = subLoc === 'Gachibowli' ? '₹14,500' : subLoc === 'Madhapur' ? '₹9,000' : subLoc === 'Jubilee Hills' ? '₹4,500' : '₹12,000';
    const tankerRate = subLoc === 'Gachibowli' ? '12 Tankers / Week' : subLoc === 'Madhapur' ? '8 Tankers / Week' : subLoc === 'Jubilee Hills' ? '2 Tankers / Week' : '5 Tankers / Week';
    const safetyIndex = subLoc === 'Gachibowli' ? '98.5%' : subLoc === 'Madhapur' ? '96.2%' : subLoc === 'Jubilee Hills' ? '99.1%' : '97.0%';
    const waterSource = subLoc === 'Jubilee Hills' ? 'Manjeera Municipality (100%)' : 'Borewell + tankers (60/40 mix)';
    
    return {
      resCount,
      pendingDues,
      tankerRate,
      safetyIndex,
      waterSource,
      reraNo: `AP-RERA-${Math.floor(100000 + Math.random() * 900000)}`
    };
  };

  return (
    <div id="super-services-container" className="space-y-8 animate-fade-in py-1">
      
      {/* Title Header with descriptive NoBroker, 99acres and Premium taglines */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-505/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider">
            <Sparkles className="w-3 h-3 animate-pulse" /> Verified Property Super App
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight">OurHome Elite Services</h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Experience an integrated Indian Real-Estate master system. Bypassing brokers with direct-owner checks (NoBroker style), unlocking heavy locality analysis and trends (99acres and MagicBricks indices), sync’d to Live Society maintenance states.
          </p>
        </div>

        {/* Phase Selectors styled like a premium segments toggle bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-1.5 rounded-2xl mt-6 border border-slate-700/50 relative z-10">
          <button
            type="button"
            onClick={() => setActiveSubTab('nobroker')}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
              activeSubTab === 'nobroker'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-center">Phase 1: Direct Deal &amp; Agreements</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('magicbricks')}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
              activeSubTab === 'magicbricks'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 shrink-0" />
            <span className="text-center">Phase 2: Locality Trends &amp; Compare</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('societysync')}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
              activeSubTab === 'societysync'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="text-center">Phase 3: Live Society Sync</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: NOBROKER DEALS, SMART AGREEMENTS & MOVERS
          ======================================================== */}
      {activeSubTab === 'nobroker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Direct Owner contact column (NoBroker Signature) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-5 h-5 text-emerald-600" /> Direct-to-Owner Matches
                </h3>
                <p className="text-xs text-slate-500 mt-1">100% verified properties with zero brokerage structures.</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono uppercase font-bold">
                Bypass Broker
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {properties.filter(p => !p.title.includes('ashok')).map((prop) => {
                const requestState = successContactDetails[prop.id];
                const isCurrentCodeVerify = isRequestingContactId === prop.id;
                
                return (
                  <div key={prop.id} className="p-4 bg-slate-50 hover:bg-slate-50/80 rounded-2xl border border-slate-100 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex gap-3">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-650 tracking-wider uppercase block">{prop.subLocality}</span>
                        <h4 className="font-semibold text-xs py-0.5 text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => onSelectProperty(prop)}>
                          {prop.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>₹{prop.price >= 100000 ? `${(prop.price / 10000000).toFixed(2)} Cr` : `${prop.price.toLocaleString()}/mo`}</span>
                          <span>•</span>
                          <span>{prop.sizeSqFt} sqft</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      {requestState ? (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                          <div className="font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Owner Details Released</div>
                          <div>Name: <span className="font-bold">{requestState.name}</span></div>
                          <div>Phone: <span className="font-bold">{requestState.phone}</span></div>
                          <div>Email: <span className="font-mono">{requestState.email}</span></div>
                        </div>
                      ) : isCurrentCodeVerify ? (
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2 max-w-xs">
                          <p className="text-[10px] text-amber-800 leading-tight">
                            Security pass token generated: <span className="font-mono font-bold text-sm bg-amber-100 px-1 py-0.5 rounded">{ownerVerificationCode}</span> (Verify code to unlock direct telephone dials).
                          </p>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              id={`verify-input-${prop.id}`}
                              placeholder="Enter 4-digit security code"
                              className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded font-mono text-center focus:ring-1 focus:ring-emerald-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.currentTarget as HTMLInputElement).value;
                                  handleVerifyOwnerCode(prop.id, val);
                                }
                              }}
                            />
                            <button
                              id={`verify-btn-submit-${prop.id}`}
                              type="button"
                              onClick={() => {
                                const inputNode = document.getElementById(`verify-input-${prop.id}`) as HTMLInputElement;
                                if (inputNode) handleVerifyOwnerCode(prop.id, inputNode.value);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 rounded font-semibold"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          id={`owner-contact-btn-${prop.id}`}
                          type="button"
                          onClick={() => handleRequestOwnerContact(prop.id)}
                          className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-colors"
                        >
                          Show Direct Owner Contact
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Rental E-Agreement Creator (NoBroker Style) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Agreement Form & Signage Pad */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div>
                <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-indigo-650" /> Smart Rental Agreements
                </h3>
                <p className="text-xs text-slate-500 mt-1">Draft legally-binding e-stamp rentals with digital ink.</p>
              </div>

              {!generatedAgreement ? (
                <form id="e-agreement-form" onSubmit={handleGenerateAgreementSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Landlord / Owner Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suhasini Mehta"
                      value={agreementOwner}
                      onChange={(e) => setAgreementOwner(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Tenant Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashok Kumar"
                      value={agreementTenant}
                      onChange={(e) => setAgreementTenant(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Monthly Rent Charge (₹)</label>
                      <input
                        type="number"
                        required
                        value={agreementRent}
                        onChange={(e) => setAgreementRent(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        required
                        value={agreementDeposit}
                        onChange={(e) => setAgreementDeposit(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Draft Property Address</label>
                    <div className="relative">
                      <select
                        value={agreementProperty}
                        onChange={(e) => setAgreementProperty(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 appearance-none"
                      >
                        <option value="">Select listed estate address...</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.location}>{p.title} - {p.subLocality}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">Duration (Months)</label>
                      <select 
                        value={agreementDuration}
                        onChange={(e) => setAgreementDuration(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      >
                        <option value="11">11 Months Standard</option>
                        <option value="24">2 year Lease</option>
                        <option value="36">3 year Lease</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        id="generate-draft-btn"
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-4 h-4" /> Draft Document
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Render simulated Hyderabad Stamp Paper layout */}
                  <div className="border-4 border-amber-800/20 bg-amber-50/40 p-4 rounded-2xl relative space-y-3 font-serif text-[11px] leading-relaxed text-slate-800 shadow-inner">
                    <div className="text-center pb-2 border-b-2 border-dashed border-amber-800/30">
                      <span className="font-bold uppercase tracking-wider text-amber-900 block text-xs">GOVERNMENT OF TELANGANA</span>
                      <span className="font-mono text-[9px] text-amber-700 block">NON-JUDICIAL LEGAL STAMP PAPER</span>
                      <span className="font-mono text-[9px] text-slate-500 block">STAMP SERIAL NO: {generatedAgreement.stampNo}</span>
                    </div>

                    <p>
                      This Rent Agreement made this <span className="font-bold underline">{generatedAgreement.date}</span> at Hyderabad, AP/Telangana, by and between:
                    </p>
                    <p>
                      <span className="font-bold font-sans">Owner:</span> {generatedAgreement.owner} (hereinafter called the landlord, residing in Hyderabad) of the ONE PART.
                    </p>
                    <p>
                      <span className="font-bold font-sans">Tenant:</span> {generatedAgreement.tenant} of the OTHER PART.
                    </p>
                    <p>
                      The landlord hereby lets and the tenant takes the premises at <span className="underline italic font-sans font-bold">{generatedAgreement.property}</span> for a term of <span className="font-bold">{generatedAgreement.duration} Months</span>.
                    </p>
                    <p>
                      The tenant agrees to pay a monthly rent of <span className="font-bold font-sans">₹{parseInt(generatedAgreement.rent).toLocaleString()}</span> on or before the 5th day of every calendar month, and has deposited <span className="font-bold font-sans">₹{parseInt(generatedAgreement.deposit).toLocaleString()}</span> as interest-free security deposit.
                    </p>

                    {signaturePath && (
                      <div className="pt-2 flex justify-end">
                        <div className="text-right border-t border-slate-300 pt-1">
                          <span className="text-[8px] text-emerald-600 block font-mono font-bold tracking-widest uppercase">E-SIGNED SECURILY</span>
                          <span className="text-[10px] font-sans italic text-slate-600">{generatedAgreement.tenant}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Draw Digital Signature pad */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1"><PenTool className="w-4 h-4 text-emerald-600" /> Apply Tenant Digital Signature</span>
                      <button 
                        id="clear-sig-btn"
                        type="button" 
                        onClick={clearSignature} 
                        className="text-[10px] text-rose-500 hover:underline hover:text-rose-600 flex items-center font-semibold"
                      >
                        Clear Signature
                      </button>
                    </div>

                    <div className="border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden relative">
                      <canvas
                        ref={canvasRef}
                        id="sig-canvas"
                        width={350}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full bg-slate-50 cursor-crosshair h-[100px]"
                      />
                      {!signaturePath && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] text-slate-400 font-mono uppercase tracking-widest text-center">
                          Draw direct e-ink style sign inside here...
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="reset-agreement-btn"
                        type="button"
                        onClick={() => {
                          setGeneratedAgreement(null);
                          setSignaturePath(false);
                        }}
                        className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        Reset Draft
                      </button>
                      <button
                        id="finalize-agreement-btn"
                        type="button"
                        onClick={() => {
                          if (!signaturePath) {
                            triggerToast('Kindly sign on the digital pad before finalization.', 'warning');
                            return;
                          }
                          triggerToast(`Congratulations! Agreement finalized and verified digitally under e-stamp: ${generatedAgreement.stampNo}. Sent to ${generatedAgreement.owner} for counter-stamp.`, 'success');
                        }}
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-xl shadow-md transition-colors"
                      >
                        Verify &amp; Register Agreement
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Packers & Movers Calculator */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-indigo-600" /> Packers &amp; Movers Estimator
                </h3>
                <p className="text-xs text-slate-500 mt-1">Get instant premium moving quotas &amp; professional crew checks.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Household Size</label>
                    <select
                      value={moverBhk}
                      onChange={(e: any) => setMoverBhk(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="1BHK">1 BHK Suite</option>
                      <option value="2BHK">2 BHK Suite</option>
                      <option value="3BHK">3 BHK Penthouse</option>
                      <option value="Penthouse">Ultra Duplex / Villa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-1">Current Floor Level</label>
                    <select
                      value={moverFloor}
                      onChange={(e) => setMoverFloor(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Ground">Ground Floor</option>
                      <option value="1-4th Floor">1st to 4th Floor</option>
                      <option value="5th+ Floor">5th Floor or higher</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 px-3 bg-slate-50 rounded-xl text-xs">
                  <span className="text-slate-700">Service Lift Available in Society?</span>
                  <input
                    type="checkbox"
                    id="elevator-chk"
                    checked={moverElevator}
                    onChange={(e) => setMoverElevator(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setMoverPackType('Standard')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
                      moverPackType === 'Standard'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Standard Pack
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoverPackType('Premium')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all font-medium ${
                      moverPackType === 'Premium'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Premium Bubble-wrap
                  </button>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Estimated cost</span>
                    <span className="text-lg font-bold font-sans flex items-center gap-0.5">
                      <IndianRupee className="w-4 h-4 text-emerald-400" /> {moverEstimate.toLocaleString()}
                    </span>
                  </div>
                  <button
                    id="book-movers-btn"
                    type="button"
                    onClick={() => {
                      setMoverBooked(true);
                      triggerToast(`Movers quote secured! Our verified partner team (Nandan Logistics) will reach on your selected move-in date.`, 'success');
                    }}
                    disabled={moverBooked}
                    className={`text-xs font-semibold py-2 px-4 rounded-xl shadow-md transition-all ${
                      moverBooked 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
                    }`}
                  >
                    {moverBooked ? 'Estimate Shared' : 'Book Guranteed Crew'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: 99ACRES & MAGICBRICKS MARKET HEURISTICS
          ======================================================== */}
      {activeSubTab === 'magicbricks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Micro-Market Analytics Column */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                <ArrowUpDown className="w-5 h-5 text-emerald-600" /> Micro-Market Indices
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time locality evaluation indices from verified capital yields.</p>
            </div>

            <div className="space-y-3">
              {microMarketTrends.map((trend) => (
                <div
                  key={trend.name}
                  onClick={() => setActiveTrendLoc(trend.name)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-xs ${
                    activeTrendLoc === trend.name
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 text-sm">{trend.name}</span>
                    <span className="font-mono text-emerald-600 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> {trend.change}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <div>SqFt cost: <span className="font-mono font-bold text-slate-800">₹{trend.currentPrice}</span></div>
                    <div>Demand index: <span className="font-mono font-bold text-indigo-700">{trend.demandIndex}/10</span></div>
                  </div>

                  {activeTrendLoc === trend.name && (
                    <div className="pt-2 border-t border-dashed border-emerald-200 mt-1 text-[10px] space-y-1 text-slate-650">
                      <div>RERA compliance rate: <span className="font-bold text-slate-800">{trend.reraRatio}</span></div>
                      <div>Active developer listings: <span className="font-bold text-slate-800">{trend.volume}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Property Comparison Column */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-650" /> Side-by-Side Verification Matrix
                  </h3>
                  <p className="text-xs text-slate-500">Select properties to compare price details and society metrics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setComparePropIds(['prop-1', 'prop-2'])}
                  className="text-xs text-emerald-600 font-mono hover:underline flex items-center"
                >
                  Reset Checklist
                </button>
              </div>

              {/* Selector checkboxes */}
              <div className="flex flex-wrap gap-2.5">
                {properties.map((p) => {
                  const selected = comparePropIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleToggleCompareSelection(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight border transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${selected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-350'}`}></span>
                      {p.title.split(' ')[0]}... ({p.subLocality})
                    </button>
                  );
                })}
              </div>

              {/* Grid Column Comparison Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                {comparePropIds.length === 0 ? (
                  <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
                    Please select at least one property matrix from the links above.
                  </div>
                ) : (
                  comparePropIds.map((pId) => {
                    const matched = properties.find(p => p.id === pId);
                    if (!matched) return null;
                    const cStat = getSublocalityCompliance(matched.subLocality);

                    return (
                      <div key={pId} className="border border-slate-150 p-4 rounded-2xl bg-slate-55/30 space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                          <img
                            src={matched.images[0]}
                            alt={matched.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-28 object-cover rounded-xl"
                          />
                          <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-tight">{matched.title}</h4>
                          <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-150 inline-block font-semibold">
                            {matched.subLocality}
                          </span>
                        </div>

                        <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Asset Cost:</span>
                            <span className="font-bold font-sans text-slate-900">
                              ₹{matched.price >= 100000 ? `${(matched.price / 10000000).toFixed(2)} Cr` : `${matched.price.toLocaleString()}/mo`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">RERA License:</span>
                            <span className="font-mono text-emerald-800 font-bold text-[10px]">{cStat.reraNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Water Source:</span>
                            <span className="font-semibold text-slate-800 text-[10px] text-right truncate max-w-[120px]">{cStat.waterSource}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Active Sec Score:</span>
                            <span className="font-bold text-indigo-700">{cStat.safetyIndex}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">BHK / Size:</span>
                            <span className="font-semibold text-slate-800">{matched.bedrooms} BHK | {matched.sizeSqFt} sqft</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectProperty(matched)}
                          className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold py-1.5 rounded-xl transition-all"
                        >
                          View Full Profile
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Locality Quality Reviews Board */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="font-display font-semibold text-base text-slate-900">Locality Reviews Board</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Review Listing */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {reviews.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{item.user}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{item.locality}</span>
                      </div>
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-slate-600 italic leading-relaxed text-[11px]">"{item.comments}"</p>
                      <div className="text-[9px] text-slate-400 font-mono text-right">{item.date}</div>
                    </div>
                  ))}
                </div>

                {/* Review posting form */}
                <form id="review-post-form" onSubmit={handleAddReview} className="bg-slate-50/40 p-4 rounded-2xl border border-slate-150 space-y-3 text-xs">
                  <span className="font-bold text-slate-805 block">Share your real experience</span>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Locality</label>
                    <select
                      value={newReviewLoc}
                      onChange={(e) => setNewReviewLoc(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-250 rounded-xl"
                    >
                      <option value="Gachibowli">Gachibowli</option>
                      <option value="Madhapur">Madhapur</option>
                      <option value="Jubilee Hills">Jubilee Hills</option>
                      <option value="Financial District">Financial District</option>
                      <option value="Kondapur">Kondapur</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Ashok"
                        value={newReviewUser}
                        onChange={(e) => setNewReviewUser(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-xl font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Rating (1-5)</label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-250 rounded-xl"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                        <option value="4">⭐⭐⭐⭐ 4/5</option>
                        <option value="3">⭐⭐⭐ 3/5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Experience Comments</label>
                    <textarea
                      required
                      placeholder="e.g. Excellent park layouts and security gates..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-250 rounded-xl text-slate-900"
                      rows={2}
                    />
                  </div>

                  <button
                    id="submit-review-btn"
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl"
                  >
                    Post Verified Review
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: INTEGRATED SOCIETY SYNC CONTEXT
          ======================================================== */}
      {activeSubTab === 'societysync' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Active Society parameters & RERA audits */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 text-emerald-600" /> Pre-Listing RERA &amp; Society Real-Time Audits
                </h3>
                <p className="text-xs text-slate-500 mt-1">Cross-linked telemetry comparing security logs, bills, and amenities status.</p>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-mono uppercase font-bold">
                Direct Sync
              </span>
            </div>

            {/* Direct localStorage values rendering. If empty, we show elegant preset controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Outlets Status (All Complexes)
                </span>
                
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span>Active Dues Trackers:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {societyBills.length > 0 ? `${societyBills.filter(b => b.status !== 'Paid').length} Unpaid` : '3 Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span>Critical Maintenance Notices:</span>
                    <span className="font-bold text-indigo-700">
                      {societyNotices.length > 0 ? societyNotices.filter((n: any) => n.isUrgent).length : '1 Urgent Notice'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span>Unresolved Complaints Flagged:</span>
                    <span className="font-bold text-amber-700 font-mono">
                      {societyComplaints.length > 0 ? societyComplaints.filter(c => c.status !== 'Resolved').length : '2 Open'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed italic">
                  *This live telemetry matches our "Society Maintenance Hub". If you switch workspaces and post bills, complaints, or notice flags, they sync here in real-time.
                </p>
              </div>

              {/* Verified Society Amenities Audits */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Utility Security &amp; Compliance Checks
                </span>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>RERA Builder Compliance:</span>
                    <span className="font-semibold text-emerald-600">Passed (Certified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fire Safety Certificate:</span>
                    <span className="font-semibold text-emerald-650">Current (Valid till 2028)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borewell Water Table:</span>
                    <span className="font-semibold text-slate-700">Good Status (Pumping)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DG Generator Capacity:</span>
                    <span className="font-semibold text-slate-700">125 kVA (Auto-switchover)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick warning list matching current notice board */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-amber-850 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Active Society Water &amp; Electricity Reminders
              </span>
              <div className="space-y-1 text-amber-900 leading-relaxed text-[11px]">
                {societyNotices.length > 0 ? (
                  societyNotices.map((n: any) => (
                    <div key={n.id} className="flex justify-between">
                      <span>• {n.title}: {n.content.substring(0, 70)}...</span>
                      <span className="font-mono text-[9px] font-bold text-slate-400">{n.date}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <div className="flex justify-between font-medium">
                      <span>• Gachibowli Water Pump Recalibration (Block 2) completed, pressure fully restored.</span>
                      <span className="font-mono text-[9px]">16-JUN</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>• Maintenance Audit remind code set: Penalties will apply on pending dues past standard date.</span>
                      <span className="font-mono text-[9px]">14-JUN</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secure Walk-In Visitor Gateway Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-650 animate-bounce" /> Visitor Walk-In Generator
              </h3>
              <p className="text-xs text-slate-500 mt-1">Visiting a property model directly? Bypass security gate checks instantly.</p>
            </div>

            {!generatedVisitorPass ? (
              <form id="vis-gate-form" onSubmit={handleGenerateWalkInPass} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Visitor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashok Kumar"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitorDate}
                    onChange={(e) => setVisitorDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Select Targeted Property Listed Complex</label>
                  <select
                    value={selectedSocietyPropId}
                    onChange={(e) => setSelectedSocietyPropId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.subLocality})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 mb-0.5">Purpose of Visit</label>
                  <select 
                    value={visitorPurpose}
                    onChange={(e) => setVisitorPurpose(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Property Walk-In View">Property Walk-In View</option>
                    <option value="Direct Owner Negotiation Meeting">Direct Owner Negotiation Meeting</option>
                    <option value="Facility Verification Check">Facility Verification Check</option>
                  </select>
                </div>

                <button
                  id="generate-passcase-btn"
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all"
                >
                  Generate Handheld Security Gatepass
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Gatepass digital card */}
                <div className="border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-emerald-50/40 p-5 rounded-2xl text-xs space-y-3 shadow-md relative">
                  <div className="flex justify-between items-center border-b border-indigo-150 pb-2">
                    <span className="font-bold text-slate-900 text-sm">OurHome Gatepass</span>
                    <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Approved
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Visitor Name</div>
                    <div className="font-bold text-slate-900 text-sm">{generatedVisitorPass.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Gate No</div>
                      <div className="font-semibold text-slate-800">MAIN GATE 01</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Date Valid</div>
                      <div className="font-semibold text-slate-800 font-mono">{generatedVisitorPass.date}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Destination Complex</div>
                    <div className="font-semibold text-slate-800 text-[11px] leading-tight">{generatedVisitorPass.property}</div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3 text-center text-white space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Security Passcode Pin</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono letter-spacing-2 tracking-widest">{generatedVisitorPass.passcode}</span>
                  </div>

                  <div className="text-[9px] text-slate-450 leading-relaxed text-center">
                    Present this passcode or barcode to MyGate or society guard terminal for immediate high-speed access bypass.
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    id="reset-pass-btn"
                    type="button"
                    onClick={() => {
                      setVisitorName('');
                      setGeneratedVisitorPass(null);
                    }}
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 rounded-xl transition-colors"
                  >
                    Issue New Gatepass
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
