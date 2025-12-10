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

  const buildMockUser = ({
    name,
    email,
    role,
    profilePictureUrl,
    address,
  }: {
    name: string;
    email: string;
    role: UserRole;
    profilePictureUrl?: string;
    address?: string;
  }): User => ({
    id: role === UserRole.VENDOR ? `v-${Date.now()}` : `c-${Date.now()}`,
    name,
    email,
    role,
    dietaryPreferences: [],
    favorites: [],
    isVerified: role === UserRole.VENDOR ? false : undefined,
    profilePictureUrl,
    address: address || undefined,
  });

  // Ensure a role-specific profile exists; creates one if missing
  const ensureProfileExists = async ({
    userId,
    role,
    name,
    email,
    address,
    profilePictureUrl,
  }: {
    userId: string;
    role: UserRole;
    name?: string;
    email?: string;
    address?: string;
    profilePictureUrl?: string;
  }) => {
    const profileTable = role === UserRole.VENDOR ? 'vendors' : 'consumers';

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await supabase
      .from(profileTable)
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing profile:', existingError);
    }
    if (existingProfile) return;

    const profileInsert =
      role === UserRole.VENDOR
        ? {
            id: userId,
            name: name || email?.split('@')[0] || 'Vendor',
            email: email || null,
            address: address || '',
            lat: 0,
            lng: 0,
            category: 'Other',
            rating: 0,
            total_reviews: 0,
            tags: [],
            photo_url: profilePictureUrl || null,
            pickup_instructions: null,
            is_verified: false,
          }
        : {
            id: userId,
            name: name || email?.split('@')[0] || 'User',
            email: email || null,
            dietary_preferences: [],
            radius_km: 5,
            phone_number: null,
            address: address || null,
            profile_picture_url: profilePictureUrl || null,
          };

    const { error: profileError } = await supabase
      .from(profileTable)
      .upsert(profileInsert as any);

    if (profileError) {
      console.error(`Failed to create ${profileTable} profile:`, profileError);
      throw new Error(profileError.message || 'Failed to create profile');
    }
  };

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

  const loadUserAndReturn = async (
    userId: string,
    preferredRole?: UserRole
  ): Promise<User | null> => {
    if (!supabase) return null;
    
    try {
      // Also read from auth metadata in case the DB row hasn't been updated yet
      const { data: authUserData } = await supabase.auth.getUser();
      const authUser = authUserData.user;
      const metadataProfilePictureUrl = authUser?.user_metadata?.profile_picture_url;
      const roleFromMetadata = authUser?.user_metadata?.role as UserRole | undefined;

      // Fetch from role-specific tables (consumers/vendors)
      const fetchProfile = async (table: 'consumers' | 'vendors') => {
        const { data, error } = await supabase.from(table).select('*').eq('id', userId).single();
        return { data, error };
      };

      let profileTable: 'consumers' | 'vendors' =
        preferredRole === UserRole.VENDOR
          ? 'vendors'
          : preferredRole === UserRole.CONSUMER
            ? 'consumers'
            : roleFromMetadata === UserRole.VENDOR
              ? 'vendors'
              : 'consumers';
      let profile: any = null;

      let { data: primaryProfile, error: primaryError } = await fetchProfile(profileTable);
      if (!primaryError && primaryProfile) {
        profile = primaryProfile;
      } else {
        // Fallback: try the other table in case metadata is stale
        const fallbackTable: 'consumers' | 'vendors' = profileTable === 'vendors' ? 'consumers' : 'vendors';
        const { data: fallbackProfile } = await fetchProfile(fallbackTable);
        if (fallbackProfile) {
          profileTable = fallbackTable;
          profile = fallbackProfile;
        }
      }

      // If no profile found, try to create it using auth metadata
      if (!profile && authUser) {
        const inferredRole = roleFromMetadata || UserRole.CONSUMER;
        await ensureProfileExists({
          userId,
          role: inferredRole,
          name: authUser.user_metadata?.name,
          email: authUser.email,
          address: (authUser.user_metadata as any)?.address,
          profilePictureUrl: metadataProfilePictureUrl,
        });
        const { data: createdProfile } = await fetchProfile(profileTable);
        profile = createdProfile;
      }

      if (!profile) {
        console.error("Error loading user profile: no profile found in consumers/vendors tables");
        setUser(null);
        return null;
      }

      // Get favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('vendor_id')
        .eq('user_id', userId);

      const isVendor = profileTable === 'vendors';
      // Vendors use photo_url; consumers use profile_picture_url
      const profilePictureUrl =
        (profile as any).profile_picture_url ||
        (profile as any).photo_url ||
        metadataProfilePictureUrl;
      const name =
        (profile as any).name ||
        authUser?.user_metadata?.name ||
        authUser?.email?.split('@')[0] ||
        'User';
      const email = authUser?.email || (profile as any).email || '';
      const isVerified = isVendor ? (profile as any).is_verified ?? false : undefined;
      console.log('Loading user profile picture from table:', (profile as any).profile_picture_url);
      console.log('Profile picture URL from auth metadata:', metadataProfilePictureUrl);
      console.log('Final profile picture URL used:', profilePictureUrl);
      console.log('Full profile data:', profile);
      
      // Ensure profilePictureUrl is a string if it exists
      const normalizedProfilePictureUrl = profilePictureUrl ? String(profilePictureUrl) : undefined;
      
      const userData: User = {
        id: profile.id,
        name,
        email,
        role: isVendor ? UserRole.VENDOR : UserRole.CONSUMER,
        dietaryPreferences: isVendor ? [] : (profile as any).dietary_preferences || [],
        radiusKm: isVendor ? undefined : (profile as any).radius_km || undefined,
        favorites: favorites?.map((f: any) => f.vendor_id) || [],
        isVerified,
        phoneNumber: (profile as any).phone_number || undefined,
        address: (profile as any).address || undefined,
        profilePictureUrl: normalizedProfilePictureUrl || undefined,
      };
      
      console.log('User data loaded:', { 
        name: userData.name, 
        profilePictureUrl: userData.profilePictureUrl,
        hasProfilePic: !!userData.profilePictureUrl,
        profilePictureUrlType: typeof userData.profilePictureUrl
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

      // Ensure profile exists (if sign-up happened with email confirmation and profile wasn't created yet)
      await ensureProfileExists({
        userId: authData.user.id,
        role,
        name: authData.user.user_metadata?.name || email.split('@')[0],
        email,
        address: undefined,
        profilePictureUrl: authData.user.user_metadata?.profile_picture_url,
      });

      // Load user data
      const loadedUser = await loadUserAndReturn(authData.user.id, role);
      if (!loadedUser) {
        throw new Error('Failed to load user data');
      }
      
      // Ensure role matches requested role
      setUser(loadedUser);
      return loadedUser;
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
    profilePictureUrl?: string,
    address?: string
  ): Promise<User> => {
    setIsLoading(true);
    
    // Fallback to localStorage mode if Supabase not configured
    if (!supabase) {
      try {
        // In localStorage mode, registration just creates a mock user
        const mockUser: User = buildMockUser({ name, email, role, profilePictureUrl, address });
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
      // Helper to upsert into role-specific profile table
      const upsertProfile = async (userId: string) => {
        const profileInsert =
          role === UserRole.VENDOR
            ? {
                id: userId,
                name,
                email,
                address: address || '',
                lat: 0,
                lng: 0,
                category: 'Other',
                rating: 0,
                total_reviews: 0,
                tags: [],
                photo_url: profilePictureUrl || null,
                pickup_instructions: null,
                is_verified: false,
            }
          : {
              id: userId,
              name,
              email,
              dietary_preferences: [],
              radius_km: 5,
              phone_number: null,
              address: address || null,
              profile_picture_url: profilePictureUrl || null,
            };

        const profileTable = role === UserRole.VENDOR ? 'vendors' : 'consumers';
        const { error: profileError } = await supabase.from(profileTable).upsert(profileInsert as any);
        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(`Failed to create ${profileTable} profile: ${profileError.message || 'Unknown error'}`);
        }
      };

      // Sign up with Supabase Auth
      // Sign up with Supabase Auth, or sign in if email already exists
      let authUser = null as any;
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
        const msg = authError.message?.toLowerCase() || '';
        if (msg.includes('registered') || msg.includes('exists')) {
          // Email already in use; try signing in to allow second-role profile creation
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            console.error("Supabase sign-in after existing email failed:", signInError);
            throw new Error(signInError.message || 'Email already registered and sign-in failed');
          }
          authUser = signInData.user;
        } else {
          console.error("Supabase auth error:", authError);
          throw new Error(authError.message || 'Registration failed');
        }
      } else {
        authUser = authData.user;
      }

      if (!authUser) {
        throw new Error('No user data returned from Supabase');
      }

      // Ensure we have a session (RLS requires it) and create the profile now
      const { data: sessionData } = await supabase.auth.getSession();
      let sessionUserId = authUser.id;
      if (!sessionData.session) {
        // Try to create a session if not present (email confirmation disabled/new project)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.error('Sign-in after sign-up failed:', signInError);
          throw new Error(signInError.message || 'Failed to establish session after sign up');
        }
        sessionUserId = signInData.user?.id || authUser.id;
      } else {
        sessionUserId = sessionData.session.user.id;
      }
      await upsertProfile(sessionUserId);

      // Wait a moment to ensure all database operations are complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load user data
      console.log('Loading user after registration, userId:', sessionUserId);
      const loadedUser = await loadUserAndReturn(sessionUserId, role);
      console.log('Loaded user after registration:', loadedUser);
      console.log('Profile picture URL in loaded user:', loadedUser?.profilePictureUrl);

      // If the profile picture didn't stick in the DB read, fall back to what the user selected
      let finalUser = loadedUser;
      if (profilePictureUrl && loadedUser && !loadedUser.profilePictureUrl) {
        console.log('Backfilling missing profile picture after registration:', profilePictureUrl);
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { profile_picture_url: profilePictureUrl },
        });
        if (metadataError) {
          console.warn('Failed to update auth metadata during backfill:', metadataError);
        }

        finalUser = { ...loadedUser, profilePictureUrl };
      }

      // Fallback: if load failed, construct a minimal user so UI can proceed
      if (!finalUser) {
        finalUser = {
          id: sessionUserId,
          name,
          email,
          role,
          dietaryPreferences: [],
          favorites: [],
          isVerified: role === UserRole.VENDOR ? false : undefined,
          profilePictureUrl: profilePictureUrl || undefined,
          address: address || undefined,
        };
        console.warn('Using fallback user after registration load failure:', finalUser);
      }

      setUser(finalUser);
      console.log('User set in context, profilePictureUrl:', finalUser.profilePictureUrl);
      return finalUser;
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      const isNetworkError =
        error instanceof TypeError || (message && message.toLowerCase().includes('failed to fetch'));

      if (isNetworkError) {
        console.warn('Supabase unreachable; falling back to local mock user for registration.');
        const mockUser = buildMockUser({ name, email, role, profilePictureUrl, address });
        setUser(mockUser);
        return mockUser;
      }

      throw error instanceof Error ? error : new Error(`Registration failed: ${JSON.stringify(error)}`);
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
      const profileTable = user.role === UserRole.VENDOR ? 'vendors' : 'consumers';
      
      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }
      if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (profileTable === 'consumers' && updates.dietaryPreferences !== undefined) updateData.dietary_preferences = updates.dietaryPreferences;
      if (profileTable === 'consumers' && updates.radiusKm !== undefined) updateData.radius_km = updates.radiusKm;
      if (updates.profilePictureUrl !== undefined) {
        if (profileTable === 'vendors') {
          updateData.photo_url = updates.profilePictureUrl;
        } else {
          updateData.profile_picture_url = updates.profilePictureUrl;
        }
        console.log('Updating profile picture in database:', updates.profilePictureUrl);
        console.log('Profile picture URL type:', typeof updates.profilePictureUrl);
      }

      const { error: updateError } = await supabase
        .from(profileTable)
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw new Error(updateError.message || 'Failed to update profile');
      }

      // Keep auth metadata in sync so future sessions get the avatar immediately
      if (updates.profilePictureUrl !== undefined || updates.name !== undefined) {
        const metadataUpdates: any = {};
        if (updates.profilePictureUrl !== undefined) {
          metadataUpdates.profile_picture_url = updates.profilePictureUrl;
        }
        if (updates.name !== undefined) {
          metadataUpdates.name = updates.name;
        }
        const { error: metadataError } = await supabase.auth.updateUser({
          data: metadataUpdates,
        });
        if (metadataError) {
          console.warn('Failed to update auth metadata:', metadataError);
        }
      }

      // Optimistically update local state so navbar/profile reflect immediately
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : prev
      );
      
      console.log('Profile updated successfully in database');

      // Wait a moment to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Reload user data to get updated values
      console.log('Reloading user data after update...');
      const updatedUser = await loadUserAndReturn(userId);
      console.log('Updated user loaded:', updatedUser);
      console.log('Profile picture URL in updated user:', updatedUser?.profilePictureUrl);
      
      // If the freshly loaded user is missing the new profile picture, fall back to the value we just saved
      const mergedUser =
        updates.profilePictureUrl && updatedUser
          ? { ...updatedUser, profilePictureUrl: updates.profilePictureUrl }
          : updatedUser;

      if (!mergedUser) {
        throw new Error('Failed to load updated user data');
      }

      setUser(mergedUser);
      console.log('User state updated with profile picture:', mergedUser.profilePictureUrl);
      return mergedUser;
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
