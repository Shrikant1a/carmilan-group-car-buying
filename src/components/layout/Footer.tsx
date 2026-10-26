import React from 'react';
import { Car, Shield, Award, Users, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Car<span className="text-indigo-400">Milan</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India’s first collective car buying platform. We bring together individual car buyers wanting the same model to demand bulk fleet discounts from verified authorized dealerships.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" /> 100% Free to Join
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-indigo-400" /> Verified OEM Dealers
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/cars')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Browse Car Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/groups')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Active Buyer Groups
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/groups/new')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Start a New Group
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  How Group Buying Works
                </button>
              </li>
            </ul>
          </div>

          {/* Dealerships */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Dealerships
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/dealers-info')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Dealer Partnership Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/register')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Register Dealership
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Dealer Portal Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Corporate Fleet Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Privacy Policy & Data Shield
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  About CarMilan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Coverage Cities */}
        <div className="py-6 border-b border-slate-900 text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Active Cities:
          </span>
          <span>Mumbai</span>
          <span>•</span>
          <span>Delhi NCR</span>
          <span>•</span>
          <span>Bengaluru</span>
          <span>•</span>
          <span>Pune</span>
          <span>•</span>
          <span>Hyderabad</span>
          <span>•</span>
          <span>Chennai</span>
          <span>•</span>
          <span>Ahmedabad</span>
          <span>•</span>
          <span>Kolkata</span>
          <span>•</span>
          <span>Jaipur</span>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 text-xs text-slate-500 leading-relaxed space-y-3">
          <p className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
            <strong className="text-slate-400">Important Regulatory Notice:</strong> CarMilan is a collective bargaining technology platform enabling prospective automobile purchasers to aggregate demand. Joining a buyer group does not constitute a booking, financial transaction, or binding purchase contract. All quotation amounts, discounts, road taxes, insurance, and delivery schedules displayed are estimates submitted by dealerships and require formal confirmation directly at the authorized showroom. CarMilan does not sell automobiles or guarantee specific manufacturer allocations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              © {new Date().getFullYear()} CarMilan Technologies Pvt Ltd • ShriiTech Pvt Ltd. All rights reserved.
            </div>
            <div className="text-slate-400 flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> by ShriiTech for Indian Car Buyers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
