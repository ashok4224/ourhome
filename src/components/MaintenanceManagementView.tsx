import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, CheckCircle2, AlertCircle, Wrench, 
  ShieldCheck, FileText, Sparkles, Plus, Search, Edit3, Trash2, 
  Eye, Bell, Calendar, IndianRupee, Activity, Star, Download, 
  QrCode, Moon, Sun, ArrowUpRight, ArrowDownRight, MessageSquare, 
  Filter, PlusCircle, Clock, ShoppingCart, Check, AlertTriangle, ChevronRight
} from 'lucide-react';

// Interfaces for Maintenance Management
export interface Resident {
  id: string;
  flatNumber: string;
  ownerName: string;
  tenantName: string | null;
  phone: string;
  email: string;
  familyMembers: number;
  vehicleDetails: string;
  moveInDate: string;
  occupancyStatus: 'Occupied' | 'Vacant';
  flatType: '2BHK' | '3BHK' | 'Penthouse';
}

export interface MaintenanceBill {
  id: string;
  flatNumber: string;
  billingMonth: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  lateFee: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  receiptNo?: string;
}

export interface Complaint {
  id: string;
  flatNumber: string;
  category: 'Plumbing' | 'Electrical' | 'Lift' | 'Security' | 'Cleaning' | 'Water Supply' | 'Parking';
  title: string;
  description: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  photoUrl?: string;
  rating?: number;
  comments: { sender: string; text: string; date: string }[];
  dateCreated: string;
}

export interface Expense {
  id: string;
  category: 'Security' | 'Cleaning' | 'Water Tankers' | 'Lift Maintenance' | 'Generator' | 'Electricity' | 'Repairs';
  amount: number;
  description: string;
  date: string;
  invoiceUrl?: string;
  vendorName: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  type: 'Electrician' | 'Plumber' | 'Water Tanker' | 'Security Agency' | 'Housekeeping' | 'Lift Vendor';
  rating: number;
  costHistory: { job: string; cost: number; date: string }[];
}

export interface SocietyAsset {
  id: string;
  name: string;
  amcExpiry: string;
  nextService: string;
  warrantyExpiry: string;
  status: 'Operational' | 'Requires Service' | 'Under Maintenance';
  serviceHistory: { date: string; description: string; cost: number }[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'Announcement' | 'Water Shutdown' | 'Maintenance Reminder' | 'Emergency Alert';
  date: string;
  isUrgent: boolean;
}

export function MaintenanceManagementView() {
  // Graceful visual toast triggered if registered, falls back to native alert
  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    if ((window as any).triggerOurHomeToast) {
      (window as any).triggerOurHomeToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // Theme States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ohm_maint_darkMode');
    return saved === 'true';
  });

  // Active Role Switcher: 'admin' (Society Admin/Secretary), 'resident' (Flat 202), 'vendor' (Water Tanker Service)
  const [activeRole, setActiveRole] = useState<'admin' | 'resident' | 'vendor'>('admin');
  
  // Tab within the Module
  const [activeTab, setActiveTab] = useState<'dashboard' | 'residents' | 'billing' | 'complaints' | 'expenses' | 'vendors' | 'assets' | 'notices' | 'reports' | 'predictions'>('dashboard');

