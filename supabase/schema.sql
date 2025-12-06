-- KiasuBites Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location-based queries (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS TABLE
-- ============================================
-- This table stores all users (both consumers and vendors)
-- Supabase Auth handles authentication, but we store additional profile data here
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'vendor')),
  dietary_preferences TEXT[] DEFAULT '{}',
  radius_km INTEGER DEFAULT 5,
  phone_number TEXT,
  address TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile when registering
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public can read basic user info (for vendor profiles)
CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT USING (true);

-- ============================================
-- VENDORS TABLE
-- ============================================
-- Extended vendor information (linked to users table)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  photo_url TEXT,
  pickup_instructions TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Public can read vendors
CREATE POLICY "Public can view vendors" ON vendors
  FOR SELECT USING (true);

-- Vendors can update their own data
CREATE POLICY "Vendors can update own data" ON vendors
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- VENDOR BUSINESS INFO TABLE
-- ============================================
-- Business verification information
CREATE TABLE IF NOT EXISTS vendor_business_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  brand_name TEXT,
  uen TEXT NOT NULL,
  business_type TEXT NOT NULL,
  director_name TEXT NOT NULL,
  nric TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  opening_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id)
);

ALTER TABLE vendor_business_info ENABLE ROW LEVEL SECURITY;

-- Vendors can view and update their own business info
CREATE POLICY "Vendors can manage own business info" ON vendor_business_info
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- VENDOR SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  instructions TEXT,
  collection_info TEXT,
  storage_info TEXT,
  show_allergens BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id)
);

ALTER TABLE vendor_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own settings" ON vendor_settings
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- VENDOR AVAILABILITY TABLE
-- ============================================
-- Weekly availability schedule
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')),
  available BOOLEAN DEFAULT FALSE,
  pickup_start TIME NOT NULL,
  pickup_end TIME NOT NULL,
  default_quantity INTEGER DEFAULT 0 CHECK (default_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, day_of_week)
);

ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view vendor availability" ON vendor_availability
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage own availability" ON vendor_availability
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- SURPRISE BAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS surprise_bags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10, 2) NOT NULL CHECK (original_price > 0),
  pickup_start TIME NOT NULL,
  pickup_end TIME NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  dietary_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'inactive')),
  category TEXT CHECK (category IN ('Meals', 'Bread & Pastries', 'Groceries', 'Dessert', 'Other')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE surprise_bags ENABLE ROW LEVEL SECURITY;

-- Public can view active bags
CREATE POLICY "Public can view active bags" ON surprise_bags
  FOR SELECT USING (status = 'active' AND quantity > 0);

-- Vendors can view and manage their own bags
CREATE POLICY "Vendors can manage own bags" ON surprise_bags
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bag_id UUID NOT NULL REFERENCES surprise_bags(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bag_title TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
  estimated_value DECIMAL(10, 2) NOT NULL CHECK (estimated_value > 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'picked_up', 'cancelled', 'no_show')),
  pickup_start TIMESTAMPTZ NOT NULL,
  pickup_end TIMESTAMPTZ NOT NULL,
  confirmation_code TEXT NOT NULL UNIQUE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Consumers can view their own orders
CREATE POLICY "Consumers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = consumer_id);

-- Consumers can create orders
CREATE POLICY "Consumers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = consumer_id);

-- Vendors can view orders for their bags
CREATE POLICY "Vendors can view own orders" ON orders
  FOR SELECT USING (auth.uid() = vendor_id);

-- Vendors can update order status
CREATE POLICY "Vendors can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = vendor_id);

-- Consumers can update their own orders (for ratings/reviews)
CREATE POLICY "Consumers can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = consumer_id);

-- ============================================
-- FAVORITES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PAYOUT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payout_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'bank_account' CHECK (type = 'bank_account'),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL, -- Encrypted in production
  account_holder_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own payout methods" ON payout_methods
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- MONTHLY STATEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  platform_fees DECIMAL(10, 2) DEFAULT 0,
  net_payout DECIMAL(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, month, year)
);

ALTER TABLE monthly_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own statements" ON monthly_statements
  FOR SELECT USING (auth.uid() = vendor_id);

-- ============================================
-- DAILY INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  product_type TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  invoice_url TEXT,
  credit_note_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);

ALTER TABLE daily_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own invoices" ON daily_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = daily_invoices.order_id 
      AND orders.vendor_id = auth.uid()
    )
  );

-- ============================================
-- PARTNER DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partner_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Singapore',
  invoice_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id)
);

ALTER TABLE partner_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own partner details" ON partner_details
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- EMAIL SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  include_account_statements BOOLEAN DEFAULT TRUE,
  include_order_summaries BOOLEAN DEFAULT TRUE,
  include_invoices BOOLEAN DEFAULT TRUE,
  include_self_billing_invoices BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id)
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own email settings" ON email_settings
  FOR ALL USING (auth.uid() = vendor_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors USING GIST (point(lng, lat));
CREATE INDEX IF NOT EXISTS idx_surprise_bags_vendor ON surprise_bags(vendor_id);
CREATE INDEX IF NOT EXISTS idx_surprise_bags_status ON surprise_bags(status);
CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vendor ON favorites(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor ON vendor_availability(vendor_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_business_info_updated_at BEFORE UPDATE ON vendor_business_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_settings_updated_at BEFORE UPDATE ON vendor_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_availability_updated_at BEFORE UPDATE ON vendor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surprise_bags_updated_at BEFORE UPDATE ON surprise_bags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_methods_updated_at BEFORE UPDATE ON payout_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_statements_updated_at BEFORE UPDATE ON monthly_statements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_details_updated_at BEFORE UPDATE ON partner_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON email_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update bag quantity when order is created
CREATE OR REPLACE FUNCTION decrease_bag_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surprise_bags
  SET quantity = quantity - NEW.quantity,
      status = CASE 
        WHEN quantity - NEW.quantity <= 0 THEN 'sold_out'
        ELSE status
      END
  WHERE id = NEW.bag_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_bag_quantity_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'reserved')
  EXECUTE FUNCTION decrease_bag_quantity();

-- Function to update vendor rating when order is rated
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  total_reviews INTEGER;
BEGIN
  IF NEW.rating IS NOT NULL AND (OLD.rating IS NULL OR OLD.rating != NEW.rating) THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)::INTEGER
    INTO avg_rating, total_reviews
    FROM orders
    WHERE vendor_id = NEW.vendor_id AND rating IS NOT NULL;
    
    UPDATE vendors
    SET rating = COALESCE(avg_rating, 0),
        total_reviews = COALESCE(total_reviews, 0)
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_rating_on_order_update
  AFTER UPDATE OF rating ON orders
  FOR EACH ROW
  WHEN (NEW.rating IS NOT NULL)
  EXECUTE FUNCTION update_vendor_rating();

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, profile_picture_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
    NEW.raw_user_meta_data->>'profile_picture_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

