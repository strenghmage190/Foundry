import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types'; // Importe seu tipo de campanha
import { supabase } from '../supabaseClient';

interface Props {
  campaign: Campaign;
  isPlayer: boolean; // Para saber se é uma campanha de jogador
  agentId?: string | null;
  onLinkCharacter?: (id: string) => void;
  onDeleteCampaign?: (id: string) => void;
  onLeaveCampaign?: (id: string) => void;
}

const CampaignCard: React.FC<Props> = ({ campaign, isPlayer, agentId, onLinkCharacter, onDeleteCampaign, onLeaveCampaign }) => {
  const navigate = useNavigate();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const coverPath = campaign.cover_image_url;
    if (coverPath && !coverPath.startsWith('http')) {
      try {
        const { data } = supabase.storage.from('campaign-covers').getPublicUrl(coverPath);
        setCoverImageUrl(data.publicUrl || coverPath);
      } catch (e) {
        console.warn('CampaignCard: public URL fallback to raw path', e);
        setCoverImageUrl(coverPath);
      }
    } else {
      setCoverImageUrl(coverPath || null);
    }
  }, [campaign.cover_image_url]);

  const handleOpenClick = () => {
    navigate(`/campaign/${campaign.id}`);
  };

  const handleOpenCharacter = () => {
    // Como jogador: abrir a campanha na aba de Jogadores
    navigate(`/campaign/${campaign.id}?tab=players`);
  };

  return (
    <div className="campaign-card">
      <div className="campaign-card-cover">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={`Capa de ${campaign.name}`} />
        ) : (
          <div className="cover-placeholder"></div>
        )}
      </div>
      <div className="campaign-card-content">
        <h3>{campaign.name}</h3>
        <p>{campaign.description || 'Nenhuma descrição fornecida.'}</p>
      </div>
      <div className="campaign-card-actions">
        {isPlayer ? (
          agentId ? (
            <>
              <button className="button-primary" onClick={handleOpenCharacter}>
                Abrir Campanha
              </button>
              <button className="button-danger" onClick={() => onLeaveCampaign && onLeaveCampaign(campaign.id)}>
                Sair
              </button>
            </>
          ) : (
            <button className="button-primary" onClick={() => onLinkCharacter && onLinkCharacter(campaign.id)}>
              Vincular Personagem
            </button>
          )
        ) : (
          <>
            <button className="button-primary" onClick={handleOpenClick}>
              Abrir
            </button>
            <button className="button-danger" onClick={() => onDeleteCampaign && onDeleteCampaign(campaign.id)}>
              Apagar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
