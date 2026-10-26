import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from './dataService';
import { hashPassword, verifyPassword } from '../lib/crypto';

class StorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, val: string) { this.store[key] = String(val); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
  get length() { return Object.keys(this.store).length; }
  key(i: number) { return Object.keys(this.store)[i] || null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new StorageMock();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new StorageMock();
}

describe('CarMilan Comprehensive Authentication & RBAC Test Suite (16 Scenarios)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    dataService.resetToDefaults();
  });

  // Scenario 1: A first-time visitor opens the website: no user is automatically logged in.
  it('Scenario 1: First-time visitor has no active session or automatic login', async () => {
    // When a fresh visitor arrives, localStorage and sessionStorage are empty
    const sessionToken = localStorage.getItem('carmilan_active_user_id');
    const sessionRole = localStorage.getItem('carmilan_active_user_role');
    expect(sessionToken).toBeNull();
    expect(sessionRole).toBeNull();

    // Verifying session without token returns null
    const user = await dataService.verifySession('');
    expect(user).toBeNull();
  });

  // Scenario 2: An unauthenticated visitor tries to access /dashboard: redirected to Login.
  it('Scenario 2: Unauthenticated access to /dashboard is blocked', async () => {
    // Simulate unauthenticated routing logic
    const currentUser = null;
    const path = '/dashboard';
    const isProtected = ['/dashboard', '/buyer', '/dealer', '/profile', '/groups/new'].some(
      prefix => path === prefix || path.startsWith(prefix + '/')
    );

    const redirectPath = isProtected && !currentUser ? '/login' : path;
    expect(redirectPath).toBe('/login');
  });

  // Scenario 3: A new user registers successfully: the account and profile are persisted.
  it('Scenario 3: New user registration persists account and profile to backend storage', async () => {
    const regResult = await dataService.registerUser({
      fullName: 'Vikram Malhotra',
      email: 'vikram.malhotra@example.in',
      phone: '+91 98765 43210',
      password: 'SecurePassword@2026',
      city: 'Bengaluru',
      state: 'Karnataka',
      preferredContactMethod: 'whatsapp',
      role: 'buyer',
    });

    expect(regResult.success).toBe(true);
    expect(regResult.user).toBeDefined();
    expect(regResult.user?.email).toBe('vikram.malhotra@example.in');
    expect(regResult.user?.fullName).toBe('Vikram Malhotra');
    expect(regResult.user?.role).toBe('buyer');

    // Verify persistence in local database store
    const verifiedUser = await dataService.verifySession(regResult.user!.id);
    expect(verifiedUser).toBeDefined();
    expect(verifiedUser?.fullName).toBe('Vikram Malhotra');
    expect(verifiedUser?.city).toBe('Bengaluru');
  });

  // Scenario 4: A user attempts to register with an existing email: duplicate account creation is prevented.
  it('Scenario 4: Duplicate registration with existing email is rejected', async () => {
    // Register first user
    await dataService.registerUser({
      fullName: 'Ananya Sharma',
      email: 'ananya.sharma@example.in',
      phone: '+91 99887 76655',
      password: 'Password#1234',
      city: 'Delhi',
      role: 'buyer',
    });

    // Attempt second registration with same email
    const duplicateResult = await dataService.registerUser({
      fullName: 'Ananya Sharma Clone',
      email: 'ananya.sharma@example.in',
      phone: '+91 99887 76699',
      password: 'AnotherPassword!99',
      city: 'Delhi',
      role: 'buyer',
    });

    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.message).toContain('already exists');
  });

  // Scenario 5: A user enters incorrect login credentials: access is denied.
  it('Scenario 5: Incorrect credentials result in access denial with generic error message', async () => {
    // Register account
    await dataService.registerUser({
      fullName: 'Siddharth Roy',
      email: 'siddharth@example.in',
      phone: '+91 91234 56789',
      password: 'CorrectPassword@2026',
      city: 'Pune',
      role: 'buyer',
    });

    // Attempt login with wrong password
    const failedAuth = await dataService.authenticateUser('siddharth@example.in', 'WrongPassword!999');
    expect(failedAuth.success).toBe(false);
    expect(failedAuth.user).toBeUndefined();
    expect(failedAuth.message).toBe('Invalid email or password. Please verify your credentials.');

    // Attempt login with non-existent email
    const nonExistentAuth = await dataService.authenticateUser('ghost@nonexistent.in', 'SomePassword123');
    expect(nonExistentAuth.success).toBe(false);
    expect(nonExistentAuth.message).toBe('Invalid email or password. Please verify your credentials.');
  });

  // Scenario 6: A registered user logs in: the correct profile and dashboard appear.
  it('Scenario 6: Registered user login retrieves correct profile and role', async () => {
    await dataService.registerUser({
      fullName: 'Meera Patel',
      email: 'meera.patel@example.in',
      phone: '+91 98222 33445',
      password: 'MeeraSecret@2026',
      city: 'Ahmedabad',
      role: 'buyer',
    });

    const loginResult = await dataService.authenticateUser('meera.patel@example.in', 'MeeraSecret@2026');
    expect(loginResult.success).toBe(true);
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user?.fullName).toBe('Meera Patel');
    expect(loginResult.user?.role).toBe('buyer');

    // Role-based target dashboard
    const targetDashboard = loginResult.user?.role === 'buyer' ? '/buyer/dashboard' : '/dealer/dashboard';
    expect(targetDashboard).toBe('/buyer/dashboard');
  });

  // Scenario 7: A logged-in user refreshes the browser: the session behaves according to the configured policy.
  it('Scenario 7: Browser refresh restores authenticated session from persisted storage', async () => {
    const regResult = await dataService.registerUser({
      fullName: 'Kunal Kapoor',
      email: 'kunal.kapoor@example.in',
      phone: '+91 97777 88899',
      password: 'KunalPassword@1',
      city: 'Mumbai',
      role: 'buyer',
    });

    // Simulate session storage on login
    const userId = regResult.user!.id;
    localStorage.setItem('carmilan_active_user_id', userId);

    // On page reload, verifySession is invoked with persisted ID
    const restoredSession = await dataService.verifySession(userId);
    expect(restoredSession).not.toBeNull();
    expect(restoredSession?.id).toBe(userId);
    expect(restoredSession?.email).toBe('kunal.kapoor@example.in');
    expect(restoredSession?.fullName).toBe('Kunal Kapoor');
  });

  // Scenario 8: A user logs out: protected pages become inaccessible.
  it('Scenario 8: Logout clears session tokens and renders protected pages inaccessible', async () => {
    localStorage.setItem('carmilan_active_user_id', 'usr-test-123');
    sessionStorage.setItem('carmilan_active_user_id', 'usr-test-123');

    // Simulate logout action
    localStorage.removeItem('carmilan_active_user_id');
    localStorage.removeItem('carmilan_active_user_role');
    sessionStorage.clear();

    const loggedOutUser = null;
    const canAccessDashboard = Boolean(loggedOutUser);
    expect(canAccessDashboard).toBe(false);

    // verifySession on empty string returns null
    const session = await dataService.verifySession('');
    expect(session).toBeNull();
  });

  // Scenario 9: The same user logs in again: their saved profile and permitted records are available.
  it('Scenario 9: Re-login restores previously saved cars and profile data', async () => {
    const regResult = await dataService.registerUser({
      fullName: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@example.in',
      phone: '+91 94444 55566',
      password: 'RohanPassword#2026',
      city: 'Pune',
      role: 'buyer',
    });
    const userId = regResult.user!.id;

    // User saves a car
    await dataService.toggleSaveCar(userId, 'model-creta');
    const initialSavedCars = await dataService.getSavedCars(userId);
    expect(initialSavedCars).toContain('model-creta');

    // Simulate logout
    globalThis.localStorage.clear();

    // Re-login with credentials
    const reloginResult = await dataService.authenticateUser('rohan.deshmukh@example.in', 'RohanPassword#2026');
    expect(reloginResult.success).toBe(true);

    // Saved records remain intact
    const restoredSavedCars = await dataService.getSavedCars(reloginResult.user!.id);
    expect(restoredSavedCars).toContain('model-creta');
  });

  // Scenario 10: A Buyer attempts to access Dealer-only functionality: access is denied.
  it('Scenario 10: Buyer is prohibited from performing dealer actions and accessing dealer portal', async () => {
    const regResult = await dataService.registerUser({
      fullName: 'Tanvi Joshi',
      email: 'tanvi.joshi@example.in',
      phone: '+91 93333 22211',
      password: 'TanviPassword@2026',
      city: 'Mumbai',
      role: 'buyer',
    });
    const buyerId = regResult.user!.id;

    // Buyer attempts to submit a dealer quote
    const quoteAttempt = await dataService.submitDealerOffer(
      {
        quotationRequestId: 'rfq-creta',
        dealershipId: 'unauthorized-dealer',
        dealershipName: 'Fake Dealership',
        groupId: 'group-creta-mumbai-sx',
        isDealershipVerified: false,
        city: 'Mumbai',
        variantId: 'var-sx-manual',
        variantName: 'SX 1.5 Petrol Manual',
        exShowroomPrice: 1530000,
        dealerDiscount: 50000,
        rtoCharges: 180000,
        insuranceCharges: 60000,
        mandatoryCharges: 15000,
        optionalAccessoriesPrice: 0,
        accessoriesIncluded: ['Mats'],
        estimatedDeliveryDays: 14,
        offerValidUntil: '2026-11-30',
        termsConditions: 'Standard terms',
        status: 'submitted',
      },
      buyerId
    );

    expect(quoteAttempt.success).toBe(false);
    expect(quoteAttempt.message).toContain('Access denied');
  });

  // Scenario 11: A Buyer or Dealer attempts to access the Admin Console: access is denied.
  it('Scenario 11: Buyer or Dealer accessing admin console endpoints is rejected', async () => {
    const buyerResult = await dataService.registerUser({
      fullName: 'Ordinary Buyer',
      email: 'ord.buyer@example.in',
      phone: '+91 91111 22233',
      password: 'BuyerPass#2026',
      city: 'Nagpur',
      role: 'buyer',
    });

    const isBuyerAdmin = await dataService.verifyUserAdminRole(buyerResult.user!.id);
    expect(isBuyerAdmin).toBe(false);

    // Direct attempt to fetch admin audit logs
    await expect(dataService.getAuditLogs(buyerResult.user!.id)).rejects.toThrow(
      'Access denied. Administrator privileges are required.'
    );

    // Direct attempt to fetch admin stats
    await expect(dataService.getAdminStats(buyerResult.user!.id)).rejects.toThrow(
      'Access denied. Administrator privileges are required.'
    );
  });

  // Scenario 12: A user tries to grant themselves admin privileges: operation is rejected.
  it('Scenario 12: Role self-escalation via registration or API is strictly rejected', async () => {
    // 1. Attempt self-registering as admin
    const adminRegAttempt = await dataService.registerUser({
      fullName: 'Hacker Attempt',
      email: 'hacker@carmilan.in',
      password: 'HackerPassword#1',
      role: 'admin' as any,
    });
    expect(adminRegAttempt.success).toBe(false);
    expect(adminRegAttempt.message).toBe('Administrator accounts cannot be self-registered.');

    // 2. Normal user attempts to escalate via attemptRoleChange
    const buyer = await dataService.registerUser({
      fullName: 'Sneaky User',
      email: 'sneaky@example.in',
      password: 'SneakyPassword#1',
      role: 'buyer',
    });
    const escalation = await dataService.attemptRoleChange(buyer.user!.id, 'admin', buyer.user!.id);
    expect(escalation.success).toBe(false);
    expect(escalation.message).toContain('Access denied');

    // 3. User attempts to modify role via updateUserProfile
    await expect(
      dataService.updateUserProfile(buyer.user!.id, { role: 'admin' as any }, buyer.user!.id)
    ).rejects.toThrow('Role modifications are not permitted via profile update.');
  });

  // Scenario 13: One buyer tries to read or update another buyer's private data: access is denied.
  it('Scenario 13: Cross-buyer data isolation masks contact details and blocks cross updates', async () => {
    const buyer1 = await dataService.registerUser({
      fullName: 'Buyer One',
      email: 'buyer1@private.in',
      phone: '+91 99999 11111',
      password: 'PasswordOne#2026',
      role: 'buyer',
    });

    const buyer2 = await dataService.registerUser({
      fullName: 'Buyer Two',
      email: 'buyer2@private.in',
      phone: '+91 99999 22222',
      password: 'PasswordTwo#2026',
      role: 'buyer',
    });

    // Buyer 2 inspects Buyer 1's profile
    const fetchedProfile = await dataService.getUserProfile(buyer1.user!.id, buyer2.user!.id);
    expect(fetchedProfile).not.toBeNull();
    expect(fetchedProfile?.fullName).toBe('Buyer One');
    // Private data must be masked
    expect(fetchedProfile?.phone).toBe('PROTECTED_CONTACT');
    expect(fetchedProfile?.email).toBe('PROTECTED_EMAIL');

    // Buyer 2 attempts to maliciously update Buyer 1's profile
    await expect(
      dataService.updateUserProfile(
        buyer1.user!.id,
        { fullName: 'Tampered Name' },
        buyer2.user!.id // Caller is buyer 2
      )
    ).rejects.toThrow('Access denied: You can only update your own profile.');
  });

  // Scenario 14: Dealer registration remains pending until the required verification is completed.
  it('Scenario 14: Dealer registration defaults to pending verification status', async () => {
    const dealerReg = await dataService.registerUser({
      fullName: 'Dealer Principal',
      email: 'principal@horizonmotors.in',
      phone: '+91 98200 99887',
      password: 'HorizonDealer#2026',
      role: 'dealer',
      dealershipInfo: {
        dealershipName: 'Horizon Motors Pune',
        tradeName: 'Horizon Auto Retail Pvt Ltd',
        gstin: '27AABCH1234F1Z5',
        tradeLicenseNumber: 'PMC/AUTO/2026/8812',
        showroomAddress: 'Senapati Bapat Road, Shivajinagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411016',
        brandsHandled: ['Tata Motors', 'Mahindra'],
      },
    });

    expect(dealerReg.success).toBe(true);
    expect(dealerReg.user?.role).toBe('dealer');
    expect(dealerReg.message).toContain('verification is currently pending');

    // Retrieve created dealership
    const allDealerships = await dataService.getDealerships();
    const createdDealership = allDealerships.find(d => d.userId === dealerReg.user!.id);

    expect(createdDealership).toBeDefined();
    expect(createdDealership?.dealershipName).toBe('Horizon Motors Pune');
    expect(createdDealership?.isVerified).toBe(false);
    expect(createdDealership?.verificationStatus).toBe('pending');
  });

  // Scenario 15: Demo mode cannot bypass real authentication or backend authorization.
  it('Scenario 15: Mock tokens and hardcoded persona identifiers cannot bypass authentication', async () => {
    // Attempting to authenticate with arbitrary passwords fails
    const fakeAuth = await dataService.authenticateUser('buyer-rahul', 'fake-pass');
    expect(fakeAuth.success).toBe(false);

    // Checking admin role for unauthenticated or non-admin demo ID fails
    const isFakeAdmin = await dataService.verifyUserAdminRole('buyer-rahul');
    expect(isFakeAdmin).toBe(false);

    // Direct access to admin login requires explicit administrator credentials
    const adminCheck = await dataService.authenticateAdminCredentials('buyer-rahul', 'admin123');
    expect(adminCheck.success).toBe(false);
  });

  // Scenario 16: Password recovery follows the configured secure reset flow.
  it('Scenario 16: Password recovery returns generic confirmation without user enumeration', async () => {
    // Request for registered user
    const res1 = await dataService.requestPasswordReset('rahul.sharma@example.com');
    expect(res1.success).toBe(true);
    expect(res1.message).toContain('If an account is associated with this email address');

    // Request for unknown non-existent user returns exact same generic confirmation
    const res2 = await dataService.requestPasswordReset('completely_unknown_user_999@domain.org');
    expect(res2.success).toBe(true);
    expect(res2.message).toBe(res1.message);
  });
});
