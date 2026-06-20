import React, { useState, useMemo } from 'react';
import { Inquiry, Property } from '../types';
import { 
  Compass, Search, Filter, MessageSquare, AlertCircle, Trash2, 
  Clock, CheckCircle2, ChevronRight, PlusCircle, Send, Heart,
  Activity, ArrowRight, ClipboardList, HelpCircle, Key, UserCheck, PhoneCall, X
} from 'lucide-react';

interface CustomerDashboardViewProps {
  inquiries: Inquiry[];
  properties: Property[];
  onAddInquiry: (inq: Omit<Inquiry, 'id' | 'status' | 'date'>) => void;
  onRemoveInquiry: (id: string) => void;
  onUpdateInquiryStatus?: (id: string, newStatus: Inquiry['status']) => void;
  onSelectProperty?: (property: Property) => void;
  triggerToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  inquiries,
  properties,
  onAddInquiry,
  onRemoveInquiry,
  onUpdateInquiryStatus,
  onSelectProperty,
  triggerToast = (msg, type?: 'success' | 'info' | 'warning' | 'error') => { console.log(msg, type); },
}) => {
  // Filters and search states
  const [inquirySearch, setInquirySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Inquiry['status']>('All');

  // Submit new inquiry form states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState('');
  const [contactName, setContactName] = useState('Premium Client');
  const [contactEmail, setContactEmail] = useState('elite.client@hyderabad.in');
  const [contactPhone, setContactPhone] = useState('+91 91000 12345');
  const [customMsg, setCustomMsg] = useState('');

  // Follow-up notes/simulation state
  const [followUpMsgs, setFollowUpMsgs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');

  // Load properties pool for the selector dropdown
  const activeProperties = useMemo(() => {
    return properties.filter(p => p.status === 'Approved');
  }, [properties]);

  // Handle follow up send
  const handleSendFollowUp = (inquiryId: string) => {
    const text = followUpMsgs[inquiryId];
    if (!text || !text.trim()) return;

    triggerToast(`Follow-up instructions successfully appended to Inquiry Registry #${inquiryId.toUpperCase()}`, 'success');
    setFollowUpMsgs(prev => ({ ...prev, [inquiryId]: '' }));

    // Simulating moving the progress dynamically!
    if (onUpdateInquiryStatus) {
      onUpdateInquiryStatus(inquiryId, 'Under Review');
    }
  };

  // Submit Inquiry handler
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropId) {
      triggerToast('Please select a target property from the active registry.', 'error');
      return;
    }
    if (!customMsg.trim()) {
      triggerToast('Inquiry message container cannot be blank.', 'error');
      return;
    }

    const matchedProp = properties.find(p => p.id === selectedPropId);
    if (!matchedProp) return;

    onAddInquiry({
      propertyId: selectedPropId,
      propertyTitle: matchedProp.title,
      customerName: contactName,
      customerEmail: contactEmail,
      customerPhone: contactPhone,
      message: customMsg,
    });

    setSelectedPropId('');
    setCustomMsg('');
    setShowSubmitModal(false);
    triggerToast(`Corporate inquiry registered on ${matchedProp.title}! Stream synchronized with RERA core ledger.`, 'success');
  };

  // Filter inquiry list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Filter by Search Query (Property title / message content)
      const matchesSearch = inq.propertyTitle.toLowerCase().includes(inquirySearch.toLowerCase()) || 
                            inq.message.toLowerCase().includes(inquirySearch.toLowerCase());
      
      // Filter by Status Group
      const matchesStatus = statusFilter === 'All' ? true : inq.status === statusFilter;

      // Filter by Quick tabs (active vs completed)
      let matchesTab = true;
      if (activeTab === 'active') {
        matchesTab = inq.status !== 'Answered';
      } else if (activeTab === 'resolved') {
        matchesTab = inq.status === 'Answered';
      }

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [inquiries, inquirySearch, statusFilter, activeTab]);

  // Statistics calculation
  const stats = useMemo(() => {
    const counts = {
      total: inquiries.length,
      received: inquiries.filter(i => i.status === 'Received').length,
      underReview: inquiries.filter(i => i.status === 'Under Review').length,
      contacted: inquiries.filter(i => i.status === 'Contacted').length,
      answered: inquiries.filter(i => i.status === 'Answered').length,
    };
    return counts;
  }, [inquiries]);

  // Helper for status badge color matching
  const getStatusBadgeStyles = (status: Inquiry['status']) => {
    switch (status) {
      case 'Received':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Contacted':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Answered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Status index for timeline representation
  const getStatusStepIndex = (status: Inquiry['status']) => {
    switch (status) {
      case 'Received': return 0;
      case 'Under Review': return 1;
      case 'Contacted': return 2;
      case 'Answered': return 3;
      default: return 0;
    }
  };

  return (
    <div id="customer-dashboard-container" className="space-y-8 pb-12 animate-fade-in text-slate-800">
      
      {/* Upper Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/65 p-6 rounded-3xl border border-slate-100 backdrop-blur-md shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wider rounded-full border border-emerald-200 uppercase">
            <Activity className="w-3.5 h-3.5 text-emerald-600" /> Live Status Feed
          </div>
          <h2 className="font-display text-2xl font-black text-slate-950 tracking-tight">
            Client Inquiry Status Tracker
          </h2>
          <p className="text-slate-500 text-xs">
            Monitor state updates, coordinate feedback, and track active regulatory files on your property transactions.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-605 to-sky-600 bg-emerald-700 hover:opacity-95 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch New Property Inquiry</span>
          </button>
        </div>
      </div>

      {/* Numerical Pipeline Summary Tracker Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-widest font-black">All Inquiries</span>
            <ClipboardList className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono">{stats.total}</span>
            <span className="text-[9px] text-zinc-400 font-mono">active filings</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold">1. Received</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-950">{stats.received}</span>
            <span className="text-[9px] text-amber-600 font-bold font-mono">Awaiting Review</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div 
              className="bg-amber-400 h-1 rounded-full transition-all duration-500" 
              style={{ width: stats.total ? `${(stats.received / stats.total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold">2. Under Review</span>
            <HelpCircle className="w-4 h-4 text-indigo-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-950">{stats.underReview}</span>
            <span className="text-[9px] text-indigo-600 font-bold font-mono">On Builder Desk</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div 
              className="bg-indigo-500 h-1 rounded-full transition-all duration-500" 
              style={{ width: stats.total ? `${(stats.underReview / stats.total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold">3. Contacted</span>
            <PhoneCall className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-950">{stats.contacted}</span>
            <span className="text-[9px] text-sky-600 font-bold font-mono">Outreach Booked</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div 
              className="bg-sky-500 h-1 rounded-full transition-all duration-500" 
              style={{ width: stats.total ? `${(stats.contacted / stats.total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold">4. Answered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-950">{stats.answered}</span>
            <span className="text-[9px] text-emerald-600 font-bold font-mono">Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div 
              className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
              style={{ width: stats.total ? `${(stats.answered / stats.total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

      </div>

      {/* Main Grid: Filters & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Dynamic Query Filters Panel */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-205/60 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Local Search Logs</span>
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-4">
            
            {/* Find in Titles */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Keyword Filter</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Skyline Oasis..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans outline-none focus:border-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Status Filter buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Filter By State</label>
              <div className="flex flex-col gap-1.5 font-mono text-[10px] font-bold">
                {[
                  { value: 'All', label: '🗂️ All Statuses' },
                  { value: 'Received', label: '⏳ Received (Fresh)' },
                  { value: 'Under Review', label: '📝 Under Review' },
                  { value: 'Contacted', label: '📞 Contacted Ready' },
                  { value: 'Answered', label: '✅ Answered Files' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                      statusFilter === item.value 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-150 text-slate-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    {statusFilter === item.value && <ChevronRight className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope tabs */}
            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Filing Category</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-mono font-bold text-center">
                {(['all', 'active', 'resolved'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 rounded-lg capitalize transition-colors ${
                      activeTab === tab 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Render Status Tracker Feed Card List */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">
              Displaying {filteredInquiries.length} filed records
            </p>
            {inquirySearch && (
              <button
                type="button"
                onClick={() => { setInquirySearch(''); setStatusFilter('All'); }}
                className="text-[10px] text-emerald-600 font-mono hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-150 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-900">No matching inquiries found</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Try tweaking your search keywords or setting the filter back to 'All Statuses' to reveal active records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setInquirySearch(''); setStatusFilter('All'); setActiveTab('all'); }}
                className="px-4 py-2 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inq) => {
                const stepIndex = getStatusStepIndex(inq.status);
                
                return (
                  <div 
                    key={inq.id} 
                    id={`inquiry-card-${inq.id}`}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 hover:border-slate-350 transition-all duration-200"
                  >
                    
                    {/* Inquiry Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            ID: {inq.id.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Filed on {inq.date}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1">
                          {inq.propertyTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${getStatusBadgeStyles(inq.status)}`}>
                          ● {inq.status}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to withdraw this active inquiry from the system registry?")) {
                              onRemoveInquiry(inq.id);
                              triggerToast(`Inquiry #${inq.id.toUpperCase()} successfully withdrawn.`, 'warning');
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                          title="Withdraw Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inquiry Message text block */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans space-y-1 relative">
                      <span className="text-[9px] text-slate-400 font-mono block font-bold uppercase">Original Message:</span>
                      <p>"{inq.message}"</p>
                    </div>

                    {/* Dynamic Status Progress Timeline Component */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Filing Progress Feed
                      </span>
                      
                      <div className="relative pt-1">
                        
                        {/* Horizontal connecting background track line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 -z-0">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-indigo-400 to-sky-400 transition-all duration-700"
                            style={{ 
                              width: stepIndex === 0 ? '0%' : 
                                     stepIndex === 1 ? '33%' : 
                                     stepIndex === 2 ? '66%' : '100%' 
                            }}
                          ></div>
                        </div>

                        {/* Four Progress Milestones */}
                        <div className="grid grid-cols-4 relative z-10 font-mono text-[9.5px]">
                          
                          {/* Item 1: Received */}
                          <div className="flex flex-col items-center text-center space-y-1.5 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              stepIndex >= 0 
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100' 
                                : 'bg-white border border-slate-200 text-slate-400'
                            }`}>
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className={`font-black ${stepIndex >= 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              1. Received
                            </span>
                            <span className="text-[8px] text-slate-400 block font-normal leading-none">
                              Registry Logged
                            </span>
                          </div>

                          {/* Item 2: Under Review */}
                          <div className="flex flex-col items-center text-center space-y-1.5 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              stepIndex >= 1 
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                                : 'bg-white border border-slate-200 text-slate-400'
                            }`}>
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                            <span className={`font-black ${stepIndex >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                              2. Under Review
                            </span>
                            <span className="text-[8px] text-slate-400 block font-normal leading-none">
                              Builder Assigned
                            </span>
                          </div>

                          {/* Item 3: Contacted */}
                          <div className="flex flex-col items-center text-center space-y-1.5 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              stepIndex >= 2 
                                ? 'bg-sky-500 text-white ring-4 ring-sky-100' 
                                : 'bg-white border border-slate-200 text-slate-400'
                            }`}>
                              <PhoneCall className="w-3.5 h-3.5" />
                            </div>
                            <span className={`font-black ${stepIndex >= 2 ? 'text-sky-600' : 'text-slate-400'}`}>
                              3. Contacted
                            </span>
                            <span className="text-[8px] text-slate-400 block font-normal leading-none">
                              Rep Outreach
                            </span>
                          </div>

                          {/* Item 4: Answered */}
                          <div className="flex flex-col items-center text-center space-y-1.5 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              stepIndex >= 3 
                                ? 'bg-emerald-650 bg-emerald-600 text-white ring-4 ring-emerald-100' 
                                : 'bg-white border border-slate-200 text-slate-400'
                            }`}>
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className={`font-black ${stepIndex >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                              4. Answered
                            </span>
                            <span className="text-[8px] text-slate-400 block font-normal leading-none">
                              Consult Solved
                            </span>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* Interactive simulation controls container */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
                      
                      {/* Left: Auto status simulation helper for the sandbox demo */}
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                        <span className="font-bold">✨ Dev Mode Option:</span>
                        <select
                          value={inq.status}
                          onChange={(e) => {
                            if (onUpdateInquiryStatus) {
                              onUpdateInquiryStatus(inq.id, e.target.value as any);
                              triggerToast(`Updated inquiry #${inq.id.toUpperCase()} progress milestone to "${e.target.value}"`, 'info');
                            }
                          }}
                          className="bg-slate-100/80 border border-slate-250 py-1 px-1.5 rounded-lg font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Received">1. Received</option>
                          <option value="Under Review">2. Under Review</option>
                          <option value="Contacted">3. Contacted</option>
                          <option value="Answered">4. Answered</option>
                        </select>
                      </div>

                      {/* Right: Append Live follow up note form */}
                      <div className="flex gap-2 w-full md:w-auto flex-1 max-w-md justify-end">
                        <input
                          type="text"
                          placeholder="Type an urgent follow-up note (e.g. Call me as soon as possible!)..."
                          value={followUpMsgs[inq.id] || ''}
                          onChange={(e) => setFollowUpMsgs(prev => ({ ...prev, [inq.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendFollowUp(inq.id);
                          }}
                          className="flex-1 max-w-[280px] px-3 py-1.5 bg-slate-55 border border-slate-200 rounded-xl text-neutral-800 outline-none focus:border-sky-500 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendFollowUp(inq.id)}
                          className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Append Note</span>
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* RERA secure transaction disclaimer cards */}
      <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border border-slate-200 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10.5px] text-slate-600 leading-normal">
        <div className="space-y-1">
          <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Authorized Builders ONLY
          </h5>
          <p>Each listings partner is evaluated against TS-RERA licenses prior to publishing matching catalog files.</p>
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Encrypted Escrows active
          </h5>
          <p>We preserve timestamp hashes of your communication files to guarantee immediate brokerage protection.</p>
        </div>
        <div className="space-y-1">
          <h5 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
            <Key className="w-4 h-4 text-emerald-600" /> Double Key Security
          </h5>
          <p>Any status modifications propagate instantly to the builder desk system and trigger telemetry logging alerts.</p>
        </div>
      </div>

      {/* MODAL: Launch new inquiry */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl relative space-y-4 animate-scale-in">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-emerald-600 font-extrabold tracking-widest block">Corporate Filing Room</span>
                <h3 className="text-base font-black text-slate-950 tracking-tight">Launch Direct Property Inquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
              
              {/* Select property */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Select Target Property</label>
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-250 p-2.5 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 font-sans cursor-pointer"
                  required
                >
                  <option value="">-- Choose property from approved registry --</option>
                  {activeProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} - {p.subLocality} (Price: ₹{(p.price / 10000000).toFixed(2)} Cr)</option>
                  ))}
                </select>
              </div>

              {/* Grid Client details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Customer Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-250 p-2 text-xs rounded-xl outline-none focus:border-emerald-500 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Customer Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-250 p-2 text-xs rounded-xl outline-none focus:border-emerald-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Customer Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-250 p-2 text-xs rounded-xl outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Inquiry details text box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Inquiry Message</label>
                <textarea
                  rows={4}
                  placeholder="Ask about floorplan files, bank loan approvals, direct zero brokerage rates..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-250 p-2.5 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 placeholder-slate-400 font-sans resize-none"
                  required
                />
              </div>

              {/* Action ctas */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-xl cursor-pointer"
                >
                  Send Inquiry Now
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
