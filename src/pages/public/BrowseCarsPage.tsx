import React, { useState } from 'react';
import { CarBrand, CarModel, BuyerGroup } from '../../types';
import { CarCard } from '../../components/common/CarCard';
import { FUEL_TYPES, BODY_TYPES } from '../../lib/constants';
import { Search, SlidersHorizontal, Car, Filter, X } from 'lucide-react';

interface BrowseCarsPageProps {
  brands: CarBrand[];
  models: CarModel[];
  groups: BuyerGroup[];
  onSelectModel: (modelId: string) => void;
  onExploreGroups: (modelId: string) => void;
  onNavigate: (path: string) => void;
}

export const BrowseCarsPage: React.FC<BrowseCarsPageProps> = ({
  brands,
  models,
  groups,
  onSelectModel,
  onExploreGroups,
  onNavigate,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');
  const [budgetTier, setBudgetTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredModels = models.filter(m => {
    if (selectedBrand !== 'all' && m.brandId !== selectedBrand) return false;
    if (selectedBodyType !== 'all' && m.bodyType !== selectedBodyType) return false;
    if (selectedFuel !== 'all' && !m.fuelTypes.includes(selectedFuel as any)) return false;

    if (budgetTier === 'under_10') {
      if (m.startingPrice > 1000000) return false;
    } else if (budgetTier === '10_15') {
      if (m.startingPrice < 1000000 || m.startingPrice > 1500000) return false;
    } else if (budgetTier === '15_20') {
      if (m.startingPrice < 1500000 || m.startingPrice > 2000000) return false;
    } else if (budgetTier === 'above_20') {
      if (m.startingPrice < 2000000) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.brandName.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedBrand('all');
    setSelectedBodyType('all');
    setSelectedFuel('all');
    setBudgetTier('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedBrand !== 'all' ||
    selectedBodyType !== 'all' ||
    selectedFuel !== 'all' ||
    budgetTier !== 'all' ||
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Automotive Catalog
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 font-heading">
            Browse Indian Cars
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose your preferred car model and variant to view active buyer pools or initiate your own group.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/groups/new')}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          + Create Buyer Group
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by brand or model name (e.g., Hyundai Creta, Thar, Nexon)..."
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

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Brand Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="all">All Brands ({models.length})</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Body Type
            </label>
            <select
              value={selectedBodyType}
              onChange={e => setSelectedBodyType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="all">All Body Types</option>
              {BODY_TYPES.map(bt => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Fuel Type
            </label>
            <select
              value={selectedFuel}
              onChange={e => setSelectedFuel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="all">All Fuel Types</option>
              {FUEL_TYPES.map(ft => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Budget Range
            </label>
            <select
              value={budgetTier}
              onChange={e => setBudgetTier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="all">Any Budget</option>
              <option value="under_10">Under ₹10 Lakh</option>
              <option value="10_15">₹10 Lakh - ₹15 Lakh</option>
              <option value="15_20">₹15 Lakh - ₹20 Lakh</option>
              <option value="above_20">Above ₹20 Lakh</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredModels.length} of {models.length} models
            </span>
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No cars found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any car models matching your selected filters. Try broadening your criteria or search keyword.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map(model => (
            <CarCard
              key={model.id}
              model={model}
              onSelect={onSelectModel}
              onExploreGroups={onExploreGroups}
            />
          ))}
        </div>
      )}
    </div>
  );
};
