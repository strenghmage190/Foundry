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
      console.log('🔍 Processando convite:', inviteCode);
      
      // 1. Verifica se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ Usuário não está logado, redirecionando...');
        // Se não estiver logado, redireciona para o login guardando o convite
        navigate(`/login?redirect=/invite/${inviteCode}`);
        return;
      }
      console.log('✅ Usuário logado:', session.user.id);
      setUser(session.user);

      // 2. Busca a campanha usando o código do convite
      if (!inviteCode) {
        setError('Código de convite inválido.');
        setIsLoading(false);
        return;
      }
      
      console.log('🔎 Buscando campanha com código:', inviteCode);
      const foundCampaign = await getCampaignByInviteCode(inviteCode);

      if (!foundCampaign) {
        console.error('❌ Campanha não encontrada com código:', inviteCode);
        setError('Este link de convite é inválido ou expirou.');
      } else {
        console.log('✅ Campanha encontrada:', foundCampaign);
        setCampaign(foundCampaign);
      }
      setIsLoading(false);
    }
    processInvite();
  }, [inviteCode, navigate]);

  const handleJoinCampaign = async () => {
    if (!campaign || !user) return;
    
    console.log('Tentando adicionar jogador:', {
      campaignId: campaign.id,
      userId: user.id,
      campaignName: campaign.name
    });
    
    try {
      await addPlayerToCampaign(campaign.id, user.id);
      alert(`Você entrou na campanha "${campaign.name}"!`);
      navigate(`/campaign/${campaign.id}?tab=players`);
    } catch (err: any) {
      console.error('Erro completo ao entrar na campanha:', err);
      console.error('Detalhes do erro:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code
      });
      
      // Verifica se o erro é de violação de chave única (jogador já está na campanha)
      if (err?.message?.includes('duplicate key value violates unique constraint')) {
          alert('Você já faz parte desta campanha.');
          navigate(`/campaign/${campaign.id}?tab=players`);
      } else if (err?.message?.includes('policy') || err?.code === '42501') {
          setError(`Erro de permissão no banco de dados. ${err?.message || 'Verifique as políticas RLS no Supabase.'}`);
      } else {
          setError(`Erro: ${err?.message || 'Ocorreu um erro ao tentar entrar na campanha.'}`);
      }
    }
  };

  if (isLoading) return <div>Verificando convite...</div>;
  if (error) return (
    <div style={{ padding: '20px' }}>
      <h2>Erro</h2>
      <p>{error}</p>
      <details style={{ marginTop: '20px' }}>
        <summary>Informações de Debug</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          Código do convite: {inviteCode}
          {'\n'}Usuário ID: {user?.id || 'não logado'}
        </pre>
      </details>
    </div>
  );

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
