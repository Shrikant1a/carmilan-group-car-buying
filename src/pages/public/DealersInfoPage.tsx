import React from 'react';
import {
  Building2,
  TrendingUp,
  Target,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react';

interface DealersInfoPageProps {
  onNavigate: (path: string) => void;
}

export const DealersInfoPage: React.FC<DealersInfoPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Authorized Dealership Partner Program
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-heading">
          High-Velocity Bulk Retail Vehicle Sales
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          CarMilan enables authorized car dealerships to acquire pre-qualified, high-intent buyer pools in bulk without paying expensive digital advertising acquisition costs or chasing lukewarm leads.
        </p>
      </div>

      {/* 4 Pillars for Dealerships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Zero Marketing CAC (Customer Acquisition Cost)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In India, automobile dealers spend between ₹12,000 to ₹25,000 per delivered car on digital marketing, portals, and telecallers. With CarMilan, you receive structured quotation requests from 10 to 30 ready buyers at zero marketing expense.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Achieve Monthly OEM Volume Targets
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Close 15 to 25 incremental vehicle bookings in a single transaction toward the end of the month to unlock manufacturer quarterly bonuses, targets, and special volume incentives.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Pre-Filtered Buyer Specifications
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every buyer group specifies the exact variant (e.g. Creta SX Petrol Manual), target budget, and delivery timeline (within 15, 30, or 60 days). No tire kickers or mismatched customer expectations.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Direct Showroom Delivery & Invoicing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            CarMilan does not interfere with showroom relationships. Buyers physically visit your authorized showroom, take delivery from your dealership floor, and your dealership retains all downstream service and insurance renewals.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black font-heading">
          Register Your Dealership Today
        </h2>
        <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto">
          Submit your GSTIN and authorized OEM brands to receive live buyer group requests in your city.
        </p>
        <button
          onClick={() => onNavigate('/register')}
          className="px-8 py-3.5 rounded-xl font-bold text-xs bg-white text-blue-900 hover:bg-blue-50 transition-all cursor-pointer shadow-lg"
        >
          Register Authorized Dealership
        </button>
      </div>
    </div>
  );
};
