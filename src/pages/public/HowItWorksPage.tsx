import React from 'react';
import {
  Car,
  Users,
  Building2,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  FileText,
  BadgePercent,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          The Power of Collective Bargaining
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-heading">
          How CarMilan Transforms Car Buying in India
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Traditionally, individual car buyers negotiate alone against seasoned showroom salespeople. CarMilan aggregates individual buyers into high-volume fleets, giving everyday car buyers institutional bargaining power.
        </p>
      </div>

      {/* Deep-Dive 4-Step Process */}
      <div className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0">
            01
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Select Your Exact Car Model & Variant
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Browse our curated Indian automotive catalog featuring India's best-selling SUVs, sedans, and hatchbacks. Select the exact variant, fuel type (Petrol, Diesel, EV, CNG), and transmission you intend to purchase.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Transparent ex-showroom and benchmark standard on-road pricing provided for every variant.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0">
            02
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Join or Form a City Buyer Group
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect with 5 to 20 other prospective buyers in your city (Mumbai, Delhi NCR, Pune, Bengaluru, etc.) who are shopping for the same model. Joining is 100% free with <strong>no advance payment, no booking token, and no purchase commitment</strong>.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Your private phone number and email remain encrypted and are never shared with other buyers.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0">
            03
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Broadcast RFQs to Authorized OEM Dealerships
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Once the group reaches its minimum target size, an official Request for Quotation (RFQ) is opened to certified authorized dealerships in the region. Dealerships compete against one another to offer the most compelling bulk discount, transparent on-road line items, and fastest delivery dates.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Dealers submit quotations directly through our audited dealership portal.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0">
            04
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Compare Offers & Finalize at Showroom
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review all submitted dealership bids on a side-by-side comparison screen. Sort by lowest total on-road price, highest discount, or quickest vehicle delivery timeline. You can print or download the quotation and book directly at the winning showroom.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Vehicle invoice, registration, and manufacturer warranty are made directly in your personal name.
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black font-heading">
          Ready to experience hassle-free group buying?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Start pooling your bargaining power today. It takes less than 2 minutes to create or join a group.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onNavigate('/cars')}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer"
          >
            Find Your Car
          </button>
          <button
            onClick={() => onNavigate('/groups')}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          >
            Explore Active Groups
          </button>
        </div>
      </div>
    </div>
  );
};
