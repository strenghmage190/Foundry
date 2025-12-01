import React from 'react';
import type { AgentData, Attributes, Character } from '../types';

interface Props {
  agent: Partial<AgentData> & { id?: number | string };
  onOpen?: () => void;
  className?: string;
  combatSummary?: string;
  onUpdateAgent?: (agentId: string | number, updatedCharacter: Partial<Character>) => Promise<void> | void;
}

const abbrevMap: { [K in keyof Attributes]?: string } = {
  forca: 'FOR',
  destreza: 'AGI',
  inteligencia: 'INT',
  percepcao: 'PRE',
  vigor: 'VIG'
};

const barColors = {
  life: '#e74c3c',
  sanity: '#8e44ad',
  effort: '#f39c12'
};

const MiniCharacterCard: React.FC<Props> = ({ agent, onOpen, className, combatSummary, onUpdateAgent }) => {
  const character = (agent as any).data?.character || (agent as any).character || {};
  const attributes: Partial<Attributes> = (agent as any).data?.attributes || (agent as any).attributes || {};

  const avatar = character?.avatarUrl || character?.player || 'https://placehold.co/72x72?text=Avatar';
  const name = character?.name || 'Sem Nome';
  
  // Usa pathwayDisplayName se existir, senão usa pathway normal
  let pathDisplay = 'Sem Caminho';
  if (character?.pathwayDisplayName) {
    pathDisplay = character.pathwayDisplayName;
  } else if (character?.pathways?.primary) {
    pathDisplay = character.pathways.primary;
  } else if (character?.pathway) {
    pathDisplay = Array.isArray(character.pathway) ? character.pathway[0] : character.pathway;
  } else {
    pathDisplay = character?.player || 'Sem Caminho';
  }
  
  const nex = (agent as any).nexPercent ?? 0;

  const vitality = character?.vitality ?? 0;
  const maxVitality = character?.maxVitality ?? vitality ?? 0;
  const spirituality = character?.spirituality ?? 0;
  const maxSpirituality = character?.maxSpirituality ?? spirituality ?? 0;
  const pa = character?.paDisponivel ?? 0; // using paDisponivel as PE/TURNO
  const paMax = (character?.paDisponivel ?? 0);

  const [hoveredBar, setHoveredBar] = React.useState<string | null>(null);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<number | string>('');

  const startEdit = (field: string, value: number) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const commitEdit = async () => {
    if (!editingField) return;
    const val = Number(editingValue) || 0;
    const updatedCharacter = { ...(character || {}) };
    if (editingField === 'vitality') updatedCharacter.vitality = val;
    if (editingField === 'spirituality') updatedCharacter.spirituality = val;
    if (editingField === 'paDisponivel') updatedCharacter.paDisponivel = val;

    // call parent updater if provided
    if (onUpdateAgent && agent.id != null) {
      try {
        await onUpdateAgent(agent.id, updatedCharacter);
      } catch (e) {
        console.error('Failed to update agent', e);
      }
    }

    // update local view
    (character as any).vitality = updatedCharacter.vitality;
    (character as any).spirituality = updatedCharacter.spirituality;
    (character as any).paDisponivel = updatedCharacter.paDisponivel;

    setEditingField(null);
  };

  const adjustBy = async (field: string, delta: number) => {
    const cur = field === 'vitality' ? vitality : field === 'spirituality' ? spirituality : pa;
    const newVal = Math.max(0, cur + delta);
    setEditingValue(newVal);
    setEditingField(field);
    await commitEdit();
  };

  const pct = (cur: number, max: number) => (max > 0 ? Math.round((cur / max) * 100) : 0);

  return (
    <div
      className={className}
      style={{ width: 340, background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 12, boxSizing: 'border-box' }}
      onMouseLeave={() => setHoveredBar(null)}
    >
      {/* Top identity row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={avatar} alt="avatar" style={{ width: 72, height: 72, borderRadius: 6, objectFit: 'cover', background: '#222' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{pathDisplay}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>NEX: {nex}%</div>
        </div>
      </div>

      {/* Attributes compact grid */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
          {(['destreza', 'forca', 'inteligencia', 'percepcao', 'vigor'] as (keyof Attributes)[]).map(key => (
            <div key={key} style={{ background: '#0b0b0b', padding: 6, borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#bbb' }}>{abbrevMap[key] ?? key}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{attributes[key] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource bars */}
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <div onMouseEnter={() => setHoveredBar('vitality')}>
          <EditableResourceBar
            label="VIDA"
            color={barColors.life}
            value={vitality}
            max={maxVitality}
            editing={editingField === 'vitality'}
            editingValue={editingValue}
            onStartEdit={() => startEdit('vitality', vitality)}
            onChange={(v) => setEditingValue(v)}
            onCommit={commitEdit}
            onAdjust={(delta) => adjustBy('vitality', delta)}
            showControls={hoveredBar === 'vitality'}
          />
        </div>

        <div onMouseEnter={() => setHoveredBar('spirituality')}>
          <EditableResourceBar
            label="SANIDADE"
            color={barColors.sanity}
            value={spirituality}
            max={maxSpirituality}
            editing={editingField === 'spirituality'}
            editingValue={editingValue}
            onStartEdit={() => startEdit('spirituality', spirituality)}
            onChange={(v) => setEditingValue(v)}
            onCommit={commitEdit}
            onAdjust={(delta) => adjustBy('spirituality', delta)}
            showControls={hoveredBar === 'spirituality'}
          />
        </div>

        <div onMouseEnter={() => setHoveredBar('pa')}> 
          <EditableResourceBar
            label="ESFORÇO"
            color={barColors.effort}
            value={pa}
            max={paMax}
            editing={editingField === 'paDisponivel'}
            editingValue={editingValue}
            onStartEdit={() => startEdit('paDisponivel', pa)}
            onChange={(v) => setEditingValue(v)}
            onCommit={commitEdit}
            onAdjust={(delta) => adjustBy('paDisponivel', delta)}
            showControls={hoveredBar === 'pa'}
          />
        </div>
      </div>

      {/* Combat summary footer */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: '#ccc' }}>{combatSummary ?? `PE/TURNO: ${pa} · DEFESA: ${character?.defense ?? '-'} · ESQUIVA: ${character?.absorption ?? '-'}`}</div>
        <div>
          <a href="#" onClick={(e) => { e.preventDefault(); onOpen && onOpen(); }} style={{ color: '#7bed9f', textDecoration: 'none', fontSize: 13 }}>Ficha</a>
        </div>
      </div>
    </div>
  );
};

const ResourceBar: React.FC<{ label: string; color: string; value: number; max: number }> = ({ label, color, value, max }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#bbb' }}>
        <div>{label}</div>
        <div>{value} / {max}</div>
      </div>
      <div style={{ width: '100%', height: 12, background: '#071017', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 200ms ease' }} />
      </div>
    </div>
  );
};

const EditableResourceBar: React.FC<{
  label: string;
  color: string;
  value: number;
  max: number;
  editing?: boolean;
  editingValue?: number | string;
  onStartEdit?: () => void;
  onChange?: (v: number | string) => void;
  onCommit?: () => void;
  onAdjust?: (delta: number) => void;
  showControls?: boolean;
}> = ({ label, color, value, max, editing, editingValue, onStartEdit, onChange, onCommit, onAdjust, showControls }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: '#bbb', alignItems: 'center' }}>
        <div>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showControls && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onAdjust && onAdjust(-1)} style={{ padding: '2px 6px' }}>-</button>
              <button onClick={() => onAdjust && onAdjust(1)} style={{ padding: '2px 6px' }}>+</button>
            </div>
          )}
          {editing ? (
            <input
              type="number"
              value={editingValue as any}
              onChange={(e) => onChange && onChange(Number(e.target.value))}
              onBlur={() => onCommit && onCommit()}
              onKeyDown={(e) => { if (e.key === 'Enter') onCommit && onCommit(); }}
              style={{ width: 70, padding: 4 }}
              autoFocus
            />
          ) : (
            <div onClick={() => onStartEdit && onStartEdit()} style={{ cursor: 'pointer' }}>{value} / {max}</div>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 12, background: '#071017', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 200ms ease' }} />
      </div>
    </div>
  );
};

export default MiniCharacterCard;
