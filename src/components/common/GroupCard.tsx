import React from 'react';
import { BuyerGroup } from '../../types';
import { ProgressBar } from './ProgressBar';
import { GroupStatusBadge } from './Badge';
import { formatINR } from '../../lib/calculations';
import { MapPin, Calendar, Tag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface GroupCardProps {
  group: BuyerGroup;
  onSelect: (groupId: string) => void;
  onJoinClick?: (group: BuyerGroup) => void;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onSelect,
  onJoinClick,
  isMember = false,
}) => {
  const isTargetReached = group.currentMemberCount >= group.targetGroupSize;
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(group.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div
      onClick={() => onSelect(group.id)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
    >
      <div>
        {/* Header Image & Badges */}
        <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
          <img
            src={group.modelImage}
            alt={`${group.brandName} ${group.modelName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-white/60">
              {group.brandName} {group.modelName}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <GroupStatusBadge status={group.status} size="sm" />
          </div>

          {/* City Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/85 backdrop-blur-md text-white shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {group.city}
          </div>

          {isMember && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500 text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              You're In
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {group.variantName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref. On-Road: <span className="font-semibold text-slate-700">{formatINR(group.referenceStandardOnRoad, true)}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ProgressBar
              current={group.currentMemberCount}
              target={group.targetGroupSize}
              size="md"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Closing soon'}
              </span>
              <span className="text-slate-600 font-medium">{group.purchaseTimeline}</span>
            </div>
          </div>

          {/* Potential Savings or Offer Teaser */}
          {group.status === 'offers_received' && group.potentialMaxSavings ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Best Dealership Offer:
              </span>
              <span className="text-emerald-700 font-extrabold text-sm">
                Save {formatINR(group.potentialMaxSavings, true)}
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Target Fleet Savings: <strong>~5% to 8% off on-road price</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-0">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {group.offersCount ? `${group.offersCount} Dealership Offers` : 'Organizer: ' + (group.creatorInitials || 'Buyer')}
          </span>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
            <span>{group.status === 'offers_received' ? 'Compare Offers' : 'View Group'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
