import React, { createContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
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
  login: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
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
    
    // Get profile data
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      // If profile doesn't exist, create it
      if (error || !profile) {
        // Create new profile using user data from auth
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: supabaseUser.id,
              name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
              avatar_url: supabaseUser.user_metadata.avatar_url || null,
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

  const login = async (provider: string): Promise<void> => {
    setLoading(true);
    
    try {
      if (provider === 'email') {
        // Use magic link/password auth in a real app
        // For now, we'll mock with the old mock user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'demo@example.com',
          password: 'password123', // In a real app this would come from a form
        });
        
        if (error) throw error;
        
      } else if (['google', 'github', 'linkedin'].includes(provider)) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider as 'google' | 'github',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
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