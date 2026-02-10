import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
// For development, these can be set in a .env file or replaced with actual values
// IMPORTANT: Replace these with your own Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://your-project-id.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key-here' &&
         supabaseUrl.includes('.supabase.co');
};

// Create untyped client for flexibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, or update src/lib/supabase.ts with your credentials.',
        status: 500
      } as any
    };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, or update src/lib/supabase.ts with your credentials.',
        status: 500
      } as any
    };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured()) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, or update src/lib/supabase.ts with your credentials.',
        status: 500
      } as any
    };
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.warn('Failed to get current user:', e);
    return null;
  }
};

export const getSession = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (e) {
    console.warn('Failed to get session:', e);
    return null;
  }
};
