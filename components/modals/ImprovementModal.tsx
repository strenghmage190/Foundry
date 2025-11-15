import React, { useState, useEffect, useMemo } from 'react';
import { AgentData, Attributes, BeyonderAbility, Antecedente, SequenceAbility, ToastData, Habilidade } from '../../types';
import { caminhosData } from '../../data/beyonders-data';
import { paRequirementsBySequence, initialAgentData } from '../../constants';

interface ImprovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentData;
    onUpdateAgent: (updatedAgent: AgentData) => void;
    addLiveToast: (toast: Omit<ToastData, 'id'>) => void;
}

type ImprovementTab = 'Atributos' | 'Perícias' | 'Habilidades' | 'Antecedentes' | 'Digestão & Avanço';

const getAbilityCost = (seqNum: number): number => {
    if (seqNum >= 6 && seqNum <= 9) return 15;
    if (seqNum >= 2 && seqNum <= 5) return 30;
    if (seqNum === 1) return 50;
    return 999;
};

const ANTECEDENTE_COST = 3;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const ImprovementModal: React.FC<ImprovementModalProps> = ({ isOpen, onClose, agent, onUpdateAgent, addLiveToast }) => {
    const [currentAgent, setCurrentAgent] = useState<AgentData>(() => JSON.parse(JSON.stringify(agent || initialAgentData)));
    const [paSpent, setPaSpent] = useState(0);
    const [activeTab, setActiveTab] = useState<ImprovementTab>('Atributos');
    const [selectedFreeAbilityName, setSelectedFreeAbilityName] = useState<string | null>(null);
    const [isAddingAntecedente, setIsAddingAntecedente] = useState(false);
    const [newAntecedenteName, setNewAntecedenteName] = useState('');

    const safeCharacter = agent?.character || initialAgentData.character;
    const safeHabilidadesBeyonder = agent?.habilidadesBeyonder || [];
    const { paDisponivel, paTotalGasto, sequence } = safeCharacter;
    const isEligibleForFreebie = !(safeCharacter.claimedFreeAbilitiesForSequences?.includes(safeCharacter.sequence));
    
    // Updated Digestion Logic
    const targetPa = paRequirementsBySequence[sequence] || 999;
    const digestaoProgressoAtual = (paTotalGasto || 0) + (paDisponivel || 0);
    const canAdvance = digestaoProgressoAtual >= targetPa;
    const progressPercent = targetPa > 0 ? Math.min(100, (digestaoProgressoAtual / targetPa) * 100) : 0;
    
    const hasChanges = paSpent > 0;

    const pathwayData = useMemo(() => safeCharacter.pathway ? caminhosData[safeCharacter.pathway] : undefined, [safeCharacter.pathway]);

    useEffect(() => {
        if (isOpen) {
            setCurrentAgent(JSON.parse(JSON.stringify(agent)));
            setPaSpent(0);
            setIsAddingAntecedente(false);
            setNewAntecedenteName('');
            setSelectedFreeAbilityName(null);
            setActiveTab(isEligibleForFreebie ? 'Habilidades' : 'Atributos');
        }
    }, [isOpen, agent, isEligibleForFreebie]);
    
    const availablePA = (safeCharacter.paDisponivel || 0) - paSpent;

    const handleAdvanceSequence = () => {
        if (!canAdvance) return;
        const currentSeq = agent.character.sequence;
        if (currentSeq <= 1) return;

        let sanityLoss = 1;
        if (currentSeq === 9) sanityLoss = 0; 
        if (currentSeq === 3 || currentSeq === 2) sanityLoss = 2; 

        const newMaxSanity = agent.character.maxSanity - sanityLoss;
        
        const updatedAgent: AgentData = {
            ...agent,
            character: {
                ...agent.character,
                sequence: currentSeq - 1,
                assimilationDice: agent.character.assimilationDice + 4,
                maxAssimilationDice: agent.character.maxAssimilationDice + 4,
                paTotalGasto: 0,
                purifiedDiceThisSequence: 0,
                maxSanity: newMaxSanity,
                sanity: Math.min(newMaxSanity, agent.character.sanity),
                claimedFreeAbilitiesForSequences: agent.character.claimedFreeAbilitiesForSequences?.filter(s => s !== currentSeq -1) || []
            },
        };
        onUpdateAgent(updatedAgent);
        
        addLiveToast({
            type: 'success',
            title: 'Avanço de Sequência!',
            message: `Você avançou para a Sequência ${currentSeq - 1}! Ganhou 4 Dados de Assimilação.`
        });
        
        onClose();
    };
    
    const handleConfirm = () => {
        const newTotalSpent = agent.character.paTotalGasto + paSpent;
        
        const finalAgentData: AgentData = {
            ...currentAgent,
            character: {
                ...currentAgent.character,
                paDisponivel: availablePA,
                paTotalGasto: newTotalSpent,
            },
        };
        onUpdateAgent(finalAgentData);
        onClose();
    };

    const handleConfirmFreeChoice = () => {
        if (!selectedFreeAbilityName) return;
        const abilityToAdd = availableAbilitiesForFreeChoice.find(a => a.name === selectedFreeAbilityName);
        if (!abilityToAdd) return;
        
        const newAbility: BeyonderAbility = { ...abilityToAdd, id: Date.now(), acquisitionMethod: 'free', description: abilityToAdd.desc };
        const updatedAgent: AgentData = {
            ...agent,
            habilidadesBeyonder: [...agent.habilidadesBeyonder, newAbility],
            character: {
                ...agent.character,
                claimedFreeAbilitiesForSequences: [...(agent.character.claimedFreeAbilitiesForSequences || []), agent.character.sequence]
            }
        };
        onUpdateAgent(updatedAgent);
        onClose();
    };

    const handleSelectFreeAbility = (abilityName: string) => {
        setSelectedFreeAbilityName(prev => (prev === abilityName ? null : abilityName));
    };
    
    const handleAttributeIncrease = (attr: keyof Attributes, cost: number) => {
        setPaSpent(prev => prev + cost);
        setCurrentAgent(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attr]: (prev.attributes[attr] as number) + 1
            }
        }));
    };
    
    const handleSkillIncrease = (type: 'gerais' | 'investigativas', skillName: string, cost: number) => {
        setPaSpent(prev => prev + cost);
        setCurrentAgent(prev => {
            const newSkills = { ...prev.habilidades };
            const list = newSkills[type].map(s => s.name === skillName ? { ...s, points: s.points + 1 } : s);
            return { ...prev, habilidades: { ...newSkills, [type]: list } };
        });
    };

    const handleAntecedenteIncrease = (id: number, cost: number) => {
        setPaSpent(prev => prev + cost);
        setCurrentAgent(prev => ({
            ...prev,
            antecedentes: prev.antecedentes.map(a => a.id === id ? { ...a, points: a.points + 1 } : a)
        }));
    };
    
    const handleAddAntecedente = () => {
        const trimmedName = newAntecedenteName.trim();
        if (!trimmedName || availablePA < ANTECEDENTE_COST) return;

        setPaSpent(prev => prev + ANTECEDENTE_COST);
        const newAntecedente: Antecedente = { id: Date.now(), name: trimmedName, description: '', points: 1 };
        setCurrentAgent(prev => ({ ...prev, antecedentes: [...prev.antecedentes, newAntecedente] }));
        
        setIsAddingAntecedente(false);
        setNewAntecedenteName('');
    };

    const handleBuyAbility = (ability: { name: string; desc: string; seqName: string; }, cost: number) => {
        setPaSpent(prev => prev + cost);
        const newAbility: BeyonderAbility = {
            id: Date.now(),
            name: ability.name,
            description: ability.desc,
            seqName: ability.seqName,
            acquisitionMethod: 'purchased'
        };
        setCurrentAgent(prev => ({...prev, habilidadesBeyonder: [...prev.habilidadesBeyonder, newAbility]}));
    };

    const availableAbilitiesForPurchase = useMemo(() => {
        if (!pathwayData) return [];
        const ownedAbilityNames = new Set(currentAgent.habilidadesBeyonder.map(a => a.name));
        return Object.entries(pathwayData.sequences)
            .map(([seqKey, abilities]) => {
                const seqNum = parseInt(seqKey.match(/\d+/)?.[0] ?? '99');
                if (seqNum < currentAgent.character.sequence) return null;
                return {
                    seqName: seqKey,
                    abilities: (abilities as SequenceAbility[])
                        .filter(ability => !ownedAbilityNames.has(ability.name))
                        .map(ability => ({ name: ability.name, desc: ability.desc, cost: getAbilityCost(seqNum) }))
                };
            })
            .filter(Boolean)
            .sort((a,b) => parseInt(b!.seqName.match(/\d+/)?.[0]!) - parseInt(a!.seqName.match(/\d+/)?.[0]!));
    }, [pathwayData, currentAgent.character.sequence, currentAgent.habilidadesBeyonder]);

    const availableAbilitiesForFreeChoice = useMemo(() => {
        if (!pathwayData) return [];
        const ownedAbilityNames = new Set(safeHabilidadesBeyonder.map(a => a.name));
        const seqNameKey = Object.keys(pathwayData.sequences).find(key => key.includes(`Sequência ${safeCharacter.sequence}:`));
        if (!seqNameKey) return [];
        
        return (pathwayData.sequences[seqNameKey as keyof typeof pathwayData.sequences] as SequenceAbility[])
            .filter(ability => !ownedAbilityNames.has(ability.name))
            .map(ability => ({ name: ability.name, desc: ability.desc, seqName: seqNameKey }));
    }, [pathwayData, safeCharacter.sequence, safeHabilidadesBeyonder]);


    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">Evolução do Agente</h3>
                    <div className="pa-display-modal">
                        PA Disponível: {availablePA} / {agent.character.paDisponivel}
                    </div>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>

                <nav className="improvement-modal-tabs">
                    {(['Atributos', 'Perícias', 'Habilidades', 'Antecedentes', 'Digestão & Avanço'] as ImprovementTab[]).map(tabName => (
                         <button 
                            key={tabName} 
                            className={activeTab === tabName ? 'active' : ''} 
                            onClick={() => setActiveTab(tabName)}
                        >
                            {tabName}
                        </button>
                    ))}
                </nav>

                <div className="improvement-tab-content">
                    {activeTab === 'Atributos' && (
                        <div className="improvement-list">
                            {Object.entries(currentAgent.attributes).map(([key, value]) => {
                                if (key === 'espiritualidade') return null;
                                const numericValue = Number(value);
                                const cost = (numericValue + 1) * 5;
                                return (
                                    <div key={key} className="improvement-item">
                                        <div className="improvement-item-name">{capitalize(key)}: {numericValue} → {numericValue + 1}</div>
                                        <div className="improvement-item-controls">
                                            <span className="improvement-item-cost">Custo: {cost} PA</span>
                                            <button onClick={() => handleAttributeIncrease(key as keyof Attributes, cost)} disabled={availablePA < cost || numericValue >= 10}>+1</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {activeTab === 'Perícias' && (
                         <div className="improvement-list">
                            <h4>Perícias Gerais (Custo: Novo Nível x 2)</h4>
                            {currentAgent.habilidades.gerais.map((skill: Habilidade) => {
                                const cost = (skill.points + 1) * 2;
                                return (
                                     <div key={skill.name} className="improvement-item">
                                        <div className="improvement-item-name">{skill.name}: {skill.points} → {skill.points + 1}</div>
                                        <div className="improvement-item-controls">
                                            <span className="improvement-item-cost">Custo: {cost} PA</span>
                                            <button onClick={() => handleSkillIncrease('gerais', skill.name, cost)} disabled={availablePA < cost || skill.points >= 5}>+1</button>
                                        </div>
                                    </div>
                                )
                            })}
                             <h4 style={{marginTop: '2rem'}}>Perícias Investigativas (Custo: Novo Nível x 3)</h4>
                              {currentAgent.habilidades.investigativas.map((skill: Habilidade) => {
                                const cost = (skill.points + 1) * 3;
                                return (
                                     <div key={skill.name} className="improvement-item">
                                        <div className="improvement-item-name">{skill.name}: {skill.points} → {skill.points + 1}</div>
                                        <div className="improvement-item-controls">
                                            <span className="improvement-item-cost">Custo: {cost} PA</span>
                                            <button onClick={() => handleSkillIncrease('investigativas', skill.name, cost)} disabled={availablePA < cost || skill.points >= 5}>+1</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                     {activeTab === 'Antecedentes' && (
                        <div className="antecedente-list">
                            {currentAgent.antecedentes.map(antecedente => (
                                <div key={antecedente.id} className="improvement-item">
                                    <div className="improvement-item-name">{antecedente.name}: {antecedente.points} → {antecedente.points + 1}</div>
                                    <div className="improvement-item-controls">
                                        <span className="improvement-item-cost">Custo: {ANTECEDENTE_COST} PA</span>
                                        <button onClick={() => handleAntecedenteIncrease(antecedente.id, ANTECEDENTE_COST)} disabled={availablePA < ANTECEDENTE_COST || antecedente.points >= 5}>+1</button>
                                    </div>
                                </div>
                            ))}
                            <div className="improvement-item">
                                {isAddingAntecedente ? (
                                    <>
                                        <input
                                            type="text"
                                            value={newAntecedenteName}
                                            onChange={e => setNewAntecedenteName(e.target.value)}
                                            placeholder="Nome do novo Antecedente"
                                            style={{ flexGrow: 1 }}
                                        />
                                        <div className="improvement-item-controls">
                                            <span className="improvement-item-cost">Custo: {ANTECEDENTE_COST} PA</span>
                                            <button onClick={handleAddAntecedente} disabled={availablePA < ANTECEDENTE_COST || !newAntecedenteName.trim()}>Confirmar</button>
                                            <button onClick={() => setIsAddingAntecedente(false)} style={{ background: 'transparent', color: 'var(--secondary-text-color)', border: '1px solid var(--secondary-text-color)' }}>Cancelar</button>
                                        </div>
                                    </>
                                ) : (
                                    <button onClick={() => setIsAddingAntecedente(true)} style={{width: '100%'}}>+ Adicionar Novo Antecedente</button>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Habilidades' && (
                        <div className="beyonder-ability-list">
                           {isEligibleForFreebie ? (
                                <>
                                    <div className="free-ability-prompt">
                                        <h4>Parabéns por avançar de sequência!</h4>
                                        <p>Escolha uma nova habilidade da sua sequência ({agent.character.sequence}) gratuitamente como recompensa.</p>
                                    </div>
                                    {availableAbilitiesForFreeChoice.map(ability => {
                                        const isSelected = selectedFreeAbilityName === ability.name;
                                        const isDisabled = selectedFreeAbilityName !== null && !isSelected;
                                        return (
                                            <div key={ability.name} className={`improvement-item beyonder-ability-item ${isSelected ? 'selected' : ''}`}>
                                                <div className="improvement-item-name">
                                                    <strong>{ability.name}</strong>
                                                    <p className="item-description">{ability.desc}</p>
                                                </div>
                                                <div className="improvement-item-controls">
                                                     <button 
                                                        className={`buy-ability-btn ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleSelectFreeAbility(ability.name)}
                                                        disabled={isDisabled}
                                                    >
                                                        {isSelected ? 'Selecionada' : 'Escolher'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                           ) : (
                             availableAbilitiesForPurchase.map(seqGroup => seqGroup && (
                                <div key={seqGroup.seqName}>
                                    <h4 style={{marginTop: '1rem'}}>{seqGroup.seqName}</h4>
                                    {seqGroup.abilities.map(ability => (
                                        <div key={ability.name} className="improvement-item">
                                            <div className="improvement-item-name">
                                                <strong>{ability.name}</strong>
                                                <p className="item-description">{ability.desc}</p>
                                            </div>
                                            <div className="improvement-item-controls">
                                                 <span className="improvement-item-cost">Custo: {ability.cost} PA</span>
                                                 <button className="buy-ability-btn" onClick={() => handleBuyAbility({name: ability.name, desc: ability.desc, seqName: seqGroup.seqName}, ability.cost)} disabled={availablePA < ability.cost}>
                                                    Comprar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             ))
                           )}
                        </div>
                    )}
                     {activeTab === 'Digestão & Avanço' && (
                        <div>
                            <h4>Progresso da Digestão (Lei de Atuação)</h4>
                            <p className="item-description" style={{marginBottom: '1.5rem', background: 'var(--background-color)', padding: '1rem'}}>
                                O progresso da digestão reflete o total de Pontos de Atuação (PA) acumulados nesta Sequência (gastos + disponíveis). Ele é usado para determinar quando você pode purificar dados e avançar para a próxima Sequência.
                            </p>
                            <div className="digestion-tracker" style={{padding: '1rem', border: '1px solid var(--border-color)', background: 'var(--background-color)'}}>
                                <h4 className="digestion-title">Digestão da Poção (Seq. {agent.character.sequence})</h4>
                                <div className="status-bar-track digestion-bar" style={{marginTop: '0.5rem'}}>
                                    <div className="status-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--character-color, var(--accent-color))' }} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}></div>
                                </div>
                                <div className="digestion-info">
                                    <span>{digestaoProgressoAtual} / {targetPa} PA</span>
                                    <span>{progressPercent.toFixed(0)}%</span>
                                </div>
                            </div>

                            {canAdvance && (
                                <div className="advancement-section">
                                    <h4>Avanço Disponível!</h4>
                                    <p>Você digeriu completamente a poção da Sequência {agent.character.sequence}.</p>
                                    <button onClick={handleAdvanceSequence}>
                                        Avançar para Sequência {agent.character.sequence - 1}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="modal-footer">
                    {isEligibleForFreebie && activeTab === 'Habilidades' ? (
                        <button onClick={handleConfirmFreeChoice} disabled={!selectedFreeAbilityName}>Confirmar Escolha Gratuita</button>
                    ) : (
                        <button onClick={handleConfirm} disabled={!hasChanges}>Confirmar e Gastar {paSpent} PA</button>
                    )}
                 </div>
            </div>
        </div>
    );
};