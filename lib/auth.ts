import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'social_worker';
  full_name: string | null;
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Authentifizierung fehlgeschlagen' };
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return { user: null, error: 'Profil nicht gefunden' };
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role as 'admin' | 'social_worker',
      full_name: profile.full_name,
    },
    error: null,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as 'admin' | 'social_worker',
    full_name: profile.full_name,
  };
}

export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'social_worker',
  fullName?: string
): Promise<{ success: boolean; error: string | null }> {
  // This should only be called by admins
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Keine Berechtigung' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Benutzer konnte nicht erstellt werden' };
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email,
      role,
      full_name: fullName || null,
    });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true, error: null };
}
