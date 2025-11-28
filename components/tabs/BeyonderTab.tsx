import React, { useMemo, useState, useRef } from 'react';
import { BeyonderAbility, PathwayData, Character, InfernalAspect } from '../../types.ts';
import { hasArcaneMastery } from '../../utils/calculations';

interface BeyonderTabProps {
    abilities: BeyonderAbility[];
    onAbilitiesChange: (newAbilities: BeyonderAbility[]) => void;
    pathwayData?: PathwayData;
    allPathways: { [key: string]: PathwayData };
    sequence: number;
    character: Character;
    onCharacterChange: (field: keyof Character, value: any) => void;
    onOpenImprovementModal?: (pathwayName: string) => void;
}

type FilterSection = 'todas' | 'domain' | 'mecanica' | 'inatos' | 'mitica' | 'adquiridas';

export const BeyonderTab: React.FC<BeyonderTabProps> = ({ 
    abilities = [], 
    onAbilitiesChange, 
    pathwayData,
    allPathways,
    sequence, 
    character, 
    onCharacterChange,
    onOpenImprovementModal
}) => {
    const [openMainSection, setOpenMainSection] = useState<string | null>(null);
    const [openAbilitySequence, setOpenAbilitySequence] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterSection>('todas');
    const [selectedPathway, setSelectedPathway] = useState<string>('');
    
    // State for Abismo pathway mechanic
    const [isAddingAspect, setIsAddingAspect] = useState(false);
    const [selectedNewAspectName, setSelectedNewAspectName] = useState<string>('');

    const refs = {
        domain: useRef<HTMLDivElement>(null),
        mecanica: useRef<HTMLDivElement>(null),
        inatos: useRef<HTMLDivElement>(null),
        mitica: useRef<HTMLDivElement>(null),
        adquiridas: useRef<HTMLDivElement>(null),
    };

    // Obter todos os caminhos do personagem
    const characterPathways = useMemo(() => {
        if (character.pathways?.primary) {
            return [character.pathways.primary, ...(character.pathways.secondary || [])].filter(Boolean);
        } else if (character.pathway) {
            const pathways = Array.isArray(character.pathway) ? character.pathway : [character.pathway];
            return pathways.filter(Boolean);
        }
        return [];
    }, [character]);

    // Inicializar selectedPathway com o caminho primário
    React.useEffect(() => {
        if (!selectedPathway && characterPathways.length > 0) {
            setSelectedPathway(characterPathways[0]);
        }
    }, [characterPathways, selectedPathway]);

    // Obter dados do caminho selecionado (suporta nomes curtos via mapeamento)
    const currentPathwayData = useMemo(() => {
        if (!selectedPathway) return null;
        return allPathways[selectedPathway];
    }, [selectedPathway, allPathways]);

    const arcaneMasteryActive = useMemo(() => {
        // We need minimal agent-like info; reuse character + fake wrapper
        const agentLike: any = { character };
        return hasArcaneMastery(agentLike, allPathways);
    }, [character, allPathways]);

    // Extracts a numeric PE cost from a description like
    // "Gaste 6 PE" or "(Custo: 8 PE)" or "10 PE e 1 Vontade"
    const extractPeCost = (text?: string): number | null => {
        if (!text) return null;
        const m = text.match(/(?:Custo:\s*)?(\d+)\s*PE/i);
        if (m) return parseInt(m[1], 10);
        return null;
    };

    const toggleMainSection = (sectionName: string) => {
        const newOpenSection = openMainSection === sectionName ? null : sectionName;
        setOpenMainSection(newOpenSection);
        setActiveFilter((newOpenSection as FilterSection) || 'todas');
    };

    const handleFilterClick = (filter: FilterSection) => {
        setActiveFilter(filter);
        if (filter === 'todas') {
            setOpenMainSection(null);
        } else {
            setOpenMainSection(filter);
            setTimeout(() => {
                refs[filter as keyof typeof refs]?.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
    };

    const toggleAbilitySequence = (seqName: string) => {
        setOpenAbilitySequence(prev => (prev === seqName ? null : seqName));
    };
    
    const mecanicaUnica = currentPathwayData?.mecanicaUnica;
    const correntes = currentPathwayData?.correntes || [];
    const poderesInatos = useMemo(() => {
        if (!currentPathwayData?.poderesInatos) return [];
        return currentPathwayData.poderesInatos
            .filter(p => {
                const seqNum = parseInt(p.seq.match(/\d+/)?.[0] ?? '99');
                return seqNum >= sequence;
            })
            .sort((a, b) => (parseInt(b.seq.match(/\d+/)?.[0] ?? '0')) - (parseInt(a.seq.match(/\d+/)?.[0] ?? '0')));
    }, [currentPathwayData, sequence]);
    const formaMitica = currentPathwayData?.formaMitica;
    const domain = currentPathwayData?.domain;

    const handleAbilityChange = (id: number, field: keyof BeyonderAbility, value: any) => {
        const newAbilities = abilities.map(ability =>
            ability.id === id ? { ...ability, [field]: value } : ability
        );
        onAbilitiesChange(newAbilities);
    };

    const handleDeleteAbility = (id: number) => {
        onAbilitiesChange(abilities.filter(ability => ability.id !== id));
    };

    const groupedAbilities = abilities.reduce((acc, ability) => {
        // Only include abilities from the selected pathway
        if (ability.pathway && ability.pathway !== selectedPathway) return acc;
        const key = ability.seqName || 'Habilidades Únicas';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(ability);
        return acc;
    }, {} as Record<string, BeyonderAbility[]>);

    const sequenceOrder = useMemo(() => {
        if (!currentPathwayData) return [];
        return Object.keys(currentPathwayData.sequences).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] ?? '99');
            const numB = parseInt(b.match(/\d+/)?.[0] ?? '99');
            return numB - numA;
        });
    }, [currentPathwayData]);
    
    // --- Abismo Pathway Logic ---
    const allPossibleAspects = useMemo(() => currentPathwayData?.mecanicaUnica?.items || [], [currentPathwayData]);
    const learnedAspectNames = useMemo(() => new Set((character.infernalAspects || []).map(a => a.name)), [character.infernalAspects]);
    const availableNewAspects = useMemo(() => allPossibleAspects.filter((a: any) => !learnedAspectNames.has(a.nome)), [allPossibleAspects, learnedAspectNames]);
    const liberatedCount = (character.infernalAspects || []).filter(a => a.isLiberated).length;

    const handleAddNewAspect = () => {
        if (!selectedNewAspectName || !currentPathwayData?.mecanicaUnica) return;
        const aspectData = currentPathwayData.mecanicaUnica.items.find((item: any) => item.nome === selectedNewAspectName);
        if (!aspectData) return;

        const newAspect: InfernalAspect = {
            id: Date.now(),
            name: (aspectData as any).nome,
            description: (aspectData as any).desc,
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

    const filters = [
        { key: 'todas' as FilterSection, label: 'Todas', condition: true },
        { key: 'domain' as FilterSection, label: 'Domínio', condition: !!domain },
        { key: 'mecanica' as FilterSection, label: 'Mecânica Única', condition: !!mecanicaUnica },
        { key: 'correntes' as FilterSection, label: 'Correntes', condition: correntes.length > 0 },
        { key: 'inatos' as FilterSection, label: 'Poderes Inatos', condition: poderesInatos.length > 0 },
        { key: 'mitica' as FilterSection, label: 'Forma Mítica', condition: !!(formaMitica && sequence <= 4) },
        { key: 'companheiro' as FilterSection, label: 'Companheiro', condition: !!character.companion },
        { key: 'adquiridas' as FilterSection, label: 'Habilidades Compráveis', condition: true },
    ];

    if (characterPathways.length === 0) {
        return (
            <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#999',
                backgroundColor: '#1a1a1c',
                border: '1px solid #333',
                borderRadius: '8px',
                margin: '1rem'
            }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>⚠️ CAMINHOS BEYONDER</h3>
                <p style={{ marginBottom: '0.5rem' }}>Nenhum caminho selecionado.</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Configure um caminho na seção de Antecedentes ou fale com o Mestre.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Dica: Se você tinha um companheiro (pet) e ele não aparece aqui, verifique a página <strong>Criaturas</strong>. Alguns pets são salvos como criaturas separadas e precisam ser vinculados manualmente à ficha.
                </p>
                {/* Debug info - pode remover depois */}
                <details style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', textAlign: 'left' }}>
                    <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
                    <pre style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.5rem', 
                        backgroundColor: '#0a0a0a',
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify({ 
                            'character.pathways': character.pathways,
                            'character.pathway': character.pathway 
                        }, null, 2)}
                    </pre>
                </details>
            </div>
        );
    }

    return (
        <div>
            {/* Filtro de Caminhos */}
            {characterPathways.length > 1 && (
                <div className="pathway-filter" style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#1a1a1c',
                    border: '1px solid #333',
                    borderRadius: '8px'
                }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                        Caminho Ativo:
                    </label>
                    <select 
                        value={selectedPathway} 
                        onChange={(e) => {
                            setSelectedPathwayRaw(e.target.options[e.target.selectedIndex].text);
                            setSelectedPathway(resolvePathKey(e.target.value));
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#2a2a2e',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {characterPathways.map((pathName) => {
                            const isPrimary = character.pathways?.primary === pathName;
                            const value = resolvePathKey(pathName);
                            return (
                                <option key={pathName} value={value}>
                                    {isPrimary ? '★ ' : ''}{pathName}{isPrimary ? ' (Principal)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Nome Alternativo para Exibição Pública */}
            {currentPathwayData?.isSecret && (
                <div className="pathway-display-name" style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#1a1a1c',
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px'
                }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        🔒 Nome Público do Caminho:
                    </label>
                    <input 
                        type="text"
                        value={character.pathwayDisplayName || ''}
                        onChange={(e) => onCharacterChange('pathwayDisplayName', e.target.value)}
                        placeholder={`Ex: "Roda da Fortuna" ao invés de "${currentPathwayData.pathway}"`}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#2a2a2e',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                        Este nome será exibido para outros jogadores na campanha ao invés do nome real do caminho secreto.
                        Deixe em branco para usar o nome original.
                    </p>
                </div>
            )}

            {/* Filtros de Seções */}
            <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
                {filters.filter(f => f.condition).map(f => (
                    <button
                        key={f.key}
                        className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                        onClick={() => handleFilterClick(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {arcaneMasteryActive && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#132a13',
                    border: '1px solid #1f3b1f',
                    borderRadius: 8,
                    color: '#c9f7c9',
                    fontSize: '0.95rem'
                }}>
                    Maestria Arcana ativa: custos de PE das suas habilidades são reduzidos pela metade (arredondado para cima).
                </div>
            )}

            {/* Mostra mensagem de debug caso um caminho esteja definido mas não encontrado */}
            { selectedPathway && !currentPathwayData && (
                <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #444', borderRadius: 6, background: '#1a1a1c', color: '#e0aaff' }}>
                    <strong>⚠️ Caminho não encontrado:</strong>
                    <p>O personagem tem um caminho configurado ({selectedPathwayRaw || selectedPathway}), mas o sistema não encontrou os dados do caminho para exibir. Isso pode acontecer se o nome salvo na ficha não corresponder exatamente ao nome registrado nos dados do caminho.</p>
                    <details>
                        <summary>Veja caminhos disponíveis (debug)</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>{JSON.stringify(Object.keys(allPathways).slice(0,50), null, 2)}</pre>
                    </details>
                </div>
            )}

            {/* Mecânicas Específicas do Caminho */}
            {currentPathwayData?.pathway === 'CAMINHO DO ACORRENTADO' && (
                <div className="pathway-mechanic-section">
                    <h3 className="section-title">A Prisão da Carne</h3>
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

            {currentPathwayData?.pathway === 'CAMINHO DO ABISMO' && (
                <div className="pathway-mechanic-section">
                    <h3 className="section-title">Aspectos Infernais</h3>
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
                                {availableNewAspects.map((asp: any) => (
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
                <div ref={refs.domain} className={`accordion-section ${openMainSection === 'domain' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('domain')}>
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
                <div ref={refs.mecanica} className={`accordion-section ${openMainSection === 'mecanica' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('mecanica')}>
                        <h4>{mecanicaUnica.titulo}</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <div className="tab-list">
                            {mecanicaUnica.items.map((item, idx) => (
                                <div key={idx} className="tab-list-item">
                                    <div className="item-header">
                                        <h5 className="item-header-title">{item.nome}</h5>
                                    </div>
                                    <p className="item-description">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Correntes (separado) */}
            {correntes.length > 0 && (
                <div className={`accordion-section ${openMainSection === 'correntes' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('correntes')}>
                        <h4>Correntes de Fado</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <div className="tab-list">
                            {correntes.map(c => {
                                const isActive = (character.activeCorrentesIds || []).includes(c.id);
                                const seqNum = parseInt(c.sequence.match(/\d+/)?.[0] ?? '99');
                                const isAvailable = seqNum >= sequence;
                                
                                return (
                                    <div key={c.id} className="tab-list-item" style={{
                                        backgroundColor: isActive ? 'rgba(156, 39, 176, 0.15)' : undefined,
                                        border: isActive ? '1px solid #9c27b0' : undefined,
                                        opacity: isAvailable ? 1 : 0.5
                                    }}>
                                        <div className="item-header">
                                            <h5 className="item-header-title">
                                                {isActive && '✓ '}{c.sequence} - {c.titulo}
                                            </h5>
                                            {isAvailable && (
                                                <button
                                                    onClick={() => {
                                                        const currentIds = character.activeCorrentesIds || [];
                                                        const newIds = isActive 
                                                            ? currentIds.filter(id => id !== c.id)
                                                            : [...currentIds, c.id];
                                                        onCharacterChange('activeCorrentesIds', newIds);
                                                    }}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: isActive ? '#d32f2f' : '#9c27b0',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {isActive ? 'Desativar' : 'Ativar'}
                                                </button>
                                            )}
                                        </div>
                                        <p className="item-description"><strong>Benefício:</strong> {c.beneficio}</p>
                                        <p className="item-description"><strong>Risco:</strong> {c.risco}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Poderes Inatos */}
            {poderesInatos.length > 0 && (
                <div ref={refs.inatos} className={`accordion-section ${openMainSection === 'inatos' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('inatos')}>
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
                 <div ref={refs.mitica} className={`accordion-section ${openMainSection === 'mitica' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('mitica')}>
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
                                <p key={poder.nome} style={{marginTop: '0.5rem'}}><strong>{poder.tipo} ({poder.nome}):</strong> {poder.desc}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Companheiro */}
            {character.companion && (
                <div ref={refs.companheiro} className={`accordion-section ${openMainSection === 'companheiro' ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleMainSection('companheiro')}>
                        <h4>Companheiro</h4>
                        <span className="accordion-icon"></span>
                    </div>
                    <div className="accordion-content">
                        <div className="tab-list">
                            <div className="tab-list-item">
                                <div className="item-header">
                                    <h5 className="item-header-title">{character.companion.type === 'humano' ? 'Companheiro Humano' : 'Companheiro Animal'}</h5>
                                </div>
                                <p className="item-description"><strong>Tipo:</strong> {character.companion.type}</p>
                                {character.companion.origin && <p className="item-description"><strong>Origem:</strong> {character.companion.origin}</p>}
                                {character.companion.biologicalMold && <p className="item-description"><strong>Molde Biológico:</strong> {character.companion.biologicalMold}</p>}
                                {character.companion.pathway && <p className="item-description"><strong>Caminho:</strong> {character.companion.pathway}</p>}
                                {character.companion.attributes && (
                                    <div>
                                        <h6>Atributos:</h6>
                                        <ul>
                                            {Object.entries(character.companion.attributes).map(([attr, value]) => (
                                                <li key={attr}>{attr}: {value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {character.companion.mechanics && (
                                    <div>
                                        <h6>Mecânicas:</h6>
                                        <p><strong>Ataque Natural:</strong> {character.companion.mechanics.naturalAttack}</p>
                                        <p><strong>Armadura Natural:</strong> {character.companion.mechanics.naturalArmor}</p>
                                        {character.companion.mechanics.sixthSense && <p>Senso de Perigo</p>}
                                        {character.companion.mechanics.socialPenalty && <p>Penalidade Social</p>}
                                        {character.companion.mechanics.intimidationBonus && <p>Bônus de Intimidação</p>}
                                        {character.companion.mechanics.cannotUseTools && <p>Não pode usar ferramentas</p>}
                                        {character.companion.mechanics.stealthAdvantage && <p>Vantagem em Furtividade</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Habilidades Adquiridas */}
            <div ref={refs.adquiridas} className={`accordion-section ${openMainSection === 'adquiridas' ? 'active' : ''}`}>
                <div className="accordion-header" onClick={() => toggleMainSection('adquiridas')}>
                    <h4>Habilidades Adquiridas</h4>
                    <span className="accordion-icon"></span>
                </div>
                <div className="accordion-content">
                    {/* Botão para comprar habilidades do caminho selecionado */}
                    {onOpenImprovementModal && selectedPathway && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenImprovementModal(selectedPathway);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                backgroundColor: 'var(--character-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                            + Comprar Habilidades de {selectedPathway}
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
                                                    {arcaneMasteryActive && (() => {
                                                        const base = extractPeCost(ability.description);
                                                        if (!base) return null;
                                                        const eff = Math.ceil(base / 2);
                                                        if (eff === base) return null;
                                                        return (
                                                            <div style={{
                                                                marginTop: '0.25rem',
                                                                fontSize: '0.9rem',
                                                                color: '#bde0fe'
                                                            }}>
                                                                Custo efetivo com Maestria Arcana: {eff} PE (antes: {base} PE)
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="empty-state-text">Nenhuma habilidade comprada ainda. Clique no botão acima para comprar habilidades deste caminho.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
