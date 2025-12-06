-- Complete Fix for RLS Policy Issue
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Drop the existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 2: Create the INSERT policy
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 3: Verify the policy was created
-- You can check this in Supabase Dashboard > Authentication > Policies > users table

-- Alternative: If the above doesn't work, try using SECURITY DEFINER function
-- This allows the function to bypass RLS when called
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

