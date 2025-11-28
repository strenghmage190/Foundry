import { supabase } from '../supabaseClient';
import { CombatSession } from '../types';

export const getCombatSessionsByCampaignId = async (campaignId: string): Promise<CombatSession[]> => {
  try {
    const { data, error } = await supabase
      .from('combat_sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching combat sessions:', error);
      return [];
    }

    return (data || []).map(session => ({
      ...session,
      participantIds: session.participant_ids || [],
      createdAt: new Date(session.created_at),
    }));
  } catch (error) {
    console.error('Error fetching combat sessions:', error);
    return [];
  }
};

export const createCombatSession = async (
  campaignId: string,
  session: Omit<CombatSession, 'id' | 'createdAt'>
): Promise<CombatSession | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('combat_sessions')
      .insert({
        campaign_id: campaignId,
        name: session.name,
        location: session.location,
        status: session.status,
        participant_ids: session.participantIds,
        notes: session.notes,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating combat session:', error);
      return null;
    }

    return {
      ...data,
      participantIds: data.participant_ids || [],
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error creating combat session:', error);
    return null;
  }
};

export const updateCombatSession = async (
  sessionId: string,
  updates: Partial<CombatSession>
): Promise<CombatSession | null> => {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.participantIds !== undefined) updateData.participant_ids = updates.participantIds;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('combat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating combat session:', error);
      return null;
    }

    return {
      ...data,
      participantIds: data.participant_ids || [],
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Error updating combat session:', error);
    return null;
  }
};

export const deleteCombatSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('combat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting combat session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting combat session:', error);
    return false;
  }
};
