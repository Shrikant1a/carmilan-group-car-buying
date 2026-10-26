/**
 * Formats a number into Indian Rupee representation (e.g., ₹14.50 Lakh or ₹14,50,000)
 */
export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const rounded = Math.round(amount);

  if (compact) {
    if (rounded >= 10000000) {
      const cr = (rounded / 10000000).toFixed(2);
      return `₹${cr.replace(/\.00$/, '')} Cr`;
    }
    if (rounded >= 100000) {
      const lakh = (rounded / 100000).toFixed(2);
      return `₹${lakh.replace(/\.00$/, '')} Lakh`;
    }
    if (rounded >= 1000) {
      const k = (rounded / 1000).toFixed(1);
      return `₹${k.replace(/\.0$/, '')}k`;
    }
    return `₹${rounded}`;
  }

  // Format with standard Indian numbering system (xx,xx,xxx)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

export interface PricingInput {
  exShowroom: number;
  dealerDiscount: number;
  rtoCharges: number;
  insuranceCharges: number;
  mandatoryCharges: number;
  optionalAccessoriesPrice?: number;
}

/**
 * Calculates the exact line-itemized final on-road price.
 * Formula:
 * (Ex-Showroom - Dealer Group Discount) + RTO + Insurance + Mandatory Charges + Optional Accessories
 * Ensures no double counting of discounts or taxes.
 */
export function calculateOnRoadPrice(input: PricingInput): number {
  const ex = Math.max(0, Number(input.exShowroom) || 0);
  const discount = Math.max(0, Number(input.dealerDiscount) || 0);
  const rto = Math.max(0, Number(input.rtoCharges) || 0);
  const insurance = Math.max(0, Number(input.insuranceCharges) || 0);
  const mandatory = Math.max(0, Number(input.mandatoryCharges) || 0);
  const accessories = Math.max(0, Number(input.optionalAccessoriesPrice) || 0);

  const discountedExShowroom = Math.max(0, ex - discount);
  const total = discountedExShowroom + rto + insurance + mandatory + accessories;

  return Math.round(total);
}

/**
 * Calculates savings against the standard individual retail on-road price.
 */
export function calculateSavings(
  referenceStandardOnRoad: number,
  finalQuotedOnRoad: number
): { amount: number; percentage: number } {
  const ref = Math.max(0, Number(referenceStandardOnRoad) || 0);
  const quoted = Math.max(0, Number(finalQuotedOnRoad) || 0);

  if (ref <= 0 || quoted >= ref) {
    return { amount: 0, percentage: 0 };
  }

  const diff = ref - quoted;
  const pct = (diff / ref) * 100;

  return {
    amount: Math.round(diff),
    percentage: Number(pct.toFixed(1)),
  };
}

/**
 * Calculate group milestone progress
 */
export function calculateGroupProgress(
  current: number,
  target: number,
  minRequired = 5
): { percent: number; remaining: number; isEligible: boolean } {
  const safeCurrent = Math.max(0, current);
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
  const remaining = Math.max(0, safeTarget - safeCurrent);
  const isEligible = safeCurrent >= minRequired;

  return { percent, remaining, isEligible };
}

/**
 * Estimate standard RTO, Insurance and other charges for a car based on its ex-showroom price
 */
export function estimateStandardCharges(exShowroom: number, fuelType = 'Petrol') {
  // Typical Indian state RTO is 10% for Petrol, 12% for Diesel, 4% for EV
  let rtoRate = 0.10;
  if (fuelType === 'Diesel') rtoRate = 0.12;
  if (fuelType === 'Electric') rtoRate = 0.04;
  if (fuelType === 'CNG') rtoRate = 0.09;

  const standardRto = Math.round(exShowroom * rtoRate);
  // Comprehensive insurance (1 yr OD + 3 yr TP) ~ 3.5%
  const standardInsurance = Math.round(exShowroom * 0.035 + 8500);
  // Mandatory: FASTag (₹500), Hypothecation/Smart Card (₹1,500), TCS 1% if > 10L
  const tcs = exShowroom > 1000000 ? Math.round(exShowroom * 0.01) : 0;
  const standardOtherCharges = 2500 + tcs;

  const standardOnRoadPrice = exShowroom + standardRto + standardInsurance + standardOtherCharges;

  return {
    standardRto,
    standardInsurance,
    standardOtherCharges,
    standardOnRoadPrice,
  };
}
