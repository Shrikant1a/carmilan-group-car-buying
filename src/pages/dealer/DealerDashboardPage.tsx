import React, { useState, useEffect } from 'react';
import { BuyerGroup, DealerOffer, Dealership } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { formatINR } from '../../lib/calculations';
import { VerifiedDealerBadge } from '../../components/common/Badge';
import { SubmitQuotationModal } from '../../components/dealer/SubmitQuotationModal';
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DealerDashboardPageProps {
  onNavigate: (path: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export const DealerDashboardPage: React.FC<DealerDashboardPageProps> = ({
  onNavigate,
  onSelectGroup,
}) => {
  const { user, dealership, refreshUserData } = useAuth();
  const [rfqGroups, setRfqGroups] = useState<BuyerGroup[]>([]);
  const [myOffers, setMyOffers] = useState<DealerOffer[]>([]);
  const [activeGroupForQuote, setActiveGroupForQuote] = useState<BuyerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const allGroups = await dataService.getBuyerGroups();

    // Show groups in 'quotations_requested' or 'target_reached' or 'offers_received'
    const openRequests = allGroups.filter(
      g =>
        g.status === 'quotations_requested' ||
        g.status === 'target_reached' ||
        g.status === 'offers_received'
    );
    setRfqGroups(openRequests);

    if (dealership) {
      const allOffers = await Promise.all(
        allGroups.map(g => dataService.getDealerOffers(g.id))
      );
      const flattened = allOffers.flat().filter(o => o.dealershipId === dealership.id || o.dealershipName === dealership.dealershipName);
      setMyOffers(flattened);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [dealership, user]);

  const handleWithdraw = async (offerId: string) => {
    if (confirm('Withdraw this submitted quotation from the buyer group?')) {
      if (user) {
        await dataService.withdrawDealerOffer(offerId, user.id);
        loadData();
      }
    }
  };

  if (user?.role !== 'dealer') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 shadow-md">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied</h2>
        <p className="text-sm text-slate-600">
          The Dealership Portal is restricted to verified dealership accounts.
        </p>
        <button
          onClick={() => onNavigate(user ? '/buyer/dashboard' : '/login')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          {user ? '← Return to Dashboard' : 'Log In'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dealership Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
              OEM Authorized Dealership Portal
            </span>
            <VerifiedDealerBadge isVerified={dealership?.isVerified ?? false} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            {dealership?.dealershipName || user?.fullName || 'Dealership Portal'}
          </h1>
          <p className="text-xs text-blue-200">
            GSTIN: <span className="font-mono text-white font-bold">{dealership?.gstin || 'Pending Verification'}</span> • {dealership?.city || user?.city || 'India'}, {dealership?.state || 'India'}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-300">
            <span>Authorized Brands:</span>
            {(dealership?.brandsHandled || ['Multi-Brand']).map(b => (
              <span key={b} className="px-2 py-0.5 rounded bg-blue-800 text-white font-bold">
                {b}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate('/dealer/verification')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-blue-900 hover:bg-blue-50 transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Verification & Credentials</span>
        </button>
      </div>

      {/* Pending Verification Notice */}
      {dealership && !dealership.isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">Dealership Verification Pending Administrator Review</p>
              <p className="text-amber-800 mt-0.5">
                Your business credentials (GSTIN {dealership.gstin}) are currently under review. RFQs can be previewed; official quotation submission unlocks upon verified status.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/dealer/verification')}
            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 text-xs shrink-0 cursor-pointer"
          >
            Review Details
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {rfqGroups.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Eligible Buyer Pools</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {myOffers.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Active Quotes Sent</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              {rfqGroups.reduce((acc, g) => acc + g.currentMemberCount, 0)}
            </span>
            <p className="text-xs text-slate-500 font-medium">Prospective Car Units</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading">
              Zero CAC
            </span>
            <p className="text-xs text-slate-500 font-medium">Direct Showroom Leads</p>
          </div>
        </div>
      </div>

      {/* Section 1: Eligible Incoming Buyer Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Incoming Buyer Group Requests ({rfqGroups.length})
            </h2>
            <p className="text-xs text-slate-500">
              Verified buyers in your territory awaiting competitive dealership proposals.
            </p>
          </div>
        </div>

        {rfqGroups.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
            No incoming RFQ requests matching your brand/city currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfqGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {group.city}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {group.currentMemberCount} Buyers
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {group.brandName} {group.modelName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">{group.variantName}</p>

                  <div className="pt-2 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span className="font-semibold text-slate-700">{group.purchaseTimeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ref. Retail On-Road:</span>
                      <span className="font-semibold text-slate-700">{formatINR(group.referenceStandardOnRoad)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectGroup(group.id)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    View Group
                  </button>

                  <button
                    onClick={() => setActiveGroupForQuote(group)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Quote</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Submitted Quotations */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900 font-heading">
            My Active Dealership Offers ({myOffers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Quotations your dealership has transmitted to buyer groups.
          </p>
        </div>

        {myOffers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
            You have not submitted any quotations yet. Check the incoming requests above to submit your first offer!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Group / Car Model</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Ex-Showroom</th>
                  <th className="py-3 px-4">Dealer Discount</th>
                  <th className="py-3 px-4">Quoted On-Road</th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {offer.variantName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{offer.city}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatINR(offer.exShowroomPrice)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">-{formatINR(offer.dealerDiscount)}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{formatINR(offer.finalQuotedOnRoadPrice)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{offer.estimatedDeliveryDays} days</td>
                    <td className="py-3.5 px-4 text-slate-600">{offer.offerValidUntil}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {offer.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleWithdraw(offer.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Quotation Modal */}
      {activeGroupForQuote && (
        <SubmitQuotationModal
          group={activeGroupForQuote}
          isOpen={Boolean(activeGroupForQuote)}
          onClose={() => setActiveGroupForQuote(null)}
          onSuccess={offer => {
            alert('Quotation submitted successfully to the buyer group!');
            loadData();
          }}
        />
      )}
    </div>
  );
};
