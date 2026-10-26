import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from './dataService';
import { demoProfiles } from './mockData';

describe('CarMilan Administrative Security & Authorization Test Suite', () => {
  beforeEach(() => {
    dataService.resetToDefaults();
  });

  // Scenario 1: An unauthenticated visitor opens /admin
  it('Scenario 1: Unauthenticated visitor cannot pass admin role check and is directed to /admin/login', async () => {
    const unauthenticatedId = undefined;
    const isAuthorized = await dataService.verifyUserAdminRole(unauthenticatedId as any);
    expect(isAuthorized).toBe(false);

    // Verify authentication is required before admin credentials can be issued
    const failedAuth = await dataService.authenticateAdminCredentials('', '');
    expect(failedAuth.success).toBe(false);
    expect(failedAuth.message).toBe('Access denied. Administrator privileges are required.');
  });

  // Scenario 2: A visitor opens /admin/approvals directly
  it('Scenario 2: Direct unauthenticated caller cannot access admin audit logs or approvals data', async () => {
    // Attempting to access audit logs with an unauthenticated caller ID must be rejected
    await expect(dataService.getAuditLogs('unauthenticated-visitor')).rejects.toThrow(
      'Access denied. Administrator privileges are required.'
    );
  });

  // Scenario 3: A Buyer attempts to access /admin
  it('Scenario 3: Buyer (Rahul Sharma) is denied administrator privileges', async () => {
    const buyerProfile = demoProfiles['buyer-rahul'];
    expect(buyerProfile.role).toBe('buyer');

    const isAdmin = await dataService.verifyUserAdminRole(buyerProfile.id);
    expect(isAdmin).toBe(false);

    // If buyer attempts admin login
    const loginAttempt = await dataService.authenticateAdminCredentials(buyerProfile.email, 'AnyPassword123');
    expect(loginAttempt.success).toBe(false);
    expect(loginAttempt.message).toBe('Access denied. Administrator privileges are required.');
  });

  // Scenario 4: A Dealer attempts to access /admin
  it('Scenario 4: Dealer (Apex Hyundai) is denied administrator privileges', async () => {
    const dealerProfile = demoProfiles['dealer-apex'];
    expect(dealerProfile.role).toBe('dealer');

    const isAdmin = await dataService.verifyUserAdminRole(dealerProfile.id);
    expect(isAdmin).toBe(false);

    // If dealer attempts admin login
    const loginAttempt = await dataService.authenticateAdminCredentials(dealerProfile.email, 'DealerPass123');
    expect(loginAttempt.success).toBe(false);
    expect(loginAttempt.message).toBe('Access denied. Administrator privileges are required.');
  });

  // Scenario 5: A Buyer attempts to change their role to admin through the frontend
  it('Scenario 5: Buyer self-escalation to admin is rejected by authorization enforcement', async () => {
    const buyerId = 'buyer-rahul';
    const escalationAttempt = await dataService.attemptRoleChange(buyerId, 'admin', buyerId);

    expect(escalationAttempt.success).toBe(false);
    expect(escalationAttempt.message).toBe('Access denied. You cannot grant administrator privileges.');

    // Verify role remained unchanged
    const isNowAdmin = await dataService.verifyUserAdminRole(buyerId);
    expect(isNowAdmin).toBe(false);
  });

  // Scenario 6: A Buyer attempts to modify their role through a direct database/API request
  it('Scenario 6: Direct API role modification without admin actor credentials is rejected', async () => {
    const maliciousActorId = 'malicious-hacker-42';
    const directApiAttempt = await dataService.attemptRoleChange(
      maliciousActorId,
      'admin',
      maliciousActorId
    );

    expect(directApiAttempt.success).toBe(false);
    expect(directApiAttempt.message).toContain('Access denied');

    const checkRole = await dataService.verifyUserAdminRole(maliciousActorId);
    expect(checkRole).toBe(false);
  });

  // Scenario 7: A user tries to access admin data through a direct API query
  it('Scenario 7: Unauthorized user trying to read admin stats or audit records is blocked', async () => {
    const unauthorizedUserId = 'buyer-rahul';

    // Trying to read protected audit logs
    await expect(dataService.getAuditLogs(unauthorizedUserId)).rejects.toThrow(
      'Access denied. Administrator privileges are required.'
    );

    // Trying to read protected aggregate admin metrics
    await expect(dataService.getAdminStats(unauthorizedUserId)).rejects.toThrow(
      'Access denied. Administrator privileges are required.'
    );
  });

  // Scenario 8: An authorized administrator logs in
  it('Scenario 8: Authorized administrator logs in and accesses admin console normally', async () => {
    const authResult = await dataService.authenticateAdminCredentials(
      'admin@carmilan.in',
      'Admin@CarMilan2026'
    );

    expect(authResult.success).toBe(true);
    expect(authResult.user).toBeDefined();
    expect(authResult.user?.role).toBe('admin');
    expect(authResult.user?.email).toBe('admin@carmilan.in');

    const adminId = authResult.user!.id;
    const isVerifiedAdmin = await dataService.verifyUserAdminRole(adminId);
    expect(isVerifiedAdmin).toBe(true);

    // Legitimate admin can access admin data without error
    const stats = await dataService.getAdminStats(adminId);
    expect(stats.totalBuyers).toBeGreaterThan(0);

    const logs = await dataService.getAuditLogs(adminId);
    expect(Array.isArray(logs)).toBe(true);
  });

  // Scenario 9: An administrator logs out and tries to access /admin again
  it('Scenario 9: Access is revoked immediately upon logout and subsequent access is denied', async () => {
    // Administrator logged in
    const authResult = await dataService.authenticateAdminCredentials(
      'admin@carmilan.in',
      'Admin@CarMilan2026'
    );
    expect(authResult.success).toBe(true);

    // Simulate session termination (logout)
    const loggedOutUserId = undefined;

    const isStillAdmin = await dataService.verifyUserAdminRole(loggedOutUserId as any);
    expect(isStillAdmin).toBe(false);

    await expect(dataService.getAuditLogs(loggedOutUserId as any)).rejects.toThrow();
  });

  // Scenario 10: A user modifies local storage or URL parameters to impersonate an administrator
  it('Scenario 10: Client-side role spoofing in local storage fails server-side verification', async () => {
    // Attacker fabricates an admin profile in client-side storage
    const spoofedProfile = {
      id: 'attacker-spoofed-session-99',
      email: 'attacker@evilcorp.com',
      fullName: 'Attacker Impersonator',
      role: 'admin' as const,
      phone: '+91 99999 99999',
      city: 'Delhi',
      preferredContactMethod: 'email' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // The backend verification must reject the spoofed session
    const isGrantedPrivileges = await dataService.verifyUserAdminRole(spoofedProfile.id);
    expect(isGrantedPrivileges).toBe(false);

    // Attempting privileged operation with spoofed ID must fail
    const approvalAttempt = await dataService.verifyDealership(
      'dealer-apex',
      'approve',
      spoofedProfile.id
    );
    expect(approvalAttempt.success).toBe(false);
    expect(approvalAttempt.message).toBe('Access denied. Administrator privileges are required.');
  });

  // Scenario 11: A demo-mode user switches personas
  it('Scenario 11: Switching demo personas grants no administrative authority', async () => {
    // Verify that admin persona was removed from public demo profiles
    expect((demoProfiles as any)['admin-anita']).toBeUndefined();
    expect(Object.keys(demoProfiles)).toEqual(['buyer-rahul', 'dealer-apex']);

    // Check Buyer persona
    const buyer = demoProfiles['buyer-rahul'];
    expect(await dataService.verifyUserAdminRole(buyer.id)).toBe(false);

    // Check Dealer persona
    const dealer = demoProfiles['dealer-apex'];
    expect(await dataService.verifyUserAdminRole(dealer.id)).toBe(false);
  });

  // Scenario 12: A normal user attempts to call an admin-only server function directly
  it('Scenario 12: Calling admin-only server functions (verifyDealership, addCarModel) is rejected', async () => {
    const normalBuyerId = 'buyer-rahul';

    // Attempt 1: Direct dealership approval by normal user
    const approvalResult = await dataService.verifyDealership(
      'dealer-apex-mumbai',
      'approve',
      normalBuyerId
    );
    expect(approvalResult.success).toBe(false);
    expect(approvalResult.message).toBe('Access denied. Administrator privileges are required.');

    // Attempt 2: Direct car catalog modification by normal user
    const catalogResult = await dataService.addCarModel(
      {
        brandId: 'brand-test',
        brandName: 'Test Brand',
        name: 'Unauthorized Car',
        bodyType: 'Midsize SUV',
        fuelTypes: ['Petrol'],
        startingPrice: 1000000,
        imageUrl: '/test.jpg',
        description: 'Should fail',
        popularityScore: 10,
        active: true,
      },
      normalBuyerId
    );
    expect(catalogResult.success).toBe(false);
    expect(catalogResult.message).toBe('Access denied. Administrator privileges are required.');

    // Attempt 3: Authorized administrator CAN execute both functions
    const adminId = 'admin-anita';
    const adminApprovalResult = await dataService.verifyDealership(
      'dealer-apex-mumbai',
      'approve',
      adminId
    );
    expect(adminApprovalResult.success).toBe(true);

    const adminCatalogResult = await dataService.addCarModel(
      {
        brandId: 'brand-hyundai',
        brandName: 'Hyundai',
        name: 'Authorized Admin Model',
        bodyType: 'Compact SUV',
        fuelTypes: ['Petrol', 'Electric'],
        startingPrice: 1500000,
        imageUrl: '/images/hero-cars.jpg',
        description: 'Successfully added by verified administrator',
        popularityScore: 90,
        active: true,
      },
      adminId
    );
    expect(adminCatalogResult.success).toBe(true);
  });
});
