// /api/campaigns.ts

import { supabase } from '../supabaseClient';
import { Campaign, CampaignPlayer } from '../types';

/**
 * Cria uma nova campanha no banco de dados Supabase.
 */
export async function createCampaign(name: string, masterId: string): Promise<Campaign> {
  // Gera um UUID válido
  const inviteCode = crypto.randomUUID();
  
  console.log('🆕 Criando campanha com invite_code:', inviteCode);
  
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: name,
      gm_id: masterId,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar campanha:', error);
    throw error;
  }
  return data as Campaign;
}

/**
 * Busca todas as campanhas de um mestre específico.
 */
export async function getCampaignsByMasterId(masterId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('gm_id', masterId);

  if (error) {
    console.error('Erro ao buscar campanhas por mestre:', error);
    return [];
  }
  return (data as Campaign[]) || [];
}

/**
 * Busca uma única campanha pelo seu ID.
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Erro ao buscar campanha por ID:', error);
    }
    return null;
  }
  return data as Campaign | null;
}

/**
 * Busca os jogadores de uma campanha específica, incluindo os dados dos seus agentes.
 */
export async function getPlayersByCampaignId(campaignId: string): Promise<any[]> {
  console.log('📡 Buscando jogadores da campanha:', campaignId);
  
  // Usar fallback direto porque não temos FK configurada entre campaign_players e user_profiles
  console.log('🔄 Usando fallback manual join...');
  
  const { data: players, error: playersError } = await supabase
    .from('campaign_players')
    .select(`
      id,
      campaign_id,
      player_id,
      agent_id,
      agents (
        id,
        data,
        is_private,
        user_id
      )
    `)
    .eq('campaign_id', campaignId);

  if (playersError) {
    console.error('❌ Erro ao buscar campaign_players:', playersError);
    return [];
  }

  console.log('📦 Campaign players encontrados:', players?.length || 0);

  const playerIds = (players || []).map((p: any) => p.player_id).filter(Boolean);
  if (playerIds.length === 0) {
    console.log('⚠️ Nenhum player_id encontrado');
    return players || [];
  }

  console.log('👥 Buscando perfis para:', playerIds);

  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', playerIds);

  if (profilesError) {
    console.error('❌ Erro ao buscar user_profiles:', profilesError);
    // Mesmo sem perfis, retornamos os links básicos
    return players || [];
  }

  console.log('👤 Perfis encontrados:', profiles?.length || 0);

  const profileMap = new Map((profiles || []).map((pr: any) => [pr.user_id, pr]));

  const merged = (players || []).map((p: any) => ({
    ...p,
    user_profiles: profileMap.get(p.player_id) ?? null,
  }));

  console.log('✅ Dados mesclados:', merged);
  return merged;
}

/**
 * Adiciona um registro na tabela campaign_players para vincular um usuário a uma campanha.
 */
export async function addPlayerToCampaign(campaignId: string, playerId: string): Promise<any> {
  const { data, error } = await supabase
    .from('campaign_players')
    .insert({
      campaign_id: campaignId,
      player_id: playerId,
      agent_id: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar jogador à campanha:', error);
    throw error;
  }
  return data;
}

/**
 * Vincula um AGENTE (NPC) existente a uma campanha.
 */
export async function linkAgentToCampaign(campaignId: string, agentId: string): Promise<any> {
  console.log('📡 API: Vinculando agente (NPC):', { campaignId, agentId });
  
  const { data, error } = await supabase
    .from('campaign_players')
    .insert({
      campaign_id: campaignId,
      agent_id: agentId,
      player_id: null,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao vincular agente à campanha:', error);
    throw error;
  }
  
  console.log('✅ Agente vinculado com sucesso:', data);
  return data;
}

/**
 * Vincula o PERSONAGEM (agent) de um JOGADOR a uma campanha.
 */
export async function linkPlayerCharacter(campaignId: string, playerId: string, agentId: string): Promise<any> {
  console.log('📡 API: Vinculando personagem:', { campaignId, playerId, agentId });
  
  const { data, error } = await supabase
    .from('campaign_players')
    .update({ agent_id: agentId })
    .eq('campaign_id', campaignId)
    .eq('player_id', playerId)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao vincular personagem do jogador:', error);
    throw error;
  }
  
  console.log('✅ Personagem vinculado:', data);
  return data;
}

/**
 * Busca uma única campanha pelo seu CÓDIGO DE CONVITE.
 */
export async function getCampaignByInviteCode(code: string): Promise<Campaign | null> {
  console.log('📡 API: Buscando campanha com invite_code:', code);
  
  // Tenta buscar diretamente como string (o Supabase faz cast automático para UUID)
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('invite_code', code)
    .maybeSingle(); // Usa maybeSingle em vez de single para não dar erro se não achar

  if (error) {
    console.error('❌ Erro ao buscar campanha por código de convite:', error);
    return null;
  }
  
  if (!data) {
    console.log('⚠️ Nenhuma campanha encontrada com código:', code);
    return null;
  }
  
  console.log('✅ Campanha encontrada:', data);
  return data as Campaign | null;
}

/**
 * Atualiza os dados de uma campanha existente.
 */
export async function updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar a campanha:', error);
    throw error;
  }
  return data as Campaign;
}

