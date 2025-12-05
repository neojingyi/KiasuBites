export enum UserRole {
  CONSUMER = 'consumer',
  VENDOR = 'vendor'
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
  [key: string]: { // mon, tue, wed, etc.
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
  status: 'active' | 'sold_out' | 'inactive';
  category?: 'Meals' | 'Bread & Pastries' | 'Groceries' | 'Dessert' | 'Other'; 
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
  status: 'reserved' | 'picked_up' | 'cancelled' | 'no_show';
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
  payouts: { date: string; period: string; gross: number; fees: number; net: number; status: 'Paid' | 'Upcoming' }[];
}
