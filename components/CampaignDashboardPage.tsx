import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Campaign, CampaignPlayer } from '../types';
import { getCampaignById, getCampaignsByMasterId, getPlayersByCampaignId, removeParticipantFromCampaign, generateInviteCode } from '../api/campaigns';
import { getAvatarUrlOrFallback } from '../utils/avatarUtils';
import { supabase } from '../supabaseClient';
import CharacterCard from './CharacterCard';
import InvitePlayerModal from './modals/InvitePlayerModal';
import AddAgentModal from './modals/AddAgentModal';
import EditCampaignModal from './modals/EditCampaignModal'; // Importe o novo modal
import CoverImageModal from './modals/CoverImageModal';

type Tab = 'agents' | 'players' | 'combats';

const headerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '16px 12px',
  background: 'linear-gradient(90deg,#111,#0b0b0b)'
};

const actionBarStyles: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center'
};

const coverStyles: React.CSSProperties = {
  height: 160,
  width: '100%',
  borderRadius: 8,
  background: 'linear-gradient(180deg,#222,#111)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ddd'
};

const tabsContainer: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  borderBottom: '1px solid #222',
  padding: '8px 12px'
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  cursor: 'pointer',
  borderBottom: active ? '3px solid #6ab04c' : '3px solid transparent'
});

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: 12,
  padding: 12
};

