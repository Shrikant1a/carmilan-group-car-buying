export type UserRole = 'buyer' | 'dealer' | 'admin';

export type GroupStatus = 
  | 'recruiting'           // Gathering buyers
  | 'target_reached'       // Target buyers reached, ready to request quotes
  | 'quotations_requested' // Quotation request sent to dealers
  | 'offers_received'      // One or more dealerships submitted offers
  | 'completed'            // Purchase cycle closed
  | 'cancelled'            // Cancelled by organizer/admin
  | 'expired';             // Deadline expired

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type OfferStatus = 'submitted' | 'updated' | 'withdrawn' | 'accepted';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  state?: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Dealership {
  id: string;
  userId: string;
  dealershipName: string;
  tradeName: string;
  gstin: string;
  tradeLicenseNumber: string;
  showroomAddress: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  brandsHandled: string[];
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DealershipVerificationDoc {
  id: string;
  dealershipId: string;
  docType: 'gst_certificate' | 'trade_license' | 'oem_authorization' | 'pan_card';
  docNumber: string;
  docUrl: string;
  uploadedAt: string;
}

export interface CarBrand {
  id: string;
  name: string;
  logo: string;
  originCountry: string;
  active: boolean;
}

export interface CarModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  bodyType: 'Compact SUV' | 'Midsize SUV' | 'Sedan' | 'Hatchback' | 'MPV' | 'Off-Roader';
  fuelTypes: ('Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid')[];
  startingPrice: number; // in INR
  imageUrl: string;
  description: string;
  popularityScore: number;
  active: boolean;
}

export interface CarVariant {
  id: string;
  modelId: string;
  variantName: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
  transmission: 'Manual' | 'Automatic' | 'iMT' | 'DCA / DCT';
  engineCc?: number;
  exShowroomPrice: number;
  standardRto: number;
  standardInsurance: number;
  standardOtherCharges: number;
  standardOnRoadPrice: number; // Reference standard retail price
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  userInitials: string; // Privacy safe display (e.g. "R.S.")
  userCity: string;
  variantId?: string;
  variantName?: string;
  budgetMax: number;
  purchaseTimeline: string;
  joinedAt: string;
  status: 'active' | 'withdrawn';
}

export interface BuyerGroup {
  id: string;
  modelId: string;
  modelName: string;
  brandName: string;
  modelImage: string;
  variantId: string;
  variantName: string;
  city: string;
  state: string;
  targetGroupSize: number;
  minGroupSize: number;
  currentMemberCount: number;
  status: GroupStatus;
  purchaseTimeline: string;
  deadlineDate: string;
  notes?: string;
  createdBy: string;
  creatorInitials?: string;
  createdAt: string;
  updatedAt: string;
  referenceExShowroom: number;
  referenceStandardOnRoad: number;
  // Computed / related data
  offersCount?: number;
  bestQuotedPrice?: number;
  potentialMaxSavings?: number;
}

export interface QuotationRequest {
  id: string;
  groupId: string;
  requestedBy: string;
  requestedAt: string;
  deadlineDate: string;
  status: 'open' | 'closed' | 'expired';
  targetCity: string;
  totalBuyers: number;
}

export interface OfferLineItem {
  id: string;
  offerId: string;
  label: string;
  amount: number;
  isOptional: boolean;
  description?: string;
}

export interface DealerOffer {
  id: string;
  quotationRequestId: string;
  groupId: string;
  dealershipId: string;
  dealershipName: string;
  isDealershipVerified: boolean;
  city: string;
  variantId: string;
  variantName: string;
  exShowroomPrice: number;
  dealerDiscount: number;
  rtoCharges: number;
  insuranceCharges: number;
  mandatoryCharges: number; // Fastag, TCS, municipal/handling
  optionalAccessoriesPrice: number;
  accessoriesIncluded: string[];
  finalQuotedOnRoadPrice: number; // exShowroom - discount + rto + insurance + mandatory + (accessories if selected)
  referenceStandardOnRoad: number;
  estimatedSavings: number; // referenceStandardOnRoad - finalQuotedOnRoadPrice
  estimatedDeliveryDays: number;
  offerValidUntil: string;
  termsConditions: string;
  status: OfferStatus;
  submittedAt: string;
  updatedAt?: string;
  lineItems?: OfferLineItem[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'group_milestone' | 'new_offer' | 'verification' | 'system';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'group' | 'offer' | 'dealership' | 'user' | 'catalog';
  entityId: string;
  details: string;
  createdAt: string;
}
