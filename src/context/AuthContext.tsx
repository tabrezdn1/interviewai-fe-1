import React, { createContext, useState, useEffect } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (
    provider: string,
    credentials?: { email: string; password: string },
    options?: { redirectTo?: string }
  ) => Promise<void>;
  testLogin: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  testLogin: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user session on load
  useEffect(() => {
    const getUserSession = async () => {
      try {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await handleSession(session);
        }
        
        setLoading(false);
        
        // Listen for auth state changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event, session);
            if (session) {
              await handleSession(session);
            } else {
              setUser(null);
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };
    
    getUserSession();
  }, []);
  
  // Handles setting the user from a session
  const handleSession = async (session: Session) => {
    const supabaseUser = session.user;
    
    if (!supabaseUser) return;
    
    console.log("Handling session for user:", supabaseUser);
    
    // Get profile data
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      // If profile doesn't exist, create it
      if (error || !profile) {
        console.log("Creating new profile for user:", supabaseUser);
        // Create new profile using user data from auth
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              avatar_url: supabaseUser.user_metadata?.avatar_url || null,
              email_confirmed: false
            }
          ])
          .select('*')
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        
        setUser({
          id: newProfile.id,
          name: newProfile.name,
          email: supabaseUser.email || '',
          avatar: newProfile.avatar_url || undefined
        });
      } else {
        // Use existing profile
        setUser({
          id: profile.id,
          name: profile.name,
          email: supabaseUser.email || '',
          avatar: profile.avatar_url || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (
    provider: string,
    credentials?: { email: string; password: string },
    options?: { redirectTo?: string }
  ): Promise<void> => {
    setLoading(true);
    
    try {
      if (['google', 'github'].includes(provider)) {
        // For OAuth providers, we need to use signInWithOAuth
        const providerEnum = provider as Provider;
        
        // Get the current origin for redirect
        const currentOrigin = window.location.origin;
        const redirectUrl = options?.redirectTo || `${currentOrigin}/dashboard`;
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: providerEnum,
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              // Optional additional parameters
              prompt: 'select_account', // Force account selection (Google)
            }
          }
        });
        
        if (error) throw error;
        
        // For OAuth, we don't set user here because it will be handled by the auth state change
        // after redirect back from the OAuth provider
        console.log("OAuth redirect initiated:", data);
        console.log("Redirect URL:", redirectUrl);
      } else {
        throw new Error('Invalid login method');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.error_description || error.message || 'Error during sign in');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async (): Promise<void> => {
    // Create a fake user for testing
    const testUser: UserProfile = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    };
    
    setUser(testUser);
    setLoading(false);
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    testLogin,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;