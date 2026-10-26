import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { INDIAN_CITIES } from '../../lib/constants';
import {
  Car,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onNavigate,
}) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState<'buyer' | 'dealer'>('buyer');

  // Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Dealership specific
  const [dealershipName, setDealershipName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [showroomAddress, setShowroomAddress] = useState('');
  const [pincode, setPincode] = useState('400001');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Hyundai']);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const brandOptions = ['Hyundai', 'Tata Motors', 'Mahindra', 'Maruti Suzuki', 'Kia', 'Toyota'];

  const toggleBrand = (b: string) => {
    if (selectedBrands.includes(b)) {
      if (selectedBrands.length > 1) {
        setSelectedBrands(selectedBrands.filter(item => item !== b));
      }
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        if (!email.trim() || !password) {
          setErrorMsg('Please enter both your email address and password.');
          setIsLoading(false);
          return;
        }

        const res = await login(email, password, rememberMe);
        if (res.success) {
          // Navigate to dashboard
          onNavigate('/dashboard');
        } else {
          setErrorMsg(res.message || 'Invalid email or password. Please verify your credentials.');
        }
      } else {
        // Registration validations
        if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
          setErrorMsg('Please fill in all required registration fields.');
          setIsLoading(false);
          return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setErrorMsg('Please provide a valid email address.');
          setIsLoading(false);
          return;
        }

        // Password validation
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters in length.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please re-enter.');
          setIsLoading(false);
          return;
        }

        if (!agreeTerms) {
          setErrorMsg('You must agree to the CarMilan Terms of Service and Privacy Policy to continue.');
          setIsLoading(false);
          return;
        }

        if (role === 'dealer') {
          if (!dealershipName.trim() || !gstin.trim() || !tradeLicense.trim() || !showroomAddress.trim()) {
            setErrorMsg('Please provide all dealership business registration details.');
            setIsLoading(false);
            return;
          }
        }

        const res = await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          city,
          state,
          preferredContactMethod: preferredContact,
          role,
          dealershipInfo: role === 'dealer' ? {
            dealershipName: dealershipName.trim(),
            tradeName: tradeName.trim() || dealershipName.trim(),
            gstin: gstin.trim().toUpperCase(),
            tradeLicenseNumber: tradeLicense.trim(),
            showroomAddress: showroomAddress.trim(),
            city,
            state,
            pincode,
            brandsHandled: selectedBrands,
          } : undefined,
        });

        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            if (role === 'dealer') {
              onNavigate('/dealer/dashboard');
            } else {
              onNavigate('/buyer/dashboard');
            }
          }, 800);
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-heading">
          {isLogin ? 'Sign In to CarMilan' : 'Create Your Account'}
        </h1>
        <p className="text-xs text-slate-500">
          {isLogin
            ? 'Access your active buyer groups or dealership bidding hub'
            : 'Join India’s premier collective automotive platform'}
        </p>
      </div>

      {/* Role Toggle for Registration */}
      {!isLogin && (
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              role === 'buyer'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>I am a Car Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('dealer')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              role === 'dealer'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Authorized Dealership</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Auth Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. rahul.sharma@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && (
              <p className="mt-1 text-[11px] text-slate-400">
                Must be at least 6 characters.
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-500">Passwords do not match.</p>
              )}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98201 54321"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">City</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    {INDIAN_CITIES.map(c => (
                      <option key={c.city} value={c.city}>
                        {c.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dealership Business Details */}
              {role === 'dealer' && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Dealership Accreditation Details</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Dealership Commercial Name</label>
                    <input
                      type="text"
                      required
                      value={dealershipName}
                      onChange={e => setDealershipName(e.target.value)}
                      placeholder="e.g. Apex Hyundai Mumbai"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Registered Trade Entity Name</label>
                    <input
                      type="text"
                      required
                      value={tradeName}
                      onChange={e => setTradeName(e.target.value)}
                      placeholder="e.g. Apex Motor Corp Pvt Ltd"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        value={gstin}
                        onChange={e => setGstin(e.target.value.toUpperCase())}
                        placeholder="27AABCA1234F1Z8"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Trade License No.</label>
                      <input
                        type="text"
                        required
                        value={tradeLicense}
                        onChange={e => setTradeLicense(e.target.value)}
                        placeholder="MCGM/TL/2026/001"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Showroom Address</label>
                    <input
                      type="text"
                      required
                      value={showroomAddress}
                      onChange={e => setShowroomAddress(e.target.value)}
                      placeholder="Plot 42, Western Express Highway"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Authorized OEM Brands</label>
                    <div className="flex flex-wrap gap-1.5">
                      {brandOptions.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleBrand(b)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            selectedBrands.includes(b)
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/terms')}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/privacy')}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              </div>
            </>
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
              role === 'dealer' && !isLogin
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Account' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            {isLogin ? "Don't have an account? Register here" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
