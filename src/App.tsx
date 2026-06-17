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
import { AdminPortalView } from './components/AdminPortalView';
import { LiveChatDrawer } from './components/LiveChatDrawer';
import { 
  Building2, Sliders, Bell, User, Clock, Heart, ShieldAlert,
  Menu, X, Sparkles, LayoutDashboard, Compass, Layers, CheckCircle2, ChevronDown,
  MessageSquare
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
  const [activeRole, setActiveRole] = useState<'customer' | 'builder' | 'admin'>('customer');
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
    alert(`Property "${pTitle}" has been verified, approved, and publicized!`);
  };

  const handleRejectProperty = (id: string) => {
    setProperties((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: 'Rejected' } : p)
    );
    const pTitle = properties.find((p) => p.id === id)?.title || id;
    addTelemetryLog(`Admin Flag Reject: Suspended deed validation audit on "${pTitle}" for RERA discrepancy.`);
    alert(`Deed rejected! Warning telemetry sent back to the builder profile regarding "${pTitle}".`);
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
    setActiveTab(tab);
    setShowMobileMenu(false);
    addTelemetryLog(`Navigated View: Switched primary route to "${tab}" panel.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setListingsPreFilters(undefined);
  };

  const handleSwitchRole = (role: 'customer' | 'builder' | 'admin') => {
    setActiveRole(role);
    setSelectedProperty(null);
    if (role === 'customer') {
      setActiveTabState('landing');
    } else if (role === 'builder') {
      setActiveTabState('dashboard');
    } else if (role === 'admin') {
      setActiveTabState('admin');
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
    <div id="ourhome-app-shell" className="min-h-screen bg-slate-50/50 flex flex-col font-sans select-none antialiased">
      
      {/* Dynamic Nav Header Bar */}
      <header id="app-nav-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div 
              id="ourhome-logo-box"
              onClick={() => handleQuickTabSelect('landing')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-neutral-900 tracking-tight block">OurHome</span>
                <span className="text-[9px] font-mono leading-none tracking-widest text-emerald-600 block uppercase font-bold">Hyderabad Portal</span>
              </div>
            </div>

             {/* Desktop Navigation Links (Dynamically isolated by selected user workspace role) */}
            <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5">
              {(activeRole === 'customer'
                ? [
                    { id: 'landing', label: 'Explore Home', icon: Compass },
                    { id: 'listings', label: 'Buy &amp; Rent', icon: Sliders }
                  ]
                : activeRole === 'builder'
                ? [{ id: 'dashboard', label: 'Builder Desk', icon: LayoutDashboard }]
                : [{ id: 'admin', label: 'Admin Hub', icon: ShieldAlert }]
              ).map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id && !selectedProperty;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleQuickTabSelect(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
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
                        handleSwitchRole('customer');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Customer App</span>
                      <span className="text-[8px] px-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-mono uppercase">SWITCH</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        handleSwitchRole('builder');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Builder Console</span>
                      <span className="text-[8px] px-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-sm font-mono uppercase">SWITCH</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        handleSwitchRole('admin');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-between"
                    >
                      <span>Admin Audit Panel</span>
                      <span className="text-[8px] px-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm font-mono uppercase">SWITCH</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdown(false);
                        alert("OurHome Sign-out simulation: Client logged out securely. Re-logged instantly as Demo Administrator.");
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
                className="md:hidden p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        {showMobileMenu && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 py-4 space-y-2 relative z-40 transition-all">
            {(activeRole === 'customer'
              ? [
                  { id: 'landing', label: 'Explore Home' },
                  { id: 'listings', label: 'Buy &amp; Rent' }
                ]
              : activeRole === 'builder'
              ? [{ id: 'dashboard', label: 'Builder Desk' }]
              : [{ id: 'admin', label: 'Admin Hub' }]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleQuickTabSelect(tab.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold ${
                  activeTab === tab.id && !selectedProperty
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
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

            {activeTab === 'admin' && (
              <AdminPortalView
                properties={properties}
                supportRequests={supportRequests}
                onApproveProperty={handleApproveProperty}
                onRejectProperty={handleRejectProperty}
                onResolveSupport={handleResolveSupportTicket}
                eventLogs={eventLogs}
              />
            )}
          </>
        )}
      </main>

      {/* Elegant minimalist footer */}
      <footer id="app-nav-footer" className="bg-slate-100 border-t border-slate-200 text-slate-500 py-10 px-6 font-mono text-[11px] text-center mt-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2 text-emerald-600">
            <Building2 className="w-4 h-4" />
            <span className="font-display font-medium text-xs text-slate-800">OurHome</span>
            <span className="text-slate-300">|</span>
            <span>Estates • Condos • Penthouses</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-slate-500 text-[10px]">
            In strict compliance with TS-RERA (Telangana Real Estate Regulatory Authority) protocols. Secured escrow services engineered with dual key cryptographic certificates.
          </p>
          <p className="text-slate-400 text-[9px] pt-2 border-t border-slate-200">
            &copy; {new Date().getFullYear()} OurHome Hyderabad Dev. All rights reserved. Built client-side with React &amp; Tailwind.
          </p>
        </div>
      </footer>

      {/* Floating Interactive Workspace Switcher (Pivots between separated platform personas) */}
      <div 
        id="workspace-switcher-floating-badge" 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 hover:bg-slate-900 border border-slate-750/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-3 max-w-[92vw] md:max-w-max transition-all animate-fade-in"
      >
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-slate-100 uppercase tracking-widest">Active Workspace:</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[
            { id: 'customer', label: 'Client App 🏡', color: 'hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/35' },
            { id: 'builder', label: 'Builder Console 🏗️', color: 'hover:bg-sky-500/10 text-sky-400 border-sky-500/35' },
            { id: 'admin', label: 'Admin Hub 🛡️', color: 'hover:bg-amber-500/10 text-amber-400 border-amber-500/35' }
          ].map((role) => {
            const isCurrent = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleSwitchRole(role.id as any)}
                className={`text-[10px] font-mono py-1 px-2.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md scale-102 font-sans'
                    : `bg-slate-950/45 border-slate-800 ${role.color}`
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

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

    </div>
  );
}
