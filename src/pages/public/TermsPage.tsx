import React from 'react';
import { ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          User Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-heading">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective Date: October 2026 • CarMilan Technologies Pvt Ltd • ShriiTech Pvt Ltd
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">No Purchase Commitment Clause:</p>
            <p className="text-xs leading-relaxed">
              Joining an active buyer group on CarMilan does not constitute a sales contract, booking token, financial transaction, or purchase obligation. Buyers retain full autonomy to withdraw from a group before quotation deadlines or decline submitted dealership bids without financial penalty.
            </p>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          1. Platform Role & Limitations
        </h3>
        <p>
          CarMilan acts exclusively as an online demand-aggregation and communication intermediary between prospective motor vehicle buyers and authorized OEM automobile dealerships. CarMilan is <strong>not</strong> an automobile dealership, manufacturer, broker, or financial lender.
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          2. Nature of Dealership Quotations
        </h3>
        <p>
          Quotations submitted by dealerships through the platform represent estimated, non-binding volume pricing offers for specific model variants. All final retail invoices, road taxes, RTO registration, insurance policies, color options, and delivery schedules must be verified and confirmed directly with the authorized dealership showroom upon physical booking.
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          3. Fair Use & Prohibited Conduct
        </h3>
        <p>
          Users agree not to submit fraudulent quotation requests, create duplicate accounts, or attempt to scrape or reverse engineer platform quotation algorithms. Dealership accounts are subject to administrative verification and audit.
        </p>

        <h3 className="text-base font-bold text-slate-900 font-heading">
          4. Jurisdiction
        </h3>
        <p>
          These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India, and the courts of Mumbai, Maharashtra shall have exclusive jurisdiction.
        </p>
      </div>
    </div>
  );
};
