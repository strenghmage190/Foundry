import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomizationSettings, AgentData } from '../types';
import { getAvatarForSanityAndVitality } from '../utils/agentUtils';
import { getSignedAvatarUrl, getDefaultDicebearUrl } from '../utils/avatarUtils';

interface CharacterCardProps {
  agent?: AgentData;
  id?: string | number;
  avatarUrl?: string;
  name?: string;
  path?: string;
  createdAt?: string;
  customization?: CustomizationSettings;
  sanity?: number;
  maxSanity?: number;
  vitality?: number;
  maxVitality?: number;
  onOpen?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ agent, avatarUrl, name, path, createdAt, customization, sanity, maxSanity, vitality, maxVitality, onOpen, onEdit, onRemove }) => {
  // Safety guard: if no agent and no fallback props, log and return null
  if (!agent && !name) {
    console.log('CharacterCard: No agent or name provided, skipping render');
    return null;
  }

  // Extract values from agent or use fallbacks
  const extractedName = agent?.character?.name || name || '[Sem nome]';
  
  // Usa pathwayDisplayName se existir, senão usa pathway normal
  let extractedPath = 'NPC';
  if (agent?.character?.pathwayDisplayName) {
    extractedPath = agent.character.pathwayDisplayName;
  } else if (agent?.character?.pathways?.primary) {
    extractedPath = agent.character.pathways.primary;
  } else if (agent?.character?.pathway) {
    extractedPath = Array.isArray(agent.character.pathway) ? agent.character.pathway[0] : agent.character.pathway;
  } else if (path) {
    extractedPath = path;
  }
  
  const extractedAvatarUrl = agent?.character?.avatarUrl || avatarUrl || null;
  const extractedCustomization = agent?.customization || customization;
  const extractedSanity = agent?.character?.sanity ?? sanity ?? 0;
  const extractedMaxSanity = agent?.character?.maxSanity ?? maxSanity ?? 1;
  const extractedVitality = agent?.character?.vitality ?? vitality ?? 0;
  const extractedMaxVitality = agent?.character?.maxVitality ?? maxVitality ?? 1;

  console.log('CharacterCard: Rendering with agent data', { extractedName, extractedAvatarUrl, agent: !!agent });
  const displayAvatar = getAvatarForSanityAndVitality({
    sanity: extractedSanity,
    maxSanity: extractedMaxSanity,
    vitality: extractedVitality,
    maxVitality: extractedMaxVitality,
    avatarUrl: extractedAvatarUrl,
    customization: extractedCustomization || null,
  });

  const defaultDicebear = getDefaultDicebearUrl(extractedName);
  const [avatarUrlState, setAvatarUrlState] = useState<string | null>(defaultDicebear);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!displayAvatar) {
          if (!cancelled) setAvatarUrlState(defaultDicebear);
          return;
        }
        // Try agent-avatars bucket first (displayAvatar may be a path)
        const signed = await getSignedAvatarUrl(displayAvatar, 'agent-avatars');
        if (!cancelled) setAvatarUrlState(signed || defaultDicebear);
      } catch (e) {
        if (!cancelled) setAvatarUrlState(defaultDicebear);
      }
    })();
    return () => { cancelled = true; };
  }, [displayAvatar, extractedName]);

  return (
    <div
      className="character-card"
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen && onOpen()}
      onKeyDown={(e) => { if (onOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(); } }}
    >
      <div className="character-avatar">
        <img
          src={avatarUrlState || defaultDicebear}
          alt="avatar"
          className="character-avatar-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultDicebear; }}
        />
      </div>
      <div className="character-info">
        <span className="character-name">{extractedName}</span>
        <span className="character-subtitle">{extractedPath}</span>
      </div>

      <div className="character-actions" onClick={(e) => e.stopPropagation()}>
        <button onClick={onEdit} className="character-btn gear" title="Configurar">⚙️</button>
        <button onClick={onRemove} className="character-btn-remove" title="Remover">🗑️</button>
      </div>
    </div>
  );
};

export default CharacterCard;