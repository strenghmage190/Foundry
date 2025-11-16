import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getCampaignByInviteCode, addPlayerToCampaign } from '../api/campaigns';
import { Campaign } from '../types';

const InvitePage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function processInvite() {
      // 1. Verifica se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Se não estiver logado, redireciona para o login guardando o convite
        navigate(`/login?redirect=/invite/${inviteCode}`);
        return;
      }
      setUser(session.user);

      // 2. Busca a campanha usando o código do convite
      if (!inviteCode) {
        setError('Código de convite inválido.');
        setIsLoading(false);
        return;
      }
      const foundCampaign = await getCampaignByInviteCode(inviteCode);

      if (!foundCampaign) {
        setError('Este link de convite é inválido ou expirou.');
      } else {
        setCampaign(foundCampaign);
      }
      setIsLoading(false);
    }
    processInvite();
  }, [inviteCode, navigate]);

  const handleJoinCampaign = async () => {
    if (!campaign || !user) return;
    try {
      await addPlayerToCampaign(campaign.id, user.id);
      alert(`Você entrou na campanha "${campaign.name}"!`);
      navigate(`/campaign/${campaign.id}?tab=players`); // Redireciona para a aba de jogadores
    } catch (err) {
      // Verifica se o erro é de violação de chave única (jogador já está na campanha)
      if ((err as any)?.message?.includes('duplicate key value violates unique constraint')) {
          alert('Você já faz parte desta campanha.');
          navigate(`/campaign/${campaign.id}?tab=players`);
      } else {
          setError('Ocorreu um erro ao tentar entrar na campanha.');
      }
    }
  };

  if (isLoading) return <div>Verificando convite...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="invite-page-container">
      <h1>Convite para Campanha</h1>
      <p>Você foi convidado por {campaign?.gm_id} para se juntar à campanha:</p>
      <h2>{campaign?.name}</h2>
      <button onClick={handleJoinCampaign}>Entrar na Campanha</button>
    </div>
  );
};

export default InvitePage;
