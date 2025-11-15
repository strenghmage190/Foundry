import React, { useMemo, useState, useRef } from 'react';
import { BeyonderAbility, PathwayData, Character, InfernalAspect } from '../../types.ts';

interface BeyonderTabProps {
    abilities: BeyonderAbility[];
    onAbilitiesChange: (newAbilities: BeyonderAbility[]) => void;
    pathwayData?: PathwayData; // Deprecated: mantido para compatibilidade
    allPathways: { [key: string]: PathwayData }; // Todos os caminhos disponíveis
    sequence: number;
    character: Character;
    onCharacterChange: (field: keyof Character, value: any) => void;
    onOpenImprovementModal?: (pathwayName: string) => void; // Callback para abrir modal de evolução
}

// Componente auxiliar para exibir detalhes de um caminho
interface PathwayDetailsProps {
    pathwayName: string;
    pathwayData: PathwayData;
    isPrimary: boolean;
    sequence: number;
    character: Character;
    onCharacterChange: (field: keyof Character, value: any) => void;
    abilities: BeyonderAbility[];
    onAbilitiesChange: (newAbilities: BeyonderAbility[]) => void;
    onOpenImprovementModal?: (pathwayName: string) => void;
}

const PathwayDetails: React.FC<PathwayDetailsProps> = ({ 
    pathwayName, 
    pathwayData, 
    isPrimary, 
    sequence,
    character,
    onCharacterChange,
    abilities,
    onAbilitiesChange,
    onOpenImprovementModal
}) => {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [openAbilitySequence, setOpenAbilitySequence] = useState<string | null>(null);
    
    // State for Abismo pathway mechanic
    const [isAddingAspect, setIsAddingAspect] = useState(false);
    const [selectedNewAspectName, setSelectedNewAspectName] = useState<string>('');

    const toggleSection = (sectionName: string) => {
        setOpenSection(prev => prev === sectionName ? null : sectionName);
    };

    const toggleAbilitySequence = (seqName: string) => {
        setOpenAbilitySequence(prev => prev === seqName ? null : seqName);
    };

    const mecanicaUnica = pathwayData?.mecanicaUnica;
    const poderesInatos = useMemo(() => {
        if (!pathwayData?.poderesInatos) return [];
        return pathwayData.poderesInatos
            .filter(p => {
                const seqNum = parseInt(p.seq.match(/\d+/)?.[0] ?? '99');
                return seqNum >= sequence;
            })
            .sort((a, b) => (parseInt(b.seq.match(/\d+/)?.[0] ?? '0')) - (parseInt(a.seq.match(/\d+/)?.[0] ?? '0')));
    }, [pathwayData, sequence]);
    
    const formaMitica = pathwayData?.formaMitica;
    const domain = pathwayData?.domain;

    const handleAbilityChange = (id: number, field: keyof BeyonderAbility, value: any) => {
        const newAbilities = abilities.map(ability =>
            ability.id === id ? { ...ability, [field]: value } : ability
        );
        onAbilitiesChange(newAbilities);
    };

    const handleDeleteAbility = (id: number) => {
        onAbilitiesChange(abilities.filter(ability => ability.id !== id));
    };

    // Filtrar habilidades deste caminho específico
    const pathwayAbilities = abilities.filter(ability => 
        ability.seqName?.includes(pathwayName) || ability.pathway === pathwayName
    );

    const groupedAbilities = pathwayAbilities.reduce((acc, ability) => {
        const key = ability.seqName || 'Habilidades Únicas';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(ability);
        return acc;
    }, {} as Record<string, BeyonderAbility[]>);

    const sequenceOrder = useMemo(() => {
        if (!pathwayData) return [];
        return Object.keys(pathwayData.sequences).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] ?? '99');
            const numB = parseInt(b.match(/\d+/)?.[0] ?? '99');
            return numB - numA;
        });
    }, [pathwayData]);

    // Abismo pathway logic
    const allPossibleAspects = useMemo(() => pathwayData?.mecanicaUnica?.items || [], [pathwayData]);
    const learnedAspectNames = useMemo(() => new Set((character.infernalAspects || []).map(a => a.name)), [character.infernalAspects]);
    const availableNewAspects = useMemo(() => allPossibleAspects.filter(a => !learnedAspectNames.has(a.nome)), [allPossibleAspects, learnedAspectNames]);
    const liberatedCount = (character.infernalAspects || []).filter(a => a.isLiberated).length;

    const handleAddNewAspect = () => {
        if (!selectedNewAspectName || !pathwayData?.mecanicaUnica) return;
        const aspectData = pathwayData.mecanicaUnica.items.find(item => item.nome === selectedNewAspectName);
        if (!aspectData) return;

        const newAspect: InfernalAspect = {
            id: Date.now(),
            name: aspectData.nome,
            description: aspectData.desc,
            isLiberated: false
        };

        onCharacterChange('infernalAspects', [...(character.infernalAspects || []), newAspect]);
        setIsAddingAspect(false);
        setSelectedNewAspectName('');
    };

    const handleToggleAspect = (aspectId: number) => {
        const updatedAspects = (character.infernalAspects || []).map(a =>
            a.id === aspectId ? { ...a, isLiberated: !a.isLiberated } : a
        );
        onCharacterChange('infernalAspects', updatedAspects);
    };

    const handleDeleteAspect = (aspectId: number) => {
        onCharacterChange('infernalAspects', (character.infernalAspects || []).filter(a => a.id !== aspectId));
    };

    return (
        <div className={`pathway-details-section ${isPrimary ? 'primary' : 'secondary'}`} style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: isPrimary ? 'rgba(169, 120, 248, 0.08)' : '#1a1a1c',
            border: `2px solid ${isPrimary ? 'var(--character-color)' : '#333'}`,
            borderRadius: '8px'
        }}>
            <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: isPrimary ? 'var(--character-color)' : '#aaa',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {isPrimary && <span style={{ fontSize: '1.3rem' }}>★</span>}
                {pathwayName}
                {isPrimary && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Principal)</span>}
            </h3>

            {/* Mecânicas Específicas do Caminho */}
            {pathwayData?.pathway === 'CAMINHO DO ACORRENTADO' && (
                <div className="pathway-mechanic-section" style={{ marginBottom: '1.5rem' }}>
                    <h4 className="section-title">A Prisão da Carne</h4>
                    <div className="form-group">
                        <label>Maldição Atual:</label>
                        <textarea
                            value={character.currentCurse || ''}
                            onChange={e => onCharacterChange('currentCurse', e.target.value)}
                            placeholder="Anote a maldição da sua sequência aqui..."
                            rows={3}
                        />
                    </div>
                    <div className="mechanic-widget">
                        <label>Pontos de Bestialidade (PB)</label>
                        <div className="mechanic-counter">
                            <button onClick={() => onCharacterChange('bestialityPoints', Math.max(0, (character.bestialityPoints || 0) - 1))}>-</button>
                            <input
                                type="number"
                                value={character.bestialityPoints || 0}
                                onChange={e => onCharacterChange('bestialityPoints', Number(e.target.value))}
                            />
                            <button onClick={() => onCharacterChange('bestialityPoints', (character.bestialityPoints || 0) + 1)}>+</button>
                        </div>
                    </div>
                    <div className="mechanic-info">
                        Dificuldade para resistir ao frenesi: +{Math.floor((character.bestialityPoints || 0) / 5)}
                    </div>
                </div>
            )}

            {pathwayData?.pathway === 'CAMINHO DO ABISMO' && (
                <div className="pathway-mechanic-section" style={{ marginBottom: '1.5rem' }}>
                    <h4 className="section-title">Aspectos Infernais</h4>
                    <div className="mechanic-widget">
                        <label>Aspectos Libertos: {liberatedCount}</label>
                    </div>
                    <div className="mechanic-info" style={{textAlign: 'left', marginTop: 0, marginBottom: '1rem'}}>
                        Cada Aspecto Liberto aumenta em 1 a dificuldade para resistir a impulsos pecaminosos.
                    </div>
                    <div className="aspect-list">
                        {(character.infernalAspects || []).map(aspect => (
                            <div key={aspect.id} className="aspect-item">
                                <div className="item-header">
                                    <h5 className="item-header-title">{aspect.name}</h5>
                                    <button onClick={() => handleDeleteAspect(aspect.id)}>&times;</button>
                                </div>
                                <p className="item-description">{aspect.description}</p>
                                <div className="aspect-item-controls">
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={aspect.isLiberated} onChange={() => handleToggleAspect(aspect.id)} />
                                        <span className="slider"></span>
                                    </label>
                                    <span>Liberto</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isAddingAspect ? (
                        <div className="add-aspect-form">
                            <select value={selectedNewAspectName} onChange={e => setSelectedNewAspectName(e.target.value)}>
                                <option value="">Selecione um Aspecto</option>
                                {availableNewAspects.map(asp => (
                                    <option key={asp.nome} value={asp.nome}>{asp.nome}</option>
                                ))}
                            </select>
                            <div className="form-actions">
                                <button onClick={handleAddNewAspect}>Adicionar</button>
                                <button onClick={() => { setIsAddingAspect(false); setSelectedNewAspectName(''); }}>Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingAspect(true)} disabled={availableNewAspects.length === 0}>
                            + Adicionar Aspecto
                        </button>
                    )}
                </div>
            )}

            {/* Domínio */}
            {domain && (
                <div className={`accordion-section ${openSection === 'domain' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('domain')}>
                        <h4>Domínio</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <p className="item-description">{domain.description}</p>
                        {domain.particulas && domain.particulas.length > 0 && (
                            <div className="domain-particles">
                                <h5>Partículas Mágicas:</h5>
                                {domain.particulas.map((p, idx) => (
                                    <div key={idx} className="domain-particle-item">
                                        <h6>{p.name} ({p.translation}) - {p.type}</h6>
                                        <p><strong>Conceito:</strong> {p.conceito}</p>
                                        {p.exemplo && <p><strong>Exemplo:</strong> {p.exemplo}</p>}
                                        {p.uso && <p><strong>Uso:</strong> {p.uso}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mecânica Única */}
            {mecanicaUnica && (
                <div className={`accordion-section ${openSection === 'mecanica' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('mecanica')}>
                        <h4>{mecanicaUnica.nome}</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <p className="item-description">{mecanicaUnica.descricao}</p>
                    </div>
                </div>
            )}

            {/* Poderes Inatos */}
            {poderesInatos.length > 0 && (
                <div className={`accordion-section ${openSection === 'inatos' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('inatos')}>
                        <h4>Poderes Inatos</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <div className="tab-list">
                            {poderesInatos.map((poder, idx) => (
                                <div key={idx} className="tab-list-item">
                                    <div className="item-header">
                                        <h5 className="item-header-title">{poder.nome}</h5>
                                        <span className="item-header-badge">{poder.seq}</span>
                                    </div>
                                    <p className="item-description">{poder.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Forma Mítica */}
            {formaMitica && sequence <= 4 && (
                <div className={`accordion-section ${openSection === 'mitica' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('mitica')}>
                        <h4>Forma Mítica: {formaMitica.nome}</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <p className="item-description">{formaMitica.disponivel}</p>
                        <div className="domain-particle-item">
                            <h5>Ativação</h5> <p>{formaMitica.ativacao}</p>
                        </div>
                        <div className="domain-particle-item">
                            <h5>Descrição</h5> <p>{formaMitica.descricao}</p>
                        </div>
                        <div className="domain-particle-item">
                            <h5>Bônus</h5> <p>{formaMitica.bonus}</p>
                        </div>
                        <div className="domain-particle-item">
                            <h5>Poderes</h5>
                            {formaMitica.poderes.map(poder => (
                                <p key={poder.nome} style={{marginTop: '0.5rem'}}>
                                    <strong>{poder.tipo} ({poder.nome}):</strong> {poder.desc}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Habilidades Compráveis */}
            <div className={`accordion-section ${openSection === 'adquiridas' ? 'active' : ''}`}>
                <div className="accordion-header" onClick={() => toggleSection('adquiridas')}>
                    <h4>Habilidades Adquiridas ({pathwayAbilities.length})</h4>
                    <span className="accordion-icon"></span>
                </div>
                <div className="accordion-content">
                    {/* Botão para comprar novas habilidades */}
                    {onOpenImprovementModal && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenImprovementModal(pathwayName);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                backgroundColor: isPrimary ? 'var(--character-color)' : '#4a4a4e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            + Comprar Habilidades Deste Caminho
                        </button>
                    )}
                    
                    {Object.keys(groupedAbilities).length > 0 ? (
                        sequenceOrder.map(seqName => {
                            const abilityList = groupedAbilities[seqName];
                            if (!abilityList || abilityList.length === 0) return null;

                            return (
                                <div key={seqName} className={`accordion-section ${openAbilitySequence === seqName ? 'active' : ''}`}>
                                    <div className="accordion-header" onClick={() => toggleAbilitySequence(seqName)}>
                                        <h5>{seqName}</h5>
                                        <span className="accordion-icon"></span>
                                    </div>
                                    <div className="accordion-content">
                                        <div className="tab-list">
                                            {abilityList.map(ability => (
                                                <div key={ability.id} className="tab-list-item">
                                                    <div className="item-header">
                                                        <h5 className="item-header-title">{ability.name}</h5>
                                                        <button onClick={() => handleDeleteAbility(ability.id)}>&times;</button>
                                                    </div>
                                                    <p className="item-description">{ability.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma habilidade adquirida deste caminho ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente principal BeyonderTab
export const BeyonderTab: React.FC<BeyonderTabProps> = ({ 
    abilities = [], 
    onAbilitiesChange, 
    pathwayData, // Deprecated, mantido para compatibilidade
    allPathways,
    sequence, 
    character, 
    onCharacterChange,
    onOpenImprovementModal
}) => {
    // Se não tem o novo formato de pathways, mostra o caminho antigo
    if (!character.pathways || !character.pathways.primary) {
        // Fallback para formato antigo
        if (!pathwayData) {
            return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Nenhum caminho selecionado
            </div>;
        }
        
        return (
            <PathwayDetails
                pathwayName={pathwayData.pathway}
                pathwayData={pathwayData}
                isPrimary={true}
                sequence={sequence}
                character={character}
                onCharacterChange={onCharacterChange}
                abilities={abilities}
                onAbilitiesChange={onAbilitiesChange}
                onOpenImprovementModal={onOpenImprovementModal}
            />
        );
    }

    const primaryPathwayName = character.pathways.primary;
    const secondaryPathwayNames = character.pathways.secondary || [];

    return (
        <div className="beyonder-tab">
            {/* Renderiza o caminho principal */}
            {primaryPathwayName && allPathways[primaryPathwayName] && (
                <PathwayDetails 
                    pathwayName={primaryPathwayName}
                    pathwayData={allPathways[primaryPathwayName]}
                    isPrimary={true}
                    sequence={sequence}
                    character={character}
                    onCharacterChange={onCharacterChange}
                    abilities={abilities}
                    onAbilitiesChange={onAbilitiesChange}
                    onOpenImprovementModal={onOpenImprovementModal}
                />
            )}
            
            {/* Renderiza os caminhos secundários */}
            {secondaryPathwayNames.map(pathName => {
                if (!allPathways[pathName]) return null;
                return (
                    <PathwayDetails 
                        key={pathName}
                        pathwayName={pathName}
                        pathwayData={allPathways[pathName]}
                        isPrimary={false}
                        sequence={sequence}
                        character={character}
                        onCharacterChange={onCharacterChange}
                        abilities={abilities}
                        onAbilitiesChange={onAbilitiesChange}
                        onOpenImprovementModal={onOpenImprovementModal}
                    />
                );
            })}
        </div>
    );
};
