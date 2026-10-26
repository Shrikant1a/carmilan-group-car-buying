import React, { useState, useEffect } from 'react';
import { BuyerGroup, GroupMember, DealerOffer, CarVariant } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../../components/common/ProgressBar';
import { GroupStatusBadge, VerifiedDealerBadge } from '../../components/common/Badge';
import { JoinGroupModal } from '../../components/common/JoinGroupModal';
import { PriceBreakdownModal } from '../../components/common/PriceBreakdownModal';
import { formatINR, calculateSavings } from '../../lib/calculations';
import {
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  LogOut,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  Tag,
  Share2,
} from 'lucide-react';

interface GroupDetailsPageProps {
  groupId: string;
  onNavigate: (path: string) => void;
  onOpenSubmitQuote?: (groupId: string) => void;
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({
  groupId,
  onNavigate,
  onOpenSubmitQuote,
}) => {
  const { user, role, dealership } = useAuth();
  const [group, setGroup] = useState<BuyerGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [offers, setOffers] = useState<DealerOffer[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedOfferForBreakdown, setSelectedOfferForBreakdown] = useState<DealerOffer | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const g = await dataService.getBuyerGroupById(groupId);
    if (g) {
      setGroup(g);
      const [mems, offs, vars] = await Promise.all([
        dataService.getGroupMembers(g.id),
        dataService.getDealerOffers(g.id),
        dataService.getCarVariants(g.modelId),
      ]);
      setMembers(mems);
      setOffers(offs);
      setVariants(vars);

      if (user) {
        const joined = await dataService.isUserMemberOfGroup(g.id, user.id);
        setIsMember(joined);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [groupId, user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading buyer group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Buyer Group Not Found</h2>
        <p className="text-xs text-slate-500">
          This group may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => onNavigate('/groups')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
        >
          Back to Buyer Groups
        </button>
      </div>
    );
  }

  const isEligibleForQuotes =
    group.currentMemberCount >= group.minGroupSize &&
    (group.status === 'recruiting' || group.status === 'target_reached');

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(group.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleRequestQuotes = async () => {
    if (!user) {
      onNavigate('/login');
      return;
    }

    const res = await dataService.requestQuotationsForGroup(group.id, user.id);
    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to withdraw from this buyer group?')) {
      const res = await dataService.leaveBuyerGroup(group.id, user.id);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message });
        setIsMember(false);
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res.message });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard! Share it with friends wanting to buy this car.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between shadow-md ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Group Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
          {/* Car Image with Visual Badges */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-100 shadow-md">
            <img
              src={group.modelImage}
              alt={`${group.brandName} ${group.modelName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs">
                {group.brandName}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <GroupStatusBadge status={group.status} />
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900/90 text-white backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {group.city}, {group.state}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Buyer Group Specification
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Group
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 font-heading">
                {group.brandName} {group.modelName}
              </h1>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                {group.variantName}
              </p>
            </div>

            {/* Price & Benchmark */}
            <div className="flex flex-wrap items-baseline gap-4 pt-1 border-t border-slate-100">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Reference Individual On-Road
                </p>
                <p className="text-xl font-extrabold text-slate-800 font-heading">
                  {formatINR(group.referenceStandardOnRoad)}
                </p>
              </div>

              {group.potentialMaxSavings && (
                <div className="bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Best Quoted Dealership Savings
                  </p>
                  <p className="text-lg font-black text-emerald-600 font-heading">
                    Save {formatINR(group.potentialMaxSavings)}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar Display */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <ProgressBar
                current={group.currentMemberCount}
                target={group.targetGroupSize}
                size="lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {daysLeft > 0 ? `${daysLeft} days until deadline` : 'Deadline active'}
                </span>
                <span>Minimum to request quotes: <strong>{group.minGroupSize} buyers</strong></span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Join / Leave Group */}
              {isMember ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    You are an Active Participant
                  </span>
                  {group.status === 'recruiting' && (
                    <button
                      onClick={handleLeaveGroup}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              ) : group.status === 'recruiting' ? (
                <button
                  onClick={() => {
                    if (!user) {
                      onNavigate('/login');
                      return;
                    }
                    setJoinModalOpen(true);
                  }}
                  className="px-7 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Join This Buyer Group</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  Group is currently in <strong>{group.status}</strong> state (enrollment closed).
                </span>
              )}

              {/* Request Quotations CTA */}
              {isEligibleForQuotes && (
                <button
                  onClick={handleRequestQuotes}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span>Request Dealership Quotations</span>
                </button>
              )}

              {/* View Offers CTA */}
              {offers.length > 0 && (
                <button
                  onClick={() => onNavigate(`/offers/${group.id}`)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Compare {offers.length} Dealership Offers</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Action Card (If logged in as a Dealer) */}
      {role === 'dealer' && (
        <div className="p-6 rounded-3xl bg-blue-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-800 flex items-center justify-center text-blue-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                Authorized Dealer Portal
              </span>
              <h3 className="text-lg font-bold">
                Submit an Official Bulk Quotation for this Group
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Pool of {group.currentMemberCount} verified prospective buyers in {group.city} looking to purchase {group.modelName}.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSubmitQuote ? onOpenSubmitQuote(group.id) : onNavigate(`/dealer/requests`)}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-blue-900 hover:bg-blue-50 transition-all cursor-pointer shrink-0 shadow-md"
          >
            Submit Official Quotation
          </button>
        </div>
      )}

      {/* Two Column Layout: Quotations (Left) & Privacy-Protected Participants (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dealership Quotations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Received Dealership Quotations ({offers.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official competing bulk offers submitted by verified OEM dealerships.
              </p>
            </div>

            {offers.length > 0 && (
              <button
                onClick={() => onNavigate(`/offers/${group.id}`)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Full Comparison Table →
              </button>
            )}
          </div>

          {offers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Quotations Submitted Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {group.status === 'recruiting'
                  ? `Once the group reaches the minimum threshold of ${group.minGroupSize} buyers, quotation requests will be broadcast to certified dealerships in ${group.city}.`
                  : 'Dealerships have been notified. Competing offers will appear here as soon as dealerships submit their quotations.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map(offer => {
                const savings = calculateSavings(
                  offer.referenceStandardOnRoad,
                  offer.finalQuotedOnRoadPrice
                );
                return (
                  <div
                    key={offer.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900">
                            {offer.dealershipName}
                          </h4>
                          <VerifiedDealerBadge isVerified={offer.isDealershipVerified} />
                        </div>
                        <p className="text-xs text-slate-500">
                          Delivery in <strong>{offer.estimatedDeliveryDays} days</strong> • Valid until {offer.offerValidUntil}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Quoted On-Road</span>
                        <span className="text-xl font-black text-slate-900 font-heading">
                          {formatINR(offer.finalQuotedOnRoadPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown & Savings */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Ex-Showroom
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatINR(offer.exShowroomPrice)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Dealer Discount
                        </span>
                        <span className="font-bold text-emerald-600">
                          -{formatINR(offer.dealerDiscount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Net Savings
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {formatINR(savings.amount)} ({savings.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 italic truncate max-w-[280px]">
                        {offer.accessoriesIncluded.length > 0
                          ? `Includes: ${offer.accessoriesIncluded.join(', ')}`
                          : 'Standard accessories pack available'}
                      </span>

                      <button
                        onClick={() => setSelectedOfferForBreakdown(offer)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Itemized Bill</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Privacy-Safe Participants (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Participants ({members.length})
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Privacy Protected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Buyers in this group. Personal contact information is strictly confidential.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
            {members.map((m, idx) => (
              <div key={m.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                    {m.userInitials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      Buyer {idx + 1} ({m.userInitials})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {m.userCity} • Timeline: {m.purchaseTimeline}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Target Budget</span>
                  <span className="font-semibold text-slate-700">
                    {formatINR(m.budgetMax, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Legal / Protection Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              CarMilan Buyer Safeguards
            </h4>
            <p className="leading-relaxed text-[11px]">
              • Joining does not charge any money or obligate you to buy.<br />
              • Dealerships never receive your private phone number or email address until you physically decide to schedule a showroom booking test drive.<br />
              • All vehicles are delivered with official OEM factory warranty and direct manufacturer invoice.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <JoinGroupModal
        group={group}
        variants={variants}
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={updatedGroup => {
          setGroup(updatedGroup);
          setIsMember(true);
          setActionMessage({
            type: 'success',
            text: `Successfully joined ${updatedGroup.modelName} buyer group!`,
          });
          loadData();
        }}
      />

      {selectedOfferForBreakdown && (
        <PriceBreakdownModal
          offer={selectedOfferForBreakdown}
          isOpen={Boolean(selectedOfferForBreakdown)}
          onClose={() => setSelectedOfferForBreakdown(null)}
        />
      )}
    </div>
  );
};
