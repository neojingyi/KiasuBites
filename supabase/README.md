# Supabase Database Setup Guide

This guide will help you set up your Supabase database for KiasuBites.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: KiasuBites (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine for development

4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for all queries to complete successfully

## Step 3: Set Up Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in the Supabase dashboard
2. Make sure **Email** is enabled
3. Configure email templates if needed (optional)

### Set Up Auth Policies (Optional)

The schema already includes Row Level Security (RLS) policies, but you may want to customize:

1. Go to **Authentication** → **Policies**
2. Review the policies created by the schema
3. Adjust as needed for your use case

## Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon) → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep this secret! Only use server-side)

## Step 5: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: 
- Never commit `.env` to git (it should be in `.gitignore`)
- The `VITE_` prefix is required for Vite to expose these variables to your frontend

## Step 6: Seed Initial Data (Optional)

If you want to populate your database with sample data, you can:

1. Use the Supabase dashboard's **Table Editor** to manually add data
2. Or create a seed script (see `supabase/seed.sql` if provided)
3. Or use the Supabase client in your app to migrate data from localStorage

## Step 7: Test Your Connection

After setting up the environment variables and installing dependencies, test the connection:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase.from('users').select('*').limit(1)
console.log('Connection test:', { data, error })
```

## Database Schema Overview

### Core Tables

- **users**: User accounts (consumers and vendors)
- **vendors**: Vendor-specific information
- **surprise_bags**: Products/bags available for purchase
- **orders**: Orders/reservations made by consumers

### Supporting Tables

- **vendor_business_info**: Business verification details
- **vendor_settings**: Vendor preferences and settings
- **vendor_availability**: Weekly pickup schedules
- **favorites**: User favorite vendors (many-to-many)
- **payout_methods**: Vendor payment methods
- **monthly_statements**: Financial statements
- **daily_invoices**: Daily invoices
- **partner_details**: Vendor partner information
- **email_settings**: Email notification preferences

### Key Features

- **Row Level Security (RLS)**: All tables have RLS enabled for data protection
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Triggers**: 
  - Auto-update `updated_at` on row changes
  - Decrease bag quantity when orders are created
  - Update vendor ratings when orders are rated
  - Create user profile when auth user is created

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire `schema.sql` file
- Check that all tables were created in the **Table Editor**

### RLS policy errors
- Verify that authentication is working
- Check that the user is logged in when making requests
- Review RLS policies in **Authentication** → **Policies**

### Connection errors
- Verify your `.env` file has the correct values
- Make sure `VITE_` prefix is used for environment variables
- Check that your Supabase project is active (not paused)

## Next Steps

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Update your API service to use Supabase (see `services/supabase.ts`)
3. Update authentication to use Supabase Auth
4. Migrate existing localStorage data to Supabase (if needed)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

