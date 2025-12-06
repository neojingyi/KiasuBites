# Migration Guide: localStorage to Supabase

This guide explains how to migrate your existing localStorage-based API to use Supabase.

## Overview

The codebase currently uses `localStorage` for data persistence. We'll migrate to Supabase while maintaining backward compatibility during the transition.

## Migration Strategy

### Phase 1: Dual Mode (Current)
- API service checks for Supabase connection
- Falls back to localStorage if Supabase is not configured
- Allows gradual migration

### Phase 2: Full Supabase
- All data operations use Supabase
- localStorage removed
- Authentication uses Supabase Auth

## Step-by-Step Migration

### 1. Set Up Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Update API Service

The `services/api.ts` file has been updated to support Supabase. It will:
- Check if Supabase is configured
- Use Supabase if available, otherwise fall back to localStorage
- Gradually migrate functions to use Supabase

### 3. Update Authentication

The `context/AuthContext.tsx` needs to be updated to use Supabase Auth:

```typescript
import { supabase } from '../services/supabase';

// Replace localStorage login with Supabase Auth
const login = async (email: string, password: string, role: UserRole) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Get user profile from users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return profile;
};
```

### 4. Migrate Existing Data

If you have existing localStorage data, create a migration script:

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '../services/supabase';

async function migrateData() {
  // Get localStorage data
  const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
  const bags = JSON.parse(localStorage.getItem('bags') || '[]');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Migrate vendors
  for (const vendor of vendors) {
    await supabase.from('vendors').upsert({
      id: vendor.id,
      name: vendor.name,
      address: vendor.address,
      lat: vendor.lat,
      lng: vendor.lng,
      category: vendor.category,
      rating: vendor.rating,
      total_reviews: vendor.totalReviews,
      tags: vendor.tags,
      photo_url: vendor.photoUrl,
      pickup_instructions: vendor.pickupInstructions,
      is_verified: vendor.isVerified || false,
    });
  }
  
  // Migrate bags
  for (const bag of bags) {
    await supabase.from('surprise_bags').upsert({
      id: bag.id,
      vendor_id: bag.vendorId,
      title: bag.title,
      description: bag.description,
      price: bag.price,
      original_price: bag.originalPrice,
      pickup_start: bag.pickupStart,
      pickup_end: bag.pickupEnd,
      quantity: bag.quantity,
      dietary_tags: bag.dietaryTags,
      status: bag.status,
      category: bag.category,
      image_url: bag.imageUrl,
    });
  }
  
  // Migrate orders
  for (const order of orders) {
    await supabase.from('orders').upsert({
      id: order.id,
      consumer_id: order.consumerId,
      bag_id: order.bagId,
      vendor_id: order.vendorId,
      bag_title: order.bagTitle,
      vendor_name: order.vendorName,
      quantity: order.quantity,
      total_price: order.totalPrice,
      estimated_value: order.estimatedValue,
      status: order.status,
      pickup_start: order.pickupStart,
      pickup_end: order.pickupEnd,
      confirmation_code: order.confirmationCode,
      rating: order.rating,
      review: order.review,
    });
  }
  
  console.log('Migration complete!');
}
```

## Testing the Migration

1. **Test Supabase Connection**
   ```typescript
   import { supabase } from './services/supabase';
   
   const testConnection = async () => {
     const { data, error } = await supabase.from('users').select('count');
     console.log('Connection test:', { data, error });
   };
   ```

2. **Test Authentication**
   - Try logging in with Supabase Auth
   - Verify user profile is created in `users` table
   - Check that session persists

3. **Test Data Operations**
   - Create a vendor
   - Create a bag
   - Create an order
   - Verify data appears in Supabase dashboard

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists and has correct values
- Restart your dev server after adding environment variables
- Check that `VITE_` prefix is used

### "Row Level Security policy violation"
- Verify user is authenticated
- Check RLS policies in Supabase dashboard
- Ensure user ID matches the resource owner

### "Foreign key constraint violation"
- Make sure parent records exist (e.g., vendor exists before creating bag)
- Check that IDs match between related tables

## Next Steps

After successful migration:

1. Remove localStorage fallback code
2. Remove mock data initialization
3. Set up Supabase Storage for images (if needed)
4. Configure email templates in Supabase Auth
5. Set up database backups
6. Monitor performance and optimize queries

