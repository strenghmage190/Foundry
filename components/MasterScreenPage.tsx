// Em /components/MasterScreenPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getCampaignById, getPlayersByCampaignId, getCampaignsByMasterId } from '../api/campaigns';
import { getCombatSessionsByCampaignId, createCombatSession, updateCombatSession, deleteCombatSession } from '../api/combatSessions';
import { getAvatarUrlOrFallback } from '../utils/avatarUtils';
import { beyondersReplacer, reviveInfinityInObject } from '../utils/serializationUtils';
import type { Campaign, Character, CombatSession, AgentData } from '../types';
import CharacterStatusCard from './CharacterStatusCard';
import CombatManager from './CombatManager';
import CombatSessionManager from './CombatSessionManager';
import CharacterOverviewModal from './CharacterOverviewModal';
import { getDefense, getAbsorptionPool, getInitiativePool } from '../utils/calculations';
import DiceLogEntry from './DiceLogEntry';
import '../styles/components/_master-screen.css';


interface MasterScreenPageProps {
  campaignId?: string;
}

const MasterScreenPage = ({ campaignId }: MasterScreenPageProps) => {
  // =======================================================
  // 1. FONTE DA VERDADE E DECLARAÇÃO DE TODOS OS HOOKS
  // =======================================================
  const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const effectiveCampaignId = campaignId || paramCampaignId;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('AGENTES');
  const [combatSessions, setCombatSessions] = useState<CombatSession[]>([]);
  const [activeCombatSessionId, setActiveCombatSessionId] = useState<string | undefined>();

  const notesKey = `beyonders_notes_${effectiveCampaignId}`;

  // Dice roll log state
  const [diceLog, setDiceLog] = useState<any[]>([]);

  // Hook principal de busca de dados
  useEffect(() => {
    async function load() {
      setLoading(true);
      let id = effectiveCampaignId;
      // Capture current viewer id for privacy filtering (always)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      if (!id) {
        if (user) {
          const list = await getCampaignsByMasterId(user.id);
          if (list && list.length > 0) id = list[0].id;
        }
      }

      if (!id) {
        setCampaign(null);
        setCharacters([]);
        setLoading(false);
        return;
      }

      const [foundCampaign, foundPlayers] = await Promise.all([
        getCampaignById(id),
        getPlayersByCampaignId(id)
      ]);

      setCampaign(foundCampaign);
      // Enriquecer players com signed avatar URLs (quando aplicável)
      const enriched = await Promise.all((foundPlayers || []).map(async (p: any) => {
        const profile = p.user_profiles || null;
        const signedAvatar = await getAvatarUrlOrFallback(profile?.avatarPath ?? null, profile?.displayName ?? p.player_id, 'user-avatars');
        return { ...p, user_profiles: { ...(profile || {}), signedAvatarUrl: signedAvatar } };
      }));
      setCharacters(enriched || []);
      setLoading(false);
    }
    load();
  }, [effectiveCampaignId]);

  // Hook para anotações (linha 87)
  useEffect(() => {
    if (!campaign) return; // Proteção para garantir que a chave exista
    const key = `beyonders_notes_${campaign.id}`;
    try {
      setNotes(localStorage.getItem(key) || '');
    } catch (e) { setNotes(''); }
  }, [campaign]); // Depende do objeto campaign

  // Hook para salvar anotações
  useEffect(() => {
    if (!campaign) return;
    const key = `beyonders_notes_${campaign.id}`;
    const t = setTimeout(() => {
      try { localStorage.setItem(key, notes); } catch (e) { }
    }, 600);
    return () => clearTimeout(t);
  }, [notes, campaign]);

  // Hook para carregar combates do Supabase
  useEffect(() => {
    if (!campaign) return;

    const loadCombatSessions = async () => {
      const sessions = await getCombatSessionsByCampaignId(campaign.id);
      setCombatSessions(sessions);
    };

    loadCombatSessions();
  }, [campaign]);

  // Hook for real-time dice roll logging (mantido)
  useEffect(() => {
    if (!campaign) return;

    // ... (lógica opcional de fetchInitialLogs) ...

    const channel = supabase
      .channel(`realtime_dice_rolls_${campaign.id}`) // Use um nome de canal único
      .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'dice_rolls',
            filter: `campaign_id=eq.${campaign.id}` // Filtra apenas para esta campanha
          },
          (payload) => {
            console.log("NOVA ROLAGEM RECEBIDA VIA REALTIME:", payload.new); // Adicione este log para depurar
            setDiceLog(prevLog => [...prevLog, payload.new]);
          }
      )
      .subscribe((status) => {
        // Adicione este callback para ver se a inscrição foi bem-sucedida
        console.log(`STATUS DA INSCRIÇÃO REALTIME: ${status}`);
      });

    // cleanup function for the realtime channel
    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('Erro ao remover canal realtime:', e);
      }
    };
  }, [campaign]);

  // Funções de iniciativa removidas.

  const updateAgentCharacter = async (agentId: string, updates: Partial<Character>) => {
    // 1. ATUALIZAÇÃO OTIMISTA DA UI
    setCharacters(prev => prev.map(p => {
      if (p.agent_id === agentId) {
        const newParticipant = JSON.parse(JSON.stringify(p)); // Cópia segura
        // Mescla o objeto 'character' antigo apenas com as novas 'updates'
        newParticipant.agents.data.character = {
          ...newParticipant.agents.data.character,
          ...updates
        };
        return newParticipant;
      }
      return p;
    }));

    // 2. PERSISTÊNCIA SEGURA NO BANCO DE DADOS
    try {
      // Busca os dados mais recentes do agente para evitar sobrescrever com dados antigos
      const { data: currentAgentData, error: fetchError } = await supabase
        .from('agents')
        .select('data')
        .eq('id', agentId)
        .single();
      if (fetchError) throw fetchError;

      // Mescla os dados completos do banco com as novas atualizações
      const updatedData = {
        ...currentAgentData.data,
        character: {
          ...currentAgentData.data.character,
          ...updates // Apenas o que mudou
        }
      };

      // Handle Infinity serialization
      const jsonString = JSON.stringify(updatedData, beyondersReplacer);
      const dataToSaveProcessed = JSON.parse(jsonString);

      // Salva o objeto 'data' completo e mesclado
      const { error: updateError } = await supabase
        .from('agents')
        .update({ data: dataToSaveProcessed })
        .eq('id', agentId);
      if (updateError) throw updateError;

    } catch (e) {
      console.error('Falha ao persistir a atualização do agente:', e);
      // Revert UI state on failure
      setCharacters(prev => prev.map(p => {
        if (p.agent_id === agentId) {
          const revertedParticipant = JSON.parse(JSON.stringify(p));
          // Remove the updates from the character object
          revertedParticipant.agents.data.character = {
            ...revertedParticipant.agents.data.character,
          };
          // Since we don't have the original state, we need to refetch or handle differently
          // For now, just log and potentially show a toast
          return revertedParticipant;
        }
        return p;
      }));
      // TODO: Add toast notification for failure
    }
  };
  const masterId = campaign?.gm_id ?? null;

  // Todos os personagens com ficha (NPCs e PCs)
  const visibleCharacters = characters.filter(p => !!p?.agents?.data?.character);

  // participante selecionado atualmente (para painel expandido)
  const selectedParticipant = characters.find(c => c.id === selectedParticipantId) || null;

  // Funções para gerenciar combates
  const handleCreateCombatSession = async (session: CombatSession) => {
    if (!campaign) return;
    
    // Otimização de UI
    setCombatSessions(prev => [...prev, session]);
    setActiveCombatSessionId(session.id);

    // Persistir no Supabase
    const saved = await createCombatSession(campaign.id, {
      name: session.name,
      location: session.location,
      participantIds: session.participantIds,
      status: session.status,
      notes: session.notes,
    });

    if (saved) {
      // Atualizar com o ID gerado pelo Supabase
      setCombatSessions(prev =>
        prev.map(s => (s.id === session.id ? { ...saved, createdAt: new Date(saved.createdAt) } : s))
      );
      setActiveCombatSessionId(saved.id);
    }
  };

  const handleSelectCombatSession = (sessionId: string) => {
    setActiveCombatSessionId(sessionId);
  };

  const handleDeleteCombatSession = async (sessionId: string) => {
    // Otimização de UI
    setCombatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeCombatSessionId === sessionId) {
      setActiveCombatSessionId(undefined);
    }

    // Deletar do Supabase
    await deleteCombatSession(sessionId);
  };

  const handleUpdateCombatSession = async (sessionId: string, updates: Partial<CombatSession>) => {
    // Otimização de UI
    setCombatSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...updates } : s))
    );

    // Atualizar no Supabase
    await updateCombatSession(sessionId, updates);
  };

  // Prepare available participants for combat session manager
  const availableParticipantsForCombat = visibleCharacters.map(ch => ({
    id: ch.id,
    name: ch.agents?.data?.character?.name || `Participante #${ch.id}`,
    avatarUrl: ch.agents?.data?.character?.avatarUrl ||
               ch.agents?.data?.customization?.avatarHealthy ||
               ch.agents?.data?.customization?.avatarHurt ||
               ch.agents?.data?.customization?.avatarDisturbed ||
               ch.agents?.data?.customization?.avatarInsane
  }));

  // Get agents for active combat session
  const activeCombatSession = combatSessions.find(s => s.id === activeCombatSessionId);
  const combatAgents = activeCombatSession
    ? visibleCharacters
        .filter(ch => activeCombatSession.participantIds.includes(ch.id))
        .map(ch => ch.agents?.data)
        .filter(Boolean) as AgentData[]
    : visibleCharacters.map(ch => ch.agents?.data).filter(Boolean) as AgentData[];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="master-screen">
      <nav className="ms-tabs">
        {['AGENTES','COMBATES','INVESTIGAÇÕES','RELATÓRIOS','DADOS','ANOTAÇÕES'].map(tab => (
          <button key={tab} className={tab === activeTab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>
      <main className="ms-simple-layout">
        <aside className="ms-dice-log-panel">
          <h4>Resultados</h4>
          {diceLog.length === 0 ? (
            <div className="ms-empty-state small">Nenhuma rolagem.</div>
          ) : (
            <ul className="ms-dice-log-list">
              {diceLog.slice().reverse().map((roll, idx) => (
                <li key={idx}><DiceLogEntry roll={roll} /></li>
              ))}
            </ul>
          )}
        </aside>
        <section className="ms-cards-area">
          {selectedParticipant && (
            <CharacterOverviewModal
              agentData={selectedParticipant?.agents?.data ?? null}
              participant={selectedParticipant}
              campaign={campaign}
              onClose={() => setSelectedParticipantId(null)}
            />
          )}
          {activeTab === 'AGENTES' && (
            <div className="ms-character-grid">
              {visibleCharacters.length === 0 ? (
                <div className="ms-empty-state">Nenhum personagem disponível.</div>
              ) : (
                visibleCharacters.map(ch => {
                  const agentData = ch?.agents?.data ?? null;
                  if (!agentData) return null;
                  const character = agentData.character || {};
                  // Mostrar somente avatar do personagem (sem fallback para perfil do usuário)
                  const avatar = character?.avatarUrl || (agentData?.customization?.avatarHealthy || agentData?.customization?.avatarHurt || agentData?.customization?.avatarDisturbed || agentData?.customization?.avatarInsane) || '';
                  const pathName = character.pathways?.primary ?? (Array.isArray(character.pathway) ? character.pathway?.[0] : character.pathway) ?? '';
                  const hasPathway = pathName && pathName.trim() !== '' && pathName !== 'Nenhum caminho selecionado.';
                  const weaknesses = hasPathway ? [`Vulnerável a ${pathName}`] : [];
                  const resistances = hasPathway ? [`Afinidade com ${pathName}`] : [];
                  const stats = {
                    defense: getDefense(agentData),
                    absorption: getAbsorptionPool(agentData),
                    initiative: getInitiativePool(agentData),
                  };
                  const isSelected = selectedParticipantId === ch.id;
                  const agentRowId = ch.agent_id ?? (ch.agents && (ch.agents.id || (ch.agents[0] && ch.agents[0].id))) ?? null;
                  return (
                    <div key={ch.id} className="ms-grid-item" onClick={() => setSelectedParticipantId(ch.id)}>
                      <CharacterStatusCard
                        compact
                        className={isSelected ? 'selected' : ''}
                        name={character.name || `Participante #${ch.id}`}
                        avatarUrl={avatar}
                        path={hasPathway ? pathName : undefined}
                        sequence={character.sequence}
                        vitality={character.vitality}
                        maxVitality={character.maxVitality}
                        sanity={character.sanity}
                        maxSanity={character.maxSanity}
                        spirituality={character.spirituality}
                        maxSpirituality={character.maxSpirituality}
                        stats={stats}
                        weaknesses={weaknesses}
                        resistances={resistances}
                        attributes={{
                          agi: character.agi,
                          for: character.for,
                          int: character.int,
                          pre: character.pre,
                          vig: character.vig,
                        }}
                        nex={character.nex}
                        role={character.role}
                        onViewDetails={() => agentRowId ? navigate(`/campaign/${campaign.id}/agent/${agentRowId}`) : null}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
          {activeTab === 'COMBATES' && !activeCombatSessionId && (
            <CombatSessionManager
              sessions={combatSessions}
              availableParticipants={availableParticipantsForCombat}
              onSelectSession={handleSelectCombatSession}
              onCreateSession={handleCreateCombatSession}
              onDeleteSession={handleDeleteCombatSession}
              onUpdateSession={handleUpdateCombatSession}
              activeSessionId={activeCombatSessionId}
            />
          )}
          {activeTab === 'COMBATES' && activeCombatSessionId && (
            <div className="ms-combat-wrapper">
              <button
                className="ms-back-to-sessions-btn"
                onClick={() => setActiveCombatSessionId(undefined)}
              >
                ← Voltar para Combates
              </button>
              <CombatManager agents={combatAgents} />
            </div>
          )}
          {!['AGENTES','COMBATES'].includes(activeTab) && (
            <div className="ms-placeholder">
              <p>Seção "{activeTab}" em desenvolvimento.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MasterScreenPage;
