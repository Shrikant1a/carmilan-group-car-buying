import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { INDIAN_CITIES } from '../../lib/constants';
import { VerifiedDealerBadge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Upload,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DealershipVerificationPageProps {
  onNavigate: (path: string) => void;
}

export const DealershipVerificationPage: React.FC<DealershipVerificationPageProps> = ({
  onNavigate,
}) => {
  const { user, dealership, refreshUserData } = useAuth();

  const [dealershipName, setDealershipName] = useState(
    dealership?.dealershipName || ''
  );
  const [tradeName, setTradeName] = useState(
    dealership?.tradeName || ''
  );
  const [gstin, setGstin] = useState(dealership?.gstin || '');
  const [tradeLicense, setTradeLicense] = useState(
    dealership?.tradeLicenseNumber || ''
  );
  const [showroomAddress, setShowroomAddress] = useState(
    dealership?.showroomAddress || ''
  );
  const [city, setCity] = useState(dealership?.city || user?.city || 'Mumbai');
  const [state, setState] = useState(dealership?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(dealership?.pincode || '');
  const [contactPerson, setContactPerson] = useState(
    dealership?.contactPerson || user?.fullName || ''
  );
  const [contactPhone, setContactPhone] = useState(
    dealership?.contactPhone || user?.phone || ''
  );
  const [contactEmail, setContactEmail] = useState(
    dealership?.contactEmail || user?.email || ''
  );
  const [brandsHandled, setBrandsHandled] = useState<string[]>(
    dealership?.brandsHandled || ['Hyundai']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const availableBrands = ['Hyundai', 'Tata Motors', 'Mahindra', 'Maruti Suzuki', 'Kia', 'Toyota'];

  if (user?.role !== 'dealer') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 shadow-md">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dealer Access Required</h2>
        <p className="text-sm text-slate-600">
          Dealership registration and verification can only be performed by registered Dealership accounts.
        </p>
        <button
          onClick={() => onNavigate(user ? '/buyer/dashboard' : '/login')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          {user ? '← Return to Dashboard' : 'Log In'}
        </button>
      </div>
    );
  }

  const toggleBrand = (b: string) => {
    if (brandsHandled.includes(b)) {
      setBrandsHandled(brandsHandled.filter(item => item !== b));
    } else {
      setBrandsHandled([...brandsHandled, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!gstin || gstin.length < 15) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please enter a valid 15-character Indian GSTIN number.',
      });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      await dataService.registerDealership({
        userId: user.id,
        dealershipName,
        tradeName,
        gstin,
        tradeLicenseNumber: tradeLicense,
        showroomAddress,
        city,
        state,
        pincode,
        contactPerson,
        contactPhone,
        contactEmail,
        brandsHandled,
      });

      await refreshUserData();
      setFeedbackMsg({
        type: 'success',
        text: 'Dealership credentials updated and submitted for administrative verification.',
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to update verification details.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isVerified = dealership?.isVerified ?? true;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Compliance & Verification
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-2 font-heading">
          Dealership Business Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          To protect buyers and ensure genuine vehicle delivery, all dealerships must be authenticated with valid GSTIN and OEM authorization.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-semibold">{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {isVerified ? 'Official Verified OEM Dealership' : 'Business Verification In Progress'}
              </h3>
              <VerifiedDealerBadge isVerified={isVerified} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVerified
                ? 'Your dealership is fully authorized to submit binding bulk quotations.'
                : 'Our platform administrator is currently validating your GSTIN and trade documents.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
          Dealership Profile & Tax Identifiers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dealership Display Name
            </label>
            <input
              type="text"
              value={dealershipName}
              onChange={e => setDealershipName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Registered Corporate Trade Name
            </label>
            <input
              type="text"
              value={tradeName}
              onChange={e => setTradeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Goods & Services Tax (GSTIN)
            </label>
            <input
              type="text"
              value={gstin}
              onChange={e => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 27AABCA1234F1Z8"
              maxLength={15}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Municipal Trade License Number
            </label>
            <input
              type="text"
              value={tradeLicense}
              onChange={e => setTradeLicense(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Showroom Physical Address
          </label>
          <textarea
            rows={2}
            value={showroomAddress}
            onChange={e => setShowroomAddress(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c.city} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              PIN Code
            </label>
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Brands Handled */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Authorized OEM Brands Handled
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableBrands.map(b => (
              <label
                key={b}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-bold transition-all ${
                  brandsHandled.includes(b)
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={brandsHandled.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Update & Re-verify Business Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
