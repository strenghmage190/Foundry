import { supabase } from '../supabaseClient';
import type { AgentData, CustomizationSettings } from '../types';

/**
 * Uploads an agent avatar file to the agent-avatars bucket.
 * Generates a unique filename based on agent ID, field name, and timestamp.
 * 
 * @param agentId - The agent's ID
 * @param fieldName - The avatar field name (avatarHealthy, avatarHurt, etc.)
 * @param file - The image file to upload
 * @returns The file path on success
 * @throws Error if upload fails
 */
export async function uploadAgentAvatar(
  agentId: string,
  fieldName: string,
  file: File
): Promise<string> {
  try {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('Invalid agentId provided to uploadAgentAvatar');
    }

    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided to uploadAgentAvatar');
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${agentId}-${fieldName}-${Date.now()}.${fileExt}`;

    console.log(`[uploadAgentAvatar] Uploading file to agent-avatars: ${filePath}`);

    const { error } = await supabase.storage
      .from('agent-avatars')
      .upload(filePath, file, { upsert: false });

    if (error) {
      console.error(`[uploadAgentAvatar] Upload error: ${error.message}`);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    console.log(`[uploadAgentAvatar] Successfully uploaded: ${filePath}`);
    return filePath;
  } catch (e) {
    console.error('[uploadAgentAvatar] Unexpected error:', e);
    throw e;
  }
}

/**
 * Saves complete agent data to the database.
 * Persists all agent properties including character data and customization.
 * 
 * @param agent - The complete agent data to save
 * @returns true on success, false on error
 */
export async function saveAgentData(agent: AgentData): Promise<boolean> {
  try {
    if (!agent?.id || typeof agent.id !== 'string') {
      console.error('[saveAgentData] Invalid agent ID:', agent?.id);
      return false;
    }

    const { id, isPrivate, ...dataToSave } = agent as any;

    console.log(`[saveAgentData] Saving agent ${id}`);
    console.log('[saveAgentData] Data to save:', dataToSave);

    // IMPORTANT: dataToSave becomes the content of the 'data' column (JSONB)
    const { data, error } = await supabase
      .from('agents')
      .update({ data: dataToSave })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`[saveAgentData] Database error for agent ${id}:`, error.message);
      console.error('[saveAgentData] Error details:', error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`[saveAgentData] Update returned no data for agent ${id}`);
      return false;
    }

    console.log(`[saveAgentData] ✓ Successfully saved agent ${id}`);
    return true;
  } catch (e) {
    console.error('[saveAgentData] Unexpected error:', e);
    return false;
  }
}

/**
 * Updates only customization and pathway color for an agent.
 * This is a more targeted update to avoid race conditions.
 * 
 * @param agent - The agent data with updated customization/character
 * @returns true on success, false on error
 */
export async function updateAgentCustomization(agent: AgentData): Promise<boolean> {
  try {
    // Log stack trace to see where this is being called from
    console.log('[updateAgentCustomization] CALL STACK:');
    console.trace('[updateAgentCustomization] updateAgentCustomization called');
    
    if (!agent?.id || typeof agent.id !== 'string') {
      console.error('[updateAgentCustomization] Invalid agent ID:', agent?.id);
      return false;
    }

    const { id, isPrivate, ...dataToSave } = agent as any;

    console.log(`[updateAgentCustomization] Updating customization for agent ${id}`);
    console.log('[updateAgentCustomization] === CRITICAL DEBUG ===');
    console.log('[updateAgentCustomization] Input agent.customization.avatarHealthy:', (agent as any).customization?.avatarHealthy);
    console.log('[updateAgentCustomization] dataToSave.customization.avatarHealthy:', (dataToSave as any).customization?.avatarHealthy);
    console.log('[updateAgentCustomization] =====================');

    // IMPORTANT: dataToSave will be stored in the 'data' column as JSONB
    // When loading, code does: { ...(data.data as AgentData), id: data.id, isPrivate: data.is_private }
    // So dataToSave should contain: character, customization, attributes, habilidades, etc.

    const { data, error } = await supabase
      .from('agents')
      .update({ data: dataToSave })
      .eq('id', id)
      .select();

    if (error) {
      console.error(
        `[updateAgentCustomization] Database error for agent ${id}:`,
        error.message
      );
      console.error('[updateAgentCustomization] Error details:', error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`[updateAgentCustomization] Update returned no data for agent ${id}`);
      return false;
    }

    console.log(`[updateAgentCustomization] ✓ Successfully updated agent ${id}`);
    console.log('[updateAgentCustomization] Data saved to DB (full structure):', data[0]);
    console.log('[updateAgentCustomization] Customization field in saved data:', data[0].data?.customization);
    console.log('[updateAgentCustomization] Character field in saved data:', data[0].data?.character);
    
    // CRITICAL: Verify customization.avatarHealthy actually made it to DB
    const savedAvatarHealthy = data[0].data?.customization?.avatarHealthy;
    const sentAvatarHealthy = (dataToSave as any).customization?.avatarHealthy;
    console.log('[updateAgentCustomization] VERIFICATION:');
    console.log('[updateAgentCustomization]   Sent avatarHealthy:', sentAvatarHealthy);
    console.log('[updateAgentCustomization]   Saved avatarHealthy:', savedAvatarHealthy);
    console.log('[updateAgentCustomization]   Match?', sentAvatarHealthy === savedAvatarHealthy);
    
    // DOUBLE-CHECK: Do another SELECT to confirm data persisted
    console.log('[updateAgentCustomization] Performing verification SELECT...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('agents')
      .select('id, data')
      .eq('id', id)
      .single();
    
    if (verifyError) {
      console.error('[updateAgentCustomization] Verification SELECT failed:', verifyError);
    } else {
      console.log('[updateAgentCustomization] Verification SELECT result:', verifyData);
      console.log('[updateAgentCustomization] Verification customization:', verifyData.data?.customization);
      console.log('[updateAgentCustomization] Verification avatarHealthy:', verifyData.data?.customization?.avatarHealthy);
    }
    
    return true;
  } catch (e) {
    console.error('[updateAgentCustomization] Unexpected error:', e);
    return false;
  }
}

