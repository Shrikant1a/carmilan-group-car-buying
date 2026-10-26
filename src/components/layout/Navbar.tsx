import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../common/NotificationDropdown';
import {
  Car,
  Users,
  PlusCircle,
  Building2,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Layers,
  Heart,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, role, dealership, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  Car<span className="text-indigo-600">Milan</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1 hidden sm:block">
                  Group Car Buying India
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => handleNav('/cars')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive('/cars')
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Browse Cars
              </button>
              <button
                onClick={() => handleNav('/groups')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive('/groups') && currentPath !== '/groups/new'
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Buyer Groups
              </button>
              <button
                onClick={() => handleNav('/how-it-works')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive('/how-it-works')
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => handleNav('/dealers-info')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive('/dealers-info')
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                For Dealers
              </button>
            </nav>
          </div>

          {/* Right Area: Actions & Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Create Group CTA (If Buyer or Guest) */}
            {(!role || role === 'buyer') && (
              <button
                onClick={() => handleNav('/groups/new')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Buyer Group</span>
              </button>
            )}

            {/* Dealer Specific Fast Actions */}
            {role === 'dealer' && (
              <button
                onClick={() => handleNav('/dealer/requests')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Incoming RFQs</span>
              </button>
            )}

            {/* Admin Specific Fast Actions */}
            {role === 'admin' && (
              <button
                onClick={() => handleNav('/admin/dashboard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Notifications */}
            {user && <NotificationDropdown onNavigate={handleNav} />}

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="text-left text-xs hidden xl:block">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">
                      {role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {role} mode
                        </span>
                      </div>
                    </div>

                    {role === 'buyer' && (
                      <>
                        <button
                          onClick={() => handleNav('/buyer/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          Buyer Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/buyer/saved')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 text-slate-400" />
                          Saved Cars
                        </button>
                        <button
                          onClick={() => handleNav('/profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          My Profile
                        </button>
                      </>
                    )}

                    {role === 'dealer' && (
                      <>
                        <button
                          onClick={() => handleNav('/dealer/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Dealer Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/dealer/requests')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          Buyer RFQs
                        </button>
                        <button
                          onClick={() => handleNav('/dealer/verification')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          Verification Status
                        </button>
                      </>
                    )}

                    {role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleNav('/admin/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          Admin Overview
                        </button>
                        <button
                          onClick={() => handleNav('/admin/dealers')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Dealership Approvals
                        </button>
                        <button
                          onClick={() => handleNav('/admin/groups')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Buyer Groups
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <NotificationDropdown onNavigate={handleNav} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => handleNav('/cars')}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Browse Cars
            </button>
            <button
              onClick={() => handleNav('/groups')}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Buyer Groups
            </button>
            <button
              onClick={() => handleNav('/how-it-works')}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('/dealers-info')}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Dealership Portal
            </button>

            {role === 'buyer' && (
              <>
                <div className="border-t border-slate-100 my-2" />
                <button
                  onClick={() => handleNav('/buyer/dashboard')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  My Buyer Dashboard
                </button>
                <button
                  onClick={() => handleNav('/groups/new')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  + Create New Buyer Group
                </button>
                <button
                  onClick={() => handleNav('/buyer/saved')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Saved Cars
                </button>
              </>
            )}

            {role === 'dealer' && (
              <>
                <div className="border-t border-slate-100 my-2" />
                <button
                  onClick={() => handleNav('/dealer/dashboard')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Dealer Dashboard
                </button>
                <button
                  onClick={() => handleNav('/dealer/requests')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Incoming Buyer Requests
                </button>
              </>
            )}

            {role === 'admin' && (
              <>
                <div className="border-t border-slate-100 my-2" />
                <button
                  onClick={() => handleNav('/admin/dashboard')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Admin Console
                </button>
                <button
                  onClick={() => handleNav('/admin/dealers')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Verify Dealerships
                </button>
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{user.fullName}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="w-full py-2 text-center text-sm font-semibold bg-indigo-600 text-white rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
