import React, { useState } from 'react';
import '../styles/components/_combat-manager.css';
import { AgentData, Attack, Enemy, Attributes, Habilidade } from '../types';
import { rollInitiative, resolveAttack, ResolveAttackOptions } from '../utils/combatLogic';
import { getAbsorptionPool, getDefense } from '../utils/calculations';
import { rollDice } from '../utils/diceRoller';
import { useMyContext } from '../MyContext';
import SelectCreatureModal from './modals/SelectCreatureModal';

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
  creatureId?: string; // ID da criatura salva (para criaturas importadas)
}

export const CombatManager: React.FC<CombatManagerProps> = ({ agents }) => {
  const { addLiveToast } = useMyContext();
  
  // Função para converter Enemy em AgentData
  const convertEnemyToAgent = (creature: Enemy): AgentData => {
    // Extrair atributos da criatura
    const attributes = creature.attributes || {};
    
    // Converter ataques EnemyAttack para Attack[]
    const attacks: Attack[] = (creature.attacks || []).map((ea, idx) => ({
      id: `attack_${creature.id}_${idx}`,
      name: ea.name,
      attribute: 'forca', // padrão
      skill: 'Armas Brancas', // padrão
      damageFormula: ea.damage,
      bonusAttack: ea.dicePool || 0,
      quality: 'Comum',
      specialQualities: ea.qualities || '',
      enhancements: '',
      range: (ea as any).range || '—',
      ammo: (ea as any).ammo || 0,
      maxAmmo: (ea as any).maxAmmo || 0,
      // preserve text note in fallback field (not part of Attack) by using specialQualities or enhancements
      // notes/presentation can be added to UI by reading meta fields on Attack if required
    }));

    // Converter creature skills em Habilidades com estrutura similar aos players
    const creatureSkillsList: Habilidade[] = [
      { name: 'Vontade', attr: 'Autocontrole', points: creature.creatureSkills?.find(s => s.name === 'Vontade')?.points ?? creature.skills?.vontade ?? 3 },
      { name: 'Vigor', attr: 'Vigor', points: creature.creatureSkills?.find(s => s.name === 'Vigor')?.points ?? creature.skills?.vigor ?? 3 },
      { name: 'Percepção', attr: 'Sabedoria', points: creature.creatureSkills?.find(s => s.name === 'Percepção')?.points ?? creature.skills?.percepcao ?? 3 },
      { name: 'Inteligência', attr: 'Inteligência', points: creature.creatureSkills?.find(s => s.name === 'Inteligência')?.points ?? creature.skills?.inteligencia ?? 2 },
      { name: 'Raciocínio', attr: 'Inteligência', points: creature.creatureSkills?.find(s => s.name === 'Raciocínio')?.points ?? creature.skills?.raciocinio ?? 2 },
    ];

    // Build a minimal AgentData object that satisfies the application types (defaults for optional/unused fields)
    const agentData: AgentData = {
      agent_id: creature.id.toString(),
      id: Date.now(),
      lastModified: new Date().toISOString(),
      character: {
        name: creature.name,
        sequence: parseInt(creature.recommendedSequence || '9') || 9,
        player: 'NPC',
        avatarUrl: '',
        anotacoes: creature.notes || '',
        aparencia: '',
        personalidade: '',
        historico: '',
        objetivo: '',
        ancoras: '',
        nomeHonorifico: '',
        pathwayColor: '#888',
        dtRituais: 0,
        vitality: creature.healthPoints || 0,
        maxVitality: creature.healthPoints || 0,
        spirituality: creature.espiritualidade || 0,
        maxSpirituality: creature.espiritualidade || 0,
        willpower: 0,
        maxWillpower: 0,
        sanity: 0,
        maxSanity: 0,
        pa: 0,
        maxPa: 0,
        paDisponivel: 0,
        paTotalGasto: 0,
        purifiedDiceThisSequence: 0,
        assimilationDice: Number.POSITIVE_INFINITY,
        maxAssimilationDice: Number.POSITIVE_INFINITY,
        soulDice: 0,
        defense: creature.defense || 0,
        absorption: creature.absorption || 0,
        initiative: creature.initiative || 0,
        anchors: [],
        tempHpBonus: 0,
      },
      attributes: {
        forca: attributes.forca || 2,
        destreza: attributes.destreza || 2,
        vigor: attributes.vigor || 2,
        carisma: attributes.carisma || 2,
        manipulacao: attributes.manipulacao || 2,
        autocontrole: attributes.autocontrole || 2,
        percepcao: attributes.percepcao || 2,
        inteligencia: attributes.inteligencia || 2,
        raciocinio: attributes.raciocinio || 2,
        espiritualidade: attributes.espiritualidade || 2,
      },
      habilidades: { gerais: creatureSkillsList, investigativas: [] },
      habilidadesBeyonder: [],
      attacks,
      protections: [],
      rituais: [],
      inventory: [],
      artifacts: [],
      money: { libras: 0, soli: 0, pennies: 0 },
      antecedentes: [],
      afiliacoes: [],
      learnedParticles: [],
      customization: { useOpenDyslexicFont: false, avatarHealthy: '', avatarHurt: '', avatarDisturbed: '', avatarInsane: '' },
    };
    return agentData;
  };

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
  const [showSelectCreature, setShowSelectCreature] = useState(false);
  const [monsterForm, setMonsterForm] = useState({ name: '', hp: '20', damage: '1d6 + sucessos', atributo: 'forca', pericia: 'Armas Brancas' });
  const [attackTargetId, setAttackTargetId] = useState<string>('');
  const [attackConfig, setAttackConfig] = useState<ResolveAttackOptions>({ attributeName: 'forca', skillName: 'Armas Brancas', damageFormula: '1d6 + sucessos' });
  const [activeSheetTab, setActiveSheetTab] = useState<'status' | 'combate' | 'descricao'>('status');

  const handleSelectCreature = (creature: Enemy) => {
    const agent = convertEnemyToAgent(creature);
    const newCombatant: CombatantState = {
      agent,
      internalId: `creature_${creature.id}`,
      hp: creature.healthPoints,
      maxHp: creature.healthPoints,
      san: 0,
      maxSan: 0,
      pe: creature.espiritualidade || 0,
      maxPe: creature.espiritualidade || 0,
      isEnemy: true,
      creatureId: creature.id,
    };
    setCombatants(prev => [...prev, newCombatant]);
    setLog(l => [`Criatura "${creature.name}" adicionada ao combate!`, ...l]);
    setShowSelectCreature(false);
  };

  const rollAllInitiatives = () => {
    // Get unique combatants by internalId to prevent duplicates
    const uniqueCombatants: { [key: string]: CombatantState } = {};
    combatants.forEach(c => {
      uniqueCombatants[c.internalId] = c;
    });
    const unique = Object.values(uniqueCombatants);
    
    const updated = unique.map(c => {
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
      agent_id: `fake_${Date.now()}`,
      id: Date.now(),
      lastModified: new Date().toISOString(),
      character: {
        name: monsterForm.name,
        sequence: 9,
        player: 'NPC',
        avatarUrl: '',
        anotacoes: '',
        aparencia: '',
        personalidade: '',
        historico: '',
        objetivo: '',
        ancoras: '',
        nomeHonorifico: '',
        pathwayColor: '#888',
        dtRituais: 0,
        vitality: parseInt(monsterForm.hp,10),
        maxVitality: parseInt(monsterForm.hp,10),
        spirituality: 0,
        maxSpirituality: 0,
        willpower: 0,
        maxWillpower: 0,
        sanity: 0,
        maxSanity: 0,
        pa: 0,
        maxPa: 0,
        paDisponivel: 0,
        paTotalGasto: 0,
        purifiedDiceThisSequence: 0,
        assimilationDice: Number.POSITIVE_INFINITY,
        maxAssimilationDice: Number.POSITIVE_INFINITY,
        soulDice: 0,
        defense: 0,
        absorption: 0,
        initiative: 0,
        anchors: [],
        tempHpBonus: 0,
      },
      attributes: { forca: 3, destreza: 3, vigor: 2, carisma: 2, manipulacao: 2, autocontrole: 2, percepcao: 2, inteligencia: 2, raciocinio: 2, espiritualidade: 0 },
      habilidades: { gerais: [{ name: 'Armas Brancas', points: 2 }, { name: 'Prontidão', points: 2 }, { name: 'Esquiva', points: 1 }], investigativas: [] },
      attacks: [],
      protections: [],
      habilidadesBeyonder: [],
      rituais: [],
      inventory: [],
      artifacts: [],
      money: { libras: 0, soli: 0, pennies: 0 },
      antecedentes: [],
      afiliacoes: [],
      learnedParticles: [],
      customization: { useOpenDyslexicFont: false, avatarHealthy: '', avatarHurt: '', avatarDisturbed: '', avatarInsane: '' },
    };
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
    const result = resolveAttack(selected.agent, target?.agent || selected.agent, attackConfig);
    
    // apply damage to target hp only if target is selected
    if (target) {
      setCombatants(prev => prev.map(c => {
        if (c.internalId === target.internalId) {
          const newHp = Math.max(0, (c.hp || 0) - result.finalDamage);
          return { ...c, hp: newHp };
        }
        return c;
      }));
    }
    
    const summary = target
      ? `${selected.agent.character?.name} ataca ${target.agent.character?.name}: Sucessos Atq ${result.attackSuccesses}, Def ${result.defenseSuccesses}, Net ${result.netSuccesses}, Dano ${result.weaponDamage}, Abs ${result.absorptionSuccesses}, Final ${result.finalDamage}`
      : `${selected.agent.character?.name} testa ataque: Sucessos Atq ${result.attackSuccesses}, Dano ${result.weaponDamage}`;
    setLog(l => [summary, ...l]);
    
    // Show toast notification
    addLiveToast({
      type: result.netSuccesses > 0 ? 'success' : 'info',
      title: target ? 'Ataque' : 'Teste de Ataque',
      message: target
        ? `${result.attackSuccesses} vs ${result.defenseSuccesses} | Dano Final: ${result.finalDamage}`
        : `${result.attackSuccesses} sucessos | Dano: ${result.weaponDamage}`
    });
  };

  const performDefinedAttack = (attack: Attack) => {
    if (!selected) return;
    const target = combatants.find(c => c.internalId === attackTargetId);
    const opts = {
      attributeName: attack.attribute?.toLowerCase() || 'forca',
      skillName: attack.skill || 'Armas Brancas',
      secondaryAttribute: attack.secondaryAttribute?.toLowerCase(),
      extraBonus: attack.bonusAttack || 0,
      damageFormula: attack.damageFormula || '1d6 + sucessos'
    };
    const result = resolveAttack(selected.agent, target?.agent || selected.agent, opts);
    
    // apply damage to target hp only if target is selected
    if (target) {
      setCombatants(prev => prev.map(c => {
        if (c.internalId === target.internalId) {
          const newHp = Math.max(0, (c.hp || 0) - result.finalDamage);
          return { ...c, hp: newHp };
        }
        return c;
      }));
    }
    
    const summary = target
      ? `${selected.agent.character?.name} usa ${attack.name} em ${target.agent.character?.name}: Atq ${result.attackSuccesses} vs Def ${result.defenseSuccesses} (Net ${result.netSuccesses}) Dano ${result.weaponDamage} Abs ${result.absorptionSuccesses} Final ${result.finalDamage}`
      : `${selected.agent.character?.name} testa ${attack.name}: Atq ${result.attackSuccesses}, Dano ${result.weaponDamage}`;
    setLog(l => [summary, ...l]);
    
    // Show toast notification
    addLiveToast({
      type: result.netSuccesses > 0 ? 'success' : 'info',
      title: attack.name,
      message: target
        ? `${result.attackSuccesses} vs ${result.defenseSuccesses} | Dano: ${result.finalDamage}`
        : `${result.attackSuccesses} sucessos | Dano: ${result.weaponDamage}`
    });
  };

  const performSkillRoll = (skillName: string, skillTotal: number) => {
    if (!selected) return;
    const { rolls, successes } = rollDice(skillTotal);
    const summary = `${selected.agent.character?.name} rola ${skillName}: ${successes} sucesso(s) [${rolls.join(', ')}]`;
    setLog(l => [summary, ...l]);
    
    // Show toast notification
    addLiveToast({
      type: successes > 0 ? 'success' : 'info',
      title: `Teste de ${skillName}`,
      message: `${successes} sucesso(s) [${rolls.join(', ')}]`
    });
  };

  return (
    <div className="combat-manager">
      <SelectCreatureModal 
        isOpen={showSelectCreature}
        onSelect={handleSelectCreature}
        onClose={() => setShowSelectCreature(false)}
      />
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
          <div className="cm-monster-actions">
            <button type="button" className="primary" onClick={() => setShowSelectCreature(true)}>Importar Criatura Salva</button>
            <div className="cm-divider">ou</div>
          </div>
          <form onSubmit={addMonster}>
            <input placeholder="Nome" value={monsterForm.name} onChange={e => setMonsterForm(f => ({ ...f, name: e.target.value }))} />
            <div className="row">
              <input placeholder="PV" value={monsterForm.hp} onChange={e => setMonsterForm(f => ({ ...f, hp: e.target.value }))} />
              <input placeholder="Dano" value={monsterForm.damage} onChange={e => setMonsterForm(f => ({ ...f, damage: e.target.value }))} />
            </div>
            <button type="submit">Adicionar Manual</button>
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

            {/* Tabs */}
            <div className="cm-sheet-tabs">
              <button 
                className={`cm-tab ${activeSheetTab === 'status' ? 'active' : ''}`}
                onClick={() => setActiveSheetTab('status')}
              >
                STATUS
              </button>
              <button 
                className={`cm-tab ${activeSheetTab === 'combate' ? 'active' : ''}`}
                onClick={() => setActiveSheetTab('combate')}
              >
                COMBATE
              </button>
              <button 
                className={`cm-tab ${activeSheetTab === 'descricao' ? 'active' : ''}`}
                onClick={() => setActiveSheetTab('descricao')}
              >
                DESCRIÇÃO
              </button>
            </div>

            {/* Tab Content */}
            <div className="cm-sheet-content">
              {/* STATUS TAB */}
              {activeSheetTab === 'status' && (
                <div className="cm-tab-content">
                  <div className="cm-bars">
                    <div className="cm-bar"><div className="cm-bar-label">PV</div><div className="cm-bar-track"><div className="cm-bar-fill hp" style={{width: `${(selected.hp||0)/(selected.maxHp||1)*100}%`}}></div></div><div className="cm-bar-value">{selected.hp}/{selected.maxHp}</div></div>
                    <div className="cm-bar"><div className="cm-bar-label">SAN</div><div className="cm-bar-track"><div className="cm-bar-fill san" style={{width: `${(selected.san||0)/(selected.maxSan||1 || 1)*100}%`}}></div></div><div className="cm-bar-value">{selected.san}/{selected.maxSan}</div></div>
                    <div className="cm-bar"><div className="cm-bar-label">PE</div><div className="cm-bar-track"><div className="cm-bar-fill pe" style={{width: `${(selected.pe||0)/(selected.maxPe||1)*100}%`}}></div></div><div className="cm-bar-value">{selected.pe}/{selected.maxPe}</div></div>
                  </div>

                  <div className="cm-section-title">Atributos</div>
                  <div className="cm-attributes-grid">
                    {Object.entries(selected.agent.attributes || {}).map(([k,v]) => (
                      <div key={k} className="cm-attr-box"><div className="attr-label">{k.toUpperCase()}</div><div className="attr-value">{v as any}</div></div>
                    ))}
                  </div>

                  {selected.agent.habilidades?.gerais && selected.agent.habilidades.gerais.length > 0 && (
                    <>
                      <div className="cm-section-title">Perícias (Testes)</div>
                      <div className="cm-skills-grid">
                        {selected.agent.habilidades.gerais.map((skill: any) => {
                          const attrName = skill.attr.split('/')[0];
                          const normalizedAttr = attrName.toLowerCase();
                          const attrValue = selected.agent.attributes?.[normalizedAttr as keyof any] || 0;
                          const total = skill.points + attrValue;
                          return (
                            <div key={skill.name} className="cm-skill-box" title={`${skill.name}: ${skill.points}pts + ${attrName}(${attrValue}) = ${total}`}>
                              <div className="skill-label">{skill.name.toUpperCase()}</div>
                              <div className="skill-value">{total}</div>
                              <button 
                                className="cm-skill-roll-btn"
                                onClick={() => performSkillRoll(skill.name, total)}
                                title="Rolar perícia"
                              >
                                🎲
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* COMBATE TAB */}
              {activeSheetTab === 'combate' && (
                <div className="cm-tab-content">
                  <div className="cm-abilities-section">
                    <h4>Poderes & Habilidades</h4>
                    {(() => {
                      // Personagens com habilidades Beyonder
                      if (selected.agent.habilidadesBeyonder && selected.agent.habilidadesBeyonder.length > 0) {
                        return (
                          <div className="cm-abilities-list">
                            {selected.agent.habilidadesBeyonder.map((poder: any, idx: number) => (
                              <div key={`poder-${idx}`} className="cm-ability-item">
                                <div>
                                  <span className="ability-name">{poder.name}</span>
                                  {poder.seqName && <span style={{ fontSize: '.65rem', color: '#999', marginLeft: '.5rem' }}>({poder.seqName})</span>}
                                  <div className="ability-desc">{poder.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Criaturas com abilities
                      if (selected.agent.data?.creatureAbilities && selected.agent.data.creatureAbilities.length > 0) {
                        return (
                          <div className="cm-abilities-list">
                            {selected.agent.data.creatureAbilities.map((ability: any, idx: number) => (
                              <div key={`creature-ability-${idx}`} className="cm-ability-item">
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span className="ability-name">{ability.name}</span>
                                    <span className="ability-action">{ability.actionType}</span>
                                  </div>
                                  <div className="ability-desc">{ability.description}</div>
                                  {ability.effects && <div className="ability-effects">Efeitos: {ability.effects}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Sem habilidades
                      return <div style={{ color: '#999', fontSize: '.75rem' }}>Sem poderes ou habilidades</div>;
                    })()}
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
                            <button type="button" onClick={() => performDefinedAttack(atk)}>Atacar</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cm-attack-form quick">
                        <input placeholder="Atributo" value={attackConfig.attributeName} onChange={e => setAttackConfig(cfg => ({ ...cfg, attributeName: e.target.value }))} />
                        <input placeholder="Perícia" value={attackConfig.skillName} onChange={e => setAttackConfig(cfg => ({ ...cfg, skillName: e.target.value }))} />
                        <input placeholder="Dano" value={attackConfig.damageFormula} onChange={e => setAttackConfig(cfg => ({ ...cfg, damageFormula: e.target.value }))} />
                        <button type="button" onClick={performAttack}>Atacar Rápido</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DESCRIÇÃO TAB */}
              {activeSheetTab === 'descricao' && (
                <div className="cm-tab-content">
                  <div style={{ padding: '1rem' }}>
                    {selected.agent.character?.anotacoes && (
                      <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#8e43ff', fontSize: '.85rem' }}>Anotações</h5>
                        <p style={{ margin: '0 0 1rem 0', color: '#ddd', fontSize: '.75rem', lineHeight: '1.5' }}>
                          {selected.agent.character.anotacoes}
                        </p>
                      </div>
                    )}
                    {selected.agent.data?.description && (
                      <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#8e43ff', fontSize: '.85rem' }}>Descrição</h5>
                        <p style={{ margin: '0', color: '#ddd', fontSize: '.75rem', lineHeight: '1.5' }}>
                          {selected.agent.data.description}
                        </p>
                      </div>
                    )}
                    {!selected.agent.character?.anotacoes && !selected.agent.data?.description && (
                      <div style={{ color: '#999', fontSize: '.75rem' }}>Sem descrição</div>
                    )}
                  </div>
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
