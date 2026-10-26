import React, { useState } from 'react';
import { CarModel, BuyerGroup } from '../../types';
import { CarCard } from '../../components/common/CarCard';
import { GroupCard } from '../../components/common/GroupCard';
import { formatINR } from '../../lib/calculations';
import {
  Car,
  Users,
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Clock,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  models: CarModel[];
  groups: BuyerGroup[];
  onNavigate: (path: string) => void;
  onSelectModel: (modelId: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  models,
  groups,
  onNavigate,
  onSelectModel,
  onSelectGroup,
}) => {
  // Calculator State
  const [calcModelId, setCalcModelId] = useState(models[0]?.id || 'model-creta');
  const [calcGroupSize, setCalcGroupSize] = useState(15);

  const selectedCalcModel = models.find(m => m.id === calcModelId) || models[0];
  // Fleet discount estimation rule: ~4% at 5 buyers, up to ~7.5% at 20+ buyers
  const estimatedSavingsPct = Math.min(8, 3.5 + calcGroupSize * 0.22);
  const estimatedPerBuyerSavings = Math.round(
    ((selectedCalcModel?.startingPrice || 1200000) * 1.15 * estimatedSavingsPct) / 100
  );
  const totalGroupSavings = estimatedPerBuyerSavings * calcGroupSize;

  // Active highlighted groups
  const featuredGroups = groups.slice(0, 3);
  const featuredModels = models.slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>India’s Premier Group Car Buying Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-heading">
                Buy Together. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300">
                  Negotiate Better.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Join forces with other car buyers in your city, invite competing dealership offers, and discover better fleet pricing with complete transparency.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('/cars')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Find Your Car</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('/groups')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Explore Buyer Groups</span>
                </button>
              </div>

              {/* Trust Metrics */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    ₹85,000+
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Avg. Savings / Buyer*</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-heading">
                    100% Free
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">No Purchase Obligation</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    Verified
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Authorized OEM Dealers</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
                <img
                  src="/images/hero-cars.jpg"
                  alt="CarMilan Group Buying Cars Lineup"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Floating Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Live Buyer Group
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      14/20 Joined
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white">Hyundai Creta SX Petrol • Mumbai</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Estimated Group Savings: <strong className="text-emerald-400 font-bold">~₹1.15 Lakh</strong> per buyer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 font-heading">
            How Group Buying Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Harness collective volume to turn the tables in your favor with zero stress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Choose Your Car
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your preferred car model, exact variant, fuel type, and transmission from our curated Indian catalog.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Join a Group
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with buyers in your city. It’s 100% free with no advance token and no purchase commitment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Request Offers
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once target size is reached, invite eligible verified dealerships to submit competing bulk quotations.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 font-heading">
              Compare & Decide
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review line-itemized on-road offers, delivery dates, and dealer discounts. Choose what works best for you.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE GROUP SAVINGS CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-indigo-800/40 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Interactive Simulator
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1 font-heading">
                  Estimate Your Group Bargaining Power
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  See how group size directly influences dealership fleet discounts.
                </p>
              </div>

              {/* Select Car */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {models.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setCalcModelId(m.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        calcModelId === m.id
                          ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-300">{formatINR(m.startingPrice, true)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Group Size (Number of Buyers)</span>
                  <span className="text-indigo-400 text-base">{calcGroupSize} Buyers</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={calcGroupSize}
                  onChange={e => setCalcGroupSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 Buyers (Min)</span>
                  <span>15 Buyers (Optimal)</span>
                  <span>30 Buyers (Max Power)</span>
                </div>
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl space-y-5">
                <div className="text-center pb-4 border-b border-slate-700">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Estimated Savings Per Buyer
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-heading mt-1">
                    {formatINR(estimatedPerBuyerSavings)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Approx. ~{estimatedSavingsPct.toFixed(1)}% off standard showroom on-road price
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Combined Group Order Value:</span>
                    <span className="font-bold text-white">
                      {formatINR((selectedCalcModel?.startingPrice || 1200000) * calcGroupSize, true)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Dealership Group Discount:</span>
                    <span className="font-bold text-emerald-400">
                      {formatINR(totalGroupSavings, true)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Dealership Interest Level:</span>
                    <span className="font-bold text-indigo-400">Extremely High (Bulk Allocation)</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/groups/new')}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Start Group for {selectedCalcModel?.name}
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-normal">
                  *Illustrative simulation based on historical Indian dealership bulk fleet discounting ranges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE BUYER GROUPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Live In Your City
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              Active Buyer Groups
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Join an existing group today and pool your bargaining power.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/groups')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>View All Groups ({groups.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGroups.map(g => (
            <GroupCard key={g.id} group={g} onSelect={onSelectGroup} />
          ))}
        </div>
      </section>

      {/* 5. POPULAR CAR MODELS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Explore Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              Popular Models for Group Buying
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Top SUVs and passenger cars with the highest group formation demand.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/cars')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredModels.map(m => (
            <CarCard
              key={m.id}
              model={m}
              onSelect={onSelectModel}
              onExploreGroups={id => onNavigate(`/groups?modelId=${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 6. VALUE PROPOSITION DUAL COMPARISON: BUYERS VS DEALERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Buyers */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Individual Buyers
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  Why Buy With CarMilan?
                </h3>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Fleet Pricing for Individuals:</strong> Get discounts usually reserved strictly for corporate fleets and rental firms.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Complete Privacy Shield:</strong> Your phone number and email are never given to sales agents for cold calling.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>No Payment Lock-In:</strong> Joining a group carries zero advance fee and zero legal commitment.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Transparent On-Road Pricing:</strong> Compare apples-to-apples line items across multiple certified dealerships.
                </span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('/cars')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Browse eligible models <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* For Dealers */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-blue-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Dealerships & OEMs
                </span>
                <h3 className="text-xl font-bold text-white font-heading">
                  Why Dealerships Partner
                </h3>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero CAC Bulk Sales:</strong> Close 10 to 30 vehicle deliveries in a single transaction without paying digital ad spend.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Verified Intent Buyers:</strong> All participants select their exact variant, timeline, and purchase budget beforehand.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Meet Monthly OEM Targets:</strong> Swiftly liquidate inventory and achieve target bonuses before month-end deadlines.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Showroom Booking:</strong> Buyers physically visit your showroom for test drives and direct delivery.
                </span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('/dealers-info')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              Learn about dealership partner program <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 font-heading">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              Am I obligated to buy the car once I join a group?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No, absolutely not. Joining a group simply registers your interest so dealerships can see bulk demand. You can review all received quotations and leave the group or decide not to proceed at any time without any financial penalty.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              Who do I make the final payment to?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              CarMilan does not take your vehicle payment. When you decide to accept a quotation, you book the car directly with the authorized OEM dealership showroom, in your name, with standard manufacturer invoice and warranty.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              How are dealership quotations verified?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every dealership account on CarMilan must submit their GSTIN, trade license, and OEM dealer authorization certificate. Our administration team verifies these records before granting verified dealer status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              What if a group doesn't reach the target size?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each group has a configurable minimum threshold (usually 4 to 6 buyers). As long as the minimum threshold is met, the group organizer or administrator can open quotation requests to dealerships.
            </p>
          </div>
        </div>
      </section>

      {/* 8. STRONG BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
              Ready to Save Thousands on Your Next Car?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
              Browse current groups or initiate a new group for your dream car in minutes. Free, transparent, and built for Indian buyers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('/cars')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-indigo-700 hover:bg-slate-100 shadow-xl transition-all cursor-pointer"
              >
                Browse All Cars
              </button>
              <button
                onClick={() => onNavigate('/groups/new')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-indigo-900/60 hover:bg-indigo-900 text-white border border-indigo-400/30 transition-all cursor-pointer"
              >
                Start a New Buyer Group
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
