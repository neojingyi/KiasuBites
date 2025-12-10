/**
 * Supabase-based API Service
 * 
 * This file contains API functions that use Supabase instead of localStorage.
 * This is a reference implementation showing how to migrate from localStorage to Supabase.
 * 
 * To use this:
 * 1. Set up Supabase (see supabase/README.md)
 * 2. Configure environment variables
 * 3. Replace imports from './api' to './api.supabase' (or merge into api.ts)
 */

import { supabase, handleSupabaseError, getCurrentUserId } from './supabase';
import {
  User,
  Vendor,
  SurpriseBag,
  Order,
  UserRole,
  VendorStats,
  WeeklyAvailability,
  VendorBusinessInfo,
  VendorSettings,
  PayoutOverview,
  PayoutMethod,
  MonthlyStatement,
  DailyInvoice,
  PartnerDetails,
  EmailSettings,
  LegalDocument,
  ImpactEstimate,
  ImpactConfig,
} from '../types';

// Helper to delay (for loading states)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate confirmation codes
const generateConfirmationCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper to convert database vendor to app vendor
const dbVendorToVendor = (dbVendor: any, businessInfo?: any, settings?: any, availability?: any[]): Vendor => {
  const weeklyAvailability: WeeklyAvailability = {};
  if (availability) {
    availability.forEach((avail) => {
      weeklyAvailability[avail.day_of_week] = {
        available: avail.available,
        pickupStart: avail.pickup_start,
        pickupEnd: avail.pickup_end,
        defaultQuantity: avail.default_quantity,
      };
    });
  }

  return {
    id: dbVendor.id,
    name: dbVendor.name,
    address: dbVendor.address,
    lat: Number(dbVendor.lat),
    lng: Number(dbVendor.lng),
    category: dbVendor.category,
    rating: Number(dbVendor.rating),
    totalReviews: dbVendor.total_reviews,
    tags: dbVendor.tags || [],
    photoUrl: dbVendor.photo_url || '',
    pickupInstructions: dbVendor.pickup_instructions || undefined,
    isVerified: dbVendor.is_verified,
    businessInfo: businessInfo ? {
      companyName: businessInfo.company_name,
      brandName: businessInfo.brand_name || undefined,
      uen: businessInfo.uen,
      businessType: businessInfo.business_type,
      directorName: businessInfo.director_name,
      nric: businessInfo.nric,
      address: businessInfo.address,
      phone: businessInfo.phone,
      email: businessInfo.email,
      openingHours: businessInfo.opening_hours || undefined,
    } : undefined,
    settings: settings ? {
      instructions: settings.instructions || undefined,
      collectionInfo: settings.collection_info || undefined,
      storageInfo: settings.storage_info || undefined,
      showAllergens: settings.show_allergens,
    } : undefined,
    availability: Object.keys(weeklyAvailability).length > 0 ? weeklyAvailability : undefined,
  };
};

// Helper to convert database bag to app bag
const dbBagToBag = (dbBag: any, vendorName: string, vendorCategory: string): SurpriseBag => {
  return {
    id: dbBag.id,
    vendorId: dbBag.vendor_id,
    vendorName,
    vendorCategory,
    title: dbBag.title,
    description: dbBag.description,
    price: Number(dbBag.price),
    originalPrice: Number(dbBag.original_price),
    pickupStart: dbBag.pickup_start,
    pickupEnd: dbBag.pickup_end,
    quantity: dbBag.quantity,
    dietaryTags: dbBag.dietary_tags || [],
    status: dbBag.status,
    category: dbBag.category || undefined,
    imageUrl: dbBag.image_url || undefined,
  };
};

// Helper to convert database order to app order
const dbOrderToOrder = (dbOrder: any): Order => {
  return {
    id: dbOrder.id,
    consumerId: dbOrder.consumer_id,
    bagId: dbOrder.bag_id,
    vendorId: dbOrder.vendor_id,
    bagTitle: dbOrder.bag_title,
    vendorName: dbOrder.vendor_name,
    quantity: dbOrder.quantity,
    totalPrice: Number(dbOrder.total_price),
    estimatedValue: Number(dbOrder.estimated_value),
    status: dbOrder.status,
    pickupStart: dbOrder.pickup_start,
    pickupEnd: dbOrder.pickup_end,
    createdAt: dbOrder.created_at,
    confirmationCode: dbOrder.confirmation_code,
    rating: dbOrder.rating || undefined,
    review: dbOrder.review || undefined,
  };
};

