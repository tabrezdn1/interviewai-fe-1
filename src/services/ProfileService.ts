import { supabase } from '../lib/supabase';

export interface ProfileUpdate {
  name?: string;
  avatar_url?: string;
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  try {
    // Update timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    // Update profile with new avatar URL
    const avatar_url = data.publicUrl;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return avatar_url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}