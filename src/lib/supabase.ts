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
        flowType: 'pkce' // Use PKCE for better security with OAuth
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

// Debug function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    // Attempt to get current session
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking Supabase connection:', error);
      return false;
    }
    console.log('Supabase connection successful. Session:', data.session ? 'Active' : 'None');
    return true;
  } catch (err) {
    console.error('Exception checking Supabase connection:', err);
    return false;
  }
};

// Initialize connection check
checkSupabaseConnection();

export { supabase };