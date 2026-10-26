import React from 'react';
import { Car, Shield, Users, Award, MapPin, Heart } from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Our Vision & Mission
        </span>
        <h1 className="text-4xl font-black text-slate-900 font-heading">
          Democratizing Car Buying Across India
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          CarMilan was founded with a single mission: to eliminate the price asymmetry between retail car purchasers and car dealerships through the power of collective volume.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 font-heading">
          The Problem with Traditional Car Buying
        </h2>
        <p>
          In India, purchasing a passenger car is typically a family’s second largest lifetime financial investment after buying a home. Yet, individual car buyers walk into dealership showrooms with zero leverage, having to haggle over insurance markups, handling charges, and minimal festive discounts.
        </p>
        <p>
          Meanwhile, large corporate fleet buyers routinely receive discounts of 6% to 10% because they buy in bulk. CarMilan levels the playing field by grouping individual buyers together to form high-volume consumer buying syndicates.
        </p>

        <h2 className="text-xl font-bold text-slate-900 font-heading pt-4">
          Our Core Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">1. Zero Buyer Lock-In</p>
            <p className="text-xs text-slate-500">
              Joining a group is completely free without booking fees or purchase obligations.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">2. Privacy Protected</p>
            <p className="text-xs text-slate-500">
              Buyer contact details are never exposed to telecallers or other group participants.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">3. Verified Dealerships Only</p>
            <p className="text-xs text-slate-500">
              Only authorized OEM showrooms with verified GSTIN numbers can submit binding bids.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-slate-900">4. Transparent Line Items</p>
            <p className="text-xs text-slate-500">
              Every quote clearly itemizes ex-showroom, discount, RTO, insurance, and fees without duplicate markups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
