import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentData, Character } from '../types';
import { getDefense, getAbsorptionPool, getInitiativePool } from '../utils/calculations';
import { supabase } from '../supabaseClient';

interface MiniSheetProps {
  agentData: AgentData;
  campaignId: string;
}

const MiniSheet: React.FC<MiniSheetProps> = ({ agentData, campaignId }) => {
  const navigate = useNavigate();
  if (!agentData?.character) return null;

  const { character, attributes, protections } = agentData;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const avatarPath = character.avatarUrl;

  useEffect(() => {
    if (avatarPath && !avatarPath.startsWith('http')) {
      supabase.storage.from('agent-avatars').createSignedUrl(avatarPath, 3600)
        .then(({ data }) => {
          if (data) setAvatarUrl(data.signedUrl);
        });
    } else {
      setAvatarUrl(avatarPath || null);
    }
  }, [avatarPath]);

  // Cálculos derivados
  const defesa = getDefense(agentData);
  const absorcao = getAbsorptionPool(agentData);
  const iniciativa = getInitiativePool(agentData);

  // Função para obter a Fraqueza Fundamental baseada no caminho
  const getFraquezaFundamental = (pathway: string): string => {
    switch (pathway) {
      case 'CAMINHO DO ACORRENTADO': return 'Vulnerável a Prata / Consagrados';
      case 'CAMINHO DA MORTE': return 'Vulnerável a Vida / Sagrado';
      case 'CAMINHO DO SOL': return 'Enfraquecido na Escuridão';
      case 'CAMINHO DO DEMÔNIO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO ENFORCADO': return 'Vulnerável a Fogo / Sagrado';
      case 'CAMINHO DA LUA': return 'Vulnerável a Prata / Sagrado';
      case 'CAMINHO DA MÃE': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO PADRE VERMELHO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DA RODA DA FORTUNA': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO TIRANO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO TOLO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DA TORRE BRANCA': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DAS TREVAS': return 'Vulnerável a Luz / Sagrado';
      case 'CAMINHO DO VISIONÁRIO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO ABISMO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO ERRO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO GIGANTE': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO IMPERADOR NEGRO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO JUSTICEIRO': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO PARAGON': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DA PORTA': return 'Vulnerável a Sagrado / Luz';
      case 'CAMINHO DO EREMITA': return 'Vulnerável a Sagrado / Luz';
      default: return 'N/A';
    }
  };

  // Função para obter Resistências baseada no caminho
  const getResistencias = (pathway: string): string => {
    switch (pathway) {
      case 'CAMINHO DO ACORRENTADO': return 'Afinidade com Trevas / Prisão';
      case 'CAMINHO DA MORTE': return 'Afinidade com Morte / Escuridão';
      case 'CAMINHO DO SOL': return 'Afinidade com Luz / Sagrado';
      case 'CAMINHO DO DEMÔNIO': return 'Afinidade com Fogo / Trevas';
      case 'CAMINHO DO ENFORCADO': return 'Afinidade com Trevas / Ilusão';
      case 'CAMINHO DA LUA': return 'Afinidade com Trevas / Ilusão';
      case 'CAMINHO DA MÃE': return 'Afinidade com Vida / Cura';
      case 'CAMINHO DO PADRE VERMELHO': return 'Afinidade com Sangue / Fogo';
      case 'CAMINHO DA RODA DA FORTUNA': return 'Afinidade com Sorte / Tempo';
      case 'CAMINHO DO TIRANO': return 'Afinidade com Controle / Força';
      case 'CAMINHO DO TOLO': return 'Afinidade com Ilusão / Engano';
      case 'CAMINHO DA TORRE BRANCA': return 'Afinidade com Conhecimento / Luz';
      case 'CAMINHO DAS TREVAS': return 'Afinidade com Trevas / Escuridão';
      case 'CAMINHO DO VISIONÁRIO': return 'Afinidade com Visão / Ilusão';
      case 'CAMINHO DO ABISMO': return 'Afinidade com Caos / Destruição';
      case 'CAMINHO DO ERRO': return 'Afinidade com Erro / Ilusão';
      case 'CAMINHO DO GIGANTE': return 'Afinidade com Força / Terra';
      case 'CAMINHO DO IMPERADOR NEGRO': return 'Afinidade com Controle / Escuridão';
      case 'CAMINHO DO JUSTICEIRO': return 'Afinidade com Justiça / Luz';
      case 'CAMINHO DO PARAGON': return 'Afinidade com Perfeição / Luz';
      case 'CAMINHO DA PORTA': return 'Afinidade com Portais / Viagem';
      case 'CAMINHO DO EREMITA': return 'Afinidade com Isolamento / Conhecimento';
      default: return 'N/A';
    }
  };

  // 👇👇👇 ESTA É A LINHA QUE PRECISA SER CORRIGIDA 👇👇👇
  const handleOpenSheet = () => {
    // Verificação de segurança: campaignId deve existir
    if (!campaignId) {
      console.error("MiniSheet: campaignId está undefined! Não é possível navegar para a ficha dentro de uma campanha.");
      alert("Erro: ID da campanha não encontrado. Certifique-se de acessar a ficha a partir do Escudo do Mestre.");
      return;
    }

    // Constrói a URL completa com o campaignId
    const targetUrl = `/campaign/${campaignId}/agent/${agentData.id}`;

    // Log para confirmar que a URL está correta antes de navegar
    console.log("MiniSheet: campaignId recebido ->", campaignId);
    console.log("MiniSheet: agentData.id ->", agentData.id);
    console.log("MiniSheet: Navegando para a URL ->", targetUrl);

    navigate(targetUrl);
  };

  return (
    <div className="mini-sheet" style={{ '--character-color': character.pathwayColor || '#8a2be2' } as React.CSSProperties}>

      <div className="msc-header">
        <div className="msc-avatar" style={{ backgroundImage: `url(${avatarUrl || ''})` }}>
          {!avatarUrl && <span>{character.name?.charAt(0) || '?'}</span>}
        </div>
        <div className="msc-info">
          <h4>{character.name || 'Sem Nome'}</h4>
          <span>
            {(() => {
              if (character.pathways?.primary) return character.pathways.primary;
              if (Array.isArray(character.pathway)) return character.pathway[0] || 'Sem Caminho';
              return character.pathway || 'Sem Caminho';
            })()}
            {' | Seq. '}{character.sequence}
          </span>
        </div>
      </div>

      <div className="msc-resources-container">
        <ResourceBar label="PV" value={character.vitality} max={character.maxVitality} color="red" />
        <ResourceBar label="SAN" value={character.sanity} max={character.maxSanity} color="purple" />
        <ResourceBar label="PE" value={character.spirituality} max={character.maxSpirituality} color="blue" />
      </div>

      <div className="msc-combat-grid">
        <StatBox label="Defesa" value={defesa} />
        <StatBox label="Absorção" value={absorcao} />
        <StatBox label="Iniciativa" value={iniciativa} />
      </div>

      {/* --- SEÇÃO DE STATUS DE COMBATE --- */}
      <div className="msc-status-section">
        <div className="status-item">
          <span className="label">Fraqueza Fundamental</span>
          <span className="value">{getFraquezaFundamental(
            character.pathways?.primary || 
            (Array.isArray(character.pathway) ? character.pathway[0] : character.pathway)
          )}</span>
        </div>
        <div className="status-item">
          <span className="label">Resistências</span>
          <span className="value">{getResistencias(
            character.pathways?.primary || 
            (Array.isArray(character.pathway) ? character.pathway[0] : character.pathway)
          )}</span>
        </div>
        {character.currentCurse && (
          <div className="status-item">
            <span className="label">Condições Ativas</span>
            <span className="value">{character.currentCurse}</span>
          </div>
        )}
      </div>

      <button className="msc-footer-link" onClick={handleOpenSheet}>
        Ficha
      </button>
    </div>
  );
};

// --- Componentes Auxiliares (coloque dentro do mesmo arquivo) ---

const ResourceBar: React.FC<{ label: string, value: number, max: number, color: string }> = ({ label, value = 0, max = 1, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`msc-resource-bar ${color}`}>
      <label>{label}</label>
      <div className="msc-bar-track">
        <div className="msc-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="msc-bar-value">{value} / {max}</div>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: number }> = ({ label, value = 0 }) => (
  <div className="msc-combat-stat">
    <span className="value">{value}</span>
    <span className="label">{label.toUpperCase()}</span>
  </div>
);

export default MiniSheet;
