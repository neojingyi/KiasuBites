-- Fix RLS Policy for User Registration
-- Run this SQL in your Supabase SQL Editor to fix the registration issue

-- Allow users to insert their own profile when registering
-- This policy allows a user to create their own profile row
-- when they register, matching their auth.uid() with the id column
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: If the policy already exists, you'll get an error.
-- In that case, you can drop and recreate it:
-- DROP POLICY IF EXISTS "Users can insert own profile" ON users;
-- Then run the CREATE POLICY above again.

