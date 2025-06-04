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
        signIn: () => Promise.reject(new Error('Supabase not configured')),
        signUp: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.reject(new Error('Supabase not configured')),
        onAuthStateChange: () => ({ data: null, error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
    };
  } else {
    // Create actual Supabase client
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Fallback to dummy client
  supabase = {
    auth: {
      signIn: () => Promise.reject(new Error('Supabase client initialization failed')),
      signUp: () => Promise.reject(new Error('Supabase client initialization failed')),
      signOut: () => Promise.reject(new Error('Supabase client initialization failed')),
      onAuthStateChange: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      insert: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      update: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
      delete: () => ({ data: null, error: new Error('Supabase client initialization failed') }),
    }),
  };
}

export { supabase };