import React, { useState, useEffect } from 'react';
import { AgentData, Attack, Attributes, LearnedParticle } from '../../types.ts';
import { magicData } from '../../data/magic-data.tsx';
import { FUNCOES, OBJETOS, CARACTERISTICAS, COMPLEMENTOS, CRIADORES, MagicParticle, getParticleType } from '../../data/magic-particles';

interface CreateMagicAttackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAttack: (attack: Attack) => void;
    agent: AgentData;
    learnedParticles?: LearnedParticle[];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const CreateMagicAttackModal: React.FC<CreateMagicAttackModalProps> = ({ isOpen, onClose, onAddAttack, agent, learnedParticles = [] }) => {
    const [selectedFuncao, setSelectedFuncao] = useState<LearnedParticle | null>(null);
    const [selectedObjeto, setSelectedObjeto] = useState<LearnedParticle | null>(null);
    const [selectedCaracteristica, setSelectedCaracteristica] = useState<LearnedParticle | null>(null);
    const [selectedComplement, setSelectedComplement] = useState<MagicParticle | null>(null);
    const [selectedCreator, setSelectedCreator] = useState<MagicParticle | null>(null);
    
    // New state for demigod attribute selection
    const [selectedRelevantAttribute, setSelectedRelevantAttribute] = useState<keyof Attributes>('espiritualidade');

    // Check if modal is open before processing
    if (!isOpen) return null;

    const { character, attributes } = agent;
    const isDemigod = character.sequence <= 4;

    // Use learnedParticles prop when provided, otherwise fallback to agent.learnedParticles
    let effectiveLearned = (Array.isArray(learnedParticles) && learnedParticles.length > 0)
        ? learnedParticles
        : (agent?.learnedParticles || []);

    // MIGRATION: Convert old type format (domain, universal) to new format (Função, Objeto, Característica)
    effectiveLearned = effectiveLearned.map((p: any) => {
        // If type is already correct (Função, Objeto, Característica), keep it
        if (p.type === 'Função' || p.type === 'Objeto' || p.type === 'Característica') {
            return p;
        }

        // If type is old format (domain, universal), try to map it
        if (p.type === 'domain' || p.type === 'universal') {
            // Try to find the type by looking up the particle name
            const particleType = getParticleType(p.name);
            if (particleType) {
                return { ...p, type: particleType };
            }
            // Fallback: guess based on common patterns
            console.warn(`[MIGRATION] Could not determine type for particle: ${p.name}`);
            return p;
        }

        return p;
    });

    // Filter and log for debugging
    const learnedFunctions = effectiveLearned.filter((p: any) => p.type === 'Função');
    const learnedObjects = effectiveLearned.filter((p: any) => p.type === 'Objeto');
    const learnedCharacteristics = effectiveLearned.filter((p: any) => p.type === 'Característica');
    // Complements and creators are global and optional
    const complements = COMPLEMENTOS;
    const creators = CRIADORES;

    // Diagnostic info
    const hasAnyParticles = effectiveLearned.length > 0;
    const hasAnyLearnedParticles = learnedFunctions.length > 0 || learnedObjects.length > 0 || learnedCharacteristics.length > 0;

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFuncao(null);
            setSelectedObjeto(null);
            setSelectedCaracteristica(null);
            setSelectedRelevantAttribute('espiritualidade');
        }
    }, [isOpen]);

    // Debug: log learnedParticles when modal opens
    useEffect(() => {
        if (isOpen) {
            try {
                console.group('CreateMagicAttackModal DEBUG - Detailed');
                console.log('=== INPUTS ===');
                console.log('learnedParticles (prop):', learnedParticles);
                console.log('agent.learnedParticles:', agent?.learnedParticles);
                
                console.log('\n=== PROCESSING ===');
                console.log('Using prop?', Array.isArray(learnedParticles) && learnedParticles.length > 0);
                console.log('effectiveLearned length:', effectiveLearned.length);
                console.log('effectiveLearned:', effectiveLearned);
                
                console.log('\n=== FILTERED RESULTS ===');
                console.log('learnedFunctions:', learnedFunctions);
                console.log('learnedObjects:', learnedObjects);
                console.log('learnedCharacteristics:', learnedCharacteristics);
                
                if (learnedFunctions.length === 0 && learnedObjects.length === 0 && learnedCharacteristics.length === 0) {
                    console.warn('⚠️ NENHUMA PARTÍCULA ENCONTRADA!');
                    console.log('Partículas disponíveis no effectiveLearned:');
                    effectiveLearned.forEach((p, i) => {
                        console.log(`  [${i}]`, { name: p.name, type: p.type, palavra: p.palavra });
                    });
                }
                console.groupEnd();
            } catch (err) {
                console.error('Error logging learnedParticles', err);
            }
        }
    }, [isOpen, learnedParticles, agent?.learnedParticles, effectiveLearned, learnedFunctions, learnedObjects, learnedCharacteristics]);

    const getDamageDie = () => {
        if (!selectedCaracteristica) return 'd4';
        const characteristicData = Object.values(magicData.caracteristicas)
            .flat()
            .find(c => c.nome === selectedCaracteristica.name);
        return characteristicData?.die || 'd6';
    };

    const handleCreateAttack = () => {
        if (!selectedFuncao || !selectedObjeto) {
            alert('Selecione ao menos uma Função e um Objeto.');
            return;
        }

        const nameParts = [
            selectedCreator ? (selectedCreator.name + ' ') : '',
            selectedFuncao.palavra || selectedFuncao.name,
            selectedCaracteristica ? (selectedCaracteristica.palavra || selectedCaracteristica.name) : null,
            selectedObjeto.palavra || selectedObjeto.name,
            selectedComplement ? `(${selectedComplement.name})` : ''
        ];
        const name = nameParts.filter(Boolean).join(' ');
        
        let newAttack: Attack;

        if (isDemigod) {
            // Tecelagem Arcana
            newAttack = {
                id: Date.now(),
                name: name,
                palavra: `${selectedFuncao.palavra || selectedFuncao.name} ${selectedObjeto.palavra || selectedObjeto.name}`,
                damageFormula: `Espiritualidade + ${getDamageDie()}`,
                quality: 'Comum',
                specialQualities: `Mágico, Tecelagem Arcana, ${selectedCaracteristica?.name || 'Arcano'}`,
                enhancements: '',
                skill: 'Tecelagem Arcana', // Skill is not used for dice pool, just for flavor
                attribute: 'espiritualidade',
                secondaryAttribute: selectedRelevantAttribute, // Store the dynamic attribute name
                bonusAttack: 0, // Bonus is now dynamic
                range: '30m',
                ammo: 0,
                maxAmmo: 0,
            };
        } else {
            // Inscrição Arcana
            newAttack = {
                id: Date.now(),
                name: name,
                palavra: `${selectedFuncao.palavra || selectedFuncao.name} ${selectedObjeto.palavra || selectedObjeto.name}`,
                damageFormula: `Inteligência + ${getDamageDie()}`,
                quality: 'Comum',
                specialQualities: `Mágico, Inscrição (Ritual), ${selectedCaracteristica?.name || 'Arcano'}`,
                enhancements: '',
                skill: 'Ocultismo (Híbrida)',
                attribute: 'inteligencia',
                bonusAttack: 0,
                range: '30m',
                ammo: 0,
                maxAmmo: 0,
            };
        }
        
        onAddAttack(newAttack);
        onClose();
    };

    const renderLearnedSelector = (title: string, items: LearnedParticle[], selected: LearnedParticle | null, setter: (item: LearnedParticle | null) => void) => (
        <div className="magic-creator-column">
            <h4>{title}</h4>
            <div className="particle-selector">
                {items.map((item, idx) => {
                    // Use name + type as unique key since id might not be reliable
                    const isSelected = selected && selected.name === item.name && selected.type === item.type;
                    return (
                        <button 
                            key={`${item.type}-${item.name}-${idx}`}
                            className={`particle-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => setter(isSelected ? null : item)}
                            title={item.description}
                        >
                            {item.name} {item.palavra ? `(${item.palavra})` : ''}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderGlobalSelector = (title: string, items: MagicParticle[], selected: MagicParticle | null, setter: (item: MagicParticle | null) => void) => (
        <div className="magic-creator-column">
            <h4>{title}</h4>
            <div className="particle-selector">
                {items.map(item => (
                    <button 
                        key={item.id} 
                        className={`particle-btn ${selected?.id === item.id ? 'active' : ''}`}
                        onClick={() => setter(item.id === selected?.id ? null : item)}
                        title={item.description}
                    >
                        {item.name} ({item.id})
                    </button>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">Criar Ataque Mágico</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>

                <div className={`magic-creator-grid ${'extended'}`}>
                    {!hasAnyLearnedParticles ? (
                        <div style={{ gridColumn: '1 / -1', padding: '1rem 0', color: 'var(--secondary-text-color)' }}>
                            {hasAnyParticles ? (
                                <>
                                    <p>⚠️ Partículas encontradas, mas nenhuma com tipo válido:</p>
                                    <ul style={{ fontSize: '0.85rem', marginLeft: '1rem' }}>
                                        {effectiveLearned.map((p: any, i) => (
                                            <li key={i}>{p.name} (type: {p.type || 'undefined'})</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p>Nenhuma partícula aprendida encontrada. Abra o Grimório e adicione partículas para que apareçam aqui.</p>
                            )}
                        </div>
                    ) : null}

                    {renderLearnedSelector('1. FUNÇÃO', learnedFunctions, selectedFuncao, setSelectedFuncao)}
                    {renderLearnedSelector('2. OBJETO', learnedObjects, selectedObjeto, setSelectedObjeto)}
                    {renderLearnedSelector('3. CARACTERÍSTICA (OPCIONAL)', learnedCharacteristics, selectedCaracteristica, setSelectedCaracteristica)}
                    {renderGlobalSelector('4. COMPLEMENTO (OPCIONAL)', complements, selectedComplement, setSelectedComplement)}
                    {renderGlobalSelector('5. CRIADOR (OPCIONAL)', creators, selectedCreator, setSelectedCreator)}
                </div>

                <div className="magic-method-summary">
                    {isDemigod ? (
                        <>
                            <h4>Método de Conjuração: Tecelagem Arcana (Ação Instantânea)</h4>
                            <p>Teste de Ativação: Espiritualidade + {capitalize(selectedRelevantAttribute)}</p>
                            <div className="form-group">
                                <label htmlFor="relevant-attribute-select">Atributo Relevante:</label>
                                <select 
                                    id="relevant-attribute-select" 
                                    value={selectedRelevantAttribute}
                                    onChange={e => setSelectedRelevantAttribute(e.target.value as keyof Attributes)}
                                >
                                    {Object.keys(attributes).map(attr => (
                                        <option key={attr} value={attr}>{capitalize(attr)}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <h4>Método de Conjuração: Inscrição Arcana (Ritual)</h4>
                            <p>Teste de Ativação: Inteligência + Ocultismo</p>
                        </>
                    )}
                </div>

                        <div className="modal-footer">
                            <button onClick={handleCreateAttack} disabled={!selectedFuncao || !selectedObjeto}>
                                Criar Ataque
                            </button>
                        </div>
            </div>
        </div>
    );
};