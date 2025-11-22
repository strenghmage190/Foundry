import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface ProfileData {
  user_id: string;
  display_name: string | null;
  pronouns: string | null;
  avatar_path: string | null;
  use_open_dyslexic_font: boolean;
  highlight_color: string;
}

/**
 * Debug function to check database connection and table structure
 */
export async function debugUserProfilesTable(): Promise<any> {
  try {
    console.log('[debugUserProfilesTable] Checking user_profiles table...');
    
    // Try to query table structure
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('[debugUserProfilesTable] Error querying table:', error);
      return { status: 'error', message: error.message };
    }
    
    console.log('[debugUserProfilesTable] Table is accessible');
    return { status: 'ok', message: 'user_profiles table is accessible' };
  } catch (e) {
    console.error('[debugUserProfilesTable] Unexpected error:', e);
    return { status: 'error', message: String(e) };
  }
}

/**
 * Fetches a user profile from the `user_profiles` table.
 * Returns null if not found or on error.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('display_name, pronouns, avatar_path, use_open_dyslexic_font, highlight_color')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error(`[getUserProfile] Database error for user ${userId}:`, error.message);
            return null;
        }

        if (!data) {
            console.log(`[getUserProfile] No profile found for user ${userId}`);
            return null;
        }

        const profile: UserProfile = {
            displayName: data.display_name ?? '',
            pronouns: data.pronouns ?? '',
            useOpenDyslexicFont: Boolean(data.use_open_dyslexic_font),
            avatarPath: data.avatar_path ?? null,
            highlightColor: data.highlight_color ?? '#8b5cf6',
        };

        console.log(`[getUserProfile] Successfully loaded profile for user ${userId}`);
        return profile;
    } catch (e) {
        console.error(`[getUserProfile] Unexpected error for user ${userId}:`, e);
        return null;
    }
}

/**
 * Upserts a user profile into the `user_profiles` table.
 * Returns true on success, false on error.
 */
export async function upsertUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    try {
        if (!userId || typeof userId !== 'string') {
            console.error('[upsertUserProfile] Invalid userId:', userId);
            return false;
        }

        if (!profile || Object.keys(profile).length === 0) {
            console.error('[upsertUserProfile] Empty profile object provided');
            return false;
        }

        const payload: ProfileData = {
            user_id: userId,
            display_name: profile.displayName ?? null,
            pronouns: profile.pronouns ?? null,
            avatar_path: profile.avatarPath ?? null,
            use_open_dyslexic_font: Boolean(profile.useOpenDyslexicFont ?? false),
            highlight_color: profile.highlightColor ?? '#8b5cf6',
        };

        console.log(`[upsertUserProfile] Saving profile for user ${userId}`, {
            displayName: payload.display_name,
            pronouns: payload.pronouns,
            avatarPath: payload.avatar_path,
            useOpenDyslexicFont: payload.use_open_dyslexic_font,
            highlightColor: payload.highlight_color,
        });

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(payload, { onConflict: 'user_id' })
            .select()
            .maybeSingle();

        if (error) {
            console.error(`[upsertUserProfile] Database error for user ${userId}:`, error.message);
            console.error('[upsertUserProfile] Full error details:', {
                message: error.message,
                code: (error as any).code,
                hint: (error as any).hint,
                details: (error as any).details,
            });
            return false;
        }

        // If no data returned, that's suspicious but might be okay if upsert succeeded
        // But let's at least verify the user_id was sent
        if (!data) {
            console.warn(`[upsertUserProfile] No data returned, but upsert may have succeeded`);
            console.warn('[upsertUserProfile] Verifying save by reading back from DB...');
            
            // Try reading back to verify
            const { data: verifyData, error: verifyError } = await supabase
                .from('user_profiles')
                .select('avatar_path, display_name')
                .eq('user_id', userId)
                .maybeSingle();
            
            if (verifyError) {
                console.error('[upsertUserProfile] Verification read also failed:', verifyError);
                return false;
            }
            
            if (verifyData) {
                console.log('[upsertUserProfile] ✓ Verification successful - data was saved:', verifyData);
                return true;
            } else {
                console.error('[upsertUserProfile] Verification read returned no data');
                return false;
            }
        }

        // Verify the data was actually saved with the expected values
        const savedData = data as any;
        console.log(`[upsertUserProfile] Verification - saved data:`, {
            user_id: savedData.user_id,
            avatar_path: savedData.avatar_path,
            display_name: savedData.display_name,
        });

        if (savedData.user_id !== userId) {
            console.error(`[upsertUserProfile] Saved user_id doesn't match: expected ${userId}, got ${savedData.user_id}`);
            return false;
        }

        console.log(`[upsertUserProfile] ✓ Successfully saved profile for user ${userId}`);
        return true;
    } catch (e) {
        console.error(`[upsertUserProfile] Unexpected error for user ${userId}:`, e);
        return false;
    }
}