  // Persistence Key Helper
  const getStored = <T,>(key: string, backup: T): T => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : backup;
  };

  // State Declarations & Initial Data Sets (Indian Context)
  const [residents, setResidents] = useState<Resident[]>(() => getStored('ohm_residents', [
    { id: 'res-1', flatNumber: '101', ownerName: 'Rahul Sharma', tenantName: 'Amit Patel', phone: '+91 98765 43210', email: 'rahul.s@ourhome.in', familyMembers: 4, vehicleDetails: 'TS-09-EA-1234 (SUV)', moveInDate: '2023-01-15', occupancyStatus: 'Occupied', flatType: '2BHK' },
    { id: 'res-2', flatNumber: '202', ownerName: 'Suresh Reddy', tenantName: null, phone: '+91 87654 32109', email: 'suresh.reddy@ourhome.in', familyMembers: 3, vehicleDetails: 'TS-07-HB-5678 (Sedan)', moveInDate: '2022-05-10', occupancyStatus: 'Occupied', flatType: '3BHK' },
    { id: 'res-3', flatNumber: '303', ownerName: 'Priyanka Nair', tenantName: 'Vijay Kumar', phone: '+91 76543 21098', email: 'priyanka@ourhome.in', familyMembers: 2, vehicleDetails: 'TS-08-EF-9012 (2-Wheeler)', moveInDate: '2023-11-01', occupancyStatus: 'Occupied', flatType: '2BHK' },
    { id: 'res-4', flatNumber: '401', ownerName: 'Ananya Gogineni', tenantName: null, phone: '+91 95432 10987', email: 'ananya.g@ourhome.in', familyMembers: 5, vehicleDetails: 'TS-10-AZ-9999 (SUV)', moveInDate: '2021-12-25', occupancyStatus: 'Occupied', flatType: 'Penthouse' },
    { id: 'res-5', flatNumber: '502', ownerName: 'Chandra Shekhar', tenantName: null, phone: '+91 84321 09876', email: 'shekhar.c@ourhome.in', familyMembers: 0, vehicleDetails: 'None', moveInDate: '2024-02-15', occupancyStatus: 'Vacant', flatType: '3BHK' },
  ]));

  const [bills, setBills] = useState<MaintenanceBill[]>(() => getStored('ohm_bills', [
    { id: 'bill-1', flatNumber: '101', billingMonth: 'June 2026', amount: 3000, dueDate: '2026-06-15', paidDate: '2026-06-12', lateFee: 0, status: 'Paid', receiptNo: 'OHM-202606-101' },
    { id: 'bill-2', flatNumber: '202', billingMonth: 'June 2026', amount: 4500, dueDate: '2026-06-15', status: 'Unpaid', lateFee: 150 },
    { id: 'bill-3', flatNumber: '303', billingMonth: 'June 2026', amount: 3000, dueDate: '2026-06-15', paidDate: '2026-06-14', lateFee: 0, status: 'Paid', receiptNo: 'OHM-202606-303' },
    { id: 'bill-4', flatNumber: '401', billingMonth: 'June 2026', amount: 6500, dueDate: '2026-06-15', status: 'Unpaid', lateFee: 200 },
    { id: 'bill-5', flatNumber: '502', billingMonth: 'June 2026', amount: 4500, dueDate: '2026-06-15', status: 'Overdue', lateFee: 300 },
    { id: 'bill-6', flatNumber: '202', billingMonth: 'May 2026', amount: 4500, dueDate: '2026-05-15', paidDate: '2026-05-10', lateFee: 0, status: 'Paid', receiptNo: 'OHM-202605-202' },
  ]));

  const [complaints, setComplaints] = useState<Complaint[]>(() => getStored('ohm_complaints', [
    { id: 'comp-1', flatNumber: '202', category: 'Plumbing', title: 'Major leakage in Master Bathroom', description: 'Water is dripping through the ceiling slab in flat below.', status: 'In Progress', assignedTo: 'Karan Plumber', dateCreated: '2026-06-14', comments: [{ sender: 'Suresh Reddy', text: 'Representative visited but parts are pending.', date: '2026-06-15' }] },
    { id: 'comp-2', flatNumber: '101', category: 'Electrical', title: 'Power fluctuation in kitchen', description: 'Microwave socket sparked twice.', status: 'Open', dateCreated: '2026-06-16', comments: [] },
    { id: 'comp-3', flatNumber: '303', category: 'Lift', title: 'Abnormal noise in Left Passenger Lift', description: 'Jerking slightly between 3rd and 4th floors.', status: 'Resolved', assignedTo: 'Kone Service Engineer', dateCreated: '2026-06-10', rating: 5, comments: [{ sender: 'Admin', text: 'Sensor recalibrated.', date: '2026-06-11' }] },
    { id: 'comp-4', flatNumber: '401', category: 'Water Supply', title: 'Low pressure in taps', description: 'Hardly getting any block level water pressure since yesterday.', status: 'Assigned', assignedTo: 'Sri Sai Tankers Representative', dateCreated: '2026-06-15', comments: [] },
  ]));

  const [expenses, setExpenses] = useState<Expense[]>(() => getStored('ohm_expenses', [
    { id: 'exp-1', category: 'Security', amount: 35000, description: 'Monthly Security Guard paycheck', date: '2026-06-01', vendorName: 'Narayana Security Services' },
    { id: 'exp-2', category: 'Water Tankers', amount: 12000, description: 'Emergency 6 Tankers supply', date: '2026-06-05', vendorName: 'Sri Sai Water Suppliers' },
    { id: 'exp-3', category: 'Lift Maintenance', amount: 8500, description: 'Semi-annual AMC check and lubrication', date: '2026-06-08', vendorName: 'Kone Lifts India Private Ltd' },
    { id: 'exp-4', category: 'Electricity', amount: 18520, description: 'Common area & pump grid electricity bi-monthly bill', date: '2026-06-10', vendorName: 'TSSPDCL Hyderabad' },
  ]));

  const [vendors, setVendors] = useState<Vendor[]>(() => getStored('ohm_vendors', [
    { id: 'v-1', name: 'Narayana Security Services', phone: '+91 99999 88888', type: 'Security Agency', rating: 4.8, costHistory: [{ job: 'Full-time Guards Duty', cost: 35000, date: '2026-06-01' }] },
    { id: 'v-2', name: 'Sri Sai Water Suppliers', phone: '+91 92222 33333', type: 'Water Tanker', rating: 4.5, costHistory: [{ job: 'Extra Summer Water load', cost: 12000, date: '2026-06-05' }] },
    { id: 'v-3', name: 'Kone Lifts India Private Ltd', phone: '+91 95555 66666', type: 'Lift Vendor', rating: 4.9, costHistory: [{ job: 'AMC Inspection Service', cost: 8500, date: '2026-06-08' }] },
    { id: 'v-4', name: 'Karan Plumber & Sanitation', phone: '+91 81111 22222', type: 'Plumber', rating: 4.2, costHistory: [{ job: 'Common Pipeline fix', cost: 4500, date: '2026-05-20' }] },
  ]));

  const [assets, setAssets] = useState<SocietyAsset[]>(() => getStored('ohm_assets', [
    { id: 'ast-1', name: 'Kone Passenger Lift A', amcExpiry: '2027-01-15', nextService: '2026-07-10', warrantyExpiry: '2028-06-01', status: 'Operational', serviceHistory: [{ date: '2026-06-08', description: 'Lubrication and sensor diagnostics', cost: 8500 }] },
    { id: 'ast-2', name: 'Cummins Diesel Generator 125kVA', amcExpiry: '2026-11-20', nextService: '2026-06-25', warrantyExpiry: '2027-11-20', status: 'Requires Service', serviceHistory: [] },
    { id: 'ast-3', name: 'Crompton Water Inflow Pump 15HP', amcExpiry: '2026-09-10', nextService: '2026-06-18', warrantyExpiry: '2026-09-10', status: 'Operational', serviceHistory: [{ date: '2026-03-12', description: 'Coil rewinding', cost: 3400 }] },
    { id: 'ast-4', name: 'SecureEye CCTV Main Entrance Unit & Hub', amcExpiry: '2027-04-10', nextService: '2026-08-01', warrantyExpiry: '2027-04-10', status: 'Operational', serviceHistory: [] },
  ]));

  const [notices, setNotices] = useState<Notice[]>(() => getStored('ohm_notices', [
    { id: 'nt-1', title: 'Scheduled TSSPDCL Grid Shutdown', content: 'There will be a power supply pause on Sunday (June 21st) from 10:00 AM to 02:00 PM for localized substation transformer maintenance. Common solar backup will cover essential elevators and corridor lighting.', category: 'Water Shutdown', date: '2026-06-17', isUrgent: true },
    { id: 'nt-2', title: 'Maintenance Collection Reminder', content: 'Dear residents, June maintenance billing cycle is due on June 15th. Kindly process dues instantly using UPI or NetBanking links within OurHome portal to avoid the nominal ₹150 penalty.', category: 'Maintenance Reminder', date: '2026-06-12', isUrgent: false },
    { id: 'nt-3', title: 'Water Tank Inflow Advisory', content: 'Due to peak summer demands, external water tanker orders are being triggered frequently. Please close wash area values completely when vacant and report block leakages to the Secretary post-haste.', category: 'Emergency Alert', date: '2026-06-15', isUrgent: true },
  ]));

  // Notification Banner States
  const [bellNotifications, setBellNotifications] = useState<{id: string, text: string, time: string, read: boolean}[]>([
    { id: 'n-1', text: 'New complaint raised: Power fluctuation in Flat 101', time: '10m ago', read: false },
    { id: 'n-2', text: 'Resident Suresh Reddy generated Maintenance payment receipt', time: '1h ago', read: false }
  ]);

  // Sync to localstorage
  useEffect(() => { localStorage.setItem('ohm_residents', JSON.stringify(residents)); }, [residents]);
  useEffect(() => { localStorage.setItem('ohm_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('ohm_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('ohm_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('ohm_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('ohm_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('ohm_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('ohm_maint_darkMode', String(darkMode)); }, [darkMode]);

  // UI Modals / Inputs Support State
  const [showAddResident, setShowAddResident] = useState(false);
  const [newResident, setNewResident] = useState<Omit<Resident, 'id'>>({
    flatNumber: '', ownerName: '', tenantName: '', phone: '', email: '', 
    familyMembers: 1, vehicleDetails: '', moveInDate: new Date().toISOString().split('T')[0], 
    occupancyStatus: 'Occupied', flatType: '2BHK'
  });

  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    flatNumber: '202', category: 'Plumbing' as any, title: '', description: ''
  });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Repairs' as any, amount: '', description: '', vendorName: ''
  });

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '', content: '', category: 'Announcement' as any, isUrgent: false
  });

  // Search Queries
  const [resSearch, setResSearch] = useState('');
  const [compFilter, setCompFilter] = useState<string>('All');

  // UPI payment simulator modal
  const [selectedBillForUPI, setSelectedBillForUPI] = useState<MaintenanceBill | null>(null);
  const [showUPISimulator, setShowUPISimulator] = useState(false);
  const [upiProcessing, setUpiProcessing] = useState(false);

  // Auto-generate Bill Wizard State
  const [selectedMonth, setSelectedMonth] = useState('July 2026');

  // Notifications management helper
  const addWebNotification = (text: string) => {
    setBellNotifications(prev => [{ id: `nt-${Date.now()}`, text, time: 'Just now', read: false }, ...prev]);
  };

  // 1. Calculations & Dashboard Metrics
  const totalFlats = residents.length;
  const occupiedFlats = residents.filter(r => r.occupancyStatus === 'Occupied').length;
  const vacantFlats = residents.filter(r => r.occupancyStatus === 'Vacant').length;
  
  const totalMaintenanceDue = bills
    .filter(b => b.billingMonth === 'June 2026')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalCollectedJune = bills
    .filter(b => b.status === 'Paid' && b.billingMonth === 'June 2026')
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingDuesJune = bills
    .filter(b => b.status !== 'Paid' && b.billingMonth === 'June 2026')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalExpensesJune = expenses
    .reduce((sum, e) => sum + e.amount, 0);

  // Helper function to auto calculate rate based on flat type
  const getRateByFlatType = (type: '2BHK' | '3BHK' | 'Penthouse') => {
    if (type === '2BHK') return 3000;
    if (type === '3BHK') return 4500;
    return 6500;
  };

  // Helper to generate monthly dues
  const handleAutoGenerateBills = () => {
    // Check if bills already exist for the selected month to prevent duplicated items
    const monthExists = bills.some(b => b.billingMonth === selectedMonth);
    if (monthExists) {
      triggerToast(`Bills were already generated for ${selectedMonth}!`, 'warning');
      return;
    }

    const newBills: MaintenanceBill[] = residents.map((r) => {
      const amt = getRateByFlatType(r.flatType);
      return {
        id: `bill-${selectedMonth.replace(' ', '')}-${r.flatNumber}-${Math.floor(Math.random() * 900)}`,
        flatNumber: r.flatNumber,
        billingMonth: selectedMonth,
        amount: amt,
        dueDate: '2026-07-15',
        status: 'Unpaid',
        lateFee: 0
      };
    });

    setBills(prev => [...newBills, ...prev]);
    addWebNotification(`Successfully generated ${newBills.length} maintenance bills for ${selectedMonth}! Mobile push notices issued.`);
    triggerToast(`Success! Generated bills for ${newBills.length} flats matching RERA standard classification rates.`, 'success');
  };

  // Actions
  const handleAddResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = `res-${Math.floor(100 + Math.random() * 900)}`;
    const freshResident: Resident = {
      ...newResident,
      id: mockId,
      tenantName: newResident.tenantName ? newResident.tenantName : null
    };
    setResidents(prev => [freshResident, ...prev]);
    addWebNotification(`Resident added: flat ${freshResident.flatNumber} occupied by ${freshResident.ownerName}`);
    setShowAddResident(false);
    // Reset states
    setNewResident({
      flatNumber: '', ownerName: '', tenantName: '', phone: '', email: '', 
      familyMembers: 1, vehicleDetails: '', moveInDate: new Date().toISOString().split('T')[0], 
      occupancyStatus: 'Occupied', flatType: '2BHK'
    });
  };

  const handleAddComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fresh: Complaint = {
      id: `comp-${Math.floor(100 + Math.random() * 900)}`,
      flatNumber: newComplaint.flatNumber,
      category: newComplaint.category,
      title: newComplaint.title,
      description: newComplaint.description,
      status: 'Open',
      dateCreated: new Date().toISOString().split('T')[0],
      comments: []
    };
    setComplaints(prev => [fresh, ...prev]);
    addWebNotification(`Complaint enqueued: "${fresh.title}" under ${fresh.category}`);
    setShowAddComplaint(false);
    setNewComplaint({ flatNumber: '202', category: 'Plumbing', title: '', description: '' });
  };

  const handleUpdateComplaintStatus = (compId: string, action: 'assign' | 'progress' | 'resolve' | 'close') => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== compId) return c;
      if (action === 'assign') {
        const vendorMap = {
          Plumbing: 'Master Karan (Plumber)',
          Electrical: 'Express Wireman (Electrician)',
          Lift: 'Kone AMC Technician',
          Security: 'Narayana Head Supervisor',
          Cleaning: 'Housekeeping Agency Lead',
          'Water Supply': 'Sri Sai Tankers Dispatch',
          Parking: 'Security Watch Guard'
        };
        const vendor = vendorMap[c.category] || 'Unassigned contractor';
        return { ...c, status: 'Assigned', assignedTo: vendor };
      }
      if (action === 'progress') return { ...c, status: 'In Progress' };
      if (action === 'resolve') return { ...c, status: 'Resolved', rating: 5 };
      if (action === 'close') return { ...c, status: 'Closed' };
      return c;
    }));
    addWebNotification(`Complaint ${compId} status processed via integrated workflows.`);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fresh: Expense = {
      id: `exp-${Math.floor(100 + Math.random() * 900)}`,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0],
      vendorName: newExpense.vendorName || 'General Store'
    };
    setExpenses(prev => [fresh, ...prev]);
    addWebNotification(`Accounting Expense Logged: ₹${fresh.amount} is routed under ${fresh.category}`);
    setShowAddExpense(false);
    setNewExpense({ category: 'Repairs', amount: '', description: '', vendorName: '' });
  };

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fresh: Notice = {
      id: `nt-${Math.floor(100 + Math.random() * 900)}`,
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      date: new Date().toISOString().split('T')[0],
      isUrgent: newNotice.isUrgent
    };
    setNotices(prev => [fresh, ...prev]);
    addWebNotification(`Broadcast society notice: "${fresh.title}"`);
    setShowAddNotice(false);
    setNewNotice({ title: '', content: '', category: 'Announcement', isUrgent: false });
  };

  // Direct Marketplace Job Booking Helper
  const handleMarketplaceBook = (service: 'Electrician' | 'Plumber' | 'Water Tanker' | 'Security Agency' | 'Cleaning Service') => {
    const costMap = {
      'Electrician': 400,
      'Plumber': 550,
      'Water Tanker': 1200,
      'Security Agency': 2500,
      'Cleaning Service': 900
    };
    const cost = costMap[service];
    const vendorMap = {
      'Electrician': 'Express Wireman',
      'Plumber': 'Karan Plumber & Sanitation',
      'Water Tanker': 'Sri Sai Water Suppliers',
      'Security Agency': 'Narayana Security Services',
      'Cleaning Service': 'Quick Shine Cleaners'
    };
    const vendor = vendorMap[service];

    // Trigger sequential auto workflow
    // 1. Create task / log expense
    const newExpId = `exp-mkt-${Math.floor(100 + Math.random() * 900)}`;
    const bookExp: Expense = {
      id: newExpId,
      category: service === 'Water Tanker' ? 'Water Tankers' : service === 'Security Agency' ? 'Security' : 'Repairs',
      amount: cost,
      description: `${service} Marketplace Job Booking completed under RERA automated billing`,
      date: new Date().toISOString().split('T')[0],
      vendorName: vendor,
      invoiceUrl: 'system-placeholder-url'
    };
    
    // Simulate updating states
    setExpenses(prev => [bookExp, ...prev]);
    
    // Update vendor rating or logs
    setVendors(prev => prev.map(v => {
      if (v.name === vendor) {
        return {
          ...v,
          costHistory: [{ job: `${service} Order`, cost, date: new Date().toISOString().split('T')[0] }, ...v.costHistory]
        };
      }
      return v;
    }));

    addWebNotification(`Marketplace complete: ${service} dispatched, charged ₹${cost}. Invoice logged.`);
    triggerToast(`Vendor Assigned! Outbound callback triggered for ${vendor}. Maintenance expense has been compiled, invoice uploaded automatically.`, 'success');
  };

  // UPI checkout handler
  const triggerUPIPayment = (bill: MaintenanceBill) => {
    setSelectedBillForUPI(bill);
    setShowUPISimulator(true);
  };

  const executeSimulatedUPI = () => {
    if (!selectedBillForUPI) return;
    setUpiProcessing(true);
    setTimeout(() => {
      const generatedReceipt = `OHM-REC-${Math.floor(100000 + Math.random() * 900000)}`;
      setBills(prev => prev.map(b => {
        if (b.id === selectedBillForUPI.id) {
          return {
            ...b,
            status: 'Paid',
            paidDate: new Date().toISOString().split('T')[0],
            receiptNo: generatedReceipt
          };
        }
        return b;
      }));
      setUpiProcessing(false);
      setShowUPISimulator(false);
      addWebNotification(`UPI Success: Bill worth ₹${selectedBillForUPI.amount} paid by G-Pay node.`);
      triggerToast(`Transaction Authorized! Receipt generated: ${generatedReceipt} saved in local account.`, 'success');
      setSelectedBillForUPI(null);
    }, 2000);
  };

  const handleDownloadReceipt = (bill: MaintenanceBill) => {
    triggerToast(`Receipt downloaded to client file cache. Secure receipt PDF: "Receipt_${bill.receiptNo || 'Bill'}.pdf". Amount: ₹${bill.amount}`, 'success');
  };

  return (
    <div id="maintenance-panel-v2" className={`rounded-3xl border shadow-xl p-4 md:p-8 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 border-neutral-800 text-slate-100' : 'bg-white border-neutral-200 text-neutral-800'
    }`}>
      
      {/* Top Banner & Persona Swapper Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-neutral-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h1 className="font-display text-2xl font-black tracking-tight">OurHome Maintenance</h1>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Society Hub
            </span>
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Comprehensive management console for small & medium apartment societies in India
          </p>
        </div>

        {/* Action Controls Side */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* User Persona Filter Selection (Role Selection) */}
          <div className={`p-1.5 rounded-xl border flex gap-1 ${
            darkMode ? 'bg-slate-950 border-neutral-850' : 'bg-slate-100 border-neutral-200'
          }`}>
            {[
              { id: 'admin', label: 'Admin 👑' },
              { id: 'resident', label: 'Resident 🏡' },
              { id: 'vendor', label: 'Vendor 🛠️' }
            ].map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setActiveRole(role.id as any);
                  setActiveTab('dashboard');
                }}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRole === role.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : `${darkMode ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border cursor-pointer hover:scale-102 transition-transform ${
              darkMode ? 'bg-slate-800 border-neutral-750 text-amber-400' : 'bg-white border-neutral-200 text-neutral-600'
            }`}
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role Banner Info alerts to explain context */}
      <div className={`p-3 rounded-2xl flex items-center gap-2.5 border mb-6 text-xs ${
        activeRole === 'admin' 
          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/55 text-indigo-900 dark:text-indigo-200'
          : activeRole === 'resident'
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/55 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/55 text-amber-900 dark:text-amber-200'
      }`}>
        <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-indigo-500" />
        <p className="leading-sm font-sans">
          {activeRole === 'admin' && (
            <span><strong>Society Administrator Workspace:</strong> You have unlimited control to map residents, log expenses, collect dues, handle emergency notices, and book contractors from marketplace nodes.</span>
          )}
          {activeRole === 'resident' && (
            <span><strong>Resident Perspective (Flat 202):</strong> Access outstanding maintenance bills, authorize direct encrypted UPI payment channels, file plumbers/electricians complaints, and view society alerts.</span>
          )}
          {activeRole === 'vendor' && (
            <span><strong>Registered Vendor Hub (Sri Sai Water):</strong> Display incoming water tanker requirements, manage active dispatcher contracts, view rating cards, and receive automated invoice drafts.</span>
          )}
        </p>
      </div>

      {/* Primary Layout: Sidebar Tabs + Grid Content details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Module Sidebar Tabs navigation */}
        <div className="lg:col-span-3 space-y-1.5">
          <p className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase px-3 block mb-1">
            Society Navigation
          </p>
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: Building2 },
            { id: 'residents', label: 'Resident Directory', icon: Users, hideForV: true },
            { id: 'billing', label: 'Maintenance Billing', icon: CreditCard, hideForV: true },
            { id: 'complaints', label: 'Complaint Desk', icon: Wrench },
            { id: 'expenses', label: 'Expense Ledger', icon: IndianRupee, hideForR: true, hideForV: true },
            { id: 'vendors', label: 'Vendor Partners', icon: ShieldCheck, hideForR: true },
            { id: 'assets', label: 'Society Infrastructure', icon: Activity, hideForR: true, hideForV: true },
            { id: 'notices', label: 'Alert Notice Board', icon: Bell },
            { id: 'reports', label: 'Financial Audit Report', icon: FileText, hideForR: true, hideForV: true },
            { id: 'predictions', label: 'Future AI Diagnostics', icon: Sparkles, hideForV: true, hideForR: true },
          ].map(tab => {
            if (activeRole === 'resident' && tab.hideForR) return null;
            if (activeRole === 'vendor' && tab.hideForV) return null;
            
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm font-black scale-101' 
                    : `text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white`
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'predictions' && (
                  <span className="ml-auto bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300 text-[8px] font-bold px-1.5 py-0.2 rounded font-mono">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Master Center Page Contents */}
        <div className="lg:col-span-9 space-y-6">

          {/* CATEGORY 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-scale-in">
              {/* Core Indian Society KPI Metrics block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border text-slate-800 ${darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'}`}>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Flats Occupancy</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">{occupiedFlats}/{totalFlats}</p>
                  <p className="text-[9px] text-emerald-500 mt-1 font-mono">● {vacantFlats} Vacant Units</p>
                </div>

                <div className={`p-4 rounded-2xl border text-slate-800 ${darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'}`}>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">June Collection</p>
                  <p className="text-2xl font-black mt-1 text-emerald-600 font-mono">₹{totalCollectedJune.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-neutral-400 mt-1 font-mono">/ ₹{totalMaintenanceDue.toLocaleString('en-IN')} target</p>
                </div>

                <div className={`p-4 rounded-2xl border text-slate-800 ${darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'}`}>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Pending Arrears</p>
                  <p className="text-2xl font-black mt-1 text-red-500 font-mono">₹{pendingDuesJune.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-neutral-400 mt-1 font-mono">Defaulter rate: {Math.round((pendingDuesJune / totalMaintenanceDue) * 100)}%</p>
                </div>

                <div className={`p-4 rounded-2xl border text-slate-800 ${darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'}`}>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Monthly Outflow</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100 font-mono">₹{totalExpensesJune.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-emerald-500 mt-1 font-mono">✓ 4 Categories Audited</p>
                </div>
              </div>

              {/* Dynamic Role customized workflows layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Chart element representing Collections vs Expenses */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                }`}>
                  <div>
                    <h3 className="font-display font-bold text-sm">Monthly Net Cashflow Dynamics</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Automated compilation from Society bank books</p>
                  </div>

                  {/* SVG Bar Chart representing Indian Society Dynamics */}
                  <div className="h-28 flex items-end justify-around my-6 relative select-none">
                    <div className="absolute top-0 right-0 p-1 font-mono text-[9px] text-neutral-400 uppercase font-black tracking-widest bg-slate-100 dark:bg-slate-850 border rounded">
                      RERA Audited
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-24 w-8 bg-emerald-500 rounded-lg shadow-sm transition-all duration-300 relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-slate-900 text-white p-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{totalCollectedJune}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 mt-2">Dues Received</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-16 w-8 bg-amber-500 rounded-lg shadow-sm transition-all duration-300 relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-slate-900 text-white p-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{totalExpensesJune}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 mt-2">Expenses paid</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 bg-red-400 rounded-lg shadow-sm transition-all duration-300 relative group">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold bg-slate-900 text-white p-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{pendingDuesJune}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 mt-2">Dues Defaulters</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-indigo-50/40 dark:bg-slate-950/30 p-2.5 rounded-xl border border-dashed border-indigo-200">
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-snug">
                      <strong>Automatic Notice Reminders</strong> will be enqueued for residents with pending dues after the selected threshold grace period.
                    </p>
                  </div>
                </div>

                {/* Left Side: Recent Active Complaints & Quick Access Alerts Notices */}
                <div className="space-y-4">
                  
                  {/* Urgent Notice board highlight */}
                  <div className={`p-5 rounded-3xl border space-y-3 ${
                    darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-red-50/35 border-red-200 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2 text-rose-500">
                      <AlertCircle className="w-4 h-4" />
                      <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Emergency Alert Banner</h4>
                    </div>
                    {notices.filter(n => n.isUrgent).slice(0, 1).map(nt => (
                      <div key={nt.id} className="space-y-1.5 text-xs text-slate-800 dark:text-slate-300 leading-snug">
                        <p className="font-bold">{nt.title}</p>
                        <p className={`line-clamp-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{nt.content}</p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveTab('notices')}
                      className="text-[10px] font-bold text-indigo-600 underline block cursor-pointer"
                    >
                      Browse Alert Archive
                    </button>
                  </div>

                  {/* Active Marketplace Quick Connect Services cards */}
                  <div className={`p-5 rounded-3xl border space-y-3 ${
                    darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                  }`}>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-400">Integrated Marketplace Partners</h4>
                      <span className="text-[9px] bg-slate-100 py-0.5 px-2 rounded-md font-mono text-slate-500">Instant Booking</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        { s: 'Water Tanker', icon: ArrowUpRight, price: '₹1,200', label: 'Sri Sai Supplies' },
                        { s: 'Plumber', icon: Wrench, price: '₹550', label: 'Karan Plumber' },
                        { s: 'Electrician', icon: Activity, price: '₹400', label: 'Express Wireman' },
                        { s: 'Cleaning Service', icon: CheckCircle2, price: '₹900', label: 'Quick Shine' }
                      ].map(serve => (
                        <div 
                          key={serve.s}
                          onClick={() => handleMarketplaceBook(serve.s as any)}
                          className="p-2 border rounded-xl hover:border-indigo-600 cursor-pointer bg-neutral-50 dark:bg-slate-950 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{serve.s}</p>
                            <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{serve.label} • {serve.price}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}


          {/* CATEGORY 2: RESIDENTS MANAGEMENT MODULE */}
          {activeTab === 'residents' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search residential directory (by Flat or Name)..."
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    className={`pl-10 pr-4 py-2 text-xs rounded-xl w-full border outline-none ${
                      darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'
                    }`}
                  />
                </div>

                {activeRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowAddResident(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-transform hover:scale-102"
                  >
                    <Plus className="w-4 h-4" /> Add Resident
                  </button>
                )}
              </div>

              {/* Add Resident modal overlay pop-up form */}
              {showAddResident && (
                <form onSubmit={handleAddResidentSubmit} className={`p-5 rounded-3xl border space-y-4 text-slate-800 dark:text-slate-100 ${
                  darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <h3 className="font-display font-bold text-sm text-indigo-950 dark:text-indigo-400">Add Society Resident Form</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Flat No</label>
                      <input 
                        type="text" required placeholder="e.g. 402"
                        value={newResident.flatNumber}
                        onChange={(e) => setNewResident({...newResident, flatNumber: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Flat Type</label>
                      <select 
                        value={newResident.flatType}
                        onChange={(e) => setNewResident({...newResident, flatType: e.target.value as any})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option>2BHK</option>
                        <option>3BHK</option>
                        <option>Penthouse</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Owner Name</label>
                      <input 
                        type="text" required placeholder="Owner full name"
                        value={newResident.ownerName}
                        onChange={(e) => setNewResident({...newResident, ownerName: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Tenant Name (Optional)</label>
                      <input 
                        type="text" placeholder="Leasing name if rented"
                        value={newResident.tenantName || ''}
                        onChange={(e) => setNewResident({...newResident, tenantName: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Phone</label>
                      <input 
                        type="text" required placeholder="+91..."
                        value={newResident.phone}
                        onChange={(e) => setNewResident({...newResident, phone: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Email Address</label>
                      <input 
                        type="email" required placeholder="name@ourhome.in"
                        value={newResident.email}
                        onChange={(e) => setNewResident({...newResident, email: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Family Members</label>
                      <input 
                        type="number" required min={1}
                        value={newResident.familyMembers}
                        onChange={(e) => setNewResident({...newResident, familyMembers: Number(e.target.value)})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono font-bold text-neutral-400">Vehicle Info</label>
                      <input 
                        type="text" placeholder="Plate number, SUV/bike"
                        value={newResident.vehicleDetails}
                        onChange={(e) => setNewResident({...newResident, vehicleDetails: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowAddResident(false)}
                      className="bg-neutral-200 dark:bg-neutral-800 dark:text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-neutral-300 pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-500 pointer"
                    >
                      Add to Register
                    </button>
                  </div>
                </form>
              )}

              {/* Residential directory listings table cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {residents
                  .filter(r => 
                    r.flatNumber.includes(resSearch) || 
                    r.ownerName.toLowerCase().includes(resSearch.toLowerCase()) || 
                    (r.tenantName && r.tenantName.toLowerCase().includes(resSearch.toLowerCase()))
                  )
                  .map(res => (
                    <div 
                      key={res.id} 
                      className={`p-5 rounded-2xl border transition-all hover:border-indigo-500 ${
                        darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-neutral-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                            Flat {res.flatNumber} • {res.flatType}
                          </span>
                          <h4 className="font-display font-bold text-base mt-2 text-slate-900 dark:text-slate-100">
                            {res.ownerName}
                          </h4>
                          {res.tenantName && (
                            <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                              Tenant: {res.tenantName}
                            </p>
                          )}
                        </div>

                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          res.occupancyStatus === 'Occupied' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                        }`}>
                          {res.occupancyStatus}
                        </span>
                      </div>

                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-500">
                        <p>📞 {res.phone}</p>
                        <p>✉ {res.email}</p>
                        <p>👥 Family: {res.familyMembers}</p>
                        <p>🚗 {res.vehicleDetails}</p>
                      </div>

                      {activeRole === 'admin' && (
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove Flat ${res.flatNumber} record from society roll?`)) {
                                setResidents(prev => prev.filter(item => item.id !== res.id));
                              }
                            }}
                            className="text-red-500 hover:text-red-600 font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Evict
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}


          {/* CATEGORY 3: MAINTENANCE BILLING & UPI */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-scale-in">
              
              {/* Autogenerated wizard segment (Admin Only) */}
              {activeRole === 'admin' && (
                <div className={`p-5 rounded-3xl border ${
                  darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-slate-50 border-neutral-200 text-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-semibold text-sm">RERA-authorized Dues Generator Wizard</h4>
                      <p className="text-xs text-neutral-400 mt-1">Automatically calculates flat maintenance values based on square footage / tier</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={`text-xs p-2 rounded-xl border outline-none ${
                          darkMode ? 'bg-slate-900 border-neutral-800 text-white' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <option>June 2026</option>
                        <option>July 2026</option>
                        <option>August 2026</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={handleAutoGenerateBills}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-4 h-4" /> Generate dues
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Outstanding list / Resident dashboard summary block */}
              {activeRole === 'resident' && (
                <div className="bg-emerald-99 border border-emerald-200/55 dark:bg-emerald-950/25 p-5 rounded-3xl flex justify-between items-center text-slate-900 dark:text-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-black">PENDING CHECKS</span>
                    <h3 className="font-display font-black text-xl text-emerald-800 mt-1">My Flat 202 Outstanding</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">June maintenance is due. Please clear before late penalty triggers.</p>
                  </div>
                  <div>
                    {bills.filter(b => b.flatNumber === '202' && b.status !== 'Paid').map(bill => (
                      <div key={bill.id} className="text-right">
                        <p className="text-2xl font-black text-emerald-700 font-mono">₹{(bill.amount + bill.lateFee).toLocaleString('en-IN')}</p>
                        <button
                          type="button"
                          onClick={() => triggerUPIPayment(bill)}
                          className="bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-xl hover:bg-indigo-500 mt-2 block cursor-pointer"
                        >
                          💸 G-Pay / UPI Pay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Dues logs ledger view */}
              <div className="overflow-x-auto rounded-2xl border border-neutral-250 dark:border-neutral-800">
                <table className="w-full text-xs text-left">
                  <thead className={`text-[10px] uppercase font-mono tracking-wider ${
                    darkMode ? 'bg-slate-800/65 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <tr>
                      <th className="p-3">Flat No</th>
                      <th className="p-3">Cycle</th>
                      <th className="p-3">Base Maintenance</th>
                      <th className="p-3">Late Fee Penalty</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-neutral-100 dark:divide-neutral-800 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {bills
                      .filter(b => activeRole === 'resident' ? b.flatNumber === '202' : true)
                      .map(bill => (
                        <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-bold">Flat {bill.flatNumber}</td>
                          <td className="p-3">{bill.billingMonth}</td>
                          <td className="p-3 font-mono">₹{bill.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3 font-mono text-red-500">₹{bill.lateFee.toLocaleString('en-IN')}</td>
                          <td className="p-3">{bill.dueDate}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-mono leading-none font-bold uppercase px-2 py-0.5 rounded-full ${
                              bill.status === 'Paid' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                                : bill.status === 'Overdue'
                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            {bill.status === 'Paid' ? (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReceipt(bill)}
                                  className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> PDF
                                </button>
                              </div>
                            ) : (
                              activeRole === 'resident' && (
                                <button
                                  type="button"
                                  onClick={() => triggerUPIPayment(bill)}
                                  className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-indigo-500 cursor-pointer"
                                >
                                  Pay Now
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* UPI Sim Modal HUD */}
              {showUPISimulator && selectedBillForUPI && (
                <div className="fixed inset-0 bg-slate-800/35 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white text-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-6 text-center shadow-2xl relative">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <p className="font-mono text-[10px] tracking-wider text-slate-500">BHIM UPI • CREDIT Secure</p>
                      <button 
                        type="button" 
                        onClick={() => setShowUPISimulator(false)}
                        className="text-neutral-400 hover:text-neutral-900 font-mono text-sm leading-none"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest leading-none">TOTAL OUTSTANDING CHARGED</p>
                      <p className="text-3xl font-black text-slate-900 font-mono">₹{(selectedBillForUPI.amount + selectedBillForUPI.lateFee).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">To: OursHome Elite Maintenance Escrow</p>
                    </div>

                    {/* QR Code Simulation element */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border rounded-2xl relative overflow-hidden">
                      <QrCode className="w-36 h-36 stroke-slate-800" />
                      <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-wide">Scan with PhonePe, PayTM, GooglePay</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={upiProcessing}
                        onClick={executeSimulatedUPI}
                        className="w-full bg-indigo-600 text-white text-xs font-black py-2.5 rounded-xl hover:bg-indigo-500 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400"
                      >
                        {upiProcessing ? (
                          <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : 'Authorize Net payment'}
                      </button>
                      <p className="text-[9px] text-neutral-400 font-mono">Secured by TS-RERA standard banking nodes 🔒</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}


          {/* CATEGORY 4: COMPLAINT MANAGEMENT DESK */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex justify-between items-center">
                {/* Segment Filter tab headers */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mr-2">Filters:</span>
                  {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCompFilter(tab)}
                      className={`text-[10px] font-bold px-2 py-1 rounded ${
                        compFilter === tab 
                          ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' 
                          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddComplaint(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> File Ticket
                </button>
              </div>

              {/* Add Complaint Inline Form overlay pop-up */}
              {showAddComplaint && (
                <form onSubmit={handleAddComplaintSubmit} className={`p-5 rounded-3xl border space-y-4 text-slate-800 dark:text-slate-100 ${
                  darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-slate-50 border-neutral-200'
                }`}>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Raise Society Complaint Ticket</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400">Flat No Selection</label>
                      <select 
                        value={newComplaint.flatNumber}
                        onChange={(e) => setNewComplaint({...newComplaint, flatNumber: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                      >
                        {residents.map(r => <option key={r.id}>{r.flatNumber}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400">Class/Category</label>
                      <select 
                        value={newComplaint.category}
                        onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value as any})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option>Plumbing</option>
                        <option>Electrical</option>
                        <option>Lift</option>
                        <option>Security</option>
                        <option>Cleaning</option>
                        <option>Water Supply</option>
                        <option>Parking</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400">Brief Title</label>
                      <input 
                        type="text" required placeholder="Description title"
                        value={newComplaint.title}
                        onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400">Full Description & Action Needed</label>
                    <textarea 
                      required rows={3} placeholder="Please paste descriptive details regarding leaking nodes, ceiling dampness..."
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100 resize-none" 
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowAddComplaint(false)}
                      className="bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-100 font-bold hover:bg-neutral-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-500 cursor-pointer"
                    >
                      Publish Ticket
                    </button>
                  </div>
                </form>
              )}

              {/* Outstanding complaint lists cards */}
              <div className="space-y-3">
                {complaints
                  .filter(c => compFilter === 'All' ? true : c.status === compFilter)
                  .map(comp => (
                    <div 
                      key={comp.id} 
                      className={`p-5 rounded-2xl border ${
                        darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 px-2 py-0.5 rounded uppercase font-bold">
                              Flat {comp.flatNumber}
                            </span>
                            <span className="bg-neutral-100 dark:bg-slate-800 text-neutral-600 px-2 py-0.5 rounded uppercase font-bold">
                              {comp.category}
                            </span>
                            <span className="text-neutral-400">Filed on: {comp.dateCreated}</span>
                          </div>

                          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                            {comp.title}
                          </h3>
                          <p className={`text-xs mt-1 leading-snug ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {comp.description}
                          </p>

                          {comp.assignedTo && (
                            <p className="text-[10px] font-mono text-indigo-600 font-bold mt-2 flex items-center gap-1">
                              👷 Assigned to: <span className="underline">{comp.assignedTo}</span>
                            </p>
                          )}
                        </div>

                        {/* Interactive Actions Side based on workflows */}
                        <div className="text-right space-y-1.5">
                          <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            comp.status === 'Open' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800' :
                            comp.status === 'Assigned' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800' :
                            comp.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800' :
                            'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800'
                          }`}>
                            {comp.status}
                          </span>

                          {/* Quick Workflow Action Switches for Admin */}
                          {activeRole === 'admin' && (
                            <div className="flex flex-col gap-1 mt-2">
                              {comp.status === 'Open' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateComplaintStatus(comp.id, 'assign')}
                                  className="text-[9px] px-2 py-1 border rounded bg-indigo-50 border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-100 cursor-pointer"
                                >
                                  Assign Vendor
                                </button>
                              )}
                              {comp.status === 'Assigned' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateComplaintStatus(comp.id, 'progress')}
                                  className="text-[9px] px-2 py-1 border rounded bg-amber-50 border-amber-200 text-amber-600 font-bold hover:bg-amber-100 cursor-pointer"
                                >
                                  Set In-Progress
                                </button>
                              )}
                              {comp.status === 'In Progress' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateComplaintStatus(comp.id, 'resolve')}
                                  className="text-[9px] px-2 py-1 border rounded bg-emerald-50 border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-100 cursor-pointer"
                                >
                                  Mark Solved
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}


          {/* CATEGORY 5: EXPENSES LEDGER */}
          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm">Automated Society Ledger Book</h3>
                  <p className="text-xs text-neutral-400">Syncs directly with vendor invoices and marketplace bookings</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddExpense(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Record expense
                </button>
              </div>

              {/* Add Expense Drawer */}
              {showAddExpense && (
                <form onSubmit={handleAddExpenseSubmit} className={`p-5 rounded-3xl border space-y-4 text-slate-800 dark:text-slate-100 ${
                  darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-slate-50 border-neutral-200'
                }`}>
                  <h3 className="font-display font-bold text-sm">Add Financial Expense Log</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Class Category</label>
                      <select 
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value as any})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option>Security</option>
                        <option>Cleaning</option>
                        <option>Water Tankers</option>
                        <option>Lift Maintenance</option>
                        <option>Generator</option>
                        <option>Electricity</option>
                        <option>Repairs</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Amount (INR)</label>
                      <input 
                        type="number" required placeholder="₹ amount"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Vendor Partner mapping</label>
                      <input 
                        type="text" placeholder="e.g. Sri Sai Tankers"
                        value={newExpense.vendorName}
                        onChange={(e) => setNewExpense({...newExpense, vendorName: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Expense Brief description</label>
                      <input 
                        type="text" required placeholder="Description note"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 dark:text-slate-100" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowAddExpense(false)}
                      className="bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-100 font-bold hover:bg-neutral-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-500 cursor-pointer"
                    >
                      Authorize disbursement
                    </button>
                  </div>
                </form>
              )}

              {/* Master Ledger List */}
              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-xs text-left">
                  <thead className={`text-[10px] uppercase font-mono tracking-wider ${
                    darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <tr>
                      <th className="p-3">Reference Id</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Disbursed Date</th>
                      <th className="p-3">Vendor / Recipient</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-neutral-100 dark:divide-neutral-800 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="p-3 font-mono text-[10px] font-bold text-neutral-400">{exp.id}</td>
                        <td className="p-3">
                          <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3">{exp.date}</td>
                        <td className="p-3 font-semibold">{exp.vendorName}</td>
                        <td className="p-3 text-neutral-500 dark:text-neutral-400">{exp.description}</td>
                        <td className="p-3 text-right font-mono font-bold">₹{exp.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* CATEGORY 6: VENDOR PARTNERS */}
          {activeTab === 'vendors' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm">Assigned & Recommended Contractors</h3>
                  <p className="text-xs text-neutral-400">Vetted partners integrated directly with emergency dispatch queue</p>
                </div>
              </div>

              {/* Vendors cards grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map(v => (
                  <div 
                    key={v.id} 
                    className={`p-5 rounded-3xl border space-y-4 ${
                      darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded text-neutral-500">
                          {v.type}
                        </span>
                        <h4 className="font-display font-bold text-base mt-2 text-slate-900 dark:text-slate-100">
                          {v.name}
                        </h4>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">📞 {v.phone}</p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{v.rating}</span>
                      </div>
                    </div>

                    {/* Cost ledger list mapping */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Job Allocation Logs</span>
                      <div className="divide-y divide-neutral-100 dark:divide-slate-800 text-xs">
                        {v.costHistory.map((hist, i) => (
                          <div key={i} className="py-2 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-300">{hist.job}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">{hist.date}</p>
                            </div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{hist.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* CATEGORY 7: INFRASTRUCTURE ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm">Society Maintenance Scheduler</h3>
                  <p className="text-xs text-neutral-400 font-sans">Tracks Annual Maintenance Contracts (AMCs) and automated system audits</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map(ast => (
                  <div 
                    key={ast.id} 
                    className={`p-5 rounded-3xl border space-y-4 ${
                      darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">{ast.name}</h4>
                        <span className={`inline-block text-[9.5px] mt-1 font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          ast.status === 'Operational' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800' 
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800'
                        }`}>
                          {ast.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-neutral-100 dark:border-neutral-800 py-3">
                      <div>
                        <p className="text-neutral-400 text-[10px] font-mono leading-none mb-1 text-neutral-500 uppercase">AMC Expiration</p>
                        <p className="font-semibold text-slate-850 dark:text-white">{ast.amcExpiry}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-[10px] font-mono leading-none mb-1 text-neutral-500 uppercase">Next Service Date</p>
                        <p className="font-semibold text-indigo-650 dark:text-indigo-400">{ast.nextService}</p>
                      </div>
                    </div>

                    {/* Service logs list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Service Run Logs</span>
                      {ast.serviceHistory.length > 0 ? (
                        <div className="space-y-1.5 text-xs">
                          {ast.serviceHistory.map((sh, idx) => (
                            <div key={idx} className="bg-neutral-50 dark:bg-slate-900 p-2.5 rounded-xl border border-neutral-100">
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{sh.description}</p>
                                <span className="font-mono text-neutral-500">{sh.date}</span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-mono mt-1">Cost verified: ₹{sh.cost}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No historical service anomalies enqueued.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* CATEGORY 8: ALERT BOARD */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-scale-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm">Society Digital Board Announcements</h3>
                  <p className="text-xs text-neutral-400 font-sans font-medium">Real-time alerts broadcasted to all flat owners</p>
                </div>

                {activeRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowAddNotice(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Bulletin notice
                  </button>
                )}
              </div>

              {/* Add Bulletin/Notice Box */}
              {showAddNotice && (
                <form onSubmit={handleAddNoticeSubmit} className={`p-5 rounded-3xl border space-y-4 text-slate-800 dark:text-slate-100 ${
                  darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-slate-50 border-neutral-200'
                }`}>
                  <h3 className="font-display font-bold text-sm">Broadcast Global Society Announcement Notice</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Heading Title</label>
                      <input 
                        type="text" required placeholder="e.g. Inflow advisory"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-neutral-400">Class Type</label>
                      <select 
                        value={newNotice.category}
                        onChange={(e) => setNewNotice({...newNotice, category: e.target.value as any})}
                        className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800"
                      >
                        <option>Announcement</option>
                        <option>Water Shutdown</option>
                        <option>Maintenance Reminder</option>
                        <option>Emergency Alert</option>
                      </select>
                    </div>

                    <div className="space-y-1 flex items-center pt-5">
                      <input 
                        type="checkbox" id="urg_chk"
                        checked={newNotice.isUrgent}
                        onChange={(e) => setNewNotice({...newNotice, isUrgent: e.target.checked})}
                        className="mr-2" 
                      />
                      <label htmlFor="urg_chk" className="text-xs font-bold text-red-500 cursor-pointer">Mark as URGENT (Alert Pop-up)</label>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="block text-[10px] font-mono font-bold text-neutral-400">Bulletin content</label>
                    <textarea 
                      required rows={3} placeholder="Paste explicit notice details..."
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border p-2 rounded-lg outline-none text-slate-800 resize-none" 
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowAddNotice(false)}
                      className="bg-neutral-205 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-100 font-bold hover:bg-neutral-350 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-500 cursor-pointer"
                    >
                      Broadcast Now
                    </button>
                  </div>
                </form>
              )}

              {/* Announcements lists details */}
              <div className="space-y-4">
                {notices.map(nt => (
                  <div 
                    key={nt.id} 
                    className={`p-5 rounded-2xl border relative ${
                      nt.isUrgent 
                        ? 'border-l-4 border-l-red-500 dark:bg-slate-850' 
                        : `${darkMode ? 'bg-slate-850 border-neutral-750' : 'bg-white border-neutral-200'}`
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            nt.isUrgent 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-300'
                          }`}>
                            {nt.category}
                          </span>
                          <span className="text-[10.5px] font-mono text-neutral-400">{nt.date}</span>
                        </div>

                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                          {nt.title}
                        </h4>
                        <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {nt.content}
                        </p>
                      </div>

                      {activeRole === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Revoke announcement bulletin: "${nt.title}"?`)) {
                              setNotices(prev => prev.filter(item => item.id !== nt.id));
                            }
                          }}
                          className="text-red-500 hover:text-red-650 font-semibold text-xs cursor-pointer"
                          title="Delete announcement"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* CATEGORY 9: REPORTS AUDITING */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-scale-in">
              <div className="bg-gradient-to-tr from-emerald-800 via-teal-700 to-sky-700 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-emerald-500/20">
                <div className="absolute top-0 right-0 p-1.5 font-mono text-[9px] text-white/40 bg-white/10 rounded-bl">OurHome Audit System</div>
                <h3 className="font-display font-black text-lg tracking-snug">RERA Legal Compliance Balance Sheet</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Society maintenance funds are tracked securely within synchronized escrow nodes</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/15 text-left font-mono">
                  <div>
                    <p className="text-white/40 text-[9px]">TOTAL LIQUID RESERVES</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">₹4,25,000</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px]">FY26 ACCUMULATED SAVINGS</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">₹1,85,000</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px]">SOCIETY DEBT PROFILE</p>
                    <p className="text-xl font-bold text-red-400 mt-1">₹0.00</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px]">AUDIT CLASSIFICATION</p>
                    <p className="text-sm font-bold text-white mt-1.5 bg-neutral-800 text-center rounded py-0.5 px-1.5">GRADE A (SAFE)</p>
                  </div>
                </div>
              </div>

              {/* Reports types and download simulator tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Cumulative Collection Audit', desc: 'Detailing monthly maintenance paid, late fee penalties collected, and net cashflow trends.', code: 'OHM-AUDIT-COLL-01' },
                  { title: 'Defaulters Deficit Report', desc: 'Explicit flat records and long-standing ledger penalty lists.', code: 'OHM-AUDIT-DEFA-02' },
                  { title: 'Vendor Disbursal Ledger', desc: 'AMC tracking reports, custom tankers expenses, and localized power bills summary.', code: 'OHM-AUDIT-EXPE-03' },
                  { title: 'Profit & Loss Statement', desc: 'Comprehensive financial comparison of common funds allocation.', code: 'OHM-AUDIT-PANDL-04' }
                ].map(rep => (
                  <div 
                    key={rep.code} 
                    className={`p-5 rounded-3xl border flex flex-col justify-between ${
                      darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[9px] text-neutral-400 font-bold bg-slate-100 dark:bg-slate-850 py-0.5 px-2 rounded-sm select-none">
                        {rep.code}
                      </span>
                      <h4 className="font-semibold text-sm mt-2">{rep.title}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-300'}`}>{rep.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerToast(`Success! Consolidated spreadsheet report compiled. Download initialized for spreadsheet binary "${rep.code}.xlsx" under browser cache.`, 'success')}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer font-mono"
                    >
                      <Download className="w-3.5 h-3.5" /> Pull Excel Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* CATEGORY 10: FUTURE AI DIAGNOSTICS & ANOMALY DETECTION */}
          {activeTab === 'predictions' && (
            <div className="space-y-6 animate-scale-in">
              <div className="p-5 bg-gradient-to-br from-indigo-700 to-violet-800 text-white rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 font-mono text-[8px] bg-white/20 text-white rounded-bl font-black tracking-widest uppercase">Predictive AI Engine</div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="font-display font-black text-base tracking-tight text-white">Future AI Maintenance Diagnostics</h3>
                </div>
                <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                  Deep intelligence modeling analyzes historical bills, climate/summer trends, pump AMC intervals, and vendor cost spikes to advise society secretary budgets proactively.
                </p>
              </div>

              {/* Predictive features list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Predict 1: Water Tanks Demand */}
                <div className={`p-5 rounded-3xl border space-y-4 ${
                  darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Activity className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-neutral-400">Water Tank Refill Prediction</h4>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-2xl">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase leading-none">AI ESTIMATED INFLOW TIMEFRAME</p>
                    <p className="text-xl font-bold mt-1 text-slate-800 dark:text-orange-500 font-mono">Next Refill in 3.2 Days</p>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-neutral-400 mt-2">
                      Based on current summer heat indexes (42°C Gachibowli records) and weekly drain rate metric logs, society reserve will dip under 20% on next Friday. We enqueued a recommendation auto-booking.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarketplaceBook('Water Tanker')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-750 text-white text-xs font-extrabold py-2 px-4 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                  >
                    ⚡ Pre-book Tanker now
                  </button>
                </div>

                {/* Predict 2: Preventative Lift Service */}
                <div className={`p-5 rounded-3xl border space-y-4 ${
                  darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-neutral-400">Lift AMC Maintenance Predictor</h4>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-2xl">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase leading-none">PREDICTIVE SERVICE RECOMMENDATION</p>
                    <p className="text-xl font-bold mt-1 text-rose-500 font-mono">Service Due: 8 Days</p>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-neutral-400 mt-2">
                      Heuristics analyze that Lift motor vibration patterns spiked by 4.5% during Peak floor travel times. Recommend semi-annual check-up early to prevent localized grid outages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerToast("Successfully alerted Kone Lift Service dispatch and requested localized motor inspection schedule check!", "success");
                    }}
                    className="w-full bg-rose-600 text-white text-xs font-bold py-2 rounded-xl text-center hover:bg-rose-500 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    📅 Dispatch AMC Team
                  </button>
                </div>

                {/* Predict 3: Expense Anomalies detector */}
                <div className={`p-5 rounded-3xl border md:col-span-2 space-y-4 ${
                  darkMode ? 'bg-slate-850 border-neutral-750 text-white' : 'bg-white border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500">
                    <ShieldCheck className="w-4 h-4" />
                    <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-neutral-400">Anomalous Disbursement Detection</h4>
                  </div>
                  
                  <div className="p-3 bg-red-50/50 dark:bg-rose-950/20 border border-red-150 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-red-950 dark:text-red-400">Unusual Water tanker charge spike detected</p>
                      <p className="text-neutral-500 dark:text-neutral-400 leading-snug">
                        Analysis identified water tanker cost records from vendor Sri Sai Suppliers spiked by 18.5% compared to historical local benchmarks. Real-time billing verification recommended.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
