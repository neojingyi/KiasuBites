-- IMMEDIATE FIX FOR RLS POLICY ERROR
-- Copy and paste this entire block into Supabase SQL Editor and run it

-- Step 1: Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 2: Create the INSERT policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 3: Verify it was created (this will show an error if policy doesn't exist, which is fine)
-- You can verify in Supabase Dashboard > Authentication > Policies

-- IMPORTANT: After running this, try registering again.
-- The policy allows authenticated users to insert a row where id = auth.uid()

