import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from './dataService';
import { UserProfile } from '../types';

const mockBuyer: UserProfile = {
  id: 'test-buyer-999',
  email: 'test999@example.com',
  fullName: 'Arjun Verma',
  phone: '+91 9988776655',
  city: 'Mumbai',
  preferredContactMethod: 'whatsapp',
  role: 'buyer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CarMilan Group Buying Business Logic', () => {
  beforeEach(() => {
    dataService.resetToDefaults();
  });

  it('allows an eligible buyer to join a recruiting group', async () => {
    // group-creta-mumbai-sx has 14/20 members
    const res = await dataService.joinBuyerGroup({
      groupId: 'group-creta-mumbai-sx',
      user: mockBuyer,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    expect(res.success).toBe(true);
    expect(res.group?.currentMemberCount).toBe(15);
  });

  it('prevents duplicate memberships for the same buyer in the same group', async () => {
    // First join
    await dataService.joinBuyerGroup({
      groupId: 'group-creta-mumbai-sx',
      user: mockBuyer,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    // Second join attempt should fail
    const secondRes = await dataService.joinBuyerGroup({
      groupId: 'group-creta-mumbai-sx',
      user: mockBuyer,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    expect(secondRes.success).toBe(false);
    expect(secondRes.message).toContain('already joined this buyer group');
  });

  it('prevents joining a group that is not in recruiting status', async () => {
    // group-nexon-pune is in 'target_reached' status
    const res = await dataService.joinBuyerGroup({
      groupId: 'group-nexon-pune',
      user: mockBuyer,
      budgetMax: 1600000,
      purchaseTimeline: 'Within 15 Days',
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('Cannot join group');
  });

  it('transitions group status to target_reached when target capacity is reached', async () => {
    // Create a group with target size 3
    const newGroupRes = await dataService.createBuyerGroup({
      modelId: 'model-creta',
      variantId: 'var-creta-sx-petrol',
      city: 'Mumbai',
      state: 'Maharashtra',
      targetGroupSize: 3,
      minGroupSize: 2,
      purchaseTimeline: 'Within 30 Days',
      deadlineDate: '2026-12-01',
      user: mockBuyer,
    });

    const groupId = newGroupRes.group!.id;
    expect(newGroupRes.group?.currentMemberCount).toBe(1); // creator is member 1

    // Member 2 joins
    const buyer2: UserProfile = { ...mockBuyer, id: 'buyer-2', fullName: 'Deepak Rao' };
    await dataService.joinBuyerGroup({
      groupId,
      user: buyer2,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    // Member 3 joins (Target capacity reached!)
    const buyer3: UserProfile = { ...mockBuyer, id: 'buyer-3', fullName: 'Sunil Nair' };
    const res3 = await dataService.joinBuyerGroup({
      groupId,
      user: buyer3,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    expect(res3.success).toBe(true);
    expect(res3.group?.currentMemberCount).toBe(3);
    expect(res3.group?.status).toBe('target_reached');

    // Attempting to join an already full group must be rejected
    const buyer4: UserProfile = { ...mockBuyer, id: 'buyer-4', fullName: 'Extra Buyer' };
    const res4 = await dataService.joinBuyerGroup({
      groupId,
      user: buyer4,
      budgetMax: 1800000,
      purchaseTimeline: 'Within 30 Days',
    });

    expect(res4.success).toBe(false);
  });
});
