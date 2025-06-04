import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL and key before creating client
let supabase;

try {
  // Check if URL is valid
  if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || !supabaseUrl.startsWith('http')) {
    console.error('Invalid Supabase URL. Please set a valid VITE_SUPABASE_URL in your .env file');
    // Create a dummy client that will show appropriate errors
    supabase = {
      auth: {
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
        signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),
        setSession: () => Promise.reject(new Error('Supabase not configured')),
        signUp: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.reject(new Error('Supabase not configured')),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: new Error('Supabase not configured') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
        }),
      },
    };
  } else {
    // Create actual Supabase client with proper OAuth configuration
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit' // Change from pkce to implicit
      }
    });
    
    console.log('Supabase client initialized with URL:', supabaseUrl);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Fallback to dummy client
  supabase = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase client initialization failed')),
      signInWithOAuth: () => Promise.reject(new Error('Supabase client initialization failed')),
      setSession: () => Promise.reject(new Error('Supabase client initialization failed')),
      signUp: () => Promise.reject(new Error('Supabase client initialization failed')),
      signOut: () => Promise.reject(new Error('Supabase client initialization failed')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: new Error('Supabase client initialization failed') }),
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase client initialization failed') }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      insert: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      update: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      delete: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
    }),
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
        getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
      }),
    },
  };
}

// Helper function to parse hash fragments from OAuth redirects
export const processHashParams = () => {
  try {
    // Check if we have hash parameters in URL (common with OAuth redirects)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('Found access token in URL hash, manually handling...');
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('Extracted tokens from hash, will set session');
        // Store for later use (AuthCallback component will use this)
        sessionStorage.setItem('sb-access-token', accessToken);
        sessionStorage.setItem('sb-refresh-token', refreshToken);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Error processing hash parameters:', err);
    return false;
  }
};

// Process hash params on initial load
if (typeof window !== 'undefined') {
  processHashParams();
}

export { supabase };