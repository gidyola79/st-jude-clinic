import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  Printer, 
  X, 
  Download, 
  TrendingUp, 
  Building 
} from 'lucide-react';
import { Invoice, InsuranceClaim, Patient, UserRole, InvoiceItem } from '../types';

interface BillingViewProps {
  invoices: Invoice[];
  setInvoices: (inv: Invoice[]) => void;
  claims: InsuranceClaim[];
  setClaims: (clm: InsuranceClaim[]) => void;
  patients: Patient[];
  activeRole: UserRole;
  searchTerm: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
}

export default function BillingView({
  invoices,
  setInvoices,
  claims,
  setClaims,
  patients,
  activeRole,
  searchTerm: globalSearchTerm,
  addNotification,
}: BillingViewProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'claims'>('invoices');
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New Invoice Modal
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'General Physician Assessment', category: 'Consultation', quantity: 1, unitPrice: 180, amount: 180 }
  ]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemCategory, setItemCategory] = useState<InvoiceItem['category']>('Consultation');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(100);
  const [coveragePercent, setCoveragePercent] = useState(80);

  // View / Print Invoice Modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Payment Recording Modal
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Insurance Direct' | 'Wire Transfer'>('Credit Card');

  // Keyboard Escape listener to dismiss any open modals in BillingView
  useEffect(() => {
    const isAnyOpen = isCreateInvoiceOpen || !!viewInvoice || !!payInvoice;
    if (!isAnyOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateInvoiceOpen(false);
        setViewInvoice(null);
        setPayInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateInvoiceOpen, viewInvoice, payInvoice]);

  // Filter Invoices
  const filteredInvoices = invoices.filter(inv => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    const matchesQuery = inv.invoiceNumber.toLowerCase().includes(query) ||
                         inv.patientName.toLowerCase().includes(query) ||
                         (inv.insuranceProvider || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Filter Claims
  const filteredClaims = claims.filter(clm => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    return clm.claimNumber.toLowerCase().includes(query) ||
           clm.patientName.toLowerCase().includes(query) ||
           clm.provider.toLowerCase().includes(query);
  });

  // Metrics
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPending = invoices.filter(i => i.status !== 'Paid').reduce((acc, inv) => acc + inv.patientPayable, 0);
  const pendingClaimsCount = claims.filter(c => c.status === 'Submitted' || c.status === 'In Review').length;

  const handleAddItemToDraft = () => {
    if (!itemDesc.trim() || itemPrice <= 0) return;
    const newItem: InvoiceItem = {
      id: `ITM-${Date.now().toString().slice(-4)}`,
      description: itemDesc.trim(),
      category: itemCategory,
      quantity: Number(itemQty),
      unitPrice: Number(itemPrice),
      amount: Number(itemQty) * Number(itemPrice)
    };
    setInvoiceItems([...invoiceItems, newItem]);
    setItemDesc('');
    setItemPrice(100);
    setItemQty(1);
  };

  const handleRemoveDraftItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(i => i.id !== id));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
    const subtotal = invoiceItems.reduce((acc, i) => acc + i.amount, 0);
    const tax = Number((subtotal * 0.085).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));
    const insuranceCovered = Number(((totalAmount * coveragePercent) / 100).toFixed(2));
    const patientPayable = Number((totalAmount - insuranceCovered).toFixed(2));

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      date: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      items: invoiceItems,
      subtotal,
      tax,
      discount: 0,
      totalAmount,
      insuranceCovered,
      patientPayable,
      status: targetPatient.insurance ? 'Claim Processing' : 'Pending',
      insuranceProvider: targetPatient.insurance
    };

    setInvoices([newInvoice, ...invoices]);

    // If insurance covered, auto generate claim
    if (insuranceCovered > 0 && targetPatient.insurance) {
      const newClaim: InsuranceClaim = {
        id: `CLM-${Date.now().toString().slice(-4)}`,
        claimNumber: `CLM-EDI-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceId: newInvoice.id,
        patientId: targetPatient.id,
        patientName: targetPatient.name,
        provider: targetPatient.insurance,
        policyNumber: targetPatient.policyNumber || 'POL-990118',
        totalBilled: totalAmount,
        amountClaimed: insuranceCovered,
        status: 'Submitted',
        submittedDate: new Date().toISOString().substring(0, 10),
        notes: 'Submitted via St. Jude Integrated Health Gateway.'
      };
      setClaims([newClaim, ...claims]);
    }

    setIsCreateInvoiceOpen(false);
    addNotification('Invoice Generated', `Created bill ${newInvoice.invoiceNumber} for ${targetPatient.name}.`, 'Success');
  };

  const handleRecordPayment = () => {
    if (!payInvoice) return;
    setInvoices(
      invoices.map(inv => inv.id === payInvoice.id ? {
        ...inv,
        status: 'Paid',
        paymentMethod,
        paidAt: new Date().toLocaleString()
      } : inv)
    );
    addNotification('Payment Confirmed', `Recorded ${paymentMethod} payment of $${payInvoice.patientPayable.toFixed(2)} for ${payInvoice.invoiceNumber}.`, 'Success');
    setPayInvoice(null);
  };

  const handleUpdateClaimStatus = (claimId: string, newStatus: 'Approved' | 'Denied') => {
    setClaims(
      claims.map(c => c.id === claimId ? {
        ...c,
        status: newStatus,
        decisionDate: new Date().toISOString().substring(0, 10),
        amountApproved: newStatus === 'Approved' ? c.amountClaimed : 0
      } : c)
    );
    addNotification('Claim Adjudication Updated', `Insurance claim ${claimId} marked as ${newStatus}.`, newStatus === 'Approved' ? 'Success' : 'Alert');
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Financial Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Billed Value</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
            <p className="text-xs text-blue-500 font-medium mt-1">All clinical services & stays</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</span>
            <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
            <p className="text-xs text-emerald-500 font-medium mt-1">Settled invoices & payments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Balances</span>
            <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
            <p className="text-xs text-amber-500 font-medium mt-1">Patient copays & pending claims</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active EDI Claims</span>
            <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{pendingClaimsCount} claims</h4>
            <p className="text-xs text-indigo-500 font-medium mt-1">BlueCross, Aetna, Medicare</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="tab-invoices"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Patient Invoices & Statements</span>
          </button>

          <button
            id="tab-claims"
            onClick={() => setActiveTab('claims')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'claims'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Insurance Claim Adjudication</span>
            {pendingClaimsCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-indigo-500 text-white font-bold rounded-full">
                {pendingClaimsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, patient, claim..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === 'invoices' && (
            <button
              id="create-invoice-btn"
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Invoices List */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {['All', 'Paid', 'Pending', 'Claim Processing', 'Overdue'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Issue Date</th>
                    <th className="px-5 py-3.5">Total Amount</th>
                    <th className="px-5 py-3.5">Insurance Coverage</th>
                    <th className="px-5 py-3.5">Patient Payable</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => {
                    const isPaid = inv.status === 'Paid';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{inv.patientName}</div>
                          <div className="text-slate-400 text-[11px]">{inv.insuranceProvider || 'Self-Pay / Direct'}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{inv.date}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                          ${inv.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          ${inv.insuranceCovered.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400 text-sm">
                          ${inv.patientPayable.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : inv.status === 'Claim Processing'
                              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => setViewInvoice(inv)}
                            className="px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            View Statement
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => setPayInvoice(inv)}
                              className="px-2.5 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors"
                            >
                              Receive Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Claims Adjudication */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredClaims.map(claim => (
              <div
                key={claim.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{claim.provider}</h4>
                        <span className="font-mono text-xs text-slate-400">({claim.claimNumber})</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Patient: <span className="font-bold text-slate-700 dark:text-slate-300">{claim.patientName}</span> • Policy #{claim.policyNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      claim.status === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : claim.status === 'Denied'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                    }`}>
                      {claim.status}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Claim Amount</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">${claim.amountClaimed.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Claim Transmission Note: </span>
                  {claim.notes || 'Electronic EDI 837 transaction processed.'}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">Submitted on {claim.submittedDate}</span>
                  {claim.status === 'Submitted' || claim.status === 'In Review' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateClaimStatus(claim.id, 'Denied')}
                        className="px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        Mark Denied
                      </button>
                      <button
                        onClick={() => handleUpdateClaimStatus(claim.id, 'Approved')}
                        className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors"
                      >
                        Approve & Remit
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold">Adjudication Complete</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Invoice */}
      {isCreateInvoiceOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateInvoiceOpen(false);
          }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Patient Hospital Bill</h3>
              <button onClick={() => setIsCreateInvoiceOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.insurance || 'Self-Pay'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Insurance Copay Coverage %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={coveragePercent}
                    onChange={(e) => setCoveragePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Add Item Line */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Add Line Item / Fee:</span>
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Description (e.g. Brain MRI Scan, ICU Day)"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="col-span-5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="col-span-3 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Ward/Bed">Ward/Bed</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="col-span-2 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="col-span-2 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItemToDraft}
                  className="px-3 py-1 font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded border border-blue-200"
                >
                  + Add Item
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Bill Items:</span>
                {invoiceItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.description}</span>
                      <span className="text-slate-400"> ({item.category}) × {item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">${item.amount.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Print Invoice Statement */}
      {viewInvoice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewInvoice(null);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-300 p-8 shadow-2xl space-y-5 text-slate-900">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-blue-900">St. Jude Medical Center</h2>
                <p className="text-xs text-slate-600">742 Healthcare Blvd • Accounting & Patient Ledger</p>
                <p className="text-xs text-slate-500">Tax ID: 12-8849201 • support@stjudes.org</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Statement #</span>
                <p className="font-mono text-lg font-black text-slate-900">{viewInvoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Date: {viewInvoice.date}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Patient Information:</span>
                <p className="text-sm font-bold text-slate-900">{viewInvoice.patientName}</p>
                <p className="text-slate-600">Patient ID: {viewInvoice.patientId}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Primary Insurance:</span>
                <p className="text-sm font-bold text-slate-900">{viewInvoice.insuranceProvider || 'Direct Patient Settlement'}</p>
                <p className="text-slate-600">Status: <span className="font-bold text-blue-700">{viewInvoice.status}</span></p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 uppercase text-[11px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Service / Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                      <td className="p-3 text-slate-500">{item.category}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right font-bold">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs pt-2 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${viewInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hospital Tax & Facility Surcharge (8.5%):</span>
                <span>${viewInvoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1">
                <span>Total Clinical Charges:</span>
                <span>${viewInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Insurance Adjudication Credit:</span>
                <span>-${viewInvoice.insuranceCovered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-blue-900 text-base pt-2 border-t border-slate-900">
                <span>Net Patient Responsibility:</span>
                <span>${viewInvoice.patientPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setViewInvoice(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {payInvoice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPayInvoice(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Invoice Payment</h3>
            <p className="text-slate-500">
              Patient: <strong>{payInvoice.patientName}</strong> • Outstanding Balance: <strong className="text-emerald-600">${payInvoice.patientPayable.toFixed(2)}</strong>
            </p>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Credit Card">Credit Card (Stripe Terminal)</option>
                <option value="Cash">Cash Cashier Point</option>
                <option value="Insurance Direct">Insurance Direct Clearing</option>
                <option value="Wire Transfer">Wire Transfer / Electronic ACH</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPayInvoice(null)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-4 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
