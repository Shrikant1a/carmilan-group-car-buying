import React, { useState, useEffect } from 'react';
import { BuyerGroup, DealerOffer } from '../../types';
import { dataService } from '../../services/dataService';
import { formatINR, calculateSavings } from '../../lib/calculations';
import { VerifiedDealerBadge } from '../../components/common/Badge';
import { PriceBreakdownModal } from '../../components/common/PriceBreakdownModal';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Tag,
  ShieldAlert,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface CompareOffersPageProps {
  groupId: string;
  onNavigate: (path: string) => void;
}

export const CompareOffersPage: React.FC<CompareOffersPageProps> = ({
  groupId,
  onNavigate,
}) => {
  const [group, setGroup] = useState<BuyerGroup | null>(null);
  const [offers, setOffers] = useState<DealerOffer[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'discount' | 'delivery'>('price');
  const [selectedOfferForBreakdown, setSelectedOfferForBreakdown] = useState<DealerOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const g = await dataService.getBuyerGroupById(groupId);
      if (g) {
        setGroup(g);
        const offs = await dataService.getDealerOffers(g.id);
        setOffers(offs);
      }
      setIsLoading(false);
    }
    load();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading dealership offers comparison...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Group Not Found</h2>
        <button
          onClick={() => onNavigate('/groups')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
        >
          Return to Buyer Groups
        </button>
      </div>
    );
  }

  // Sorting
  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'price') {
      return a.finalQuotedOnRoadPrice - b.finalQuotedOnRoadPrice;
    }
    if (sortBy === 'discount') {
      return b.dealerDiscount - a.dealerDiscount;
    }
    if (sortBy === 'delivery') {
      return a.estimatedDeliveryDays - b.estimatedDeliveryDays;
    }
    return 0;
  });

  const bestOffer = sortedOffers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate(`/groups/${group.id}`)}
          className="hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Group Details
        </button>
        <span>/</span>
        <span className="text-slate-800 font-bold">Dealership Price Comparison</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Official Bidding Results
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 font-heading">
            Compare Dealership Offers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {group.brandName} {group.modelName} ({group.variantName}) • {group.city} • Pool of {group.currentMemberCount} Buyers
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-xs"
          >
            <option value="price">Lowest On-Road Price</option>
            <option value="discount">Highest Dealer Discount</option>
            <option value="delivery">Fastest Delivery Time</option>
          </select>
        </div>
      </div>

      {/* Benchmark Reference Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">
              Standard Individual Retail Benchmark Price: {formatINR(group.referenceStandardOnRoad)}
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Based on official manufacturer ex-showroom price ({formatINR(group.referenceExShowroom)}) plus standard state RTO registration and zero-dep insurance. Savings calculations represent net reductions below this reference.
            </p>
          </div>
        </div>

        {bestOffer && (
          <div className="shrink-0 bg-white px-4 py-2.5 rounded-xl border border-indigo-200 shadow-xs text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lowest Quoted On-Road</span>
            <span className="text-lg font-black text-emerald-600 font-heading">
              {formatINR(bestOffer.finalQuotedOnRoadPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOffers.map((offer, index) => {
          const savings = calculateSavings(offer.referenceStandardOnRoad, offer.finalQuotedOnRoadPrice);
          const isBestPrice = index === 0 && sortBy === 'price';

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-xl ${
                isBestPrice ? 'ring-2 ring-indigo-500 border-indigo-200' : 'border-slate-200'
              }`}
            >
              {isBestPrice && (
                <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 text-center">
                  ★ Best Price Dealership Offer
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Dealership Info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                      {offer.dealershipName}
                    </h3>
                  </div>
                  <VerifiedDealerBadge isVerified={offer.isDealershipVerified} />
                </div>

                {/* Final Price & Savings */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Final Quoted On-Road Price
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-heading">
                    {formatINR(offer.finalQuotedOnRoadPrice)}
                  </p>
                  {savings.amount > 0 && (
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Save {formatINR(savings.amount)} ({savings.percentage}% off)
                    </p>
                  )}
                </div>

                {/* Key Line Items Breakdown */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Ex-Showroom Price:</span>
                    <span className="font-semibold text-slate-800">{formatINR(offer.exShowroomPrice)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Special Dealer Discount:</span>
                    <span>-{formatINR(offer.dealerDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>RTO + State Road Tax:</span>
                    <span className="font-semibold text-slate-800">{formatINR(offer.rtoCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Comprehensive Insurance:</span>
                    <span className="font-semibold text-slate-800">{formatINR(offer.insuranceCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Mandatory FASTag/Fees:</span>
                    <span className="font-semibold text-slate-800">{formatINR(offer.mandatoryCharges)}</span>
                  </div>
                  {offer.optionalAccessoriesPrice > 0 && (
                    <div className="flex justify-between text-indigo-700">
                      <span>Accessories Pack:</span>
                      <span className="font-semibold">{formatINR(offer.optionalAccessoriesPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Delivery & Expiry */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{offer.estimatedDeliveryDays} days</strong> delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Valid until {new Date(offer.offerValidUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedOfferForBreakdown(offer)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>View Itemized Bill & Terms</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Side-by-Side Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-heading">
            Comprehensive Line-by-Line Comparison Table
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compare all price components side-by-side. Calculated transparently without duplicate taxes or deductions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-4 font-bold text-slate-700 uppercase tracking-wider">Line Item</th>
                {sortedOffers.map(o => (
                  <th key={o.id} className="py-3 px-4 font-extrabold text-slate-900">
                    <div className="flex items-center gap-1">
                      <span>{o.dealershipName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">Ex-Showroom Price</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 font-semibold text-slate-800">
                    {formatINR(o.exShowroomPrice)}
                  </td>
                ))}
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-3 px-4 font-bold text-emerald-800">Dealer Group Discount</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 font-extrabold text-emerald-700">
                    -{formatINR(o.dealerDiscount)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">RTO & Road Tax</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 text-slate-700">
                    {formatINR(o.rtoCharges)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">Comprehensive Insurance</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 text-slate-700">
                    {formatINR(o.insuranceCharges)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">FASTag + Mandatory Fees</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 text-slate-700">
                    {formatINR(o.mandatoryCharges)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">Accessories Included</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 text-slate-700">
                    {o.accessoriesIncluded.length > 0 ? o.accessoriesIncluded.join(', ') : 'None'}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-900 text-white font-bold text-sm">
                <td className="py-4 px-4 font-black">Final Quoted On-Road Price</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-4 px-4 font-black text-indigo-400 font-heading">
                    {formatINR(o.finalQuotedOnRoadPrice)}
                  </td>
                ))}
              </tr>
              <tr className="bg-emerald-100/60 font-bold">
                <td className="py-3 px-4 text-emerald-900">Total Group Savings</td>
                {sortedOffers.map(o => {
                  const s = calculateSavings(o.referenceStandardOnRoad, o.finalQuotedOnRoadPrice);
                  return (
                    <td key={o.id} className="py-3 px-4 text-emerald-800 font-extrabold">
                      {formatINR(s.amount)} ({s.percentage}%)
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-500">Estimated Delivery Time</td>
                {sortedOffers.map(o => (
                  <td key={o.id} className="py-3 px-4 font-semibold text-slate-800">
                    {o.estimatedDeliveryDays} days
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Clear Disclaimer (as required by prompt) */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency Notice:</strong> All figures shown are illustrative quotations submitted by verified dealerships based on bulk volume demand. Final vehicle registration, physical PDI, color availability, and road tax invoice must be confirmed with the respective dealership before placing booking amount. CarMilan does not sell vehicles or guarantee showroom availability.
          </p>
        </div>
      </div>

      {/* Itemized Modal */}
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
