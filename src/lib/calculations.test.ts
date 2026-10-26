import { describe, it, expect } from 'vitest';
import {
  formatINR,
  calculateOnRoadPrice,
  calculateSavings,
  calculateGroupProgress,
} from './calculations';

describe('CarMilan Calculation Engine', () => {
  it('formats INR correctly in standard and compact formats', () => {
    expect(formatINR(1250000)).toContain('12,50,000');
    expect(formatINR(1250000, true)).toBe('₹12.50 Lakh');
    expect(formatINR(15000000, true)).toBe('₹1.50 Cr');
    expect(formatINR(45000, true)).toBe('₹45k');
  });

  it('calculates on-road price accurately without double discounts', () => {
    const onRoad = calculateOnRoadPrice({
      exShowroom: 1500000,
      dealerDiscount: 75000,
      rtoCharges: 150000,
      insuranceCharges: 55000,
      mandatoryCharges: 3500,
      optionalAccessoriesPrice: 15000,
    });

    // (15,00,000 - 75,000) + 150,000 + 55,000 + 3,500 + 15,000 = 16,48,500
    expect(onRoad).toBe(1648500);
  });

  it('calculates savings and savings percentage against reference price', () => {
    const refPrice = 1723500;
    const quotedPrice = 1648500;
    const savings = calculateSavings(refPrice, quotedPrice);

    expect(savings.amount).toBe(75000);
    expect(savings.percentage).toBeCloseTo(4.4, 1);
  });

  it('handles zero or negative savings correctly', () => {
    const savings = calculateSavings(1500000, 1550000);
    expect(savings.amount).toBe(0);
    expect(savings.percentage).toBe(0);
  });

  it('calculates group progress and eligibility', () => {
    const progress = calculateGroupProgress(14, 20, 5);
    expect(progress.percent).toBe(70);
    expect(progress.remaining).toBe(6);
    expect(progress.isEligible).toBe(true);

    const earlyProgress = calculateGroupProgress(3, 10, 5);
    expect(earlyProgress.percent).toBe(30);
    expect(earlyProgress.remaining).toBe(7);
    expect(earlyProgress.isEligible).toBe(false);
  });
});
