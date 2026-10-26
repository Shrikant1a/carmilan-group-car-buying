export const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', region: 'West' },
  { city: 'Delhi NCR', state: 'Delhi', region: 'North' },
  { city: 'Bengaluru', state: 'Karnataka', region: 'South' },
  { city: 'Hyderabad', state: 'Telangana', region: 'South' },
  { city: 'Pune', state: 'Maharashtra', region: 'West' },
  { city: 'Chennai', state: 'Tamil Nadu', region: 'South' },
  { city: 'Ahmedabad', state: 'Gujarat', region: 'West' },
  { city: 'Kolkata', state: 'West Bengal', region: 'East' },
  { city: 'Jaipur', state: 'Rajasthan', region: 'North' },
  { city: 'Lucknow', state: 'Uttar Pradesh', region: 'North' },
  { city: 'Chandigarh', state: 'Punjab / Haryana', region: 'North' },
  { city: 'Kochi', state: 'Kerala', region: 'South' },
];

export const PURCHASE_TIMELINES = [
  { id: 'immediate', label: 'Within 15 Days (Urgent)' },
  { id: '30_days', label: 'Within 30 Days (Ready)' },
  { id: '60_days', label: 'Within 60 Days (Planning)' },
  { id: '90_days', label: 'Within 3 Months' },
];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'] as const;

export const BODY_TYPES = [
  'Compact SUV',
  'Midsize SUV',
  'Sedan',
  'Hatchback',
  'MPV',
  'Off-Roader',
] as const;

export const GROUP_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  recruiting: {
    label: 'Recruiting Buyers',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  target_reached: {
    label: 'Target Reached',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  quotations_requested: {
    label: 'Quotations Requested',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  offers_received: {
    label: 'Offers Received',
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
  expired: {
    label: 'Expired',
    color: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
  },
};

export const STANDARD_ACCESSORIES_LIST = [
  'All-Weather 3D Floor Mats',
  'Mud Flaps Set',
  'Body Cover with Reflective Strips',
  'Dual-Channel Full HD Dashcam',
  'Door Visors / Rain Guards',
  'Magnetic Sunshades (Set of 4)',
  'Boot Mat & Luggage Net',
  'Illuminated Scuff Plates',
];
