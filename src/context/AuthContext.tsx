import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Dealership } from '../types';
import { dataService, RegisterUserParams } from '../services/dataService';
import { isSupabaseConfigured, supabase } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  dealership: Dealership | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  sessionLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (params: RegisterUserParams) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'carmilan_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Production security rule: Never automatically log in a fake user on first visit.
  // Default to null until a verified session is restored or explicit login succeeds.
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const isDemoMode = !isSupabaseConfigured;

  const refreshUserData = async (currentUser?: UserProfile | null) => {
    const active = currentUser !== undefined ? currentUser : user;
    if (!active) {
      setDealership(null);
      return;
    }
    if (active.role === 'dealer') {
      const dealerRecord = await dataService.getDealershipByUserId(active.id);
      setDealership(dealerRecord || null);
    } else {
      setDealership(null);
    }
  };

  // Restore authenticated session on initial mount
  useEffect(() => {
    let isCancelled = false;

    const restoreSession = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Check localStorage first (Remember Me), then sessionStorage
          const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsed: UserProfile = JSON.parse(stored);
            if (parsed && parsed.id) {
              const verifiedUser = await dataService.verifySession(parsed.id);
              if (verifiedUser && !isCancelled) {
                // If user claims admin role, strictly re-verify against server store
                if (verifiedUser.role === 'admin') {
                  const isAdmin = await dataService.verifyUserAdminRole(verifiedUser.id);
                  if (!isAdmin) {
                    throw new Error('Revoking unauthorized admin session claim.');
                  }
                }
                setUser(verifiedUser);
                await refreshUserData(verifiedUser);
              } else {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                sessionStorage.removeItem(AUTH_STORAGE_KEY);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Session restoration failed:', e);
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch (_) {}
      } finally {
        if (!isCancelled) {
          setSessionLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync role and dealership whenever user state changes
  useEffect(() => {
    refreshUserData();
  }, [user]);

  /**
   * User login against stored database credentials
   */
  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await dataService.authenticateUser(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshUserData(res.user);

      try {
        if (typeof window !== 'undefined') {
          const serialized = JSON.stringify(res.user);
          if (rememberMe) {
            localStorage.setItem(AUTH_STORAGE_KEY, serialized);
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          } else {
            sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (e) {}

      return { success: true };
    }

    return {
      success: false,
      message: res.message || 'Invalid email or password. Please verify your credentials.',
    };
  };

  /**
   * Register a new user account with database persistence
   */
  const register = async (
    params: RegisterUserParams
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const res = await dataService.registerUser(params);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshUserData(res.user);

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        }
      } catch (e) {}

      return {
        success: true,
        message: res.message,
        user: res.user,
      };
    }

    return {
      success: false,
      message: res.message || 'Registration could not be completed.',
    };
  };

  /**
   * Dedicated administrator login
   */
  const adminLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    const result = await dataService.authenticateAdminCredentials(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      await refreshUserData(result.user);

      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
        }
      } catch (e) {}

      return { success: true };
    }
    return {
      success: false,
      message: result.message || 'Access denied. Administrator privileges are required.',
    };
  };

  /**
   * Password recovery request
   */
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return dataService.requestPasswordReset(email);
  };

  /**
   * Secure sign out: clears active session and browser tokens
   */
  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      try {
        supabase.auth.signOut();
      } catch (e) {}
    }

    setUser(null);
    setDealership(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        dealership,
        isAuthenticated: Boolean(user),
        isDemoMode,
        sessionLoading,
        login,
        register,
        adminLogin,
        forgotPassword,
        logout,
        refreshUserData: () => refreshUserData(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
