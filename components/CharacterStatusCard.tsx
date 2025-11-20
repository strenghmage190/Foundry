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
        </div>
      </header>

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
        <ResourceBar label="PV" value={vitality ?? 0} max={maxVitality ?? 1} color="red" />
        <ResourceBar label="SAN" value={sanity ?? 0} max={maxSanity ?? 1} color="purple" />
        <ResourceBar label="PE" value={spirituality ?? 0} max={maxSpirituality ?? 1} color="blue" />
      </section>

      <section className="char-tags">
        <div className="tag-group">
          <div className="tag-group-label">Fraquezas</div>
          <div className="tags">
            {weaknesses.length === 0 ? <span className="tag empty">Nenhuma</span> : weaknesses.map((w, i) => (
              <span key={i} className="tag tag-weak">{w}</span>
            ))}
          </div>
        </div>

        <div className="tag-group">
          <div className="tag-group-label">Resistências</div>
          <div className="tags">
            {resistances.length === 0 ? <span className="tag empty">Nenhuma</span> : resistances.map((r, i) => (
              <span key={i} className="tag tag-resist">{r}</span>
            ))}
          </div>
        </div>

        {others && others.length > 0 && (
          <div className="tag-group">
            <div className="tag-group-label">Outros</div>
            <div className="tags">
              {others.map((o, i) => <span key={i} className="tag tag-other">{o}</span>)}
            </div>
          </div>
        )}
      </section>

      <div className="char-action">
        <button className="char-cta" onClick={onViewDetails}>Ver Ficha Completa</button>
      </div>
    </div>
  );
};

// Simple resource bar copied/adapted from MiniSheet
const ResourceBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value = 0, max = 1, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`char-resource-bar ${color}`}>
      <label>{label}</label>
      <div className="char-bar-track">
        <div className="char-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="char-bar-value">{value} / {max}</div>
    </div>
  );
};

export default CharacterStatusCard;
