import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentData, Character } from '../types';
import { getDefense, getAbsorptionPool, getInitiativePool } from '../utils/calculations';
import { supabase } from '../supabaseClient';
import { Shield, Zap, Heart, ShieldAlert, ShieldCheck } from 'lucide-react';
import '../styles/components/_mini-sheet.css';

interface MiniSheetProps {
  agentData: AgentData;
  campaignId: string;
}

const MiniSheet: React.FC<MiniSheetProps> = ({ agentData, campaignId }) => {
  const navigate = useNavigate();
  if (!agentData?.character) return null;

  console.log('🎨 MiniSheet NOVA VERSAO renderizando:', character.name);

  const { character, attributes, protections } = agentData;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const avatarPath = character.avatarUrl;

  useEffect(() => {
    if (avatarPath && !avatarPath.startsWith('http')) {
      try {
        const { data } = supabase.storage.from('agent-avatars').getPublicUrl(avatarPath);
        setAvatarUrl(data.publicUrl || avatarPath);
      } catch (e) {
        console.warn('MiniSheet: public avatar URL fallback to raw path', e);
        setAvatarUrl(avatarPath);
      }
    } else {
      setAvatarUrl(avatarPath || null);
    }
  }, [avatarPath]);

  // Cálculos derivados
  const defesa = getDefense(agentData);
  const absorcao = getAbsorptionPool(agentData);
  const iniciativa = getInitiativePool(agentData);

  // Derivar Bloqueio (soma dos bônus de proteção equipados) e Esquiva (a partir de destreza)
  const bloqueio = (agentData.protections || []).filter(p => p.isEquipped).reduce((s, p) => s + (p.armorBonus || 0), 0) || 0;
  const esquiva = agentData.attributes?.destreza ? Math.max(0, Math.floor(agentData.attributes.destreza / 2)) : 0;

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

      {/* Cabeçalho com Avatar e Nome */}
      <div className="msc-header">
        <div className="msc-avatar" style={{ backgroundImage: `url(${avatarUrl || ''})` }}>
          {!avatarUrl && <span>{character.name?.charAt(0) || '?'}</span>}
        </div>
        <div className="msc-info">
          <h4 className="msc-name">{character.name || 'Sem Nome'}</h4>
          <div className="msc-pathway">
            {(() => {
              if (character.pathwayDisplayName) return character.pathwayDisplayName;
              if (character.pathways?.primary) return character.pathways.primary;
              if (Array.isArray(character.pathway)) return character.pathway[0] || 'Sem Caminho';
              return character.pathway || 'Sem Caminho';
            })()}
          </div>
          <div className="msc-sequence">Sequência {character.sequence}</div>
        </div>
      </div>

      {/* Grade de Atributos de Combate */}
      <div className="msc-combat-grid">
        <StatBox icon={<Shield size={14} />} label="DEFESA" value={defesa} />
        <StatBox icon={<ShieldCheck size={14} />} label="ABSORÇÃO" value={absorcao} />
        <StatBox icon={<Zap size={14} />} label="INICIATIVA" value={iniciativa} />
        <StatBox icon={<ShieldAlert size={14} />} label="BLOQUEIO" value={bloqueio} />
        <StatBox icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7h7l-5.5 4 2 7-6-4-6 4 2-7L2 9h7z"/></svg>} label="ESQUIVA" value={esquiva} />
      </div>

      {/* Barras de Recursos */}
      <div className="msc-resources-container">
        <ResourceBar icon={<Heart size={14} />} label="PV" value={character.vitality} max={character.maxVitality} color="red" />
        <ResourceBar icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 6v6l4 2"/></svg>} label="SAN" value={character.sanity} max={character.maxSanity} color="purple" />
        <ResourceBar icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>} label="PE" value={character.spirituality} max={character.maxSpirituality} color="blue" />
      </div>

      {/* Afixos (Fraquezas e Resistências) */}
      {/* Assimilação e Âncoras (linha compacta) */}
      <div className="msc-assimilation-anchors">
        <div className="msc-assimilation">DADOS DE ASSIMILAÇÃO: {Array.from({ length: Math.max(0, character.assimilationDice || 0) }).map((_, i) => (<span key={i} className="assim-icon">🎲</span>))}</div>
        <div className="msc-anchors">ANCORAS: { (character.anchors || []).map((a, i) => (<span key={i} className={`anchor-icon ${a ? 'filled' : 'empty'}`}>{a?.symbol || '◯'}</span>)) }</div>
      </div>

      <div className="msc-affix-section">
        <div className="msc-affix-item weakness">
          <div className="msc-affix-header">
            <ShieldAlert size={12} />
            <span>Fraquezas</span>
          </div>
          <div className="msc-affix-content">
            {getFraquezaFundamental(
              character.pathways?.primary || 
              (Array.isArray(character.pathway) ? character.pathway[0] : character.pathway)
            )}
          </div>
        </div>
        <div className="msc-affix-item resistance">
          <div className="msc-affix-header">
            <ShieldCheck size={12} />
            <span>Resistências</span>
          </div>
          <div className="msc-affix-content">
            {getResistencias(
              character.pathways?.primary || 
              (Array.isArray(character.pathway) ? character.pathway[0] : character.pathway)
            )}
          </div>
        </div>
        {character.currentCurse && (
          <div className="msc-affix-item condition">
            <div className="msc-affix-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <span>Condições</span>
            </div>
            <div className="msc-affix-content">{character.currentCurse}</div>
          </div>
        )}
      </div>

      <button className="msc-footer-link" onClick={handleOpenSheet}>
        [ Ver Ficha Completa ]
      </button>
    </div>
  );
};

// --- Componentes Auxiliares (coloque dentro do mesmo arquivo) ---

const ResourceBar: React.FC<{ icon: React.ReactNode, label: string, value: number, max: number, color: string }> = ({ icon, label, value = 0, max = 1, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`msc-resource-bar ${color}`}>
      <div className="msc-resource-icon">{icon}</div>
      <div className="msc-resource-content">
        <div className="msc-resource-header">
          <label>{label}</label>
          <span className="msc-bar-value">{value} / {max}</span>
        </div>
        <div className="msc-bar-track">
          <div className="msc-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ icon: React.ReactNode, label: string, value: number }> = ({ icon, label, value = 0 }) => (
  <div className="msc-combat-stat">
    <div className="msc-stat-icon">{icon}</div>
    <div className="msc-stat-content">
      <span className="value">{value}</span>
      <span className="label">{label.toUpperCase()}</span>
    </div>
  </div>
);

export default MiniSheet;