/**
 * Gera e define um novo invite_code para a campanha (se estiver vazio ou por regeneração).
 */
export async function generateInviteCode(campaignId: string): Promise<Campaign> {
  // Gera um UUID válido
  const code = crypto.randomUUID();
  console.log('🔄 Gerando novo invite_code:', code, 'para campanha:', campaignId);
  return updateCampaign(campaignId, { invite_code: code } as any);
}


/**
 * Remove o vínculo de um jogador/agente de uma campanha.
 * @param linkId O ID da linha na tabela 'campaign_players'.
 */
export async function removeParticipantFromCampaign(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('campaign_players')
    .delete()
    .eq('id', linkId); // Apaga a linha específica da ligação

  if (error) {
    console.error('Erro ao remover participante da campanha:', error);
    throw error;
  }
}

/**
 * Faz upload de uma imagem de capa, salva o path no banco e atualiza a campanha.
 */
export async function uploadAndSetCampaignCover(campaignId: string, file: File): Promise<Campaign> {
  // 1. Gera um nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${campaignId}_${Date.now()}.${fileExt}`;

  console.log('📤 Uploading campaign cover:', fileName, 'Size:', file.size, 'Type:', file.type);

  // 2. Faz upload para o bucket
  const { error: uploadError } = await supabase.storage
    .from('campaign-covers')
    .upload(fileName, file);

  if (uploadError) {
    console.error('❌ Erro ao fazer upload da imagem:', uploadError);
    throw uploadError;
  }

  console.log('✅ Upload successful! Saved as:', fileName);

  // 3. Salva APENAS o path no banco de dados, não a URL inteira.
  const updatedCampaign = await updateCampaign(campaignId, { cover_image_url: fileName });

  return updatedCampaign;
}

/**
 * Registra uma rolagem de dados no banco de dados para exibição em tempo real.
 */
export async function logDiceRoll(payload: {
  campaign_id: string;
  character_name: string;
  roll_name: string;
  result: string;
  details: string;
  roll_data?: any;
}) {
  console.log("4. API: Função logDiceRoll recebida com payload:", payload); // LOG 4

  try {
    const { error } = await supabase.from('dice_rolls').insert(payload);

    if (error) {
      // Se houver um erro do Supabase, ele será mostrado aqui
      console.error("ERRO DETALHADO DENTRO DA API:", error); // LOG DE ERRO
    } else {
      console.log("5. API: Rolagem inserida no banco com sucesso!"); // LOG DE SUCESSO
    }
  } catch (e) {
    console.error("ERRO INESPERADO NA API:", e);
  }
}

/**
 * Exclui uma campanha. Espera-se que RLS permita somente ao mestre (gm_id) executar.
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);
  if (error) {
    console.error('Erro ao apagar campanha:', error);
    throw error;
  }
}

/**
 * Remove o jogador autenticado da campanha ("Sair da campanha").
 */
export async function leaveCampaign(campaignId: string, playerId: string): Promise<void> {
  const { error } = await supabase
    .from('campaign_players')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('player_id', playerId);
  if (error) {
    console.error('Erro ao sair da campanha:', error);
    throw error;
  }
}
