import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Buyer Privacy & Data Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-heading">
          Privacy Policy & Confidentiality Guarantee
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last updated: October 2026 • Compliant with Indian DPDP (Digital Personal Data Protection) Act
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Our Core Privacy Commitment to Indian Car Buyers:</p>
            <p className="text-xs leading-relaxed">
              When you join a buyer group on CarMilan, your personal telephone number and email address are strictly masked and encrypted. Other group participants see only your anonymized initials and city (e.g. "R.S. from Mumbai").
            </p>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          1. Information We Collect
        </h3>
        <p>
          When you register on CarMilan as a prospective car buyer, we collect your full name, contact mobile number, email address, preferred city, and automotive purchase preferences (model, variant, target budget, and estimated purchase timeline).
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          2. How We Share Buyer Data with Dealerships
        </h3>
        <p>
          Dealerships receive aggregated, anonymous demand summaries (e.g. "20 buyers seeking Hyundai Creta SX Petrol in Mumbai within 30 days"). Individual personal contact information is <strong>never sold, shared, or broadcast to telecallers</strong>. Personal showroom bookings are scheduled only upon your explicit confirmation.
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          3. Security & Data Protection
        </h3>
        <p>
          We employ industry-standard transport layer security (TLS 1.3), database field encryption, and granular Row-Level Security (RLS) policies within our database cluster to prevent unauthorized data exposure.
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          4. Contact the Data Protection Officer
        </h3>
        <p>
          For privacy inquiries, account deletion requests, or consent withdrawal, contact our privacy compliance officer at <span className="text-indigo-600 font-bold">privacy@carmilan.in</span>.
        </p>
      </div>
    </div>
  );
};
