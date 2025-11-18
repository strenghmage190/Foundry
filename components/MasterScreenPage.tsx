// Em /components/MasterScreenPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getCampaignById, getPlayersByCampaignId, getCampaignsByMasterId } from '../api/campaigns';
import { getAvatarUrlOrFallback } from '../utils/avatarUtils';
import type { Campaign, Character } from '../types';
import CharacterStatusCard from './CharacterStatusCard';
import { getDefense, getAbsorptionPool, getInitiativePool } from '../utils/calculations';
import DiceLogEntry from './DiceLogEntry';


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
  const [hideAgents, setHideAgents] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Record<string | number, boolean>>({});
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | number | null>(null);
  const [initiativeOrder, setInitiativeOrder] = useState<Array<{ id: string | number; name: string; initiative: number; status?: string }>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

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
      // Clean up selectedIds: remove selections that point to participants without characters
      setSelectedIds(prev => {
        const next: Record<string | number, boolean> = {};
        (enriched || []).forEach((p: any) => {
          const hasCharacter = !!p?.agents?.data?.character;
          if (hasCharacter && prev[p.id]) next[p.id] = true;
        });
        return next;
      });
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

  // Hook para iniciativa
  useEffect(() => {
    if (!campaign) return;
    const key = `beyonders_initiative_${campaign.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setInitiativeOrder(parsed.order || []);
        setActiveIndex(parsed.activeIndex || 0);
      }
    } catch (e) { }
  }, [campaign]);

  // Hook for real-time dice roll logging
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign]);

  // =======================================================
  // 2. LÓGICA DE RETORNO ANTECIPADO (DEPOIS DOS HOOKS)
  // =======================================================
  if (loading) return <div className="loading-state">Carregando Escudo do Mestre...</div>;
  if (!campaign) return <div className="empty-state">Nenhuma campanha encontrada.</div>;


  // =======================================================
  // 3. FUNÇÕES HANDLER E RETORNO FINAL
  // =======================================================

  // ... (todas as suas funções como saveInitiativeState, toggleSelect, rollInitiatives, etc. vêm aqui)
  // O código deles pode permanecer o mesmo.
  // ...
  const saveInitiativeState = (order: any[], active: number) => {
    const key = `beyonders_initiative_${campaign.id}`;
    try { localStorage.setItem(key, JSON.stringify({ order, activeIndex: active })); } catch (e) { }
  };
    const toggleSelect = (id: string | number) => {
    // Prevent selecting participants that don't have a linked character
    const participant = characters.find(c => c.id === id);
    const hasCharacter = !!participant?.agents?.data?.character;
    if (!hasCharacter) return; // ignore toggles for missing characters
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rollInitiatives = () => {
    const participants = visibleCharacters.filter(ch => selectedIds[ch.id]);

    const rolled = participants
      .map(ch => {
        // Pula participantes inválidos
        if (!ch?.id || !ch?.agents?.data?.character) return null;

        const baseInitiative = ch.agents.data.character.initiative != null ? ch.agents.data.character.initiative : 0;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + baseInitiative;
        const name = ch.agents.data.character.name || `Participante #${ch.id}`;

        return { id: ch.id, name, initiative: total, status: '' };
      })
      .filter(Boolean); // Filtra todos os nulos

    if (rolled.length === 0) {
      setInitiativeOrder([]);
      setActiveIndex(0);
      saveInitiativeState([], 0);
      return;
    }

    rolled.sort((a, b) => b.initiative - a.initiative);
    setInitiativeOrder(rolled as any);
    setActiveIndex(0);
    saveInitiativeState(rolled as any, 0);
  };
  
    const nextTurn = () => {
    setActiveIndex(i => {
      const next = (i + 1) % initiativeOrder.length; // Volta para o início
      saveInitiativeState(initiativeOrder, next);
      return next;
    });
  };

  const prevTurn = () => {
    setActiveIndex(i => {
      const prev = (i - 1 + initiativeOrder.length) % initiativeOrder.length; // Volta para o final
      saveInitiativeState(initiativeOrder, prev);
      return prev;
    });
  };

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

      // Salva o objeto 'data' completo e mesclado
      const { error: updateError } = await supabase
        .from('agents')
        .update({ data: updatedData })
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
  const masterId = campaign.gm_id;

  // GM vê TODOS os personagens, apenas filtra NPCs se hideAgents estiver ativo
  const visibleCharacters = characters.filter(p => {
    const hasCharacter = !!p?.agents?.data?.character;
    if (!hasCharacter) return false; // Ignora participantes sem personagem
    
    const isNpc = p.player_id === null;
    if (hideAgents && isNpc) return false; // Filtro de NPCs
    
    return true; // GM vê todos os outros
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="master-screen">
      <main className="ms-main-layout">
        <section className="ms-main-column">
          <div className="ms-participants-selector">
            <h4>Selecione os Participantes</h4>
            <div className="ms-participants-grid">
                {visibleCharacters.map(ch => {
                  const hasCharacter = !!ch.agents?.data?.character;
                  const name = hasCharacter ? ch.agents.data.character.name : (ch.user_profiles?.displayName ?? (ch.player_id ? `Player: ${ch.player_id}` : `Participante #${ch.id}`));
                  const isSelected = selectedParticipantId === ch.id;

                  return (
                    <div key={ch.id} className={`ms-participant-tag ${isSelected ? 'selected' : ''}`}>
                      {hasCharacter ? (
                        <input type="checkbox" checked={!!selectedIds[ch.id]} onChange={() => toggleSelect(ch.id)} />
                      ) : (
                        <div style={{ width: 18 }} />
                      )}
                      <span className="ms-participant-name" onClick={() => setSelectedParticipantId(ch.id)}>{name}</span>
                    </div>
                  );
                })}
            </div>
            <div className="ms-participants-actions">
              <button onClick={rollInitiatives} className="button-primary">Rolar Iniciativas!</button>
              <button onClick={() => { setInitiativeOrder([]); setActiveIndex(0); saveInitiativeState([], 0); }}>Limpar Combate</button>
            </div>
          </div>
          <div className="ms-character-grid">
            {visibleCharacters.length === 0 ? (
              <div className="ms-empty-state">Nenhum personagem disponível.</div>
            ) : (
              (() => {
                const selected = characters.find(c => c.id === selectedParticipantId) || visibleCharacters[0] || null;
                if (!selected) return <div className="ms-empty-state">Nenhum participante selecionado.</div>;

                const ch = selected;
                const agentData = ch?.agents?.data ?? null;

                if (!agentData) {
                  const profile = ch.user_profiles || null;
                  const displayName = profile?.displayName ?? (ch.player_id ? `Player: ${ch.player_id}` : `Link ID: ${ch.id}`);
                  const avatar = profile?.signedAvatarUrl ?? null;
                  return (
                    <div key={ch.id} style={{ width: '100%' }}>
                      <div className="ms-profile-card">
                        <div className="char-status-header">
                          <div className="char-avatar">
                            {avatar ? (
                              <img src={avatar} alt={displayName} className="char-avatar-img" />
                            ) : (
                              <div className="char-avatar-fallback">{(displayName || '??').slice(0,2).toUpperCase()}</div>
                            )}
                          </div>
                          <div className="char-identity">
                            <div className="char-name">{displayName}</div>
                            <div className="char-path">Sem personagem</div>
                          </div>
                        </div>
                        <div className="char-action">
                          <button className="char-cta" onClick={() => { if (ch.player_id) navigate(`/profile/${ch.player_id}`); }}>Ver Perfil</button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const character = agentData.character || {};
                const avatar = (character && character.avatarUrl) ? character.avatarUrl : (ch.user_profiles?.signedAvatarUrl ?? null);
                const pathName = character.pathways?.primary ?? (Array.isArray(character.pathway) ? character.pathway?.[0] : character.pathway) ?? '';
                const hasPathway = pathName && pathName.trim() !== '' && pathName !== 'Nenhum caminho selecionado.';
                const weaknesses = hasPathway ? [`Vulnerável a ${pathName}`] : [];
                const resistances = hasPathway ? [`Afinidade com ${pathName}`] : [];

                const stats = {
                  defense: getDefense(agentData),
                  absorption: getAbsorptionPool(agentData),
                  initiative: getInitiativePool(agentData),
                };

                return (
                  <CharacterStatusCard
                    key={ch.id}
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
                    onViewDetails={() => navigate(`/campaign/${campaign.id}/agent/${agentData.id}`)}
                  />
                );
              })()
            )}
          </div>
        </section>
          <aside className="ms-sidebar">
            <div className="ms-sidebar-widget">
              <h3>Ordem de Combate</h3>
              {initiativeOrder.length === 0 ? (
                <div className="ms-empty-state small">Nenhuma iniciativa rolada.</div>
              ) : (
                <>
                  <ol className="ms-initiative-list">
                    {initiativeOrder.map((p, idx) => {
                      if (!p) return null;
                      return (
                        <li key={p.id || idx} className={idx === activeIndex ? 'active' : ''}>
                          <div className="initiative-entry">
                            <span className="name">{p.name || 'Nome Inválido'}</span>
                            <span className="value">{p.initiative != null ? p.initiative : 0}</span>
                          </div>
                          <div className="status">{p.status || ''}</div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="ms-initiative-controls">
                    <button onClick={prevTurn}>{'<'} Anterior</button>
                    <button onClick={nextTurn}>Próximo {'>'}</button>
                  </div>
                </>
              )}
            </div>
            <div className="ms-sidebar-widget">
              <h3>Log de Dados</h3>
              {diceLog.length === 0 ? (
                <div className="ms-empty-state small">Nenhuma rolagem registrada.</div>
              ) : (
                <ul className="ms-dice-log-list">
                  {diceLog.map((roll, idx) => (
                    <DiceLogEntry key={idx} roll={roll} />
                  ))}
                </ul>
              )}
            </div>
          </aside>
      </main>
    </div>
  );
};

export default MasterScreenPage;
