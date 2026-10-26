import React, { useState } from 'react';
import { BuyerGroup, CarVariant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { formatINR } from '../../lib/calculations';
import { PURCHASE_TIMELINES } from '../../lib/constants';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface JoinGroupModalProps {
  group: BuyerGroup;
  variants: CarVariant[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedGroup: BuyerGroup) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  group,
  variants,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedVariantId, setSelectedVariantId] = useState(group.variantId);
  const [budgetMax, setBudgetMax] = useState<number>(group.referenceStandardOnRoad);
  const [purchaseTimeline, setPurchaseTimeline] = useState('Within 30 Days (Ready)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please sign in to join this buyer group.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await dataService.joinBuyerGroup({
        groupId: group.id,
        user,
        variantId: selectedVariantId,
        variantName: selectedVariant?.variantName || group.variantName,
        budgetMax: Number(budgetMax) || group.referenceStandardOnRoad,
        purchaseTimeline,
        notes,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      if (res.group) {
        onSuccess(res.group);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while joining.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Join Buyer Group
            </h3>
            <p className="text-xs text-slate-500">
              {group.brandName} {group.modelName} in {group.city}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Group Status Summary */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Group Progress</span>
            <span className="text-indigo-600 font-bold">
              {group.currentMemberCount} / {group.targetGroupSize} Buyers
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{
                width: `${Math.min(100, (group.currentMemberCount / group.targetGroupSize) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Only <strong>{group.targetGroupSize - group.currentMemberCount} spots left</strong> before dealer quotation request opens!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Variant
            </label>
            <select
              value={selectedVariantId}
              onChange={e => {
                setSelectedVariantId(e.target.value);
                const v = variants.find(item => item.id === e.target.value);
                if (v) setBudgetMax(v.standardOnRoadPrice);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.variantName} ({formatINR(v.standardOnRoadPrice, true)} on-road)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Budget Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. 1800000"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Approx. {formatINR(budgetMax, true)}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchase Horizon
              </label>
              <select
                value={purchaseTimeline}
                onChange={e => setPurchaseTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                {PURCHASE_TIMELINES.map(t => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes or Color Preference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. White or Black color, ready with bank loan"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Privacy & Guarantee Notice */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Risk Commitment:</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-5">
              Joining a group is completely free and does <strong>not</strong> obligate you to buy. Your contact details remain private and are never disclosed to other group members.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Joining...' : 'Confirm & Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
