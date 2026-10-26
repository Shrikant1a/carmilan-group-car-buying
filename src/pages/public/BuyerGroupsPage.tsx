import React, { useState } from 'react';
import { BuyerGroup, GroupStatus } from '../../types';
import { GroupCard } from '../../components/common/GroupCard';
import { INDIAN_CITIES, GROUP_STATUS_LABELS } from '../../lib/constants';
import { Users, Search, Filter, PlusCircle, X, Sparkles } from 'lucide-react';

interface BuyerGroupsPageProps {
  groups: BuyerGroup[];
  onSelectGroup: (groupId: string) => void;
  onNavigate: (path: string) => void;
  initialModelFilter?: string;
}

export const BuyerGroupsPage: React.FC<BuyerGroupsPageProps> = ({
  groups,
  onSelectGroup,
  onNavigate,
  initialModelFilter,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>(initialModelFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'savings' | 'deadline'>('progress');

  // Filter groups
  let filtered = groups.filter(g => {
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (cityFilter !== 'all' && g.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (modelFilter !== 'all' && g.modelId !== modelFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !g.modelName.toLowerCase().includes(q) &&
        !g.brandName.toLowerCase().includes(q) &&
        !g.variantName.toLowerCase().includes(q) &&
        !g.city.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort groups
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'progress') {
      const pctA = a.currentMemberCount / a.targetGroupSize;
      const pctB = b.currentMemberCount / b.targetGroupSize;
      return pctB - pctA;
    }
    if (sortBy === 'savings') {
      return (b.potentialMaxSavings || 0) - (a.potentialMaxSavings || 0);
    }
    if (sortBy === 'deadline') {
      return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
    }
    return 0;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setCityFilter('all');
    setModelFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' || cityFilter !== 'all' || modelFilter !== 'all' || searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Collective Bargaining Hub
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 font-heading">
            Explore Active Buyer Groups
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join other verified car buyers in your city, track group capacity, and unlock dealership fleet prices.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/groups/new')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start New Group</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by model or city (e.g. Creta Mumbai, Thar, Pune Nexon)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All States ({groups.length})
          </button>
          <button
            onClick={() => setStatusFilter('recruiting')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'recruiting'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Recruiting
          </button>
          <button
            onClick={() => setStatusFilter('target_reached')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'target_reached'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Target Reached
          </button>
          <button
            onClick={() => setStatusFilter('quotations_requested')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'quotations_requested'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            RFQs Opened
          </button>
          <button
            onClick={() => setStatusFilter('offers_received')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              statusFilter === 'offers_received'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            Offers Received
          </button>
        </div>

        {/* City & Sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Filter by City
            </label>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="all">All Indian Cities</option>
              {INDIAN_CITIES.map(c => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Sort Opportunities
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="progress">Highest Participation % (Near Target)</option>
              <option value="savings">Highest Quoted Savings (INR)</option>
              <option value="deadline">Closing Soonest</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No buyer groups found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No active groups matched your search or city criteria. You can easily start a new group and be the group organizer!
            </p>
          </div>
          <button
            onClick={() => onNavigate('/groups/new')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-md"
          >
            Start a Group for Your City
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(group => (
            <GroupCard key={group.id} group={group} onSelect={onSelectGroup} />
          ))}
        </div>
      )}
    </div>
  );
};
