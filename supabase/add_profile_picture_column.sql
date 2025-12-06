-- Add profile_picture_url column to users table
-- Run this SQL in your Supabase SQL Editor if you've already created the users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Update the trigger function to include profile_picture_url
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
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    profile_picture_url = EXCLUDED.profile_picture_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

