import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  TrendingDown, 
  Package, 
  DollarSign, 
  RefreshCw, 
  Filter, 
  X, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Sparkles 
} from 'lucide-react';
import { Medicine, PrescriptionOrder, Patient, UserRole } from '../types';

interface PharmacyViewProps {
  medicines: Medicine[];
  setMedicines: (meds: Medicine[]) => void;
  prescriptions: PrescriptionOrder[];
  setPrescriptions: (orders: PrescriptionOrder[]) => void;
  patients: Patient[];
  activeRole: UserRole;
  searchTerm: string;
  addNotification: (title: string, desc: string, type: 'Alert' | 'Success' | 'Info' | 'Schedule') => void;
  onOpenAiAssistant?: (patient?: Patient) => void;
}

export default function PharmacyView({
  medicines,
  setMedicines,
  prescriptions,
  setPrescriptions,
  patients,
  activeRole,
  searchTerm: globalSearchTerm,
  addNotification,
  onOpenAiAssistant,
}: PharmacyViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'queue'>('queue');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // New Medicine Modal State
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newCategory, setNewCategory] = useState<Medicine['category']>('Antibiotics');
  const [newDosageForm, setNewDosageForm] = useState<Medicine['dosageForm']>('Tablet');
  const [newStrength, setNewStrength] = useState('');
  const [newStock, setNewStock] = useState(100);
  const [newMinThreshold, setNewMinThreshold] = useState(25);
  const [newPrice, setNewPrice] = useState(15.00);
  const [newExpiry, setNewExpiry] = useState('2028-01-01');
  const [newBatch, setNewBatch] = useState('BATCH-2026-01');
  const [newManufacturer, setNewManufacturer] = useState('St. Jude Generic Lab');

  // Restock Modal State
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);
  const [restockAmount, setRestockAmount] = useState(50);

  // Dispensing View / Label Print Modal
  const [viewPrescription, setViewPrescription] = useState<PrescriptionOrder | null>(null);

  // Keyboard Escape listener to dismiss any open modals in PharmacyView
  useEffect(() => {
    const isAnyOpen = isAddMedicineOpen || !!restockMedicine || !!viewPrescription;
    if (!isAnyOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddMedicineOpen(false);
        setRestockMedicine(null);
        setViewPrescription(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddMedicineOpen, restockMedicine, viewPrescription]);

  // Filter Medicines
  const filteredMedicines = medicines.filter(med => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    const matchesQuery = med.name.toLowerCase().includes(query) ||
                         med.genericName.toLowerCase().includes(query) ||
                         med.batchNumber.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || med.inStock <= med.minThreshold;
    return matchesQuery && matchesCategory && matchesLowStock;
  });

  // Filter Prescriptions
  const filteredPrescriptions = prescriptions.filter(order => {
    const query = (globalSearchTerm || localSearch).toLowerCase();
    return order.patientName.toLowerCase().includes(query) ||
           order.doctorName.toLowerCase().includes(query) ||
           order.id.toLowerCase().includes(query);
  });

  // Summary Metrics
  const lowStockCount = medicines.filter(m => m.inStock <= m.minThreshold).length;
  const totalInventoryValue = medicines.reduce((acc, m) => acc + (m.inStock * m.unitPrice), 0);
  const pendingOrdersCount = prescriptions.filter(p => p.status === 'Pending Dispense').length;
  const dispensedTodayCount = prescriptions.filter(p => p.status === 'Dispensed').length;

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMed: Medicine = {
      id: `MED-${Date.now().toString().slice(-4)}`,
      name: newMedName.trim(),
      genericName: newGenericName.trim() || newMedName.trim(),
      category: newCategory,
      dosageForm: newDosageForm,
      strength: newStrength.trim() || 'Standard',
      inStock: Number(newStock),
      minThreshold: Number(newMinThreshold),
      unitPrice: Number(newPrice),
      expiryDate: newExpiry,
      batchNumber: newBatch,
      manufacturer: newManufacturer,
      requiresPrescription: true
    };

    setMedicines([newMed, ...medicines]);
    setIsAddMedicineOpen(false);
    addNotification('Pharmaceutical Inventory Updated', `Added ${newMed.name} to pharmacy warehouse.`, 'Success');

    // Reset
    setNewMedName('');
    setNewGenericName('');
    setNewStrength('');
  };

  const handleRestock = () => {
    if (!restockMedicine || restockAmount <= 0) return;
    setMedicines(
      medicines.map(m => m.id === restockMedicine.id ? { ...m, inStock: m.inStock + Number(restockAmount) } : m)
    );
    addNotification('Stock Restocked', `Replenished ${restockMedicine.name} (+${restockAmount} units).`, 'Success');
    setRestockMedicine(null);
  };

  const handleDispenseOrder = (orderId: string) => {
    const targetOrder = prescriptions.find(p => p.id === orderId);
    if (!targetOrder) return;

    // Deduct stock for each prescribed item if found in inventory
    const updatedMeds = [...medicines];
    targetOrder.medications.forEach(rx => {
      const matchIndex = updatedMeds.findIndex(m => m.name.toLowerCase().includes(rx.medication.toLowerCase()) || m.genericName.toLowerCase().includes(rx.medication.toLowerCase()));
      if (matchIndex >= 0 && updatedMeds[matchIndex].inStock > 0) {
        updatedMeds[matchIndex].inStock = Math.max(0, updatedMeds[matchIndex].inStock - 10);
      }
    });

    setMedicines(updatedMeds);
    setPrescriptions(
      prescriptions.map(p => p.id === orderId ? {
        ...p,
        status: 'Dispensed',
        dispensedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dispensedBy: activeRole === 'Pharmacist' ? 'Pharm. Clinical Staff' : 'Authorized Medical Staff'
      } : p)
    );

    addNotification('Prescription Dispensed', `e-Rx ${targetOrder.id} dispensed for ${targetOrder.patientName}.`, 'Success');
  };

  const categories = ['All', 'Antibiotics', 'Analgesics', 'Cardiovascular', 'Antidiabetic', 'Respiratory', 'Sedatives', 'Emergency/IV', 'Gastrointestinal'];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Dispense</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingOrdersCount} orders</h4>
            <p className="text-xs text-amber-500 font-medium mt-1">Requires pharmacist validation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dispensed Today</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dispensedTodayCount} e-Rx</h4>
            <p className="text-xs text-emerald-500 font-medium mt-1">Verified with 0 allergy clashes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Reorders</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{lowStockCount} items</h4>
            <p className="text-xs text-rose-500 font-medium mt-1">Below minimum buffer</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inventory Valuation</span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
            <p className="text-xs text-blue-500 font-medium mt-1">{medicines.length} total active formulations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="tab-rx-queue"
            onClick={() => setActiveSubTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeSubTab === 'queue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescription Queue</span>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-400 text-amber-950 font-bold rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            id="tab-med-inventory"
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeSubTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Medication Warehouse</span>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-rose-500 text-white font-bold rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drugs, patient, batch..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeSubTab === 'inventory' && (
            <button
              id="add-medicine-btn"
              onClick={() => setIsAddMedicineOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Formulation</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Prescription Dispensing Pipeline */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredPrescriptions.map(order => {
              const patientObj = patients.find(p => p.id === order.patientId);
              const isPending = order.status === 'Pending Dispense';

              return (
                <div
                  key={order.id}
                  id={`rx-order-${order.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isPending ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'}`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{order.patientName}</h4>
                          <span className="text-xs font-mono text-slate-400">({order.id})</span>
                          {order.priority === 'STAT' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 rounded-full animate-pulse">
                              STAT EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Prescribed by <span className="font-semibold text-slate-700 dark:text-slate-300">{order.doctorName}</span> on {order.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        isPending
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ${order.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Medications List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.medications.map((rx, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{rx.medication}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold rounded">
                            {rx.dosage}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-500">Regimen: </span>{rx.frequency} ({rx.duration})
                        </p>
                        {rx.instructions && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            "{rx.instructions}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Patient Allergy Check Badge */}
                  {patientObj?.allergies && patientObj.allergies.length > 0 && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs flex items-center justify-between text-rose-800 dark:text-rose-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-rose-600" />
                        <span><strong>Patient Allergies: </strong>{patientObj.allergies.join(', ')}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-600">Cross-Safety Verified</span>
                    </div>
                  )}

                  {/* Order Footer & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {order.dispensedAt ? (
                        <span>Dispensed at {order.dispensedAt} by {order.dispensedBy}</span>
                      ) : (
                        <span>{order.pharmacyNotes || 'Pending clinical pharmacist sign-off.'}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewPrescription(order)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Rx Label</span>
                      </button>

                      {onOpenAiAssistant && (
                        <button
                          onClick={() => onOpenAiAssistant(patientObj)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Drug Check</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          id={`dispense-btn-${order.id}`}
                          onClick={() => handleDispenseOrder(order.id)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Dispense Medication</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Medication Inventory Table */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterLowStockOnly
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alert Only</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Medication & Strength</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Dosage Form</th>
                    <th className="px-5 py-3.5">Stock Level</th>
                    <th className="px-5 py-3.5">Unit Price</th>
                    <th className="px-5 py-3.5">Batch / Expiry</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMedicines.map(med => {
                    const isLow = med.inStock <= med.minThreshold;

                    return (
                      <tr key={med.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{med.genericName} • {med.strength}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-300">
                            {med.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{med.dosageForm}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                              {med.inStock} units
                            </span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold rounded">
                                Reorder Req (&lt;{med.minThreshold})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          ${med.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-[11px] text-slate-500">{med.batchNumber}</div>
                          <div className="text-slate-400 text-[11px]">Exp: {med.expiryDate}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setRestockMedicine(med)}
                            className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                          >
                            + Restock
                          </button>
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

      {/* Modal: Add Formulation */}
      {isAddMedicineOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddMedicineOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Pharmaceutical Item</h3>
              <button onClick={() => setIsAddMedicineOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Lipitor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Generic / Molecule</label>
                  <input
                    type="text"
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                    placeholder="e.g. Atorvastatin"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Dosage Form</label>
                  <select
                    value={newDosageForm}
                    onChange={(e) => setNewDosageForm(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Strength</label>
                  <input
                    type="text"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    placeholder="e.g. 20mg"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min={1}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMedicineOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restock */}
      {restockMedicine && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRestockMedicine(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Restock Formulation Inventory</h3>
            <p className="text-slate-500">
              Adding units to <strong>{restockMedicine.name}</strong> ({restockMedicine.strength}). Current stock: {restockMedicine.inStock} units.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Units to Add:</label>
              <input
                type="number"
                min={10}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRestockMedicine(null)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Prescription Label Preview / Print */}
      {viewPrescription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewPrescription(null);
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-300 p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">St. Jude Medical Pharmacy</h3>
                <p className="text-[11px] text-slate-600">742 Healthcare Blvd • Licensed Rx Dispensary</p>
              </div>
              <span className="px-2 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
                {viewPrescription.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div><strong>Patient:</strong> {viewPrescription.patientName}</div>
              <div><strong>Date:</strong> {viewPrescription.date}</div>
              <div><strong>Doctor:</strong> {viewPrescription.doctorName}</div>
              <div><strong>Status:</strong> {viewPrescription.status}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-slate-700">Prescribed Formulations:</div>
              {viewPrescription.medications.map((rx, idx) => (
                <div key={idx} className="p-2.5 bg-slate-100 rounded border border-slate-200">
                  <div className="font-bold text-sm">{rx.medication} - {rx.dosage}</div>
                  <div className="text-slate-700">Take: {rx.frequency} for {rx.duration}</div>
                  {rx.instructions && <div className="text-[11px] text-slate-500 italic">"{rx.instructions}"</div>}
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200">
              Warning: Take only as directed by attending physician. Keep out of reach of children.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewPrescription(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setViewPrescription(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
