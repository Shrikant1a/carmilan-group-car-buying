import React, { useState } from 'react';
import { BuyerGroup, DealerOffer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { calculateOnRoadPrice, calculateSavings, formatINR } from '../../lib/calculations';
import { STANDARD_ACCESSORIES_LIST } from '../../lib/constants';
import { X, Building2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SubmitQuotationModalProps {
  group: BuyerGroup;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (offer: DealerOffer) => void;
}

export const SubmitQuotationModal: React.FC<SubmitQuotationModalProps> = ({
  group,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, dealership } = useAuth();

  // Pricing inputs
  const [exShowroom, setExShowroom] = useState<number>(group.referenceExShowroom);
  const [dealerDiscount, setDealerDiscount] = useState<number>(100000);
  const [rtoCharges, setRtoCharges] = useState<number>(
    Math.round(group.referenceExShowroom * 0.11)
  );
  const [insuranceCharges, setInsuranceCharges] = useState<number>(
    Math.round(group.referenceExShowroom * 0.035 + 8500)
  );
  const [mandatoryCharges, setMandatoryCharges] = useState<number>(22650);
  const [optionalAccessoriesPrice, setOptionalAccessoriesPrice] = useState<number>(12000);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    'All-Weather 3D Floor Mats',
    'Mud Flaps Set',
  ]);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(14);
  const [offerValidUntil, setOfferValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split('T')[0];
  });
  const [termsConditions, setTermsConditions] = useState<string>(
    'Exclusive CarMilan bulk group allocation. Price includes standard OEM warranty and 3-year roadside assistance. Final booking token ₹25,000 paid at dealership showroom.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Real-time calculation
  const calculatedOnRoad = calculateOnRoadPrice({
    exShowroom,
    dealerDiscount,
    rtoCharges,
    insuranceCharges,
    mandatoryCharges,
    optionalAccessoriesPrice,
  });

  const savings = calculateSavings(group.referenceStandardOnRoad, calculatedOnRoad);

  const toggleAccessory = (acc: string) => {
    if (selectedAccessories.includes(acc)) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== acc));
    } else {
      setSelectedAccessories([...selectedAccessories, acc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in as an authorized dealer.');
      return;
    }

    if (dealerDiscount <= 0) {
      setErrorMsg('Dealer group discount must be greater than zero for collective buyer proposals.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const dealershipName = dealership?.dealershipName || user.fullName;
      const isVerified = dealership?.isVerified ?? true;

      const res = await dataService.submitDealerOffer({
        quotationRequestId: `rfq-${group.id}`,
        groupId: group.id,
        dealershipId: dealership?.id || `dealer-${user.id}`,
        dealershipName,
        isDealershipVerified: isVerified,
        city: group.city,
        variantId: group.variantId,
        variantName: group.variantName,
        exShowroomPrice: Number(exShowroom),
        dealerDiscount: Number(dealerDiscount),
        rtoCharges: Number(rtoCharges),
        insuranceCharges: Number(insuranceCharges),
        mandatoryCharges: Number(mandatoryCharges),
        optionalAccessoriesPrice: Number(optionalAccessoriesPrice),
        accessoriesIncluded: selectedAccessories,
        estimatedDeliveryDays: Number(estimatedDeliveryDays),
        offerValidUntil,
        termsConditions,
        status: 'submitted',
      });

      if (!res.success || !res.offer) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.offer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quotation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Submit Dealership Bulk Quotation
            </h3>
            <p className="text-xs text-slate-500">
              For {group.brandName} {group.modelName} ({group.variantName}) in {group.city} • Pool of {group.currentMemberCount} Buyers
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Calculation Preview Card */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                Calculated On-Road Price Per Buyer
              </span>
              <p className="text-3xl font-black font-heading text-indigo-400 mt-0.5">
                {formatINR(calculatedOnRoad)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard Retail: {formatINR(group.referenceStandardOnRoad)}
              </p>
            </div>

            {savings.amount > 0 && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-right">
                <span className="text-[10px] font-bold uppercase text-emerald-300 block">
                  Total Buyer Savings
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {formatINR(savings.amount)} ({savings.percentage}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ex-Showroom Price (INR)
              </label>
              <input
                type="number"
                value={exShowroom}
                onChange={e => setExShowroom(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Dealership Group Discount (INR)
              </label>
              <input
                type="number"
                value={dealerDiscount}
                onChange={e => setDealerDiscount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/30 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                RTO & Road Tax
              </label>
              <input
                type="number"
                value={rtoCharges}
                onChange={e => setRtoCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Motor Insurance
              </label>
              <input
                type="number"
                value={insuranceCharges}
                onChange={e => setInsuranceCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                FASTag & TCS / Fees
              </label>
              <input
                type="number"
                value={mandatoryCharges}
                onChange={e => setMandatoryCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Accessories Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Included Accessories Package
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Package Price (INR):</span>
                <input
                  type="number"
                  value={optionalAccessoriesPrice}
                  onChange={e => setOptionalAccessoriesPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
              {STANDARD_ACCESSORIES_LIST.map(acc => (
                <label key={acc} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAccessories.includes(acc)}
                    onChange={() => toggleAccessory(acc)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="truncate">{acc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Delivery (Days from Booking)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={estimatedDeliveryDays}
                onChange={e => setEstimatedDeliveryDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Offer Expiration Date
              </label>
              <input
                type="date"
                value={offerValidUntil}
                onChange={e => setOfferValidUntil(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dealership Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={termsConditions}
              onChange={e => setTermsConditions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Quotation...' : 'Transmit Official Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
