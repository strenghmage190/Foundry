import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

/**
 * Fetches a user profile from the `user_profiles` table.
 * Returns null if not found or on error.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.warn('getUserProfile: could not read from user_profiles', error.message || error);
            return null;
        }

        if (!data) return null;
        // Normalize DB row (prefer camelCase columns in your Supabase table)
        const row: any = data;
        const mapped: UserProfile = {
            displayName: row.displayName ?? row.display_name ?? '',
            pronouns: row.pronouns ?? '',
            useOpenDyslexicFont: row.useOpenDyslexicFont ?? row.use_open_dyslexic_font ?? false,
            avatarPath: row.avatarPath ?? row.avatar_path ?? null,
        };
        return mapped;
    } catch (e) {
        console.error('getUserProfile unexpected error', e);
        return null;
    }
}

/**
 * Upserts a user profile into the `user_profiles` table.
 * Returns true on success, false on error.
 */
export async function upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    try {
        // Map client profile (camelCase) to DB columns using camelCase keys (your Supabase table uses camelCase)
        const payload: any = {
            user_id: userId,
            displayName: (profile as any).displayName ?? (profile as any).display_name ?? null,
            pronouns: (profile as any).pronouns ?? null,
            avatarPath: (profile as any).avatarPath ?? (profile as any).avatar_path ?? null,
            useOpenDyslexicFont: (profile as any).useOpenDyslexicFont ?? (profile as any).use_open_dyslexic_font ?? false,
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(payload, { onConflict: 'user_id' })
            .select()
            .maybeSingle();

        if (error) {
            console.warn('upsertUserProfile: could not upsert', error.message || error);
            return false;
        }
        return !!data;
    } catch (e) {
        console.error('upsertUserProfile unexpected error', e);
        return false;
    }
}
