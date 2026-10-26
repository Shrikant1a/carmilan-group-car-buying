import React, { useState, useEffect } from 'react';
import { CarModel, CarVariant, BuyerGroup } from '../../types';
import { dataService } from '../../services/dataService';
import { formatINR } from '../../lib/calculations';
import { GroupCard } from '../../components/common/GroupCard';
import {
  ArrowLeft,
  Fuel,
  ShieldCheck,
  PlusCircle,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CarDetailsPageProps {
  modelId: string;
  onNavigate: (path: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export const CarDetailsPage: React.FC<CarDetailsPageProps> = ({
  modelId,
  onNavigate,
  onSelectGroup,
}) => {
  const [model, setModel] = useState<CarModel | null>(null);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [groups, setGroups] = useState<BuyerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const m = await dataService.getCarModelById(modelId);
      if (m) {
        setModel(m);
        const [v, g] = await Promise.all([
          dataService.getCarVariants(m.id),
          dataService.getBuyerGroups({ modelId: m.id }),
        ]);
        setVariants(v);
        setGroups(g);
      }
      setIsLoading(false);
    }
    load();
  }, [modelId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading car specifications...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Car Model Not Found</h2>
        <button
          onClick={() => onNavigate('/cars')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('/cars')}
          className="hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cars
        </button>
        <span>/</span>
        <span className="text-slate-800 font-bold">{model.brandName} {model.name}</span>
      </div>

      {/* Hero Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
        <div className="lg:col-span-6 aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
          <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
        </div>

        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {model.brandName}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {model.bodyType}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              {model.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {model.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pricing Range
            </span>
            <p className="text-2xl font-black text-slate-900 font-heading">
              Starts from {formatINR(model.startingPrice, true)}
              <span className="text-xs font-normal text-slate-500 ml-1">ex-showroom</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate(`/groups/new`)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Group for this Car</span>
            </button>

            <button
              onClick={() => onNavigate(`/groups?modelId=${model.id}`)}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>View {groups.length} Existing Groups</span>
            </button>
          </div>
        </div>
      </div>

      {/* Variants & Pricing Specs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-heading">
            Official Variants & Retail Pricing Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            Standard manufacturer ex-showroom and estimated individual on-road benchmarks for {model.name}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Variant Name</th>
                <th className="py-3 px-4">Fuel & Transmission</th>
                <th className="py-3 px-4">Engine (CC)</th>
                <th className="py-3 px-4">Ex-Showroom</th>
                <th className="py-3 px-4">Est. Standard On-Road</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{v.variantName}</td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {v.fuelType} • {v.transmission}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{v.engineCc ? `${v.engineCc} cc` : 'N/A'}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{formatINR(v.exShowroomPrice)}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{formatINR(v.standardOnRoadPrice)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigate('/groups/new')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                    >
                      Start Group
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Buyer Groups for this Model */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Active Buyer Groups for {model.name} ({groups.length})
            </h2>
            <p className="text-xs text-slate-500">
              Join buyers in your city pooling volume for this car.
            </p>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No active buyer groups currently forming for this car. Be the first to start a group!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(g => (
              <GroupCard key={g.id} group={g} onSelect={onSelectGroup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
