/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import { 
  INITIAL_PROPERTIES, INITIAL_APPOINTMENTS, INITIAL_INQUIRIES, 
  INITIAL_SUPPORT_REQUESTS, loadData, saveData 
} from './data';
import { Property, Appointment, Inquiry, SupportRequest, ChatMessage, ChatInvitation, TypingState } from './types';
import { LandingPageView } from './components/LandingPageView';
import { PropertyDetailsView } from './components/PropertyDetailsView';
import { ListingsPageView } from './components/ListingsPageView';
import { BuilderPortalView } from './components/BuilderPortalView';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { MaintenanceManagementView } from './components/MaintenanceManagementView';
import { SuperServicesView } from './components/SuperServicesView';
import { SmartDeciderView } from './components/SmartDeciderView';
import { 
  Building2, Sliders, Bell, User, Clock, Heart, ShieldAlert,
  Menu, X, Sparkles, LayoutDashboard, Compass, Layers, CheckCircle2, ChevronDown,
  MessageSquare, CheckSquare, PlusCircle
} from 'lucide-react';

export default function App() {
  const [, startTransition] = useTransition();

  // Core Persistent States loaded via custom LocalStorage engine helpers
  const [properties, setProperties] = useState<Property[]>(() => 
    loadData('oh_properties', INITIAL_PROPERTIES)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    loadData('oh_appointments', INITIAL_APPOINTMENTS)
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => 
    loadData('oh_inquiries', INITIAL_INQUIRIES)
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(() => 
    loadData('oh_support', INITIAL_SUPPORT_REQUESTS)
  );
  const [savedIds, setSavedIds] = useState<string[]>(() => 
    loadData('oh_saved_ids', ['prop-1', 'prop-4'])
  );
  const [eventLogs, setEventLogs] = useState<string[]>(() => 
    loadData('oh_event_logs', [
      'System initiated on Cloud Run container.',
      'RERA housing state registry loaded (Hyderabad district).',
      'Secure connection synchronized with local indexed database.',
    ])
  );

  // Router States
  const [activeTab, setActiveTabState] = useState<string>('landing'); // 'landing', 'listings', 'dashboard', 'admin'
  const [activeRole, setActiveRole] = useState<'customer' | 'builder' | 'admin' | 'maintenance'>('customer');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Custom Filters pre-passed to Listings page for quick searching
  const [listingsPreFilters, setListingsPreFilters] = useState<{ type?: 'Rent' | 'Buy'; search?: string; subLocality?: string } | undefined>(undefined);

  // Real-Time Chat System States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInvitations, setChatInvitations] = useState<ChatInvitation[]>([]);
  const [chatTypingStates, setChatTypingStates] = useState<TypingState[]>([]);
  const [activeChatPropertyId, setActiveChatPropertyId] = useState<string | null>(null);
  const [activeChatPropertyTitle, setActiveChatPropertyTitle] = useState<string>('');
  const [isChatBoxOpen, setIsChatBoxOpen] = useState<boolean>(false);

  // UI Interactive States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(2);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Dynamic Premium Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    (window as any).triggerOurHomeToast = triggerToast;
    return () => {
      (window as any).triggerOurHomeToast = undefined;
    };
  }, []);

  // Sync to localStorage on raw state changes
  useEffect(() => {
    saveData('oh_properties', properties);
  }, [properties]);

  useEffect(() => {
    saveData('oh_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    saveData('oh_inquiries', inquiries);
  }, [inquiries]);

  useEffect(() => {
    saveData('oh_support', supportRequests);
  }, [supportRequests]);

  useEffect(() => {
    saveData('oh_saved_ids', savedIds);
  }, [savedIds]);

  useEffect(() => {
    saveData('oh_event_logs', eventLogs);
  }, [eventLogs]);

  // Log system telemetry events helper
  const addTelemetryLog = (msg: string) => {
    const stamp = new Date().toLocaleTimeString();
    setEventLogs((prev) => [`[${stamp}] ${msg}`, ...prev.slice(0, 40)]);
  };

  // Real-Time SSE listener connecting to full-stack Express engine
  useEffect(() => {
    console.log("Establishing Real-Time Server SSE channel...");
    const eventSource = new EventSource('/api/chat/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sync') {
          setChatMessages(data.messages || []);
          setChatInvitations(data.invitations || []);
          setChatTypingStates(data.typingStates || []);
        } else if (data.type === 'msg') {
          setChatMessages((prev) => {
            if (prev.some(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        } else if (data.type === 'typing_sync') {
          setChatTypingStates(data.typingStates || []);
        } else if (data.type === 'invite') {
          setChatInvitations((prev) => {
            if (prev.some(i => i.id === data.invitation.id)) return prev;
            return [...prev, data.invitation];
          });
          // Alert user or sync telemetry
          addTelemetryLog(`[Real-Time Event] Online live inquiry room request registered for "${data.invitation.propertyTitle}" by ${data.invitation.customerName}.`);
        }
      } catch (err) {
        console.error("Failed to parse SSE event payload:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Realtime EventSource channel reconnecting...", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleStartLiveChat = async (propertyId: string, propertyTitle: string) => {
    try {
      const customerName = activeRole === 'customer' ? 'Premium Client' : 'Arjun Nandan (Builder)';
      const customerEmail = activeRole === 'customer' ? 'elite.client@hyderabad.in' : 'arjun.nandan@ourhome.com';

      const res = await fetch('/api/chat/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          propertyTitle,
          customerName,
          customerEmail,
        }),
      });

      if (res.ok) {
        setActiveChatPropertyId(propertyId);
        setActiveChatPropertyTitle(propertyTitle);
        setIsChatBoxOpen(true);
        addTelemetryLog(`Connect with Builder: Initiated real-time live chat consultation on "${propertyTitle}".`);
      }
    } catch (e) {
      console.error('Error starting live chat:', e);
    }
  };

  const handleOpenBuilderChat = (propertyId: string, propertyTitle: string) => {
    setActiveChatPropertyId(propertyId);
    setActiveChatPropertyTitle(propertyTitle);
    setIsChatBoxOpen(true);
    addTelemetryLog(`Builder Live Consultation Room: Joined active client chat room for "${propertyTitle}"`);
  };

  const handleSendMessage = async (text: string, attachment?: { name: string; type: 'image' | 'document'; url: string }) => {
    if (!activeChatPropertyId) return;
    try {
      const senderName = activeRole === 'customer' ? 'Premium Client' : 'Arjun Nandan (Builder)';
      
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: activeChatPropertyId,
          sender: activeRole === 'customer' ? 'customer' : 'builder',
          senderName,
          text,
          attachment
        }),
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const handleSendTyping = async (isTyping: boolean) => {
    if (!activeChatPropertyId) return;
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: activeChatPropertyId,
          role: activeRole === 'customer' ? 'customer' : 'builder',
          isTyping,
        }),
      });
    } catch (e) {
      console.warn('Typing state sync warning:', e);
    }
  };

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  };

  // State Event handlers
  const handleToggleSaveProperty = (id: string) => {
    const wasSaved = savedIds.includes(id);
    const propName = properties.find((p) => p.id === id)?.title || 'Property';
    if (wasSaved) {
      setSavedIds(savedIds.filter((item) => item !== id));
      addTelemetryLog(`Unfocused property: "${propName}" removed from favorites.`);
    } else {
      setSavedIds([...savedIds, id]);
      addTelemetryLog(`Bookmarked property: "${propName}" saved in user favorites.`);
    }
  };

  const handleSelectProperty = (property: Property) => {
    // Dynamically increment view count internally
    setProperties((prev) => 
      prev.map((p) => p.id === property.id ? { ...p, views: p.views + 1 } : p)
    );
    setSelectedProperty(property);
    addTelemetryLog(`Browsed details: Opened full profile page for "${property.title}".`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookSiteVisit = (appt: Omit<Appointment, 'id' | 'status'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `appt-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Scheduled',
    };
    setAppointments((prev) => [newAppt, ...prev]);
    setUnreadNotificationCount((prev) => prev + 1);
    addTelemetryLog(`Registered Appointment: ${appt.customerName} scheduled a visit for "${appt.propertyTitle}" on ${appt.date}.`);
  };

  const handleAddPropertySubmit = (newProp: Omit<Property, 'id' | 'views' | 'inquiries' | 'status'>) => {
    const freshProperty: Property = {
      ...newProp,
      id: `prop-${Math.floor(7 + Math.random() * 999)}`,
      views: 70,
      inquiries: 0,
      status: 'Approved', // Auto-approved under Arjun's active account for this client demonstration
    };
    setProperties((prev) => [freshProperty, ...prev]);
    addTelemetryLog(`Listed New Property: "${freshProperty.title}" successfully added by Arjun Nandan inside Gachibowli databases.`);
  };

  const handleRemoveProperty = (id: string) => {
    const titleToRemove = properties.find((p) => p.id === id)?.title || id;
    setProperties((prev) => prev.filter((p) => p.id !== id));
    addTelemetryLog(`Withdrew listing: Removed "${titleToRemove}" from portfolio database references.`);
  };

  const handleApproveProperty = (id: string) => {
    setProperties((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: 'Approved' } : p)
    );
    const pTitle = properties.find((p) => p.id === id)?.title || id;
    addTelemetryLog(`Admin Verified Approved: Checked RERA certificates and set "${pTitle}" to active, broadcast public.`);
    triggerToast(`Property "${pTitle}" has been verified, approved, and publicized!`, 'success');
  };

  const handleRejectProperty = (id: string) => {
    setProperties((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: 'Rejected' } : p)
    );
    const pTitle = properties.find((p) => p.id === id)?.title || id;
    addTelemetryLog(`Admin Flag Reject: Suspended deed validation audit on "${pTitle}" for RERA discrepancy.`);
    triggerToast(`Deed rejected! Warning telemetry sent back to the builder profile regarding "${pTitle}".`, 'warning');
  };

  const handleResolveSupportTicket = (id: string) => {
    setSupportRequests((prev) => 
      prev.map((s) => s.id === id ? { ...s, status: 'Resolved' } : s)
    );
    const sName = supportRequests.find((s) => s.id === id)?.customerName || id;
    addTelemetryLog(`Support Ticket Closed: Resolved support queries sent by ${sName}.`);
  };

  const handleSwitchToClientWithFilter = (propertyTitle: string) => {
    setActiveRole('customer');
    setActiveTabState('listings');
    setListingsPreFilters({ search: propertyTitle });
    setSelectedProperty(null);
    addTelemetryLog(`Preview Action: Swappped view to preview newly listed property "${propertyTitle}" on customer search view.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToListingsWithFilters = (preFilters?: { type?: 'Rent' | 'Buy'; search?: string; subLocality?: string }) => {
    setListingsPreFilters(preFilters);
    setSelectedProperty(null);
    setActiveTab('listings');
    addTelemetryLog(`Filtered Query search: Routing to listings page focusing on target criteria.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTabSelect = (tab: string) => {
    setSelectedProperty(null);
    let targetRole: 'customer' | 'builder' | 'admin' | 'maintenance' = 'customer';
    if (tab === 'dashboard' || tab === 'builder') {
      targetRole = 'builder';
      triggerToast("Welcome to Owner/Builder Desk! Post your Rent or Sale property directly below.", "info");
      setActiveTab('dashboard');
    } else if (tab === 'maintenance') {
      targetRole = 'maintenance';
      triggerToast("Welcome to Society Hub! Syncing maintenance bills and facilities.", "info");
      setActiveTab('maintenance');
    } else {
      setActiveTab(tab);
    }
    
    setActiveRole(targetRole);
    setShowMobileMenu(false);
    addTelemetryLog(`Navigated View: Switched primary tab view to "${tab}" panel.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setListingsPreFilters(undefined);
  };

  const handleSwitchRole = (role: 'customer' | 'builder' | 'admin' | 'maintenance') => {
    setActiveRole(role);
    setSelectedProperty(null);
    if (role === 'customer') {
      setActiveTabState('landing');
    } else if (role === 'builder') {
      setActiveTabState('dashboard');
    } else if (role === 'admin') {
      setActiveTabState('admin');
    } else if (role === 'maintenance') {
      setActiveTabState('maintenance');
    }
    addTelemetryLog(`Switched Workspace: Swapped active workspace viewport context to "${role.toUpperCase()}".`);
  };

  // Sample static notification stack
  const NOTIFICATIONS_STACK = [
    { id: 1, title: 'Appointment Booked', text: 'Anil Kumar scheduled Gachibowli Penthouse visit.', time: '11m ago', isNew: true },
    { id: 2, title: 'Inquiry Received', text: 'Vikram Reddy left pricing logs on Jubilee Hills.', time: '1h ago', isNew: true },
    { id: 3, title: 'Security Pass Checked', text: 'Arjun Nandan securely synchronized telemetry logs.', time: '2h ago', isNew: false }
  ];

  return (
    <div id="ourhome-app-shell" className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-white to-[#e8fbf1] flex flex-col font-sans select-none antialiased">
      
      {/* Dynamic Nav Header Bar */}
      <header id="app-nav-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div 
              id="ourhome-logo-box"
              onClick={() => handleQuickTabSelect('landing')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-emerald-600/10 group-hover:scale-105 ring-2 ring-emerald-100 group-hover:ring-emerald-400/20">
                <Building2 className="w-5.5 h-5.5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tight leading-none text-slate-900 flex items-center gap-1 transition-colors group-hover:text-emerald-700">
                  Our<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 font-extrabold">Home</span>
                  <span className="inline-block w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse self-start mt-0.5"></span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#059669] font-extrabold uppercase leading-none mt-1">
                  Hyderabad Portal
                </span>
              </div>
            </div>

             {/* Desktop Navigation Links (Unified single Client App with all workspace portals) */}
            <nav id="desktop-nav" className="hidden lg:flex items-center gap-1.5">
              {[
                { id: 'landing', label: 'Explore Home', icon: Compass },
                { id: 'listings', label: 'Buy &amp; Rent', icon: Sliders },
                { id: 'decider', label: 'Decision Helper 🎯', icon: CheckSquare },
                { id: 'services', label: 'Super Services ⚡', icon: Sparkles },
                { id: 'dashboard', label: 'Builder Desk 🏗️', icon: LayoutDashboard },
                { id: 'maintenance', label: 'Society Hub 🏢', icon: Building2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id && !selectedProperty;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleQuickTabSelect(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-650/15 scale-102'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> 
                    {/* Render raw HTML labels safely */}
                    <span dangerouslySetInnerHTML={{ __html: tab.label }} />
                  </button>
                );
              })}
            </nav>

            {/* Practical Top-Right Interactive Utilities */}
            <div id="nav-utilities" className="flex items-center gap-3">
              
              {/* Dynamic Notification Hub */}
              <div className="relative">
                <button
                  id="notif-bell-btn"
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setUnreadNotificationCount(0);
                    setProfileDropdown(false);
                  }}
                  className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
                    showNotifications 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                      : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white animate-bounce">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown HUD overlay */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-scale-in">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
                      <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Alerts Registry</span>
                      <button 
                        type="button" 
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {NOTIFICATIONS_STACK.map((notif) => (
                        <div key={notif.id} className="py-2.5 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h4 className={`font-semibold ${notif.isNew ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[9px] font-mono text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-slate-500 leading-relaxed text-[11px]">{notif.text}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="w-full bg-slate-50 py-1.5 text-center text-[10px] font-mono text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      Dismiss Window
                    </button>
                  </div>
                )}
              </div>

              {/* Saved Properties count tag */}
              <button
                type="button"
                onClick={() => handleQuickTabSelect('listings')}
                className="hidden md:flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100 py-1.5 px-3 rounded-xl text-xs font-semibold shadow-xs"
                title="View saved properties"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Saved ({savedIds.length})</span>
              </button>

              {/* Post Your Property helper badge */}
              {activeRole === 'customer' && (
                <button
                  type="button"
                  onClick={() => handleQuickTabSelect('builder')}
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:opacity-95 py-1.5 px-3 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all border border-emerald-500/25 shrink-0"
                  title="List your rent or sale house with zero brokerage fees"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Property</span>
                  <span className="bg-emerald-500 text-[8px] font-bold px-1 py-0.2 rounded-sm text-white shrink-0 font-mono">0% FEE</span>
                </button>
              )}

              {/* Mini User Profile dropdown switcher */}
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  type="button"
                  onClick={() => {
                    setProfileDropdown(!profileDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 p-1 bg-emerald-50 text-emerald-800 rounded-full hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                      alt="User profile"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown className="w-3 h-3 text-emerald-600 mr-1.5 hidden sm:block" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2.5 w-52 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-scale-in">
                    <div className="px-3.5 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">Arjun Nandan</p>
                      <p className="text-[9px] font-mono text-slate-400">arjun@ourhome.com</p>
                      <span className="inline-block mt-1 text-[8px] font-bold font-mono bg-emerald-50 border border-emerald-100 text-emerald-700 py-0.5 px-1.5 rounded-sm uppercase">PRO BUILDER</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        handleQuickTabSelect('listings');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Explore Buy &amp; Rent</span>
                      <span className="text-[8px] px-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-mono uppercase">Go</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        handleQuickTabSelect('dashboard');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Post / Edit Listings</span>
                      <span className="text-[8px] px-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-sm font-mono uppercase">Go</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        handleQuickTabSelect('maintenance');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Society Maintenance</span>
                      <span className="text-[8px] px-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-sm font-mono uppercase font-bold">Go</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        triggerToast("OurHome Sign-out simulation: Client logged out securely. Feel free to re-login to explore listing analytics.", "info");
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                    >
                      Log out Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu trigger */}
              <button
                id="mobile-menu-trigger"
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden border-b border-slate-200 bg-white/95 px-4 py-4 space-y-2 relative z-40 transition-all">
            {[
              { id: 'landing', label: 'Explore Home' },
              { id: 'listings', label: 'Buy &amp; Rent' },
              { id: 'decider', label: 'Decision Helper 🎯' },
              { id: 'services', label: 'Super Services ⚡' },
              { id: 'dashboard', label: 'Builder Desk 🏗️' },
              { id: 'maintenance', label: 'Society Hub 🏢' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleQuickTabSelect(tab.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold ${
                  activeTab === tab.id && !selectedProperty
                    ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
                dangerouslySetInnerHTML={{ __html: tab.label }}
              />
            ))}
            <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-500 font-bold uppercase">Saved ({savedIds.length}) Elements</span>
              <button
                type="button"
                onClick={() => handleQuickTabSelect('listings')}
                className="text-xs text-emerald-600 font-bold underline"
              >
                Explore Bookmarks List
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout containing routed components */}
      <main id="app-main-canvas" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Detail view override takes precedence - allows immersive modular routing flow */}
        {selectedProperty ? (
          <PropertyDetailsView
            property={selectedProperty}
            onBack={() => {
              setSelectedProperty(null);
              addTelemetryLog("Withdrew inspected profile. Returned back to listings index.");
            }}
            onBookAppointment={handleBookSiteVisit}
            savedIds={savedIds}
            onToggleSave={handleToggleSaveProperty}
            onStartLiveChat={handleStartLiveChat}
          />
        ) : (
          /* Normal Tab routers */
          <>
            {activeTab === 'landing' && (
              <LandingPageView
                properties={properties}
                onSelectProperty={handleSelectProperty}
                onNavigateToListings={handleNavigateToListingsWithFilters}
                onNavigateToTab={handleQuickTabSelect}
                savedIds={savedIds}
                onToggleSave={handleToggleSaveProperty}
              />
            )}

            {activeTab === 'listings' && (
              <ListingsPageView
                properties={properties}
                onSelectProperty={handleSelectProperty}
                initialFilters={listingsPreFilters}
                savedIds={savedIds}
                onToggleSave={handleToggleSaveProperty}
              />
            )}

            {activeTab === 'services' && (
              <SuperServicesView
                properties={properties}
                onNavigateToListings={handleNavigateToListingsWithFilters}
                onSelectProperty={handleSelectProperty}
                savedIds={savedIds}
              />
            )}

            {activeTab === 'decider' && (
              <SmartDeciderView
                properties={properties}
                onSelectProperty={handleSelectProperty}
                onNavigateToListings={handleNavigateToListingsWithFilters}
              />
            )}

            {activeTab === 'dashboard' && (
              <BuilderPortalView
                properties={properties}
                appointments={appointments}
                inquiries={inquiries}
                onAddProperty={handleAddPropertySubmit}
                onRemoveProperty={handleRemoveProperty}
                chatInvitations={chatInvitations}
                chatMessages={chatMessages}
                chatTypingStates={chatTypingStates}
                onOpenChat={handleOpenBuilderChat}
                onSwitchToClientWithFilter={handleSwitchToClientWithFilter}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceManagementView />
            )}
          </>
        )}
      </main>

      {/* Elegant minimalist footer */}
      <footer id="app-nav-footer" className="bg-slate-100 border-t border-slate-200 text-slate-500 py-10 px-6 font-mono text-[11px] text-center mt-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-extrabold text-sm text-slate-900 tracking-tight">
              Our<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Home</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-bold text-[10px] tracking-tight">Estates &bull; Condos &bull; Penthouses</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-slate-500 text-[10px]">
            In strict compliance with TS-RERA (Telangana Real Estate Regulatory Authority) protocols. Secured escrow services engineered with dual key cryptographic certificates.
          </p>
          <p className="text-slate-400 text-[9px] pt-2 border-t border-slate-200">
            &copy; {new Date().getFullYear()} OurHome Hyderabad Dev. All rights reserved. Built client-side with React &amp; Tailwind.
          </p>
        </div>
      </footer>

      {/* Render the unified instant real-time chat cabinet component */}
      <LiveChatDrawer
        isOpen={isChatBoxOpen}
        onClose={() => {
          setIsChatBoxOpen(false);
          setActiveChatPropertyId(null);
        }}
        currentUserRole={activeRole === 'customer' ? 'customer' : 'builder'}
        currentUserName={activeRole === 'customer' ? 'Premium Client' : 'Arjun Nandan (Builder)'}
        propertyId={activeChatPropertyId || ''}
        propertyTitle={activeChatPropertyTitle}
        messages={chatMessages}
        typingStates={chatTypingStates}
        onSendMessage={handleSendMessage}
        onSendTyping={handleSendTyping}
      />

      {/* Floating high-fidelity premium Toast notifications panel */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-4 sm:right-6 z-[9999] w-full max-w-sm pointer-events-none flex flex-col gap-2.5 px-4 animate-fade-in">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            
            return (
              <div
                key={toast.id}
                className="pointer-events-auto bg-slate-900/95 text-white border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex gap-3 items-start transition-all duration-300 max-w-full"
                style={{
                  boxShadow: '0 12px 32px -4px rgba(16, 185, 129, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  isError ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                  {isError && <ShieldAlert className="w-4 h-4" />}
                  {isWarning && <ShieldAlert className="w-4 h-4" />}
                  {toast.type === 'info' && <Sparkles className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    {toast.type === 'success' ? 'Task Finalized' : toast.type === 'error' ? 'Security Alert' : 'System Information'}
                  </span>
                  <p className="text-xs font-semibold text-slate-100 leading-normal">{toast.message}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
