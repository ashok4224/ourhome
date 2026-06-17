/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Property, SupportRequest } from '../types';
import { 
  ShieldCheck, AlertTriangle, Users, Settings, Activity, 
  MapPin, CheckCircle, XCircle, Clock, Check, RefreshCw
} from 'lucide-react';

interface AdminPortalViewProps {
  properties: Property[];
  supportRequests: SupportRequest[];
  onApproveProperty: (id: string) => void;
  onRejectProperty: (id: string) => void;
  onResolveSupport: (id: string) => void;
  eventLogs: string[];
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  properties,
  supportRequests,
  onApproveProperty,
  onRejectProperty,
  onResolveSupport,
  eventLogs,
}) => {
  // Filters to find properties that require approval queue
  const pendingProperties = useMemo(() => {
    return properties.filter((p) => p.status === 'Pending Approval');
  }, [properties]);

  const approvedPropertiesCount = useMemo(() => {
    return properties.filter((p) => p.status === 'Approved').length;
  }, [properties]);

  // Premium handpicked agent roster
  const AGENT_ROSTER = [
    { name: 'Arjun Nandan', license: 'TS-HP-0081', specialty: 'Financial district / Gachibowli Penthouses', views: '1.2K', status: 'Active' },
    { name: 'Suhasini Mehta', license: 'TS-HP-0044', specialty: 'Jubilee Hills Estates / Travertines', views: '980', status: 'Active' },
    { name: 'Rohan Sharma', license: 'TS-HP-0105', specialty: 'Madhapur Smart Condos / High-speed fibers', views: '520', status: 'Active' }
  ];

  return (
    <div id="admin-portal" className="space-y-8 animate-fade-in text-neutral-850">
      {/* Dynamic Header console with platform stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-950">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 py-0.5 px-2 bg-rose-500/10 text-rose-300 text-[10px] uppercase font-mono tracking-wider rounded-md border border-rose-500/20">
            <Settings className="w-3.5 h-3.5" /> SECURE ROOT ACCESS
          </div>
          <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">
            OurHome Control Center
          </h1>
          <p className="text-xs text-zinc-400">
            Platform Health: <span className="text-emerald-400 font-bold">● Operational (100% SLA)</span> • Security Protocol Active
          </p>
        </div>

        {/* Sync loading effect indicator */}
        <div className="flex gap-2 items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-zinc-400 shrink-0">
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>Real-time DB Sync Active</span>
        </div>
      </div>

      {/* Main Admin Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT 1 */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Pending Approvals</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-900">{pendingProperties.length}</p>
            <span className={`text-[10px] font-mono font-bold py-0.5 px-1.5 rounded-md ${
              pendingProperties.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-400'
            }`}>
              {pendingProperties.length > 0 ? 'Urgent Queue' : 'Empty'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400">Newly listed elements awaiting audit</p>
        </div>

        {/* STAT 2 */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Active Approved</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-900">{approvedPropertiesCount}</p>
            <span className="text-xs font-semibold text-emerald-600">On Air</span>
          </div>
          <p className="text-[10px] text-zinc-400">Vetted assets broadcasting locally</p>
        </div>

        {/* STAT 3 */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Registered Agents</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-900">3</p>
            <span className="text-xs font-semibold text-zinc-500">Licensed</span>
          </div>
          <p className="text-[10px] text-zinc-400">Elite verified Hyderabad brokers</p>
        </div>

        {/* STAT 4 */}
        <div className="bg-white border p-5 rounded-2xl space-y-1 shadow-xs font-mono">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Incident Tickets</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-neutral-900">
              {supportRequests.filter((s) => s.status === 'Open').length}
            </p>
            <span className="text-xs font-semibold text-rose-600">Open</span>
          </div>
          <p className="text-[10px] text-zinc-400">RERA or custom builder assistance inquiries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Column 1: Approval Queue & Support Tickets */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: Property Approvals Queue */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-neutral-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Property Listings Approval Queue
            </h3>

            {pendingProperties.length === 0 ? (
              <div className="p-8 bg-neutral-50/50 rounded-2xl text-center border border-dashed border-neutral-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-850">All Clear! No Pending Approvals</p>
                <p className="text-[10px] text-neutral-400 mt-1">Platform automatically indexed all verified title deeds.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProperties.map((p) => (
                  <div
                    id={`approval-queue-card-${p.id}`}
                    key={p.id}
                    className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs space-y-4 hover:border-indigo-400 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-neutral-900 text-sm truncate leading-snug">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          Location: <span className="text-neutral-700">{p.location}</span>
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 mt-1">
                          Price Check: <span className="font-semibold text-neutral-700">₹{p.price.toLocaleString('en-IN')}</span> • {p.bedrooms} BHK • Submitted by <span className="font-semibold text-indigo-600">{p.agent.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg leading-relaxed text-[11px]">
                      <span className="font-bold text-neutral-850 font-mono text-[9px] uppercase tracking-wider block mb-1">BUILDER EXPLANATION NOTE</span>
                      {p.description.slice(0, 160)}...
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
                      <span className="text-[10px] font-mono text-amber-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Owner Deed Audit
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onRejectProperty(p.id)}
                          className="flex items-center gap-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 rounded-xl font-mono text-[10px] font-bold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject / Flag
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveProperty(p.id)}
                          className="flex items-center gap-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-mono text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Verify &amp; Live Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Support Tickets Ledger */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-neutral-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Platform Trouble Support Tickets
            </h3>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
              <div className="divide-y divide-neutral-100">
                {supportRequests.map((ticket) => (
                  <div key={ticket.id} className="p-4 flex flex-col md:flex-row justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-neutral-900">
                        <span className="font-semibold text-sm">{ticket.customerName}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 rounded-full ${
                          ticket.status === 'Open' ? 'bg-rose-50 text-rose-600' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400">Email: {ticket.email} • Dated {ticket.date}</p>
                      <p className="text-zinc-600 leading-relaxed text-[11px] mt-1 p-2 bg-neutral-50 rounded-lg">{ticket.message}</p>
                    </div>
                    {ticket.status === 'Open' && (
                      <div className="shrink-0 self-start md:self-auto text-right">
                        <button
                          type="button"
                          onClick={() => onResolveSupport(ticket.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-[10px] font-bold text-neutral-800 cursor-pointer"
                        >
                          <Check className="w-3 h-3 text-emerald-600" /> Resolve Ticket
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Platform Event Logs & Verified Agent Directory */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Platform Event logs tracker */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4 text-white">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400">
              <Activity className="w-5 h-5 animate-pulse" /> Live System Telemetry Events
            </h3>
            <div className="font-mono text-[10px] bg-black/40 p-3 rounded-xl max-h-56 overflow-y-auto space-y-2 border border-slate-900">
              {eventLogs.map((log, idx) => (
                <p key={idx} className="leading-relaxed text-zinc-400 flex items-start gap-1">
                  <span className="text-indigo-400 font-bold shrink-0">&gt;</span> 
                  <span>{log}</span>
                </p>
              ))}
            </div>
            <p className="text-[9px] font-mono text-zinc-500 leading-normal">
              Simulating cloud container operations. Events index user actions and persist state parameters safely across demo operations.
            </p>
          </div>

          {/* Active Verified Agent directory router */}
          <div className="bg-white border p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="font-display text-base font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-400" /> Verified Agent Directory
            </h3>
            <p className="text-xs text-neutral-400 leading-normal">These brokers operate core listings with physical title verification SLA schedules.</p>
            
            <div className="divide-y divide-neutral-100">
              {AGENT_ROSTER.map((agent, index) => (
                <div key={index} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <p className="font-sans font-bold text-neutral-900">{agent.name}</p>
                    <p className="text-[10px] text-zinc-400">License: {agent.license}</p>
                    <p className="text-[9px] text-neutral-500 font-sans leading-tight italic">{agent.specialty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] py-0.5 px-1.5 rounded-md font-bold uppercase">Active</span>
                    <p className="text-[10px] text-zinc-400 mt-1">SLA: {agent.views}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
