export enum UserRole {
  CONSUMER = "consumer",
  VENDOR = "vendor",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dietaryPreferences?: string[];
  radiusKm?: number;
  favorites?: string[]; // vendor IDs
  isVerified?: boolean; // For vendors
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
}

export interface VendorBusinessInfo {
  companyName: string;
  brandName?: string;
  uen: string;
  businessType: string;
  directorName: string;
  nric: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
}

export interface WeeklyAvailability {
  [key: string]: {
    // mon, tue, wed, etc.
    available: boolean;
    pickupStart: string;
    pickupEnd: string;
    defaultQuantity: number;
  };
}

export interface VendorSettings {
  instructions: string;
  collectionInfo: string;
  storageInfo: string;
  showAllergens: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  totalReviews: number;
  tags: string[];
  photoUrl: string;
  pickupInstructions?: string;
  businessInfo?: VendorBusinessInfo;
  availability?: WeeklyAvailability;
  settings?: VendorSettings;
}

export interface SurpriseBag {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  pickupStart: string;
  pickupEnd: string;
  quantity: number;
  dietaryTags: string[];
  status: "active" | "sold_out" | "inactive";
  category?: "Meals" | "Bread & Pastries" | "Groceries" | "Dessert" | "Other";
  imageUrl?: string; // Image URL for the surprise bag
}

export interface Order {
  id: string;
  consumerId: string;
  bagId: string;
  vendorId: string;
  bagTitle: string;
  vendorName: string;
  quantity: number;
  totalPrice: number;
  estimatedValue: number; // For savings calculation
  status: "reserved" | "picked_up" | "cancelled" | "no_show";
  pickupStart: string;
  pickupEnd: string;
  createdAt: string;
  confirmationCode: string;
  rating?: number;
  review?: string;
}

export interface VendorStats {
  todaySales: number;
  totalMealsSaved: number;
  revenueThisMonth: number;
  pickupRate: number;
  avgRating: number;
  salesHistory: { date: string; amount: number; bagsSold: number }[];
  payouts: {
    date: string;
    period: string;
    gross: number;
    fees: number;
    net: number;
    status: "Paid" | "Upcoming";
  }[];
}

// Financial Types
export interface PayoutOverview {
  currentAccrued: number;
  payoutCycle: "Monthly";
  minimumThreshold: number;
  nextPayoutDate: string;
  payoutMethod?: PayoutMethod;
}

export interface PayoutMethod {
  id: string;
  type: "bank_account";
  bankName: string;
  accountNumber: string; // Last 4 digits only for display
  accountHolderName: string;
  isDefault: boolean;
}

export interface MonthlyStatement {
  month: number;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  platformFees: number;
  netPayout: number;
  status: "pending" | "processing" | "paid";
}

export interface DailyInvoice {
  orderId: string;
  date: string;
  productType: string;
  totalAmount: number;
  invoiceUrl?: string;
  creditNoteUrl?: string;
}

export interface PartnerDetails {
  businessName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  invoiceEmail: string;
}

export interface EmailSettings {
  enabled: boolean;
  includeAccountStatements: boolean;
  includeOrderSummaries: boolean;
  includeInvoices: boolean;
  includeSelfBillingInvoices: boolean;
}

export interface LegalDocument {
  id: string;
  name: string;
  url: string;
  type: "terms" | "commercial_terms" | "cookie_policy" | "privacy_policy";
}

// Impact Calculator Types
export interface ImpactConfig {
  moneySavedPerBag: number; // Currency amount saved per bag
  co2eSavedPerBagKg: number; // kg of CO2e avoided per bag
  hoursOfShowersPerKgCo2e: number; // Equivalent hours of hot showers per kg CO2e
  sliderMin: number; // Minimum extra bags per day
  sliderMax: number; // Maximum extra bags per day
  currency: string; // Currency code (e.g., 'SGD', 'GBP', 'USD')
}

export interface ImpactEstimate {
  baseBagsPerDay: number;
  extraBagsPerDay: number;
  totalBagsPerDay: number;
  bagsPerYear: number;
  moneySavedPerYear: number;
  co2eAvoidedPerYearKg: number;
  hoursOfHotShowers: number;
  config: ImpactConfig;
}

export interface ImpactPreviewRequest {
  extraBagsPerDay: number;
}

export interface UpdateScheduleFromImpactRequest {
  extraBagsPerDay: number;
  totalBagsPerDay: number;
}