const CampaignDashboardPage: React.FC<{ campaignId?: string }> = ({ campaignId }) => {
  const navigate = useNavigate();
  const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
  const effectiveCampaignId = campaignId || paramCampaignId;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const location = useLocation();
  const initialTab = (new URLSearchParams(location.search).get('tab') as Tab) || 'agents';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // <--- NOVO ESTADO
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null); // <--- NOVO ESTADO
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 👇 1. CRIE UMA FUNÇÃO DEDICADA PARA BUSCAR OS JOGADORES
  const loadPlayers = async (id: string) => {
    console.log("3. DASHBOARD: A função loadPlayers foi chamada."); // LOG 3
    const foundPlayers = await getPlayersByCampaignId(id);
    console.log("4. DASHBOARD: Dados recebidos da API:", foundPlayers); // LOG 4

    // Enriquecer cada registro com uma URL assinada para o avatar do usuário (quando disponível)
    const enriched = await Promise.all((foundPlayers || []).map(async (p: any) => {
      const profile = p.user_profiles || null;
      let signedAvatar: string | null = null;
      if (profile?.avatarPath) {
        signedAvatar = await getAvatarUrlOrFallback(profile.avatarPath, profile.displayName || p.player_id, 'user-avatars');
      } else {
        // fallback: generate a Dicebear URL using displayName or player_id as seed
        signedAvatar = await getAvatarUrlOrFallback(null, profile?.displayName || p.player_id, 'user-avatars');
      }
      return {
        ...p,
        user_profiles: {
          ...(profile || {}),
          signedAvatarUrl: signedAvatar,
        }
      };
    }));

    setPlayers(enriched);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Capture current viewer id for privacy filtering
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      let id = effectiveCampaignId;
      if (!id) {
        // fallback: pick first campaign of current user
        // user is already fetched above
        if (!user) {
          setCampaign(null);
          setPlayers([]);
          setLoading(false);
          return;
        }
  // get campaigns by master and pick first
  const list = await getCampaignsByMasterId(user.id);
        if (list && list.length > 0) id = list[0].id;
        else {
          setCampaign(null);
          setPlayers([]);
          setLoading(false);
          return;
        }
      }

      const found = await getCampaignById(id!);
      setCampaign(found);
      if (found) {
        await loadPlayers(id!); // Carrega os jogadores após carregar a campanha
      }
      setLoading(false);
    }
    load();
  }, [effectiveCampaignId]);

  // Atualiza a aba ativa quando o query param mudar (ex: vindo do card do jogador)
  useEffect(() => {
    const qpTab = new URLSearchParams(location.search).get('tab') as Tab | null;
    if (qpTab && qpTab !== activeTab) setActiveTab(qpTab);
  }, [location.search]);

  // 👇👇👇 NOVO useEffect PARA GERAR A URL ASSINADA 👇👇👇
  useEffect(() => {
    // Se não houver campanha ou a URL da imagem estiver vazia, não faz nada.
    if (!campaign?.cover_image_url) {
      setCoverImageUrl(null);
      return;
    }

    async function createSignedUrl() {
      const { data, error } = await supabase.storage
        .from('campaign-covers')
        .createSignedUrl(campaign.cover_image_url, 3600); // 3600 segundos = 1 hora de validade

      if (error) {
        // Se o objeto não for encontrado, apenas não definimos a imagem
        console.error(`Erro ao criar URL assinada para ${campaign.cover_image_url}:`, error);
        setCoverImageUrl(null); // Garante que o placeholder seja exibido
      } else {
        setCoverImageUrl(data.signedUrl);
      }
    }

    createSignedUrl();
  }, [campaign]); // Roda sempre que os dados da campanha mudarem

  if (loading) return <div style={{ padding: 20 }}>Carregando campanha...</div>;
  if (!campaign) return <div style={{ padding: 20 }}>Campanha não encontrada.</div>;

  // Função para copiar o link para a área de transferência
  const handleCopyInviteLink = async () => {
    try {
      let code = campaign?.invite_code;
      if (!campaign) return;
      if (!code) {
        const updated = await generateInviteCode(campaign.id);
        setCampaign(updated);
        code = updated.invite_code as string;
      }
      if (!code) return;
      const inviteLink = `${window.location.origin}/invite/${code}`;
      await navigator.clipboard.writeText(inviteLink);
      alert('Link de convite copiado para a área de transferência!');
    } catch (err) {
      console.error('Falha ao gerar/copiar link:', err);
      alert('Não foi possível gerar/copiar o link de convite.');
    }
  };

  const handlePlayerInvited = () => {
    // Esta função será chamada para atualizar a lista de jogadores após um convite
    // Por enquanto, vamos apenas fechar o modal
    setShowInviteModal(false);
    // Idealmente, você iria recarregar a lista de jogadores aqui
  };

  // 👇 2. MODIFIQUE O HANDLER PARA CHAMAR A NOVA FUNÇÃO
  const handleAgentAdded = () => {
    console.log("2. DASHBOARD: A função handleAgentAdded foi chamada."); // LOG 2
    setShowAddAgentModal(false);
    loadPlayers(campaign!.id); // <-- AQUI ESTÁ A MÁGICA!
    alert('Agente adicionado com sucesso!'); // Mova o alerta para cá
  };

  const handleRemoveParticipant = async (linkId: string) => {
    if (window.confirm("Tem certeza que deseja remover este participante da campanha?")) {
      try {
        await removeParticipantFromCampaign(linkId);
        // Atualiza a UI removendo o participante da lista local
        setPlayers(prev => prev.filter(p => p.id !== linkId));
        alert('Participante removido com sucesso.');
      } catch (error) {
        alert('Ocorreu um erro ao remover o participante.');
      }
    }
  };

  console.log("5. DASHBOARD: Componente está renderizando com esta lista de players:", players); // LOG 5

  return (
    <div>
      <header style={headerStyles}>
        <div style={actionBarStyles}>
          <button onClick={() => setShowCoverModal(true)}>Foto de Capa</button>
          <button onClick={() => setShowAddAgentModal(true)}>Adicionar Agentes</button>
          <button onClick={handleCopyInviteLink}>Convidar com Link</button>
          <button onClick={() => setShowEditModal(true)}>Editar Campanha</button>
          <button onClick={() => alert('Funcionalidade de Criar Combate ainda não implementada')}>Criar Combate</button>
          <button onClick={() => navigate(`/masterscreen/${campaign.id}`)}>Escudo do Mestre</button>
        </div>

        <div>
          <h1 style={{ fontSize: 28, margin: '8px 0' }}>{campaign.name}</h1>
          <div className="campaign-cover-container">
            {/* 👇 USE O NOVO ESTADO 'coverImageUrl' AQUI 👇 */}
            {coverImageUrl ? (
              <img src={coverImageUrl} alt={`Capa da campanha ${campaign.name}`} className="campaign-cover-image" />
            ) : (
              <div style={coverStyles}>Foto de Capa (placeholder)</div>
            )}
          </div>
        </div>
      </header>

      <nav style={tabsContainer}>
        <div style={tabStyle(activeTab === 'agents')} onClick={() => setActiveTab('agents')}>Agentes</div>
        <div style={tabStyle(activeTab === 'players')} onClick={() => setActiveTab('players')}>Jogadores</div>
        <div style={tabStyle(activeTab === 'combats')} onClick={() => setActiveTab('combats')}>Combates</div>
      </nav>

      <main>
        {activeTab === 'agents' && (
          <section style={gridStyle}>
            {players.length === 0 && <div style={{ padding: 12 }}>Nenhum agente (NPC) adicionado.</div>}

            {/* 👇👇👇 MODIFICAÇÃO AQUI 👇👇👇 */}
            {players
              .filter(p => p.agents)
              .filter(p => {
                const isPrivate = p?.agents?.is_private === true;
                if (!isPrivate) return true;
                const viewerId = currentUserId;
                const ownerId = p?.agents?.user_id || null;
                const gmId = campaign?.gm_id || null;
                return viewerId && (viewerId === ownerId || viewerId === gmId);
              })
              .map(p => {
              // Safety guard: if no agents data, skip rendering
              if (!p.agents) {
                console.log('CampaignDashboardPage: Skipping player without agents data', p);
                return null;
              }

              console.log('CampaignDashboardPage: Rendering agent', { name: p.agents.data.character?.name, avatarUrl: p.agents.data.character?.avatarUrl });

              return (
                <CharacterCard
                  key={p.id}
                  agent={p.agents.data}
                  onOpen={() => navigate(`/campaign/${p.campaign_id}/agent/${p.agent_id}`)}
                  onEdit={() => navigate(`/campaign/${p.campaign_id}/agent/${p.agent_id}`)}
                  onRemove={() => handleRemoveParticipant(p.id)}
                />
              );
            })}
          </section>
        )}

        {activeTab === 'players' && (
          <section style={gridStyle}>
            {players.filter(p => p.player_id).length === 0 && <div style={{ padding: 12 }}>Nenhum jogador convidado.</div>}
            {players.filter(p => p.player_id).map(p => (
              <CharacterCard
                key={p.player_id}
                name={p.user_profiles?.displayName ?? p.player_id}
                avatarUrl={p.user_profiles?.signedAvatarUrl ?? undefined}
                path={'Jogador'}
                createdAt={undefined}
                onOpen={() => navigate(`/campaign/${p.campaign_id}/player/${p.player_id}`)}
                onEdit={() => navigate(`/campaign/${p.campaign_id}/player/${p.player_id}`)}
                onRemove={() => handleRemoveParticipant(p.id)}
              />
            ))}
          </section>
        )}

        {activeTab === 'combats' && (
          <section style={{ padding: 12 }}>
            <div style={{ padding: 12 }}>Lista de combates (ainda vazia - funcionalidade futura)</div>
          </section>
        )}
      </main>

      {/* 👇 ADICIONE A RENDERIZAÇÃO CONDICIONAL DO MODAL 👇 */}
      {showInviteModal && (
        <InvitePlayerModal
          campaignId={campaign.id}
          onClose={() => setShowInviteModal(false)}
          onPlayerInvited={handlePlayerInvited}
        />
      )}
      {showAddAgentModal && (
        <AddAgentModal
          campaignId={campaign.id}
          onClose={() => setShowAddAgentModal(false)}
          onAgentAdded={handleAgentAdded}
        />
      )}
      {showEditModal && (
        <EditCampaignModal
          campaign={campaign}
          onClose={() => setShowEditModal(false)}
          onSaved={(updatedCampaign) => {
            setCampaign(updatedCampaign); // ATUALIZA A UI IMEDIATAMENTE!
            setShowEditModal(false);
          }}
        />
      )}
      {showCoverModal && (
        <CoverImageModal
          campaign={campaign}
          onClose={() => setShowCoverModal(false)}
          onSaved={(updatedCampaign) => {
            setCampaign(updatedCampaign); // ATUALIZA A UI IMEDIATAMENTE!
            setShowCoverModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CampaignDashboardPage;
