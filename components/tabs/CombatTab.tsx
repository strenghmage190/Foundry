import React, { useState } from 'react';
import { AgentData, Attack, ToastData, ProtectionItem } from '../../types';
import { initialHabilidadesState } from '../../constants.ts';
import { rollDice, rollDamage } from '../../utils/diceRoller.ts';
import { getInitiativePool, getAbsorptionPool } from '../../utils/calculations';
import { DiceIcon, EditIcon } from '../icons.tsx';

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

interface CombatTabProps {
    agent: AgentData;
    onUpdate: (updatedAgent: Partial<AgentData>) => void;
    addLiveToast: (toast: Omit<ToastData, 'id'>) => void;
    addLogEntry: (log: Omit<ToastData, 'id'>) => void;
    onOpenAddWeaponModal: (attack?: Attack) => void;
    onOpenAddProtectionModal: () => void;
    onOpenMagicCreator: () => void;
    onRollRequest: (event: React.MouseEvent, name: string, pool: number, rollType: 'skill' | 'absorption', meta?: any) => void;
    onDirectRoll: (name: string, pool: number) => void;
}

export const CombatTab: React.FC<CombatTabProps> = ({ agent, onUpdate, addLiveToast, addLogEntry, onOpenAddWeaponModal, onOpenAddProtectionModal, onOpenMagicCreator, onRollRequest, onDirectRoll }) => {
    const [editingAttack, setEditingAttack] = useState<Attack | null>(null);
    const [openAttackId, setOpenAttackId] = useState<string | null>(null);

    if (!agent || !agent.character) return null;

    const { attacks = [], protections = [], character } = agent;
    const attributes = agent.attributes || ({} as any);
    const habilidades = agent.habilidades || initialHabilidadesState;

    const onAttacksChange = (newAttacks: Attack[]) => onUpdate({ attacks: newAttacks });
    const onProtectionsChange = (newProtections: ProtectionItem[]) => onUpdate({ protections: newProtections });
    const onCharacterChange = (field: keyof AgentData['character'], value: any) => onUpdate({ character: { ...character, [field]: value }});

    const handleDeleteAttack = (id: string) => {
        if (window.confirm("Tem certeza que deseja apagar este ataque?")) {
            onAttacksChange(attacks.filter(attack => attack.id !== id));
        }
    };

    const handleDeleteProtection = (id: number) => {
        onProtectionsChange(protections.filter(p => p.id !== id));
    };

    const handleEquipProtection = (id: number) => {
        const newProtections = protections.map(p => ({
            ...p,
            isEquipped: p.id === id ? !p.isEquipped : p.isEquipped // Permite múltiplas equipadas
        }));
        onProtectionsChange(newProtections);
    };
    
    const getAttributeValue = (attrName: string) => {
        if (!attrName) return 0;
        return (attributes as any)[attrName.toLowerCase() as keyof typeof attributes] || 0;
    };

    const getSkillValue = (skillName: string) => {
        if (!skillName) return 0;
        const skill = [...(habilidades.gerais || []), ...(habilidades.investigativas || [])].find(s => s.name === skillName);
        return skill ? skill.points : 0;
    };

    const getQualityBonus = (quality: Attack['quality']) => {
        if (quality === 'Superior') return 1;
        if (quality === 'Obra-Prima') return 2;
        return 0;
    };

    const handleRollAttack = (attack: Attack) => {
        const attrValue = getAttributeValue(attack.attribute);
        const skillValue = getSkillValue(attack.skill);
        const qualityBonus = getQualityBonus(attack.quality);
        const secondaryAttrValue = attack.secondaryAttribute ? getAttributeValue(attack.secondaryAttribute) : 0;
    
        const pool = attrValue + skillValue + attack.bonusAttack + qualityBonus + secondaryAttrValue;
        
        const { rolls, successes } = rollDice(pool);
        const damageResult = rollDamage(attack.damageFormula, successes);

        // Combine damage dice with successes if the formula doesn't already include 'sucessos'
        const formulaIncludesSuccesses = /sucessos/i.test(attack.damageFormula || '');
        const baseDamageTotal = damageResult?.total ?? 0;
        const totalDamage = baseDamageTotal + (formulaIncludesSuccesses ? 0 : successes);
        const damageBreakdown = `${damageResult?.breakdown ?? ''}${formulaIncludesSuccesses ? '' : ` | + Sucessos: ${successes} = ${totalDamage}`}`;
        const damageObj = { total: totalDamage, breakdown: damageBreakdown };

        let breakdown = `Parada: ${pool} (`;
        const breakdownParts = [];
        if (attack.attribute) breakdownParts.push(`${capitalize(attack.attribute)} ${attrValue}`);
        if (attack.skill && getSkillValue(attack.skill) > 0) breakdownParts.push(`Perícia ${skillValue}`);
        if (attack.bonusAttack > 0) breakdownParts.push(`Bônus ${attack.bonusAttack}`);
        if (qualityBonus > 0) breakdownParts.push(`Qualidade ${qualityBonus}`);
        if (attack.secondaryAttribute) breakdownParts.push(`${capitalize(attack.secondaryAttribute)} ${secondaryAttrValue}`);
        breakdown += breakdownParts.join(' + ') + ')';
    
        const resultType = successes > 0 ? 'success' : 'failure';
        const title = attack.name;
        const message = `${successes} sucesso(s) | Dano: ${damageObj.total ?? '–'}`;
        const details = `${breakdown}\nRolagem: [${rolls.join(', ')}]\nDano: ${damageObj.breakdown ?? 'N/A'}`;

        addLiveToast({ type: resultType, title, message, rollInfo: { rolls, successes, damage: damageObj } });
        addLogEntry({ type: resultType, title, message, details, damage: damageObj.total ?? null, rollInfo: { rolls, successes, damage: damageObj } });
    };

    const handleFuryUpdate = (value: number) => {
        onCharacterChange('furyPoints', Math.max(0, value));
    };

    const prontidaoSkill = (habilidades.gerais || []).find(s => s.name === 'Prontidão') || { points: 0 };
    const initiativePool = getInitiativePool(agent);
    const absorptionPool = getAbsorptionPool(agent);

    return (
        <div>
            {/* --- SEÇÃO DE PROTEÇÃO --- */}
            <div className="tab-header">
                <h4 className="section-title">Status de Combate</h4>
                <button onClick={onOpenAddProtectionModal}>+ Adicionar Proteção</button>
            </div>
            <div className="combat-summary-grid">
                <div className="stat-box">
                    <div className="stat-box-header-with-roll">
                        <h4>Parada de Iniciativa Total</h4>
                        <button className="inline-roll-btn" onClick={() => onDirectRoll('Rolagem de Iniciativa', initiativePool)} aria-label="Rolar Iniciativa">
                            <DiceIcon />
                        </button>
                    </div>
                    <p className="calculated-value">{initiativePool} dados</p>
                    <small>(Percepção {attributes.percepcao ?? 0} + Prontidão {prontidaoSkill.points})</small>
                </div>
                <div className="stat-box">
                    <div className="stat-box-header-with-roll">
                        <h4>Parada de Absorção Total</h4>
                        <button className="inline-roll-btn" onClick={(e) => onRollRequest(e, 'Rolagem de Absorção', absorptionPool, 'absorption')} aria-label="Rolar Absorção">
                            <DiceIcon />
                        </button>
                    </div>
                    <p className="calculated-value">{absorptionPool} dados</p>
                    <small>(Vigor {attributes.vigor ?? 0} + Bônus de Armadura)</small>
                </div>
            </div>
            <div className="tab-list">
                {protections.map(p => (
                    <div key={p.id} className={`tab-list-item protection-card ${p.isEquipped ? 'equipped' : ''}`}>
                        <div className="item-header">
                            <h5 className="item-header-title">{p.name}</h5>
                            <button onClick={() => handleDeleteProtection(p.id)}>&times;</button>
                        </div>
                        <div className="protection-details">
                            <span>Bônus de Armadura: +{p.armorBonus}</span>
                            <span>Qualidades: {p.qualities || 'Nenhuma'}</span>
                        </div>
                        <button className="equip-btn" onClick={() => handleEquipProtection(p.id)}>
                            {p.isEquipped ? 'Desequipar' : 'Equipar'}
                        </button>
                    </div>
                ))}
            </div>

            {/* --- RESTORED FURY TRACKER SECTION --- */}
            {(() => {
                const pathways = agent.character.pathways 
                    ? [agent.character.pathways.primary, ...agent.character.pathways.secondary]
                    : (Array.isArray(agent.character.pathway) ? agent.character.pathway : [agent.character.pathway]);
                return pathways.includes('CAMINHO DO TIRANO');
            })() && (
                <div className="pathway-mechanic-section" style={{ marginTop: '2rem' }}>
                    <h4 className="section-title">Fúria da Tempestade</h4>
                    <div className="mechanic-widget">
                        <label>Pontos de Fúria</label>
                        <div className="mechanic-counter">
                            <button onClick={() => handleFuryUpdate((character.furyPoints || 0) - 1)}>-</button>
                            <input
                                type="number"
                                value={character.furyPoints || 0}
                                onChange={e => handleFuryUpdate(Number(e.target.value))}
                            />
                            <button onClick={() => handleFuryUpdate((character.furyPoints || 0) + 1)}>+</button>
                        </div>
                    </div>
                    <div className="mechanic-info" style={{textAlign: 'left', marginTop: '1rem'}}>
                        <p>Ganha 1 Ponto de Fúria para cada 5 de vida perdida. Gaste para adicionar +2 de dano por ponto.</p>
                    </div>
                </div>
            )}


            {/* --- SEÇÃO DE ARSENAL --- */}
            <div className="tab-header" style={{ marginTop: '2rem' }}>
                <h4 className="section-title">Arsenal</h4>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button onClick={onOpenMagicCreator}>+ Criar Magia</button>
                    <button onClick={() => onOpenAddWeaponModal(undefined)}>+ Adicionar Arma</button>
                </div>
            </div>
            <div className="tab-list">
                {attacks.map(attack => {
                    const attrValue = getAttributeValue(attack.attribute);
                    const skillValue = getSkillValue(attack.skill);
                    const qualityBonus = getQualityBonus(attack.quality);
                    const secondaryAttrValue = attack.secondaryAttribute ? getAttributeValue(attack.secondaryAttribute) : 0;
                    const attackPool = attrValue + skillValue + attack.bonusAttack + qualityBonus + secondaryAttrValue;
                    const isOpen = openAttackId === attack.id;

                    return (
                        <div key={attack.id} className={`tab-list-item weapon-card ${isOpen ? 'expanded' : 'collapsed'}`}>
                            <div className="weapon-header item-header" onClick={() => setOpenAttackId(isOpen ? null : attack.id)}>
                                <div className="item-header-title">
                                    <span className="weapon-title">{attack.name}</span>
                                    <div className="weapon-sub">Dano: <strong>{attack.damageFormula}</strong> · Crítico: x2</div>
                                </div>
                                <div className="header-controls">
                                    <button className="skill-roll-btn" onClick={(e) => { e.stopPropagation(); onRollRequest(e, attack.name, attackPool, 'skill', { isAttack: true, damageFormula: attack.damageFormula, attackId: attack.id }); }} aria-label="Rolar Ataque">
                                        <DiceIcon />
                                    </button>
                                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onOpenAddWeaponModal(attack); }} title="Editar ataque" aria-label="Editar ataque">
                                        <EditIcon />
                                    </button>
                                    {attack.palavra && (
                                        <div className="attack-pronunciation" title={`Pronúncia: ${attack.palavra}`} style={{marginLeft: '0.5rem', color: '#d0d0d0', fontSize: '0.9rem'}}>
                                            {attack.palavra}
                                        </div>
                                    )}
                                    <span className={`chev ${isOpen ? 'open' : ''}`}></span>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="weapon-body">
                                    <div className="weapon-stats">
                                        <div className="stat-block">
                                            <span className="stat-label">Parada de Ataque</span>
                                            <span className="stat-value">{attackPool}</span>
                                        </div>
                                        <div className="stat-block">
                                            <span className="stat-label">Dano</span>
                                            <span className="stat-value">{attack.damageFormula} + Sucessos</span>
                                        </div>
                                    </div>
                                    <div className="weapon-qualities">
                                        <strong>Qualidades:</strong> {attack.specialQualities || 'Nenhuma'}
                                    </div>
                                    {attack.enhancements && (
                                        <div className="weapon-enhancements">
                                            <strong>Aprimoramentos:</strong> {attack.enhancements}
                                        </div>
                                    )}
                                    <div className="weapon-actions">
                                        <button className="link-btn remove-link" onClick={() => handleDeleteAttack(attack.id)}>Remover</button>
                                        <button className="link-btn edit-link" onClick={() => onOpenAddWeaponModal(attack)}>Editar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};