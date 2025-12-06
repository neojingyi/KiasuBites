import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { supabase } from "../services/supabase";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  register: (email: string, password: string, name: string, role: UserRole, profilePictureUrl?: string) => Promise<User>;
  updateUser: (updates: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check session

  // Check for existing session on mount
  useEffect(() => {
    if (supabase) {
      checkSession();
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            await loadUser(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Fallback to localStorage mode
      setIsLoading(false);
    }
  }, []);

  const checkSession = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUser(session.user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async (userId: string): Promise<void> => {
    if (!supabase) return;
    await loadUserAndReturn(userId);
  };

  const loadUserAndReturn = async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    
    try {
      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error("Error loading user profile:", profileError);
        setUser(null);
        return null;
      }

      // Get favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('vendor_id')
        .eq('user_id', userId);

      // Get vendor verification status if vendor
      let isVerified = undefined;
      if (profile.role === UserRole.VENDOR) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('is_verified')
          .eq('id', userId)
          .single();
        isVerified = vendor?.is_verified || false;
      }

      const profilePictureUrl = (profile as any).profile_picture_url;
      console.log('Loading user profile picture from database:', profilePictureUrl);
      console.log('Full profile data:', profile);
      
      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        dietaryPreferences: (profile as any).dietary_preferences || [],
        radiusKm: (profile as any).radius_km || undefined,
        favorites: favorites?.map((f: any) => f.vendor_id) || [],
        isVerified,
        phoneNumber: (profile as any).phone_number || undefined,
        address: (profile as any).address || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
      };
      
      console.log('User data loaded:', { 
        name: userData.name, 
        profilePictureUrl: userData.profilePictureUrl,
        hasProfilePic: !!userData.profilePictureUrl 
      });

      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<User> => {
    setIsLoading(true);
    
    // Fallback to localStorage mode if Supabase not configured
    if (!supabase) {
      try {
        const loggedInUser = await api.login(email, role);
        setUser(loggedInUser);
        return loggedInUser;
      } catch (error) {
        console.error("Login failed", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
    
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Login failed');
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Verify user role matches
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (!profile || (profile as any).role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Account is registered as ${(profile as any)?.role || 'unknown'}, not ${role}`);
      }

      // Load user data
      await loadUser(authData.user.id);
      
      const currentUser = user;
      if (!currentUser) {
        throw new Error('Failed to load user data');
      }

      return currentUser;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    profilePictureUrl?: string
  ): Promise<User> => {
    setIsLoading(true);
    
    // Fallback to localStorage mode if Supabase not configured
    if (!supabase) {
      try {
        // In localStorage mode, registration just creates a mock user
        const mockUser: User = {
          id: role === UserRole.VENDOR ? "v1" : `c${Date.now()}`,
          name,
          email,
          role,
          dietaryPreferences: [],
          favorites: [],
          isVerified: role === UserRole.VENDOR ? false : undefined,
          profilePictureUrl,
        };
        setUser(mockUser);
        return mockUser;
      } catch (error) {
        console.error("Registration failed (localStorage mode):", error);
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
    
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
            profile_picture_url: profilePictureUrl,
          },
        },
      });

      if (authError) {
        console.error("Supabase auth error:", authError);
        throw new Error(authError.message || 'Registration failed');
      }

      if (!authData.user) {
        throw new Error('No user data returned from Supabase');
      }

      // Wait a moment for the trigger to create the user profile
      // The trigger handle_new_user() should automatically create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if profile was created by trigger, if not create it explicitly
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!existingProfile) {
        // Profile wasn't created by trigger, try to create it explicitly
        console.log('Creating new profile with profile picture:', profilePictureUrl);
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            role,
            profile_picture_url: profilePictureUrl,
          } as any);

        if (profileError) {
          const errorCode = (profileError as any).code;
          // If it's a duplicate key error, the profile was created between check and insert
          if (errorCode !== '23505') {
            console.error("Profile creation error:", profileError);
            throw new Error(`Failed to create user profile: ${profileError.message || 'Unknown error'}`);
          } else {
            // Profile was created by trigger, update it with profile picture
            console.log('Profile created by trigger, updating with profile picture');
            await supabase
              .from('users')
              .update({ profile_picture_url: profilePictureUrl } as any)
              .eq('id', authData.user.id);
          }
        } else {
          console.log('Profile created successfully with profile picture');
        }
      } else {
        // Profile exists, update it with the correct name, role, and profile picture
        console.log('Updating existing profile with profile picture:', profilePictureUrl);
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            name, 
            role,
            profile_picture_url: profilePictureUrl,
          } as any)
          .eq('id', authData.user.id);
        
        if (updateError) {
          console.error('Error updating profile picture:', updateError);
        } else {
          console.log('Profile picture updated successfully');
        }
      }

      // If vendor, create vendor record
      if (role === UserRole.VENDOR) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            id: authData.user.id,
            name,
            address: '', // Will be filled in later
            lat: 0,
            lng: 0,
            category: 'Other',
            rating: 0,
            total_reviews: 0,
            is_verified: false,
          } as any);

        if (vendorError) {
          const errorCode = (vendorError as any).code;
          if (errorCode !== '23505') {
            console.warn('Failed to create vendor record:', vendorError);
            // Don't throw here, user profile was created successfully
          }
        }
      }

      // Load user data
      const loadedUser = await loadUserAndReturn(authData.user.id);
      if (!loadedUser) {
        throw new Error('Failed to load user data after registration');
      }

      setUser(loadedUser);
      return loadedUser;
    } catch (error) {
      console.error("Registration failed:", error);
      // Provide more helpful error messages
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Registration failed: ${JSON.stringify(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<User> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    
    // Fallback to localStorage mode if Supabase not configured
    if (!supabase) {
      try {
        const updatedUser = await api.updateUser(updates);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        console.error("Update user failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }

    try {
      const userId = user.id;
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.dietaryPreferences !== undefined) updateData.dietary_preferences = updates.dietaryPreferences;
      if (updates.radiusKm !== undefined) updateData.radius_km = updates.radiusKm;
      if (updates.profilePictureUrl !== undefined) {
        updateData.profile_picture_url = updates.profilePictureUrl;
        console.log('Updating profile picture in database:', updates.profilePictureUrl);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }
      
      console.log('Profile updated successfully in database');

      // Reload user data to get updated values
      const updatedUser = await loadUserAndReturn(userId);
      if (!updatedUser) {
        throw new Error('Failed to load updated user data');
      }

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        api.logout();
      }
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
