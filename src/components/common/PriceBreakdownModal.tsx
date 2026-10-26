import React from 'react';
import { DealerOffer } from '../../types';
import { formatINR, calculateSavings } from '../../lib/calculations';
import { VerifiedDealerBadge } from './Badge';
import { X, CheckCircle2, ShieldCheck, Printer, Calendar, Clock, Sparkles } from 'lucide-react';

interface PriceBreakdownModalProps {
  offer: DealerOffer;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  offer,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const savings = calculateSavings(offer.referenceStandardOnRoad, offer.finalQuotedOnRoadPrice);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-5 mb-5">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Official Dealership Quotation Breakdown
            </span>
            <VerifiedDealerBadge isVerified={offer.isDealershipVerified} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 font-heading">
            {offer.dealershipName}
          </h3>
          <p className="text-sm font-semibold text-slate-600 mt-0.5">
            {offer.variantName} • {offer.city}
          </p>
        </div>

        {/* Highlight Savings Box */}
        {savings.amount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
                  Group Fleet Savings
                </p>
                <p className="text-xl font-extrabold font-heading">
                  {formatINR(savings.amount)} Saved
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-black">
                {savings.percentage}% OFF Standard Retail
              </span>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
            <span>Price Component</span>
            <span>Amount (INR)</span>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Manufacturer Ex-Showroom Price</span>
                <p className="text-xs text-slate-400">Official OEM base vehicle price</p>
              </div>
              <span className="font-bold text-slate-900">{formatINR(offer.exShowroomPrice)}</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between bg-emerald-50/50">
              <div>
                <span className="font-bold text-emerald-700">(-) Dealer Special Group Discount</span>
                <p className="text-xs text-emerald-600">Exclusive CarMilan bulk buyer volume deduction</p>
              </div>
              <span className="font-bold text-emerald-700">-{formatINR(offer.dealerDiscount)}</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">(+) RTO Registration & Road Tax</span>
                <p className="text-xs text-slate-400">State motor vehicle registration charges</p>
              </div>
              <span className="font-semibold text-slate-800">{formatINR(offer.rtoCharges)}</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">(+) Motor Insurance Package</span>
                <p className="text-xs text-slate-400">1-Year Own Damage + 3-Year Third Party Comprehensive</p>
              </div>
              <span className="font-semibold text-slate-800">{formatINR(offer.insuranceCharges)}</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">(+) Mandatory Regulatory Charges</span>
                <p className="text-xs text-slate-400">FASTag, Smart Card RC fee, Hypothecation & TCS</p>
              </div>
              <span className="font-semibold text-slate-800">{formatINR(offer.mandatoryCharges)}</span>
            </div>

            {offer.optionalAccessoriesPrice > 0 && (
              <div className="px-4 py-3 flex items-center justify-between bg-indigo-50/40">
                <div>
                  <span className="font-semibold text-indigo-900">(+) Dealership Accessories Pack</span>
                  <p className="text-xs text-indigo-600">
                    {offer.accessoriesIncluded.join(', ') || 'Selected original accessories'}
                  </p>
                </div>
                <span className="font-semibold text-indigo-900">{formatINR(offer.optionalAccessoriesPrice)}</span>
              </div>
            )}

            {/* Total Row */}
            <div className="px-4 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-base font-black">Final Quoted On-Road Price</span>
                <p className="text-xs text-slate-400">Total payable at showroom with group discount</p>
              </div>
              <span className="text-2xl font-black font-heading text-indigo-400">
                {formatINR(offer.finalQuotedOnRoadPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Estimated Delivery Time</p>
              <p className="text-slate-500">{offer.estimatedDeliveryDays} days from booking confirmation</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Quotation Valid Until</p>
              <p className="text-slate-500">
                {new Date(offer.offerValidUntil).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {offer.termsConditions && (
          <div className="mb-6 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">Dealership Terms & Conditions:</p>
            <p className="leading-relaxed">{offer.termsConditions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save Summary
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-md"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
