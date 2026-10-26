import React, { useState, useEffect } from 'react';
import { BuyerGroup, CarModel, AppNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { GroupCard } from '../../components/common/GroupCard';
import { CarCard } from '../../components/common/CarCard';
import { formatINR } from '../../lib/calculations';
import {
  Layers,
  Heart,
  Bell,
  User,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface BuyerDashboardPageProps {
  onNavigate: (path: string) => void;
  onSelectGroup: (groupId: string) => void;
  onSelectModel: (modelId: string) => void;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({
  onNavigate,
  onSelectGroup,
  onSelectModel,
}) => {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<BuyerGroup[]>([]);
  const [savedModels, setSavedModels] = useState<CarModel[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);

      const allGroups = await dataService.getBuyerGroups();
      const userJoined: BuyerGroup[] = [];
      for (const g of allGroups) {
        const isMem = await dataService.isUserMemberOfGroup(g.id, user.id);
        if (isMem) userJoined.push(g);
      }
      setJoinedGroups(userJoined);

      const savedIds = await dataService.getSavedCars(user.id);
      const allModels = await dataService.getCarModels();
      setSavedModels(allModels.filter(m => savedIds.includes(m.id)));

      const notifs = await dataService.getNotifications(user.id);
      setNotifications(notifs.slice(0, 5));

      setIsLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500">
          Sign in or switch to the Buyer demo persona to view your buyer dashboard.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              Verified Buyer Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-slate-400">
            {user.city} • Preferred Contact: {user.preferredContactMethod.toUpperCase()} • {user.phone}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/groups/new')}
          className="px-5 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Buyer Group</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {joinedGroups.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Active Groups Joined</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {savedModels.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Wishlisted Models</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {joinedGroups.reduce((acc, g) => acc + (g.offersCount || 0), 0)}
            </span>
            <p className="text-xs text-slate-500 font-medium">Dealer Offers Available</p>
          </div>
        </div>
      </div>

      {/* Section 1: Active Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              My Active Buyer Groups ({joinedGroups.length})
            </h2>
            <p className="text-xs text-slate-500">
              Groups you have joined to pool demand with fellow buyers.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/groups')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Explore More Groups →
          </button>
        </div>

        {joinedGroups.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">You haven't joined any buyer groups yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Find a car you love and join a group in your city to unlock collective dealership discounts.
            </p>
            <button
              onClick={() => onNavigate('/groups')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
            >
              Browse Buyer Groups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onSelect={onSelectGroup}
                isMember={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Saved Cars */}
      {savedModels.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-heading">
                Saved Wishlist Cars ({savedModels.length})
              </h2>
              <p className="text-xs text-slate-500">
                Cars you've saved for quick access and group creation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedModels.map(model => (
              <CarCard
                key={model.id}
                model={model}
                onSelect={onSelectModel}
                onExploreGroups={id => onNavigate(`/groups?modelId=${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
