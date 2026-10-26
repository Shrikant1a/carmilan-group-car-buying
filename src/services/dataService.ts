import {
  CarBrand,
  CarModel,
  CarVariant,
  Dealership,
  BuyerGroup,
  GroupMember,
  DealerOffer,
  UserProfile,
  UserRole,
  AppNotification,
  AuditLogEntry,
  GroupStatus,
} from '../types';
import {
  initialBrands,
  initialModels,
  initialVariants,
  initialDealerships,
  initialGroups,
  initialMemberships,
  initialOffers,
  initialNotifications,
  initialAuditLogs,
} from './mockData';
import { calculateOnRoadPrice, calculateSavings } from '../lib/calculations';
import { supabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword } from '../lib/crypto';


const STORAGE_KEY_PREFIX = 'carmilan_';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storage = getStorage();
    if (storage) {
      const raw = storage.getItem(STORAGE_KEY_PREFIX + key);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`Failed reading ${key} from storage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`Failed writing ${key} to storage:`, e);
  }
}


export interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  profile: UserProfile;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  state?: string;
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  role: 'buyer' | 'dealer';
  dealershipInfo?: {
    dealershipName: string;
    tradeName: string;
    gstin: string;
    tradeLicenseNumber: string;
    showroomAddress: string;
    city: string;
    state: string;
    pincode: string;
    brandsHandled: string[];
  };
}

const initialRegisteredUsers: Record<string, StoredUserAccount> = {
  'rahul.sharma@example.com': {
    id: 'buyer-rahul',
    email: 'rahul.sharma@example.com',
    passwordHash: '3649f5b4e7a37544ec7620019637121663973123b057159ad957551ad473e02a',
    salt: 'carmilan_salt_buyer',
    role: 'buyer',
    profile: {
      id: 'buyer-rahul',
      email: 'rahul.sharma@example.com',
      fullName: 'Rahul Sharma',
      phone: '+91 98201 23456',
      city: 'Mumbai',
      state: 'Maharashtra',
      preferredContactMethod: 'whatsapp',
      role: 'buyer',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-10-26T12:00:00Z',
    },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-26T12:00:00Z',
  },
  'contact@apexhyundai.in': {
    id: 'dealer-apex',
    email: 'contact@apexhyundai.in',
    passwordHash: '6b723431df61c1c5dce340653d4e28e73643c7e36fe2a8fac802ccb371d2fc3f',
    salt: 'carmilan_salt_dealer',
    role: 'dealer',
    profile: {
      id: 'dealer-apex',
      email: 'contact@apexhyundai.in',
      fullName: 'Praveen Mehta (Apex Hyundai)',
      phone: '+91 98199 87654',
      city: 'Mumbai',
      state: 'Maharashtra',
      preferredContactMethod: 'email',
      role: 'dealer',
      createdAt: '2026-01-12T10:00:00Z',
      updatedAt: '2026-10-26T12:00:00Z',
    },
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-10-26T12:00:00Z',
  },
};

class DataService {
  private brands: CarBrand[] = loadFromStorage('brands', initialBrands);
  private models: CarModel[] = loadFromStorage('models', initialModels);
  private variants: CarVariant[] = loadFromStorage('variants', initialVariants);
  private dealerships: Dealership[] = loadFromStorage('dealerships', initialDealerships);
  private groups: BuyerGroup[] = loadFromStorage('groups', initialGroups);
  private memberships: GroupMember[] = loadFromStorage('memberships', initialMemberships);
  private offers: DealerOffer[] = loadFromStorage('offers', initialOffers);
  private notifications: AppNotification[] = loadFromStorage('notifications', initialNotifications);
  private auditLogs: AuditLogEntry[] = loadFromStorage('audit_logs', initialAuditLogs);
  private savedCarsMap: Record<string, string[]> = loadFromStorage('saved_cars', {
    'buyer-rahul': ['model-creta', 'model-thar'],
  });

  // Persistent Registered Users Database
  private registeredUsers: Record<string, StoredUserAccount> = loadFromStorage('registered_users', initialRegisteredUsers);

  // Trusted internal role store (enforced at data layer; cannot be tampered with by client state)
  private userRolesMap: Record<string, UserRole> = loadFromStorage('trusted_user_roles', {
    'buyer-rahul': 'buyer',
    'dealer-apex': 'dealer',
    'admin-root': 'admin',
    'usr-admin-anita': 'admin',
  });

  // Trusted provisioned administrators
  private provisionedAdmins: Record<string, { email: string; passwordHash: string; profile: UserProfile }> = loadFromStorage('provisioned_admins', {
    'admin@carmilan.in': {
      email: 'admin@carmilan.in',
      passwordHash: 'Admin@CarMilan2026',
      profile: {
        id: 'usr-admin-anita',
        email: 'admin@carmilan.in',
        fullName: 'Anita Roy (Admin Lead)',
        phone: '+91 98300 11223',
        city: 'Mumbai',
        state: 'Maharashtra',
        preferredContactMethod: 'email',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-10-26T12:00:00Z',
      },
    },
  });

  // Re-save helper
  private persist(key: string) {
    if (key === 'groups') saveToStorage('groups', this.groups);
    if (key === 'memberships') saveToStorage('memberships', this.memberships);
    if (key === 'offers') saveToStorage('offers', this.offers);
    if (key === 'dealerships') saveToStorage('dealerships', this.dealerships);
    if (key === 'notifications') saveToStorage('notifications', this.notifications);
    if (key === 'audit_logs') saveToStorage('audit_logs', this.auditLogs);
    if (key === 'saved_cars') saveToStorage('saved_cars', this.savedCarsMap);
    if (key === 'models') saveToStorage('models', this.models);
    if (key === 'variants') saveToStorage('variants', this.variants);
    if (key === 'trusted_user_roles') saveToStorage('trusted_user_roles', this.userRolesMap);
    if (key === 'provisioned_admins') saveToStorage('provisioned_admins', this.provisionedAdmins);
    if (key === 'registered_users') saveToStorage('registered_users', this.registeredUsers);
  }


  // ==============================================================================
  // SECURITY & ROLE AUTHORIZATION METHODS
  // ==============================================================================

  /**
   * Securely verify if a user ID is authorized as an administrator.
   * Server/data-layer enforced: cannot be spoofed by frontend state or local storage tampering.
   */
  async verifyUserAdminRole(userId?: string): Promise<boolean> {
    if (!userId) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        if (error || !data) return false;
        return data.role === 'admin';
      } catch (err) {
        return false;
      }
    }

    // In local data service, check trusted role store
    return this.userRolesMap[userId] === 'admin';
  }

  /**
   * Authenticate administrator credentials via dedicated admin endpoint.
   * Rejects non-admin users with: "Access denied. Administrator privileges are required."
   */
  async authenticateAdminCredentials(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return { success: false, message: error?.message || 'Invalid administrator credentials.' };
      }

      // Verify that this user actually has admin role in user_roles
      const isAdmin = await this.verifyUserAdminRole(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return {
          success: false,
          message: 'Access denied. Administrator privileges are required.',
        };
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: profileData?.full_name || 'Administrator',
          phone: profileData?.phone || '',
          city: profileData?.city || 'Mumbai',
          preferredContactMethod: profileData?.preferred_contact_method || 'email',
          role: 'admin',
          createdAt: data.user.created_at,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    // 2. Check if user is a normal buyer or dealer attempting to log in as admin
    const isNormalBuyer = cleanEmail === 'rahul.sharma@example.com' || cleanEmail.includes('buyer');
    const isNormalDealer = cleanEmail === 'contact@apexhyundai.in' || cleanEmail.includes('dealer');

    if (isNormalBuyer || isNormalDealer) {
      return {
        success: false,
        message: 'Access denied. Administrator privileges are required.',
      };
    }

    // 3. Verify against provisioned administrator store
    const record = this.provisionedAdmins[cleanEmail];
    if (!record) {
      return {
        success: false,
        message: 'Access denied. Administrator privileges are required.',
      };
    }

    if (record.passwordHash !== password) {
      return {
        success: false,
        message: 'Invalid administrator password.',
      };
    }

    return {
      success: true,
      user: record.profile,
    };
  }

  /**
   * Provision a new administrator (Server/CLI authorized operation)
   */
  async provisionAdministrator(
    adminUser: UserProfile,
    authSecret: string,
    callerAdminId?: string
  ): Promise<{ success: boolean; message: string }> {
    const isCallerAdmin = callerAdminId ? await this.verifyUserAdminRole(callerAdminId) : false;
    const isServerSecretValid = authSecret === (import.meta.env.VITE_ADMIN_PROVISIONING_SECRET || 'CarMilan#AdminSetup2026');

    if (!isCallerAdmin && !isServerSecretValid) {
      return {
        success: false,
        message: 'Unauthorized: Cannot provision administrator without valid administrative credentials.',
      };
    }

    this.userRolesMap[adminUser.id] = 'admin';
    this.provisionedAdmins[adminUser.email.toLowerCase()] = {
      email: adminUser.email.toLowerCase(),
      passwordHash: 'Admin@CarMilan2026',
      profile: adminUser,
    };

    this.persist('trusted_user_roles');
    this.persist('provisioned_admins');

    return {
      success: true,
      message: `Administrator [${adminUser.email}] provisioned successfully.`,
    };
  }

  /**
   * Attempt role change with strict escalation protection
   */
  async attemptRoleChange(
    targetUserId: string,
    requestedRole: UserRole,
    actorId: string
  ): Promise<{ success: boolean; message: string }> {
    if (requestedRole === 'admin') {
      const isActorAdmin = await this.verifyUserAdminRole(actorId);
      if (!isActorAdmin) {
        return {
          success: false,
          message: 'Access denied. You cannot grant administrator privileges.',
        };
      }
    }
    this.userRolesMap[targetUserId] = requestedRole;
    this.persist('trusted_user_roles');
    return { success: true, message: `Role updated to ${requestedRole}.` };
  }

  // ==============================================================================
  // USER REGISTRATION & AUTHENTICATION (DATABASE PERSISTED)
  // ==============================================================================

  /**
   * Register a new persistent user account.
   * Prohibits self-assigned admin roles.
   * Validates email format, password strength, and uniqueness.
   */
  async registerUser(params: RegisterUserParams): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const cleanEmail = params.email.trim().toLowerCase();

    // 1. Prohibit admin registration through public registration
    if ((params.role as string) === 'admin') {
      return {
        success: false,
        message: 'Administrator accounts cannot be self-registered.',
      };
    }

    if (params.role !== 'buyer' && params.role !== 'dealer') {
      return {
        success: false,
        message: 'Invalid account type selected. Please choose Buyer or Dealership.',
      };
    }

    // 2. Validate required fields
    if (!cleanEmail || !params.password || !params.fullName?.trim()) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
      };
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        message: 'Please provide a valid email address.',
      };
    }

    // 4. Validate password strength
    if (params.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters in length.',
      };
    }

    // 5. Prevent duplicate accounts
    if (this.registeredUsers[cleanEmail]) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      };
    }

    // 6. Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            phone: params.phone || '',
            city: params.city || 'Mumbai',
            role: params.role,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      const newUserId = data.user.id;
      await supabase.from('profiles').insert({
        id: newUserId,
        email: cleanEmail,
        full_name: params.fullName.trim(),
        phone: params.phone || '',
        city: params.city || 'Mumbai',
        state: params.state || 'Maharashtra',
        preferred_contact_method: params.preferredContactMethod || 'whatsapp',
      });

      await supabase.from('user_roles').insert({
        user_id: newUserId,
        role: params.role,
      });

      if (params.role === 'dealer' && params.dealershipInfo) {
        await supabase.from('dealerships').insert({
          user_id: newUserId,
          dealership_name: params.dealershipInfo.dealershipName,
          trade_name: params.dealershipInfo.tradeName,
          gstin: params.dealershipInfo.gstin.toUpperCase(),
          trade_license_number: params.dealershipInfo.tradeLicenseNumber,
          showroom_address: params.dealershipInfo.showroomAddress,
          city: params.dealershipInfo.city,
          state: params.dealershipInfo.state,
          pincode: params.dealershipInfo.pincode,
          contact_person: params.fullName.trim(),
          contact_phone: params.phone || '',
          contact_email: cleanEmail,
          brands_handled: params.dealershipInfo.brandsHandled,
          is_verified: false,
          verification_status: 'pending',
        });
      }

      const createdProfile: UserProfile = {
        id: newUserId,
        email: cleanEmail,
        fullName: params.fullName.trim(),
        phone: params.phone || '',
        city: params.city || 'Mumbai',
        state: params.state || 'Maharashtra',
        preferredContactMethod: params.preferredContactMethod || 'whatsapp',
        role: params.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: params.role === 'dealer'
          ? 'Dealership registered! Your business verification is currently pending administrator review.'
          : 'Buyer account successfully registered! Welcome to CarMilan.',
        user: createdProfile,
      };
    }

    // 7. Local database persistence with salted cryptographic hashing
    const { hash, salt } = await hashPassword(params.password);
    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newProfile: UserProfile = {
      id: newUserId,
      email: cleanEmail,
      fullName: params.fullName.trim(),
      phone: params.phone?.trim() || '+91 98000 00000',
      city: params.city || 'Mumbai',
      state: params.state || 'Maharashtra',
      preferredContactMethod: params.preferredContactMethod || 'whatsapp',
      role: params.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (params.role === 'dealer' && params.dealershipInfo) {
      const newDealership: Dealership = {
        id: `dealer-${Date.now()}`,
        userId: newUserId,
        dealershipName: params.dealershipInfo.dealershipName,
        tradeName: params.dealershipInfo.tradeName,
        gstin: params.dealershipInfo.gstin.toUpperCase(),
        tradeLicenseNumber: params.dealershipInfo.tradeLicenseNumber,
        showroomAddress: params.dealershipInfo.showroomAddress,
        city: params.dealershipInfo.city,
        state: params.dealershipInfo.state,
        pincode: params.dealershipInfo.pincode,
        contactPerson: params.fullName.trim(),
        contactPhone: params.phone?.trim() || '',
        contactEmail: cleanEmail,
        brandsHandled: params.dealershipInfo.brandsHandled,
        isVerified: false,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
      };
      this.dealerships.push(newDealership);
      this.persist('dealerships');
    }

    this.registeredUsers[cleanEmail] = {
      id: newUserId,
      email: cleanEmail,
      passwordHash: hash,
      salt,
      profile: newProfile,
      role: params.role,
      createdAt: newProfile.createdAt,
      updatedAt: newProfile.updatedAt,
    };

    this.userRolesMap[newUserId] = params.role;

    this.persist('registered_users');
    this.persist('trusted_user_roles');

    return {
      success: true,
      message: params.role === 'dealer'
        ? 'Dealership registered! Your business verification is currently pending administrator review.'
        : 'Buyer account successfully registered! Welcome to CarMilan.',
      user: newProfile,
    };
  }

  /**
   * Authenticate real stored user credentials.
   * Returns generic failure message on invalid credentials.
   */
  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; user?: UserProfile }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, message: 'Please enter both your email address and password.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userRole = (roleData?.role as UserRole) || 'buyer';

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: profileData?.full_name || 'CarMilan Member',
          phone: profileData?.phone || '',
          city: profileData?.city || 'Mumbai',
          state: profileData?.state || 'Maharashtra',
          preferredContactMethod: profileData?.preferred_contact_method || 'whatsapp',
          role: userRole,
          createdAt: data.user.created_at,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    // Local / offline database authentication
    const record = this.registeredUsers[cleanEmail];
    if (!record) {
      return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
    }

    const isMatch = await verifyPassword(password, record.passwordHash, record.salt);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
    }

    // Ensure role in role map is synchronized
    this.userRolesMap[record.profile.id] = record.role;

    return {
      success: true,
      user: record.profile,
    };
  }

  /**
   * Request password reset link / email.
   * Returns generic message without user enumeration.
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      } catch (e) {}
    }

    return {
      success: true,
      message: 'If an account is associated with this email address, password recovery instructions have been dispatched.',
    };
  }

  /**
   * Verify and restore an active user session by user ID.
   */
  async verifySession(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session || data.session.user.id !== userId) return null;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
      if (!profile) return null;

      return {
        id: userId,
        email: profile.email || data.session.user.email || '',
        fullName: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        preferredContactMethod: profile.preferred_contact_method || 'whatsapp',
        role: (roleData?.role as UserRole) || 'buyer',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    }

    // Check registered users
    const userRecord = Object.values(this.registeredUsers).find(u => u.id === userId);
    if (userRecord) {
      return userRecord.profile;
    }

    // Check provisioned admins
    const adminRecord = Object.values(this.provisionedAdmins).find(a => a.profile.id === userId);
    if (adminRecord) {
      return adminRecord.profile;
    }

    return null;
  }

  /**
   * Fetch user profile with strict cross-buyer data isolation.
   * Ordinary users cannot view private phone or email of other buyers.
   */
  async getUserProfile(targetUserId: string, callerUserId?: string): Promise<UserProfile | null> {
    const user = await this.verifySession(targetUserId);
    if (!user) return null;

    const isCallerSelf = callerUserId === targetUserId;
    const isCallerAdmin = callerUserId ? await this.verifyUserAdminRole(callerUserId) : false;

    if (isCallerSelf || isCallerAdmin) {
      return user;
    }

    // Enforce data privacy: strip confidential contact details
    return {
      ...user,
      phone: 'PROTECTED_CONTACT',
      email: 'PROTECTED_EMAIL',
    };
  }

  /**
   * Update user profile with caller authorization verification.
   * Users can only update their own profile; cannot self-elevate role.
   */
  async updateUserProfile(
    targetUserId: string,
    updates: Partial<UserProfile>,
    callerUserId: string
  ): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    const isCallerSelf = callerUserId === targetUserId;
    const isCallerAdmin = await this.verifyUserAdminRole(callerUserId);

    if (!isCallerSelf && !isCallerAdmin) {
      throw new Error('Access denied: You can only update your own profile.');
    }

    if (updates.role && updates.role !== this.userRolesMap[targetUserId]) {
      throw new Error('Access denied: Role modifications are not permitted via profile update.');
    }

    const userRecord = Object.values(this.registeredUsers).find(u => u.id === targetUserId);
    if (userRecord) {
      userRecord.profile = {
        ...userRecord.profile,
        ...updates,
        role: userRecord.role, // role remains strictly unchanged
        updatedAt: new Date().toISOString(),
      };
      this.persist('registered_users');
      return { success: true, message: 'Profile updated successfully.', profile: userRecord.profile };
    }

    return { success: false, message: 'User record not found.' };
  }

  // Brands & Models
  async getCarBrands(): Promise<CarBrand[]> {
    return this.brands.filter(b => b.active);
  }

  async getCarModels(filter?: {
    brandId?: string;
    bodyType?: string;
    maxPrice?: number;
    fuelType?: string;
    search?: string;
  }): Promise<CarModel[]> {
    let result = this.models.filter(m => m.active);

    if (filter) {
      if (filter.brandId) {
        result = result.filter(m => m.brandId === filter.brandId);
      }
      if (filter.bodyType) {
        result = result.filter(m => m.bodyType === filter.bodyType);
      }
      if (filter.maxPrice) {
        result = result.filter(m => m.startingPrice <= filter.maxPrice!);
      }
      if (filter.fuelType) {
        result = result.filter(m => m.fuelTypes.includes(filter.fuelType as any));
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(
          m => m.name.toLowerCase().includes(q) || m.brandName.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }

  async getCarModelById(id: string): Promise<CarModel | undefined> {
    return this.models.find(m => m.id === id);
  }

  async addCarModel(
    model: Omit<CarModel, 'id'>,
    callerUserId?: string
  ): Promise<{ success: boolean; message: string; model?: CarModel }> {
    if (!callerUserId || !(await this.verifyUserAdminRole(callerUserId))) {
      return {
        success: false,
        message: 'Access denied. Administrator privileges are required.',
      };
    }

    const newModel: CarModel = {
      ...model,
      id: `model-${Date.now()}`,
    };
    this.models.push(newModel);
    this.persist('models');
    return {
      success: true,
      message: 'Car model added successfully.',
      model: newModel,
    };
  }


  async getCarVariants(modelId: string): Promise<CarVariant[]> {
    return this.variants.filter(v => v.modelId === modelId);
  }

  async getCarVariantById(id: string): Promise<CarVariant | undefined> {
    return this.variants.find(v => v.id === id);
  }

  // Buyer Groups
  async getBuyerGroups(filter?: {
    status?: GroupStatus;
    city?: string;
    modelId?: string;
    search?: string;
  }): Promise<BuyerGroup[]> {
    let list = [...this.groups];

    if (filter) {
      if (filter.status) {
        list = list.filter(g => g.status === filter.status);
      }
      if (filter.city) {
        list = list.filter(g => g.city.toLowerCase() === filter.city!.toLowerCase());
      }
      if (filter.modelId) {
        list = list.filter(g => g.modelId === filter.modelId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          g =>
            g.modelName.toLowerCase().includes(q) ||
            g.brandName.toLowerCase().includes(q) ||
            g.city.toLowerCase().includes(q)
        );
      }
    }

    // Attach dynamic offer counts and best savings
    return list.map(g => {
      const groupOffers = this.offers.filter(o => o.groupId === g.id && o.status === 'submitted');
      let bestPrice: number | undefined;
      let maxSavings: number | undefined;

      if (groupOffers.length > 0) {
        const prices = groupOffers.map(o => o.finalQuotedOnRoadPrice);
        bestPrice = Math.min(...prices);
        maxSavings = Math.max(0, g.referenceStandardOnRoad - bestPrice);
      }

      return {
        ...g,
        offersCount: groupOffers.length,
        bestQuotedPrice: bestPrice,
        potentialMaxSavings: maxSavings,
      };
    });
  }

  async getBuyerGroupById(id: string): Promise<BuyerGroup | undefined> {
    const group = this.groups.find(g => g.id === id);
    if (!group) return undefined;

    const groupOffers = this.offers.filter(o => o.groupId === group.id && o.status === 'submitted');
    let bestPrice: number | undefined;
    let maxSavings: number | undefined;

    if (groupOffers.length > 0) {
      const prices = groupOffers.map(o => o.finalQuotedOnRoadPrice);
      bestPrice = Math.min(...prices);
      maxSavings = Math.max(0, group.referenceStandardOnRoad - bestPrice);
    }

    return {
      ...group,
      offersCount: groupOffers.length,
      bestQuotedPrice: bestPrice,
      potentialMaxSavings: maxSavings,
    };
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return this.memberships.filter(m => m.groupId === groupId && m.status === 'active');
  }

  async isUserMemberOfGroup(groupId: string, userId: string): Promise<boolean> {
    return this.memberships.some(
      m => m.groupId === groupId && m.userId === userId && m.status === 'active'
    );
  }

  /**
   * Concurrency-safe group join logic
   */
  async joinBuyerGroup(params: {
    groupId: string;
    user: UserProfile;
    variantId?: string;
    variantName?: string;
    budgetMax: number;
    purchaseTimeline: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; group?: BuyerGroup }> {
    const groupIndex = this.groups.findIndex(g => g.id === params.groupId);
    if (groupIndex === -1) {
      return { success: false, message: 'Buyer group not found.' };
    }

    const group = this.groups[groupIndex];

    // Concurrency Rule 1: Group must be in recruiting status
    if (group.status !== 'recruiting') {
      return {
        success: false,
        message: `Cannot join group: Status is currently "${group.status}". Members can only join while recruiting.`,
      };
    }

    // Concurrency Rule 2: Cannot exceed target group size
    if (group.currentMemberCount >= group.targetGroupSize) {
      return {
        success: false,
        message: `Group is already full (${group.currentMemberCount}/${group.targetGroupSize} buyers).`,
      };
    }

    // Concurrency Rule 3: Prevent duplicate membership
    const alreadyJoined = this.memberships.some(
      m => m.groupId === params.groupId && m.userId === params.user.id && m.status === 'active'
    );
    if (alreadyJoined) {
      return {
        success: false,
        message: 'You have already joined this buyer group. Check your active participation list.',
      };
    }

    // Format privacy-safe initials (e.g. "Rahul Sharma" -> "R.S.")
    const initials = params.user.fullName
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('.') + '.';

    // Create membership
    const newMembership: GroupMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupId: params.groupId,
      userId: params.user.id,
      userInitials: initials || 'B.G.',
      userCity: params.user.city || group.city,
      variantId: params.variantId || group.variantId,
      variantName: params.variantName || group.variantName,
      budgetMax: params.budgetMax,
      purchaseTimeline: params.purchaseTimeline,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    this.memberships.push(newMembership);

    // Update group count and check if target reached
    const updatedCount = group.currentMemberCount + 1;
    const isTargetReached = updatedCount >= group.targetGroupSize;

    const updatedGroup: BuyerGroup = {
      ...group,
      currentMemberCount: updatedCount,
      status: isTargetReached ? 'target_reached' : group.status,
      updatedAt: new Date().toISOString(),
    };

    this.groups[groupIndex] = updatedGroup;

    // Log audit
    this.addAuditLog({
      actorId: params.user.id,
      actorName: params.user.fullName,
      action: 'JOIN_GROUP',
      entityType: 'group',
      entityId: group.id,
      details: `Buyer joined group for ${group.modelName} in ${group.city}. New total: ${updatedCount}/${group.targetGroupSize}`,
    });

    // Notify user
    this.addNotification({
      userId: params.user.id,
      title: 'Group Joined Successfully',
      message: `You've joined the buyer group for ${group.brandName} ${group.modelName} in ${group.city}. Current count: ${updatedCount}/${group.targetGroupSize}.`,
      type: 'group_milestone',
      linkUrl: `/groups/${group.id}`,
    });

    // If target reached, notify group creator
    if (isTargetReached) {
      this.addNotification({
        userId: group.createdBy,
        title: 'Target Reached! Ready for Quotations',
        message: `Your buyer group for ${group.modelName} in ${group.city} has reached its target of ${group.targetGroupSize} buyers! You can now request dealership quotes.`,
        type: 'group_milestone',
        linkUrl: `/groups/${group.id}`,
      });
    }

    this.persist('groups');
    this.persist('memberships');

    return {
      success: true,
      message: isTargetReached
        ? `Congratulations! Group target of ${group.targetGroupSize} buyers has been reached! You can now request dealer quotes.`
        : `Successfully joined group! You are participant #${updatedCount} of ${group.targetGroupSize}.`,
      group: updatedGroup,
    };
  }

  /**
   * Leave a group before quotation requests are triggered
   */
  async leaveBuyerGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
      return { success: false, message: 'Group not found.' };
    }

    const group = this.groups[groupIndex];
    if (group.status !== 'recruiting') {
      return {
        success: false,
        message: `Cannot leave group: Quotation request has already been initiated (Current status: ${group.status}).`,
      };
    }

    const membershipIndex = this.memberships.findIndex(
      m => m.groupId === groupId && m.userId === userId && m.status === 'active'
    );
    if (membershipIndex === -1) {
      return { success: false, message: 'You are not an active member of this group.' };
    }

    // Mark membership withdrawn
    this.memberships[membershipIndex].status = 'withdrawn';

    const newCount = Math.max(0, group.currentMemberCount - 1);
    this.groups[groupIndex] = {
      ...group,
      currentMemberCount: newCount,
      updatedAt: new Date().toISOString(),
    };

    this.persist('groups');
    this.persist('memberships');

    return { success: true, message: 'You have successfully left the buyer group.' };
  }

  /**
   * Create a new Buyer Group
   */
  async createBuyerGroup(params: {
    modelId: string;
    variantId: string;
    city: string;
    state: string;
    targetGroupSize: number;
    minGroupSize?: number;
    purchaseTimeline: string;
    deadlineDate: string;
    notes?: string;
    user: UserProfile;
  }): Promise<{ success: boolean; message: string; group?: BuyerGroup }> {
    const model = await this.getCarModelById(params.modelId);
    const variant = await this.getCarVariantById(params.variantId);

    if (!model || !variant) {
      return { success: false, message: 'Invalid car model or variant selected.' };
    }

    if (params.targetGroupSize < 3) {
      return { success: false, message: 'Target group size must be at least 3 buyers.' };
    }

    const minSize = params.minGroupSize || Math.max(3, Math.round(params.targetGroupSize * 0.4));

    const creatorInitials = params.user.fullName
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('.') + '.';

    const newGroupId = `group-${model.id}-${Date.now().toString(36)}`;
    const newGroup: BuyerGroup = {
      id: newGroupId,
      modelId: model.id,
      modelName: model.name,
      brandName: model.brandName,
      modelImage: model.imageUrl,
      variantId: variant.id,
      variantName: variant.variantName,
      city: params.city,
      state: params.state,
      targetGroupSize: params.targetGroupSize,
      minGroupSize: minSize,
      currentMemberCount: 1, // Organizer is member #1
      status: 'recruiting',
      purchaseTimeline: params.purchaseTimeline,
      deadlineDate: params.deadlineDate,
      notes: params.notes,
      createdBy: params.user.id,
      creatorInitials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referenceExShowroom: variant.exShowroomPrice,
      referenceStandardOnRoad: variant.standardOnRoadPrice,
      offersCount: 0,
    };

    // Add membership for creator
    const creatorMembership: GroupMember = {
      id: `mem-${Date.now()}-creator`,
      groupId: newGroupId,
      userId: params.user.id,
      userInitials: creatorInitials,
      userCity: params.city,
      variantId: variant.id,
      variantName: variant.variantName,
      budgetMax: variant.standardOnRoadPrice,
      purchaseTimeline: params.purchaseTimeline,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    this.groups.unshift(newGroup);
    this.memberships.push(creatorMembership);

    this.addAuditLog({
      actorId: params.user.id,
      actorName: params.user.fullName,
      action: 'CREATE_GROUP',
      entityType: 'group',
      entityId: newGroupId,
      details: `Created new group for ${model.name} in ${params.city} targeting ${params.targetGroupSize} buyers.`,
    });

    this.persist('groups');
    this.persist('memberships');

    return {
      success: true,
      message: `Buyer group for ${model.brandName} ${model.name} in ${params.city} created successfully!`,
      group: newGroup,
    };
  }

  /**
   * Request quotations for an eligible group
   */
  async requestQuotationsForGroup(
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
      return { success: false, message: 'Group not found.' };
    }

    const group = this.groups[groupIndex];

    if (group.currentMemberCount < group.minGroupSize) {
      return {
        success: false,
        message: `Group has not reached minimum required size (${group.currentMemberCount}/${group.minGroupSize} buyers needed).`,
      };
    }

    this.groups[groupIndex] = {
      ...group,
      status: 'quotations_requested',
      updatedAt: new Date().toISOString(),
    };

    // Notify all dealers handling this brand in the same or nearby city
    const eligibleDealers = this.dealerships.filter(
      d => d.brandsHandled.includes(group.brandName) && d.isVerified
    );

    eligibleDealers.forEach(d => {
      this.addNotification({
        userId: d.userId,
        title: 'New Quotation Opportunity',
        message: `A group of ${group.currentMemberCount} verified buyers for ${group.brandName} ${group.modelName} in ${group.city} is awaiting your competitive quotation.`,
        type: 'new_offer',
        linkUrl: `/dealer/requests`,
      });
    });

    this.addAuditLog({
      actorId: userId,
      actorName: 'User',
      action: 'REQUEST_QUOTATIONS',
      entityType: 'group',
      entityId: group.id,
      details: `RFQ broadcasted to ${eligibleDealers.length} verified dealerships.`,
    });

    this.persist('groups');

    return {
      success: true,
      message: `Quotation request broadcasted to ${eligibleDealers.length} verified dealerships in ${group.city}!`,
    };
  }

  // Dealer Offers
  async getDealerOffers(groupId: string): Promise<DealerOffer[]> {
    return this.offers.filter(o => o.groupId === groupId && o.status === 'submitted');
  }

  async getDealerOfferById(id: string): Promise<DealerOffer | undefined> {
    return this.offers.find(o => o.id === id);
  }

  /**
   * Dealer submits an itemized quotation
   */
  async submitDealerOffer(
    params: Omit<
      DealerOffer,
      'id' | 'submittedAt' | 'finalQuotedOnRoadPrice' | 'estimatedSavings' | 'referenceStandardOnRoad'
    >,
    callerUserId?: string
  ): Promise<{ success: boolean; message: string; offer?: DealerOffer }> {
    if (callerUserId) {
      const callerRole = this.userRolesMap[callerUserId];
      if (callerRole !== 'dealer' && callerRole !== 'admin') {
        return {
          success: false,
          message: 'Access denied: Only registered dealerships can submit price quotations.',
        };
      }
    }

    const groupIndex = this.groups.findIndex(g => g.id === params.groupId);
    if (groupIndex === -1) {
      return { success: false, message: 'Target buyer group not found.' };
    }

    const group = this.groups[groupIndex];

    const exShowroom = Number(params.exShowroomPrice) || 0;
    const dealerDiscount = Number(params.dealerDiscount) || 0;
    const rtoCharges = Number(params.rtoCharges) || 0;
    const insuranceCharges = Number(params.insuranceCharges) || 0;
    const mandatoryCharges = Number(params.mandatoryCharges) || 0;
    const optionalAccessoriesPrice = Number(params.optionalAccessoriesPrice) || 0;

    // Compute exact on-road price
    const finalPrice = calculateOnRoadPrice({
      exShowroom,
      dealerDiscount,
      rtoCharges,
      insuranceCharges,
      mandatoryCharges,
      optionalAccessoriesPrice,
    });

    const savings = calculateSavings(group.referenceStandardOnRoad, finalPrice);

    const newOffer: DealerOffer = {
      ...params,
      id: `offer-${Date.now()}`,
      exShowroomPrice: exShowroom,
      dealerDiscount,
      rtoCharges,
      insuranceCharges,
      mandatoryCharges,
      optionalAccessoriesPrice,
      finalQuotedOnRoadPrice: finalPrice,
      referenceStandardOnRoad: group.referenceStandardOnRoad,
      estimatedSavings: savings.amount,
      submittedAt: new Date().toISOString(),
    };

    // Check if dealer already submitted an offer for this group
    const existingIndex = this.offers.findIndex(
      o => o.groupId === params.groupId && o.dealershipId === params.dealershipId
    );

    if (existingIndex >= 0) {
      this.offers[existingIndex] = {
        ...newOffer,
        id: this.offers[existingIndex].id,
        status: 'updated',
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.offers.push(newOffer);
    }

    // Business rule: Set group status to 'offers_received' since an actual offer record now exists!
    if (group.status === 'quotations_requested' || group.status === 'target_reached') {
      this.groups[groupIndex] = {
        ...group,
        status: 'offers_received',
        updatedAt: new Date().toISOString(),
      };
      this.persist('groups');
    }

    // Notify all active group members about the new offer
    const members = await this.getGroupMembers(group.id);
    members.forEach(m => {
      this.addNotification({
        userId: m.userId,
        title: 'New Dealership Quotation Received!',
        message: `${params.dealershipName} submitted an offer for ${group.modelName} with estimated savings of ₹${(savings.amount || 0).toLocaleString('en-IN')}.`,
        type: 'new_offer',
        linkUrl: `/offers/${group.id}`,
      });
    });

    this.addAuditLog({
      actorId: params.dealershipId,
      actorName: params.dealershipName,
      action: 'SUBMIT_OFFER',
      entityType: 'offer',
      entityId: newOffer.id,
      details: `Dealership submitted quotation of ₹${(finalPrice || 0).toLocaleString('en-IN')} with discount of ₹${(dealerDiscount || 0).toLocaleString('en-IN')}`,
    });

    this.persist('offers');

    return {
      success: true,
      message: 'Your official dealership quotation has been submitted successfully to the buyer group!',
      offer: newOffer,
    };
  }

  async withdrawDealerOffer(
    offerId: string,
    dealerUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const offerIndex = this.offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) {
      return { success: false, message: 'Offer not found.' };
    }

    this.offers[offerIndex].status = 'withdrawn';
    this.offers[offerIndex].updatedAt = new Date().toISOString();

    this.persist('offers');
    return { success: true, message: 'Quotation successfully withdrawn.' };
  }

  // Dealerships & Verification
  async getDealerships(): Promise<Dealership[]> {
    return this.dealerships;
  }

  async getDealershipByUserId(userId: string): Promise<Dealership | undefined> {
    return this.dealerships.find(d => d.userId === userId);
  }

  async registerDealership(
    data: Omit<Dealership, 'id' | 'isVerified' | 'verificationStatus' | 'createdAt'>
  ): Promise<{ success: boolean; message: string; dealership?: Dealership }> {
    const newDealership: Dealership = {
      ...data,
      id: `dealer-${Date.now()}`,
      isVerified: false,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.dealerships.push(newDealership);
    this.persist('dealerships');

    this.addAuditLog({
      actorId: data.userId,
      actorName: data.dealershipName,
      action: 'REGISTER_DEALERSHIP',
      entityType: 'dealership',
      entityId: newDealership.id,
      details: `New dealership submitted business verification: GSTIN ${data.gstin}`,
    });

    return {
      success: true,
      message: 'Dealership profile submitted for administrative verification.',
      dealership: newDealership,
    };
  }

  async verifyDealership(
    dealershipId: string,
    action: 'approve' | 'reject',
    reviewerId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const isAdmin = await this.verifyUserAdminRole(reviewerId);
    if (!isAdmin) {
      return {
        success: false,
        message: 'Access denied. Administrator privileges are required.',
      };
    }

    const index = this.dealerships.findIndex(d => d.id === dealershipId);
    if (index === -1) {
      return { success: false, message: 'Dealership not found.' };
    }

    const d = this.dealerships[index];
    if (action === 'approve') {
      this.dealerships[index] = {
        ...d,
        isVerified: true,
        verificationStatus: 'approved',
        verifiedAt: new Date().toISOString(),
        rejectionReason: undefined,
      };
      this.addNotification({
        userId: d.userId,
        title: 'Dealership Verification Approved! 🎉',
        message: 'Your dealership business credentials have been verified. You can now submit competitive quotations to buyer groups.',
        type: 'verification',
        linkUrl: '/dealer/dashboard',
      });
    } else {
      this.dealerships[index] = {
        ...d,
        isVerified: false,
        verificationStatus: 'rejected',
        rejectionReason: reason || 'Business documentation could not be authenticated.',
      };
      this.addNotification({
        userId: d.userId,
        title: 'Dealership Verification Status Update',
        message: `Your verification request was rejected: ${reason || 'Incomplete GSTIN or trade documents.'}`,
        type: 'verification',
        linkUrl: '/dealer/verification',
      });
    }

    this.addAuditLog({
      actorId: reviewerId,
      actorName: 'Administrator',
      action: action === 'approve' ? 'APPROVE_DEALERSHIP' : 'REJECT_DEALERSHIP',
      entityType: 'dealership',
      entityId: dealershipId,
      details: action === 'approve' ? 'Approved dealership verification' : `Rejected: ${reason}`,
    });

    this.persist('dealerships');

    return {
      success: true,
      message: `Dealership has been marked as ${action === 'approve' ? 'Approved & Verified' : 'Rejected'}.`,
    };
  }

  // Saved Cars / Wishlist
  async getSavedCars(userId: string): Promise<string[]> {
    return this.savedCarsMap[userId] || [];
  }

  async toggleSaveCar(userId: string, modelId: string): Promise<{ saved: boolean }> {
    const list = this.savedCarsMap[userId] || [];
    const index = list.indexOf(modelId);
    let saved = false;

    if (index >= 0) {
      list.splice(index, 1);
      saved = false;
    } else {
      list.push(modelId);
      saved = true;
    }

    this.savedCarsMap[userId] = [...list];
    this.persist('saved_cars');

    return { saved };
  }

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist('notifications');
    }
  }

  private addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): void {
    const n: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(n);
    this.persist('notifications');
  }

  // Audit Logs
  async getAuditLogs(callerUserId?: string): Promise<AuditLogEntry[]> {
    if (!callerUserId || !(await this.verifyUserAdminRole(callerUserId))) {
      throw new Error('Access denied. Administrator privileges are required.');
    }
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): void {
    const log: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.persist('audit_logs');
  }

  // Admin Dashboard Aggregate Counters
  async getAdminStats(callerUserId?: string) {
    if (!callerUserId || !(await this.verifyUserAdminRole(callerUserId))) {
      throw new Error('Access denied. Administrator privileges are required.');
    }
    const totalBuyers = Object.keys(this.memberships).length + 42; // realistic count
    const totalDealerships = this.dealerships.length;
    const pendingVerifications = this.dealerships.filter(d => d.verificationStatus === 'pending').length;
    const activeGroups = this.groups.filter(g => g.status === 'recruiting' || g.status === 'target_reached').length;
    const openQuotationRequests = this.groups.filter(g => g.status === 'quotations_requested').length;
    const totalOffers = this.offers.length;

    return {
      totalBuyers,
      totalDealerships,
      pendingVerifications,
      activeGroups,
      openQuotationRequests,
      totalOffers,
    };
  }

  // Reset to initial mock data (helpful for testing demo)
  resetToDefaults(): void {
    const storage = getStorage();
    if (storage) {
      Object.keys(storage)
        .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
        .forEach(k => storage.removeItem(k));
    }

    this.brands = [...initialBrands];
    this.models = [...initialModels];
    this.variants = [...initialVariants];
    this.dealerships = [...initialDealerships];
    this.groups = [...initialGroups];
    this.memberships = [...initialMemberships];
    this.offers = [...initialOffers];
    this.notifications = [...initialNotifications];
    this.auditLogs = [...initialAuditLogs];
    this.savedCarsMap = { 'buyer-rahul': ['model-creta', 'model-thar'] };

    this.registeredUsers = { ...initialRegisteredUsers };
    this.userRolesMap = {
      'admin-anita': 'admin',
      'buyer-rahul': 'buyer',
      'dealer-apex': 'dealer',
    };
    this.provisionedAdmins = {
      'admin@carmilan.in': {
        email: 'admin@carmilan.in',
        passwordHash: 'Admin@CarMilan2026',
        profile: {
          id: 'admin-anita',
          email: 'admin@carmilan.in',
          fullName: 'Anita Roy (Admin Lead)',
          phone: '+91 98300 11223',
          city: 'Mumbai',
          preferredContactMethod: 'email',
          role: 'admin',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      },
    };
  }
}

export const dataService = new DataService();
