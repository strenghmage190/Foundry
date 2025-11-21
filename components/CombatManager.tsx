import React, { useState } from 'react';
import '../styles/components/_combat-manager.css';
import { AgentData, Attack } from '../types';
import { rollInitiative, resolveAttack, ResolveAttackOptions } from '../utils/combatLogic';
import { getAbsorptionPool, getDefense } from '../utils/calculations';

interface CombatManagerProps {
  agents: AgentData[]; // players + NPCs com character
}

interface CombatantState {
  agent: AgentData;
  internalId: string; // ID usado internamente no combate
  initiative?: number; // sucessos
  initiativeRolls?: number[];
  hp?: number;
  maxHp?: number;
  san?: number;
  maxSan?: number;
  pe?: number;
  maxPe?: number;
  isEnemy?: boolean;
}

export const CombatManager: React.FC<CombatManagerProps> = ({ agents }) => {
  const initialCombatants: CombatantState[] = agents.map((a, idx) => ({
    agent: a,
    internalId: `pc_${a.id ?? a.character?.name ?? idx}`,
    hp: a.character?.vitality ?? a.character?.maxVitality ?? 0,
    maxHp: a.character?.maxVitality ?? a.character?.vitality ?? 0,
    san: a.character?.sanity ?? a.character?.maxSanity ?? 0,
    maxSan: a.character?.maxSanity ?? a.character?.sanity ?? 0,
    pe: a.character?.spirituality ?? a.character?.maxSpirituality ?? 0,
    maxPe: a.character?.maxSpirituality ?? a.character?.spirituality ?? 0,
    isEnemy: false,
  }));

  const [combatants, setCombatants] = useState<CombatantState[]>(initialCombatants);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [monsterForm, setMonsterForm] = useState({ name: '', hp: '20', damage: '1d6 + sucessos', atributo: 'forca', pericia: 'Armas Brancas' });
  const [attackTargetId, setAttackTargetId] = useState<string>('');
  const [attackConfig, setAttackConfig] = useState<ResolveAttackOptions>({ attributeName: 'forca', skillName: 'Armas Brancas', damageFormula: '1d6 + sucessos' });

  const rollAllInitiatives = () => {
    const updated = combatants.map(c => {
      const { rolls, successes } = rollInitiative(c.agent);
      return { ...c, initiative: successes, initiativeRolls: rolls };
    }).sort((a,b) => (b.initiative || 0) - (a.initiative || 0));
    setCombatants(updated);
    setLog(l => [ `Iniciativa rolada: ${updated.map(c => `${c.agent.character?.name || 'Sem Nome'}=${c.initiative}`).join(', ')}` , ...l]);
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    const idx = combatants.findIndex(c => c.internalId === selectedId);
    const nextIdx = (idx + 1) % combatants.length;
    setSelectedId(combatants[nextIdx].internalId);
  };

  const prevTurn = () => {
    if (combatants.length === 0) return;
    const idx = combatants.findIndex(c => c.internalId === selectedId);
    const prevIdx = (idx - 1 + combatants.length) % combatants.length;
    setSelectedId(combatants[prevIdx].internalId);
  };

  const addMonster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monsterForm.name.trim()) return;
    const fakeAgent: AgentData = {
      id: Date.now(),
      character: {
        name: monsterForm.name,
        vitality: parseInt(monsterForm.hp,10),
        maxVitality: parseInt(monsterForm.hp,10),
        sanity: 0,
        maxSanity: 0,
        spirituality: 0,
        maxSpirituality: 0,
        sequence: 9,
      },
      attributes: { forca: 3, percepcao: 2, raciocinio: 2, vigor: 2 },
      habilidades: { gerais: [{ name: 'Armas Brancas', points: 2 }, { name: 'Prontidão', points: 2 }, { name: 'Esquiva', points: 1 }], investigativas: [] },
      attacks: [],
      protections: [],
      data: {},
    } as any;
    const newCombatant: CombatantState = {
      agent: fakeAgent,
      internalId: `enemy_${fakeAgent.id}`,
      hp: fakeAgent.character?.vitality,
      maxHp: fakeAgent.character?.vitality,
      san: 0,
      maxSan: 0,
      pe: 0,
      maxPe: 0,
      isEnemy: true,
    };
    setCombatants(prev => [...prev, newCombatant]);
    setMonsterForm({ name: '', hp: '20', damage: monsterForm.damage, atributo: monsterForm.atributo, pericia: monsterForm.pericia });
  };

  const selected = combatants.find(c => c.internalId === selectedId) || null;

  const performAttack = () => {
    if (!selected) return;
    const target = combatants.find(c => c.internalId === attackTargetId);
    if (!target) return;
    const result = resolveAttack(selected.agent, target.agent, attackConfig);
    // apply damage to target hp
    setCombatants(prev => prev.map(c => {
      if (c.internalId === target.internalId) {
        const newHp = Math.max(0, (c.hp || 0) - result.finalDamage);
        return { ...c, hp: newHp };
      }
      return c;
    }));
    const summary = `${selected.agent.character?.name} ataca ${target.agent.character?.name}: Sucessos Atq ${result.attackSuccesses}, Def ${result.defenseSuccesses}, Net ${result.netSuccesses}, Dano ${result.weaponDamage}, Abs ${result.absorptionSuccesses}, Final ${result.finalDamage}`;
    setLog(l => [summary, ...l]);
  };

  const performDefinedAttack = (attack: Attack) => {
    if (!selected) return;
    const target = combatants.find(c => c.internalId === attackTargetId);
    if (!target) return;
    const opts = {
      attributeName: attack.attribute?.toLowerCase() || 'forca',
      skillName: attack.skill || 'Armas Brancas',
      secondaryAttribute: attack.secondaryAttribute?.toLowerCase(),
      extraBonus: attack.bonusAttack || 0,
      damageFormula: attack.damageFormula || '1d6 + sucessos'
    };
    const result = resolveAttack(selected.agent, target.agent, opts);
    setCombatants(prev => prev.map(c => {
      if (c.internalId === target.internalId) {
        const newHp = Math.max(0, (c.hp || 0) - result.finalDamage);
        return { ...c, hp: newHp };
      }
      return c;
    }));
    const summary = `${selected.agent.character?.name} usa ${attack.name} em ${target.agent.character?.name}: Atq ${result.attackSuccesses} vs Def ${result.defenseSuccesses} (Net ${result.netSuccesses}) Dano ${result.weaponDamage} Abs ${result.absorptionSuccesses} Final ${result.finalDamage}`;
    setLog(l => [summary, ...l]);
  };

  return (
    <div className="combat-manager">
      <div className="cm-left">
        <h3>Iniciativa</h3>
        <div className="cm-initiative-actions">
          <button onClick={rollAllInitiatives}>Rolar Iniciativa</button>
          <button className="secondary" onClick={prevTurn}>Voltar Turno</button>
          <button className="secondary" onClick={nextTurn}>Próximo Turno</button>
        </div>
        <ul className="cm-combatant-list">
          {combatants.map(c => {
            const id = c.internalId;
            const active = id === selectedId;
            const avatarUrl = c.agent.character?.avatarUrl && c.agent.character.avatarUrl.trim() !== '' ? c.agent.character.avatarUrl : '';
            const name = c.agent.character?.name || 'Sem Nome';
            return (
              <li key={id} className={`cm-combatant ${active ? 'active' : ''}`} onClick={() => setSelectedId(id)}>
                <div className="cm-avatar">
                  {avatarUrl && avatarUrl.trim() !== '' ? (
                    <img src={avatarUrl} alt={name} />
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'0.7rem',fontWeight:700,color:'#8e43ff'}}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="cm-info">
                  <div className="cm-name">{name}</div>
                  <div className="cm-sub">PV {c.hp}/{c.maxHp} · DEF {getDefense(c.agent)} · ABS {getAbsorptionPool(c.agent)}</div>
                </div>
                <div className="cm-initiative-result">{c.initiative ?? '-'}</div>
              </li>
            );
          })}
        </ul>

        <div className="cm-create-monster">
          <h4>Adicionar Inimigo</h4>
          <form onSubmit={addMonster}>
            <input placeholder="Nome" value={monsterForm.name} onChange={e => setMonsterForm(f => ({ ...f, name: e.target.value }))} />
            <div className="row">
              <input placeholder="PV" value={monsterForm.hp} onChange={e => setMonsterForm(f => ({ ...f, hp: e.target.value }))} />
              <input placeholder="Dano" value={monsterForm.damage} onChange={e => setMonsterForm(f => ({ ...f, damage: e.target.value }))} />
            </div>
            <button type="submit">Adicionar</button>
          </form>
        </div>

        <div className="cm-log">
          {log.map((entry,i) => <div key={i} className="cm-log-entry">{entry}</div>)}
        </div>
      </div>
      <div className="cm-right">
        {selected ? (
          <div className="cm-sheet-panel">
            <div className="cm-sheet-header">
              <div className="avatar">
                {(() => {
                  const avatarUrl = selected.agent.character?.avatarUrl && selected.agent.character.avatarUrl.trim() !== '' ? selected.agent.character.avatarUrl : '';
                  const name = selected.agent.character?.name || 'Sem Nome';
                  if (avatarUrl && avatarUrl.trim() !== '') {
                    return <img src={avatarUrl} alt={name} />;
                  }
                  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',fontSize:'0.8rem',fontWeight:700,color:'#8e43ff'}}>{name.charAt(0).toUpperCase()}</div>;
                })()}
              </div>
              <div className="title-block">
                <div className="name">{selected.agent.character?.name}</div>
                <div className="meta">SEQ {selected.agent.character?.sequence}</div>
              </div>
            </div>
            <div className="cm-bars">
              <div className="cm-bar"><div className="cm-bar-label">PV</div><div className="cm-bar-track"><div className="cm-bar-fill hp" style={{width: `${(selected.hp||0)/(selected.maxHp||1)*100}%`}}></div></div><div className="cm-bar-value">{selected.hp}/{selected.maxHp}</div></div>
              <div className="cm-bar"><div className="cm-bar-label">SAN</div><div className="cm-bar-track"><div className="cm-bar-fill san" style={{width: `${(selected.san||0)/(selected.maxSan||1 || 1)*100}%`}}></div></div><div className="cm-bar-value">{selected.san}/{selected.maxSan}</div></div>
              <div className="cm-bar"><div className="cm-bar-label">PE</div><div className="cm-bar-track"><div className="cm-bar-fill pe" style={{width: `${(selected.pe||0)/(selected.maxPe||1)*100}%`}}></div></div><div className="cm-bar-value">{selected.pe}/{selected.maxPe}</div></div>
            </div>

            <div className="cm-attributes-grid">
              {Object.entries(selected.agent.attributes || {}).map(([k,v]) => (
                <div key={k} className="cm-attr-box"><div className="attr-label">{k.toUpperCase()}</div><div className="attr-value">{v as any}</div></div>
              ))}
            </div>

            <div className="cm-attack-section">
              <h4>Ataques</h4>
              <div className="cm-attack-form">
                <select value={attackTargetId} onChange={e => setAttackTargetId(e.target.value)}>
                  <option value="">Alvo...</option>
                  {combatants.filter(c => c !== selected).map(c => (
                    <option key={c.internalId} value={c.internalId}>{c.agent.character?.name}</option>
                  ))}
                </select>
              </div>
              {selected.agent.attacks && selected.agent.attacks.length > 0 ? (
                <div className="cm-attacks-list">
                  {selected.agent.attacks.map(atk => (
                    <div key={atk.id} className="cm-attack-item">
                      <div className="info">
                        <div className="name">{atk.name}</div>
                        <div className="meta">{atk.attribute}{atk.secondaryAttribute ? ` + ${atk.secondaryAttribute}` : ''} + {atk.skill} · Bônus {atk.bonusAttack || 0} · Dano {atk.damageFormula}</div>
                      </div>
                      <button type="button" disabled={!attackTargetId} onClick={() => performDefinedAttack(atk)}>Atacar</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cm-attack-form quick">
                  <input placeholder="Atributo" value={attackConfig.attributeName} onChange={e => setAttackConfig(cfg => ({ ...cfg, attributeName: e.target.value }))} />
                  <input placeholder="Perícia" value={attackConfig.skillName} onChange={e => setAttackConfig(cfg => ({ ...cfg, skillName: e.target.value }))} />
                  <input placeholder="Dano" value={attackConfig.damageFormula} onChange={e => setAttackConfig(cfg => ({ ...cfg, damageFormula: e.target.value }))} />
                  <button type="button" onClick={performAttack} disabled={!attackTargetId}>Atacar Rápido</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="cm-no-selection">Selecione um combatente para ver a ficha</div>
        )}
      </div>
    </div>
  );
};

export default CombatManager;