export const apiSupabase = {
  // Auth
  login: async (email: string, password: string, role: UserRole): Promise<User> => {
    await delay(600);
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      // If user doesn't exist, create them
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: email.split('@')[0], // Default name from email
          },
        },
      });
      
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Failed to create user');
      
      // Create role-specific profile
      const profileTable = role === UserRole.VENDOR ? 'vendors' : 'consumers';
      const profileInsert =
        role === UserRole.VENDOR
          ? {
              id: signUpData.user.id,
              name: email.split('@')[0],
              email,
              address: '',
              lat: 0,
              lng: 0,
              category: 'Other',
              rating: 0,
              total_reviews: 0,
              is_verified: false,
              photo_url: null,
          }
          : {
              id: signUpData.user.id,
              name: email.split('@')[0],
              email,
              dietary_preferences: [],
              radius_km: 5,
            };
      const { error: profileError } = await supabase.from(profileTable).insert(profileInsert as any);
      if (profileError) throw profileError;
      
      return {
        id: signUpData.user.id,
        name: email.split('@')[0],
        email,
        role,
        dietaryPreferences: [],
        favorites: [],
        isVerified: role === UserRole.VENDOR ? false : undefined,
      };
    }
    
    const targetRole = (authData.user.user_metadata?.role as UserRole) || role;
    const profileTable = targetRole === UserRole.VENDOR ? 'vendors' : 'consumers';

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from(profileTable)
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError || !profile) throw profileError || new Error('Profile not found');
    
    // Get favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('vendor_id')
      .eq('user_id', authData.user.id);
    
    // Get vendor verification status if vendor
    let isVerified = undefined;
    if (targetRole === UserRole.VENDOR) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('is_verified')
        .eq('id', authData.user.id)
        .single();
      isVerified = vendor?.is_verified || false;
    }
    
    const resolvedName =
      (profile as any).name ||
      authData.user.user_metadata?.name ||
      authData.user.email?.split('@')[0] ||
      'User';

    return {
      id: profile.id,
      name: resolvedName,
      email: authData.user.email || email,
      role: targetRole,
      dietaryPreferences: targetRole === UserRole.VENDOR ? [] : profile.dietary_preferences || [],
      radiusKm: targetRole === UserRole.VENDOR ? undefined : profile.radius_km,
      favorites: favorites?.map((f) => f.vendor_id) || [],
      isVerified,
      profilePictureUrl: targetRole === UserRole.VENDOR ? profile.photo_url || undefined : profile.profile_picture_url || undefined,
    };
  },

  logout: async () => {
    await delay(200);
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    // Try consumers then vendors
    const fetchProfile = async (table: 'consumers' | 'vendors') => {
      const { data } = await supabase.from(table).select('*').eq('id', session.user.id).maybeSingle();
      return data;
    };

    let profile: any = await fetchProfile('consumers');
    let role: UserRole = UserRole.CONSUMER;
    if (!profile) {
      profile = await fetchProfile('vendors');
      role = UserRole.VENDOR;
    }
    if (!profile) return null;

    const { data: favorites } = await supabase
      .from('favorites')
      .select('vendor_id')
      .eq('user_id', session.user.id);
    
    let isVerified = undefined;
    if (role === UserRole.VENDOR) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('is_verified')
        .eq('id', session.user.id)
        .single();
      isVerified = vendor?.is_verified || false;
    }
    
    return {
      id: profile.id,
      name: profile.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      email: profile.email || session.user.email || '',
      role,
      dietaryPreferences: role === UserRole.VENDOR ? [] : profile.dietary_preferences || [],
      radiusKm: role === UserRole.VENDOR ? undefined : profile.radius_km,
      favorites: favorites?.map((f) => f.vendor_id) || [],
      isVerified,
    };
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    await delay(300);
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) updateData.address = updates.address;
    // Only consumers have dietary/radius
    const profileTable = updates.role === UserRole.VENDOR ? 'vendors' : 'consumers';
    if (profileTable === 'consumers') {
      if (updates.dietaryPreferences) updateData.dietary_preferences = updates.dietaryPreferences;
      if (updates.radiusKm !== undefined) updateData.radius_km = updates.radiusKm;
    }
    if (updates.profilePictureUrl !== undefined) {
      if (profileTable === 'vendors') {
        updateData.photo_url = updates.profilePictureUrl;
      } else {
        updateData.profile_picture_url = updates.profilePictureUrl;
      }
    }
    
    const { data, error } = await supabase
      .from(profileTable)
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    const role = profileTable === 'vendors' ? UserRole.VENDOR : UserRole.CONSUMER;
    const { data: authUserData } = await supabase.auth.getUser();
    const resolvedName =
      (data as any).name ||
      (updates as any).name ||
      authUserData?.user?.user_metadata?.name ||
      authUserData?.user?.email?.split('@')[0] ||
      'User';

    return {
      id: data.id,
      name: resolvedName,
      email: data.email || (await supabase.auth.getUser()).data.user?.email || '',
      role,
      dietaryPreferences: role === UserRole.VENDOR ? [] : data.dietary_preferences || [],
      radiusKm: role === UserRole.VENDOR ? undefined : data.radius_km,
      favorites: updates.favorites || [],
    };
  },

  toggleFavorite: async (vendorId: string): Promise<User> => {
    await delay(200);
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('vendor_id', vendorId)
      .single();
    
    if (existing) {
      // Remove favorite
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('vendor_id', vendorId);
    } else {
      // Add favorite
      await supabase.from('favorites').insert({
        user_id: userId,
        vendor_id: vendorId,
      });
    }
    
    // Get updated user
    const user = await apiSupabase.getCurrentUser();
    if (!user) throw new Error('Failed to get user');
    return user;
  },

  // Consumer
  getBags: async (): Promise<SurpriseBag[]> => {
    await delay(400);
    
    const { data: bags, error } = await supabase
      .from('surprise_bags')
      .select(`
        *,
        vendors!inner(name, category)
      `);
    
    if (error) throw error;
    
    return bags.map((bag: any) => 
      dbBagToBag(bag, bag.vendors.name, bag.vendors.category)
    );
  },

  getVendors: async (): Promise<Vendor[]> => {
    await delay(400);
    
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*');
    
    if (error) throw error;
    
    // Fetch related data for each vendor
    const vendorsWithDetails = await Promise.all(
      vendors.map(async (vendor) => {
        const [businessInfo, settings, availability] = await Promise.all([
          supabase.from('vendor_business_info').select('*').eq('vendor_id', vendor.id).single(),
          supabase.from('vendor_settings').select('*').eq('vendor_id', vendor.id).single(),
          supabase.from('vendor_availability').select('*').eq('vendor_id', vendor.id),
        ]);
        
        return dbVendorToVendor(
          vendor,
          businessInfo.data,
          settings.data,
          availability.data || []
        );
      })
    );
    
    return vendorsWithDetails;
  },

  getBagById: async (id: string): Promise<SurpriseBag | undefined> => {
    await delay(300);
    
    const { data: bag, error } = await supabase
      .from('surprise_bags')
      .select(`
        *,
        vendors!inner(name, category)
      `)
      .eq('id', id)
      .single();
    
    if (error || !bag) return undefined;
    
    return dbBagToBag(bag, bag.vendors.name, bag.vendors.category);
  },

  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    await delay(300);
    
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !vendor) return undefined;
    
    const [businessInfo, settings, availability] = await Promise.all([
      supabase.from('vendor_business_info').select('*').eq('vendor_id', id).single(),
      supabase.from('vendor_settings').select('*').eq('vendor_id', id).single(),
      supabase.from('vendor_availability').select('*').eq('vendor_id', id),
    ]);
    
    return dbVendorToVendor(
      vendor,
      businessInfo.data,
      settings.data,
      availability.data || []
    );
  },

  getFavoriteVendors: async (
    userId: string
  ): Promise<{ vendor: Vendor; bags: SurpriseBag[] }[]> => {
    await delay(500);
    
    const { data: favorites } = await supabase
      .from('favorites')
      .select('vendor_id')
      .eq('user_id', userId);
    
    if (!favorites || favorites.length === 0) return [];
    
    const vendorIds = favorites.map((f) => f.vendor_id);
    
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .in('id', vendorIds);
    
    if (!vendors) return [];
    
    const { data: bags } = await supabase
      .from('surprise_bags')
      .select(`
        *,
        vendors!inner(name, category)
      `)
      .in('vendor_id', vendorIds)
      .eq('status', 'active')
      .gt('quantity', 0);
    
    return vendors.map((vendor) => {
      const vendorBags = (bags || [])
        .filter((bag: any) => bag.vendor_id === vendor.id)
        .map((bag: any) => dbBagToBag(bag, bag.vendors.name, bag.vendors.category));
      
      return {
        vendor: dbVendorToVendor(vendor),
        bags: vendorBags,
      };
    });
  },

  createOrder: async (
    bagId: string,
    quantity: number
  ): Promise<Order> => {
    await delay(800);
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    
    // Get bag details
    const bag = await apiSupabase.getBagById(bagId);
    if (!bag) throw new Error('Bag not found');
    if (bag.quantity < quantity) throw new Error('Insufficient quantity');
    
    // Get vendor details
    const vendor = await apiSupabase.getVendorById(bag.vendorId);
    if (!vendor) throw new Error('Vendor not found');
    
    // Calculate dates for pickup
    const today = new Date();
    const pickupDate = new Date(today);
    pickupDate.setHours(parseInt(bag.pickupStart.split(':')[0]), parseInt(bag.pickupStart.split(':')[1]), 0);
    
    const pickupEndDate = new Date(today);
    pickupEndDate.setHours(parseInt(bag.pickupEnd.split(':')[0]), parseInt(bag.pickupEnd.split(':')[1]), 0);
    
    const orderData = {
      consumer_id: userId,
      bag_id: bagId,
      vendor_id: bag.vendorId,
      bag_title: bag.title,
      vendor_name: vendor.name,
      quantity,
      total_price: bag.price * quantity,
      estimated_value: bag.originalPrice * quantity,
      status: 'reserved' as const,
      pickup_start: pickupDate.toISOString(),
      pickup_end: pickupEndDate.toISOString(),
      confirmation_code: generateConfirmationCode(),
    };
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    
    return dbOrderToOrder(order);
  },

  getConsumerOrders: async (userId: string): Promise<Order[]> => {
    await delay(400);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('consumer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return orders.map(dbOrderToOrder);
  },

  rateOrder: async (
    orderId: string,
    rating: number,
    review: string
  ): Promise<Order> => {
    await delay(500);
    
    const { data: order, error } = await supabase
      .from('orders')
      .update({ rating, review })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    return dbOrderToOrder(order);
  },

  // Vendor functions continue similarly...
  // (This is a reference implementation - full implementation would include all vendor functions)
};
