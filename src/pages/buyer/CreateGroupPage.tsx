import React, { useState, useEffect } from 'react';
import { CarModel, CarVariant } from '../../types';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_CITIES, PURCHASE_TIMELINES } from '../../lib/constants';
import { formatINR } from '../../lib/calculations';
import confetti from 'canvas-confetti';
import {
  Car,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CreateGroupPageProps {
  models: CarModel[];
  onNavigate: (path: string) => void;
  onGroupCreated: (groupId: string) => void;
}

export const CreateGroupPage: React.FC<CreateGroupPageProps> = ({
  models,
  onNavigate,
  onGroupCreated,
}) => {
  const { user } = useAuth();
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'model-creta');
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Mumbai');
  const [targetGroupSize, setTargetGroupSize] = useState<number>(20);
  const [minGroupSize, setMinGroupSize] = useState<number>(5);
  const [purchaseTimeline, setPurchaseTimeline] = useState<string>('Within 30 Days (Ready)');
  const [deadlineDate, setDeadlineDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch variants when model changes
  useEffect(() => {
    async function loadVariants() {
      if (selectedModelId) {
        const vars = await dataService.getCarVariants(selectedModelId);
        setVariants(vars);
        if (vars.length > 0) {
          setSelectedVariantId(vars[0].id);
        }
      }
    }
    loadVariants();
  }, [selectedModelId]);

  const selectedModel = models.find(m => m.id === selectedModelId);
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
  const selectedCityObj = INDIAN_CITIES.find(c => c.city === selectedCity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('/login');
      return;
    }

    if (!selectedVariant) {
      setErrorMsg('Please select a car variant.');
      return;
    }

    if (targetGroupSize < 3) {
      setErrorMsg('Target group size must be at least 3 buyers.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await dataService.createBuyerGroup({
        modelId: selectedModelId,
        variantId: selectedVariant.id,
        city: selectedCity,
        state: selectedCityObj?.state || 'Maharashtra',
        targetGroupSize: Number(targetGroupSize),
        minGroupSize: Number(minGroupSize),
        purchaseTimeline,
        deadlineDate,
        notes,
        user,
      });

      if (!res.success || !res.group) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      // Celebrate
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      onGroupCreated(res.group.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create buyer group.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Demand Aggregation
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2 font-heading">
          Start a New Buyer Group
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Specify your target car model and city. We'll publish your group to pool local buyers and request fleet discounts.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Wizard */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Step 1: Select Model */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            1. Select Car Model
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {models.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedModelId === m.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-extrabold text-slate-900">{m.name}</p>
                <p className="text-[11px] text-slate-500">{m.brandName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Variant & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Specific Variant
            </label>
            <select
              value={selectedVariantId}
              onChange={e => setSelectedVariantId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.variantName} ({formatINR(v.standardOnRoadPrice, true)} on-road)
                </option>
              ))}
            </select>
            {selectedVariant && (
              <p className="text-[11px] text-slate-500 mt-1">
                Standard On-Road Reference: <strong>{formatINR(selectedVariant.standardOnRoadPrice)}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Target City
            </label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.state})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Dealerships within this city territory will submit competitive quotes.
            </p>
          </div>
        </div>

        {/* Step 3: Target Group Size & Minimum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Target Group Size
              </label>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {targetGroupSize} Buyers
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              value={targetGroupSize}
              onChange={e => {
                const val = Number(e.target.value);
                setTargetGroupSize(val);
                if (minGroupSize > val) setMinGroupSize(Math.max(2, Math.round(val * 0.4)));
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Higher group size yields stronger dealership discount incentives.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              5. Minimum Size to Request Quotes
            </label>
            <input
              type="number"
              min="2"
              max={targetGroupSize}
              value={minGroupSize}
              onChange={e => setMinGroupSize(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              You can trigger quotation requests once at least {minGroupSize} buyers join.
            </p>
          </div>
        </div>

        {/* Step 4: Purchase Timeline & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              6. Purchase Horizon
            </label>
            <select
              value={purchaseTimeline}
              onChange={e => setPurchaseTimeline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              {PURCHASE_TIMELINES.map(t => (
                <option key={t.id} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              7. Group Enrollment Deadline
            </label>
            <input
              type="date"
              value={deadlineDate}
              onChange={e => setDeadlineDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            8. Organizer Note or Specific Requirements (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Focusing on buyers in Mumbai Suburban area, open to Petrol or Diesel variants..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Assurance Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Organizer Guarantee:</span>
          </div>
          <p className="text-slate-600 leading-relaxed pl-5">
            You will automatically be registered as Participant #1. Creating this group is 100% free and does not require credit card or advance booking payments.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('/groups')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Creating Group...' : 'Publish Buyer Group'}
          </button>
        </div>
      </form>
    </div>
  );
};
