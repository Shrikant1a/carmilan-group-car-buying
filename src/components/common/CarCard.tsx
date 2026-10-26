import React, { useState, useEffect } from 'react';
import { CarModel } from '../../types';
import { formatINR } from '../../lib/calculations';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { Users, Fuel, ArrowRight, Heart } from 'lucide-react';

interface CarCardProps {
  model: CarModel;
  onSelect: (modelId: string) => void;
  onExploreGroups: (modelId: string) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ model, onSelect, onExploreGroups }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [activeGroupCount, setActiveGroupCount] = useState(0);

  useEffect(() => {
    if (user) {
      dataService.getSavedCars(user.id).then(saved => {
        setIsSaved(saved.includes(model.id));
      });
    }
    dataService.getBuyerGroups({ modelId: model.id }).then(groups => {
      setActiveGroupCount(groups.length);
    });
  }, [user, model.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save cars to your wishlist.');
      return;
    }
    const res = await dataService.toggleSaveCar(user.id, model.id);
    setIsSaved(res.saved);
  };

  return (
    <div
      onClick={() => onSelect(model.id)}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Car Image with Badges */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
        <img
          src={model.imageUrl}
          alt={`${model.brandName} ${model.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border border-white/60">
            {model.brandName}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900/80 backdrop-blur-md text-white shadow-xs">
            {model.bodyType}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleSave}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-500 transition-colors shadow-xs hover:scale-110 cursor-pointer"
          aria-label="Save car"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {activeGroupCount > 0 && (
          <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <Users className="w-3 h-3" />
            {activeGroupCount} Active {activeGroupCount === 1 ? 'Group' : 'Groups'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {model.name}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Starts at
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xl font-extrabold text-slate-900 font-heading">
              {formatINR(model.startingPrice, true)}
              <span className="text-xs font-normal text-slate-500 ml-1">ex-showroom</span>
            </p>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {model.description}
          </p>

          {/* Fuel Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <Fuel className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
            {model.fuelTypes.map(f => (
              <span
                key={f}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Variants & Groups
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
