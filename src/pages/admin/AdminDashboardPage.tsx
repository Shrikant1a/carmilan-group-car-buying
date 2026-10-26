import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Dealership, BuyerGroup, CarModel, AuditLogEntry } from '../../types';
import { formatINR } from '../../lib/calculations';
import { VerifiedDealerBadge, GroupStatusBadge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Building2,
  Users,
  Car,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onSelectGroup,
}) => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalDealerships: 0,
    pendingVerifications: 0,
    activeGroups: 0,
    openQuotationRequests: 0,
    totalOffers: 0,
  });

  const [activeTab, setActiveTab] = useState<'verifications' | 'groups' | 'catalog' | 'audit'>(
    'verifications'
  );
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [groups, setGroups] = useState<BuyerGroup[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Model Modal
  const [newModelName, setNewModelName] = useState('');
  const [newBrandName, setNewBrandName] = useState('Hyundai');
  const [newStartingPrice, setNewStartingPrice] = useState(1200000);
  const [newBodyType, setNewBodyType] = useState<'Compact SUV' | 'Midsize SUV' | 'Sedan'>('Midsize SUV');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [st, dls, grps, mdls, logs] = await Promise.all([
        dataService.getAdminStats(user?.id),
        dataService.getDealerships(),
        dataService.getBuyerGroups(),
        dataService.getCarModels(),
        dataService.getAuditLogs(user?.id),
      ]);
      setStats(st);
      setDealerships(dls);
      setGroups(grps);
      setModels(mdls);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      loadData();
    }
  }, [role, user]);

  if (role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200 shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied</h2>
          <p className="mt-2 text-sm font-semibold text-rose-600 bg-rose-50 py-2 px-4 rounded-xl border border-rose-200 inline-block">
            Access denied. Administrator privileges are required.
          </p>
          <p className="mt-3 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your current account credentials do not grant access to the CarMilan Platform Administration Console. This security incident has been logged.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate(role === 'dealer' ? '/dealer/dashboard' : '/buyer/dashboard')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            ← Return to Dashboard
          </button>
          <button
            onClick={() => onNavigate('/admin/login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  const handleVerifyDealership = async (dealershipId: string, action: 'approve' | 'reject') => {
    let reason: string | undefined;
    if (action === 'reject') {
      reason = prompt('Enter reason for rejection:') || 'Documentation incomplete';
    }

    if (!user) return;
    const res = await dataService.verifyDealership(
      dealershipId,
      action,
      user.id,
      reason
    );
    alert(res.message);
    loadData();
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName || !user) return;

    const res = await dataService.addCarModel(
      {
        brandId: `brand-${newBrandName.toLowerCase()}`,
        brandName: newBrandName,
        name: newModelName,
        bodyType: newBodyType,
        fuelTypes: ['Petrol', 'Diesel'],
        startingPrice: Number(newStartingPrice),
        imageUrl: '/images/hero-cars.jpg',
        description: 'Newly added car model in CarMilan Indian automotive catalog.',
        popularityScore: 80,
        active: true,
      },
      user.id
    );

    if (!res.success) {
      alert(res.message);
      return;
    }

    setNewModelName('');
    alert('New car model added to catalog!');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Admin Super Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            Platform Administration & Oversight
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as <strong>{user?.fullName}</strong> • Full compliance, moderation, verification & catalog authority
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Buyers
          </span>
          <span className="text-xl font-black text-slate-900 font-heading">{stats.totalBuyers}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Dealerships
          </span>
          <span className="text-xl font-black text-slate-900 font-heading">{stats.totalDealerships}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Verifications
          </span>
          <span className="text-xl font-black text-amber-600 font-heading">{stats.pendingVerifications}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Groups
          </span>
          <span className="text-xl font-black text-indigo-600 font-heading">{stats.activeGroups}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Open RFQs
          </span>
          <span className="text-xl font-black text-blue-600 font-heading">{stats.openQuotationRequests}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Offers Sent
          </span>
          <span className="text-xl font-black text-emerald-600 font-heading">{stats.totalOffers}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dealership Verifications ({dealerships.length})
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'groups'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Buyer Groups ({groups.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Car Catalog ({models.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          System Audit Stream
        </button>
      </div>

      {/* Tab 1: Dealership Verification Workflow */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Registered Dealerships & Business Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review GSTIN authenticity and dealer authorization before certifying dealerships to submit bulk quotes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Dealership Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Brands Handled</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dealerships.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.dealershipName}
                      <span className="block text-[10px] text-slate-400 font-normal">{d.tradeName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{d.city}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{d.gstin}</td>
                    <td className="py-3.5 px-4 text-slate-700">{d.brandsHandled.join(', ')}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {d.contactPerson}
                      <span className="block text-[10px] text-slate-400">{d.contactPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <VerifiedDealerBadge isVerified={d.isVerified} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!d.isVerified ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerifyDealership(d.id, 'approve')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyDealership(d.id, 'reject')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Buyer Groups Management */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Platform Buyer Groups Management
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect group membership numbers, status transitions, and quotation workflows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Group Car & Variant</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4">Target Size</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {g.brandName} {g.modelName}
                      <span className="block text-[10px] text-slate-500">{g.variantName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{g.city}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.currentMemberCount} Buyers</td>
                    <td className="py-3.5 px-4 text-slate-600">{g.targetGroupSize} (min {g.minGroupSize})</td>
                    <td className="py-3.5 px-4 text-slate-600">{g.deadlineDate}</td>
                    <td className="py-3.5 px-4">
                      <GroupStatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectGroup(g.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Inspect Group →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Catalog Management */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add New Car Model to Platform</h3>
            <form onSubmit={handleAddModel} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elevate, Scorpio-N"
                  value={newModelName}
                  onChange={e => setNewModelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Brand</label>
                <select
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Hyundai">Hyundai</option>
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Maruti Suzuki">Maruti Suzuki</option>
                  <option value="Kia">Kia</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Starting Price (INR)</label>
                <input
                  type="number"
                  value={newStartingPrice}
                  onChange={e => setNewStartingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  + Add Model
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map(m => (
              <div key={m.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{m.brandName} {m.name}</p>
                  <p className="text-[11px] text-slate-500">{m.bodyType}</p>
                  <p className="text-[11px] font-extrabold text-slate-700">{formatINR(m.startingPrice, true)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Stream */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Platform Audit & Activity Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger of group formations, quotation transmissions, and verifications.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Actor: {log.actorName} ({log.actorId})
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
