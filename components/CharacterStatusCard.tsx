import React, { useEffect, useState } from 'react';
import '../styles/components/_character-status-card.css';
import { getAvatarUrlOrFallback } from '../utils/avatarUtils';

type Stats = {
  defense?: number;
  absorption?: number;
  initiative?: number;
};

interface CharacterStatusCardProps {
  name: string;
  avatarUrl?: string | null;
  path?: string;
  sequence?: number | string;
  stats?: Stats;
  weaknesses?: string[];
  resistances?: string[];
  others?: string[];
  onViewDetails?: () => void;
  vitality?: number;
  maxVitality?: number;
  sanity?: number;
  maxSanity?: number;
  spirituality?: number;
  maxSpirituality?: number;
  compact?: boolean;
  className?: string;
  attributes?: {
    agi?: number;
    for?: number;
    int?: number;
    pre?: number;
    vig?: number;
  };
  nex?: string | number | null;
  role?: string | null;
}

const CharacterStatusCard: React.FC<CharacterStatusCardProps> = ({
  name,
  avatarUrl,
  path,
  sequence,
  stats = {},
  vitality,
  maxVitality,
  sanity,
  maxSanity,
  spirituality,
  maxSpirituality,
  weaknesses = [],
  resistances = [],
  others = [],
  onViewDetails,
  compact = false,
  className,
  attributes,
  nex,
  role,
}) => {
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);

  // Utility: extract initials from a name string
  const getInitials = (fullName?: string | null) => {
    if (!fullName) return '??';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return (first + last).toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!avatarUrl) {
          if (mounted) setSignedAvatar(null);
          return;
        }
        if (avatarUrl.startsWith('http')) {
          if (mounted) setSignedAvatar(avatarUrl);
          return;
        }
        const url = await getAvatarUrlOrFallback(avatarUrl, name || 'anon', 'agent-avatars');
        if (mounted) setSignedAvatar(url);
      } catch (e) {
        if (mounted) setSignedAvatar(null);
      }
    })();
    return () => { mounted = false; };
  }, [avatarUrl, name]);

  return (
    <div className={`char-status-card${compact ? ' compact' : ''}${className ? ' ' + className : ''}`}>
      <header className="char-status-header">
        <div className="char-avatar">
          {signedAvatar ? (
            <img src={signedAvatar} alt={name} className="char-avatar-img" />
          ) : avatarUrl && avatarUrl.startsWith('http') ? (
            <img src={avatarUrl} alt={name} className="char-avatar-img" />
          ) : (
            <div className="char-avatar-fallback">{getInitials(name)}</div>
          )}
        </div>
        <div className="char-identity">
          <div className="char-name">{name}</div>
          <div className="char-path">
            {path ? (
              <>
                {path} {sequence ? <span className="char-seq">| SEQ. {sequence}</span> : ''}
              </>
            ) : (
              'Caminho não selecionado'
            )}
          </div>
          <div className="badge-row">
            {nex ? <div className="badge nex">NEX: {nex}</div> : null}
            {role ? <div className="badge role">{role}</div> : null}
          </div>
        </div>
      </header>

        {/* Attributes row: AGI FOR INT PRE VIG */}
        {(attributes || {}).agi !== undefined || (attributes || {}).for !== undefined ? (
          <section className="char-attributes">
            <div className="attr-item"><div className="attr-value">{attributes?.agi ?? '-'}</div><div className="attr-label">AGI</div></div>
            <div className="attr-item"><div className="attr-value">{attributes?.for ?? '-'}</div><div className="attr-label">FOR</div></div>
            <div className="attr-item"><div className="attr-value">{attributes?.int ?? '-'}</div><div className="attr-label">INT</div></div>
            <div className="attr-item"><div className="attr-value">{attributes?.pre ?? '-'}</div><div className="attr-label">PRE</div></div>
            <div className="attr-item"><div className="attr-value">{attributes?.vig ?? '-'}</div><div className="attr-label">VIG</div></div>
          </section>
        ) : null}

      <section className="char-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.defense ?? 0}</div>
          <div className="stat-label">DEFESA</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.absorption ?? 0}</div>
          <div className="stat-label">ABSORÇÃO</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.initiative ?? 0}</div>
          <div className="stat-label">INICIATIVA</div>
        </div>
      </section>

      <section className="char-resources">
        <div className="char-resource-row-wrapper">
          <ResourceBar label="PV" value={vitality ?? 0} max={maxVitality ?? 1} color="red" compact={compact} />
          <ResourceBar label="SAN" value={sanity ?? 0} max={maxSanity ?? 1} color="purple" compact={compact} />
          <ResourceBar label="PE" value={spirituality ?? 0} max={maxSpirituality ?? 1} color="orange" compact={compact} />
        </div>
      </section>

      {/* Removido fraquezas/resistências para mini-fichas conforme pedido */}

      <div className="char-action">
        {compact ? (
          <button className="char-cta" onClick={onViewDetails}>Ficha</button>
        ) : (
          <button className="char-cta" onClick={onViewDetails}>Ver Ficha Completa</button>
        )}
      </div>
    </div>
  );
};

// Simple resource bar copied/adapted from MiniSheet
const ResourceBar: React.FC<{ label: string; value: number; max: number; color: string; compact?: boolean }> = ({ label, value = 0, max = 1, color, compact=false }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`char-resource-bar ${color} ${compact ? 'compact' : ''}`}>
      <div className="char-resource-row">
        <label className="char-resource-label">{label}</label>
        <div className="char-resource-content">
          <div className="char-bar-track">
            <div className="char-bar-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        <div className="char-bar-numbers">{value}/{max}</div>
      </div>
    </div>
  );
};

export default CharacterStatusCard;
