import React, { useState } from 'react';
import { Enemy } from '../types.ts';

interface EnemySheetProps {
    enemy: Enemy;
    onClose?: () => void;
}

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getThreatColor = (level: string): string => {
    switch (level) {
        case 'Baixa': return '#4caf50';
        case 'Média': return '#ff9800';
        case 'Alta': return '#f44336';
        case 'Crítica': return '#9c27b0';
        default: return '#fff';
    }
};

export const EnemySheet: React.FC<EnemySheetProps> = ({ enemy, onClose }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="enemy-sheet" style={{ 
            background: 'linear-gradient(135deg, #1a1a1c 0%, #2a2a2e 100%)',
            color: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            border: '2px solid #a978f8',
            maxWidth: '900px',
            margin: '0 auto',
            fontFamily: 'inherit'
        }}>
            {/* Header com Nome e Ameaça */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #a978f8'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
                        {enemy.name}
                    </h1>
                    <p style={{ margin: '0', color: '#aaa', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        {enemy.description}
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#aaa',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0'
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Threat Level e Recomendação */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(169, 120, 248, 0.05)',
                borderRadius: '6px',
                border: '1px solid #444'
            }}>
                <div>
                    <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Nível de Ameaça
                    </div>
                    <div style={{ 
                        color: getThreatColor(enemy.threatLevel),
                        fontSize: '1.3rem',
                        fontWeight: 'bold'
                    }}>
                        {enemy.threatLevel}
                    </div>
                </div>
                <div>
                    <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Sequência Recomendada
                    </div>
                    <div style={{ color: '#4ecdc4', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {enemy.recommendedSequence}
                    </div>
                </div>
            </div>

            {/* Atributos */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 
                    onClick={() => toggleSection('attributes')}
                    style={{ 
                        cursor: 'pointer',
                        margin: '0 0 1rem 0',
                        padding: '0.75rem',
                        background: 'rgba(169, 120, 248, 0.1)',
                        borderLeft: '4px solid #a978f8',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Atributos
                    <span style={{ fontSize: '0.9rem' }}>
                        {expandedSection === 'attributes' ? '▼' : '▶'}
                    </span>
                </h3>
                
                {expandedSection === 'attributes' && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'rgba(42, 42, 46, 0.5)',
                        borderRadius: '6px'
                    }}>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Força</div>
                            <div style={{ color: '#ff6b6b', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.forca}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Destreza</div>
                            <div style={{ color: '#4ecdc4', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.destreza}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Vigor</div>
                            <div style={{ color: '#a978f8', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.vigor}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Carisma</div>
                            <div style={{ color: '#ffd93d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.carisma}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Manipulação</div>
                            <div style={{ color: '#ffd93d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.manipulacao}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Autocontrole</div>
                            <div style={{ color: '#ffd93d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.autocontrole}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Percepção</div>
                            <div style={{ color: '#b19cd9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.percepcao}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Inteligência</div>
                            <div style={{ color: '#b19cd9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.inteligencia}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Raciocínio</div>
                            <div style={{ color: '#b19cd9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.attributes.raciocinio}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Espiritualidade</div>
                            <div style={{ color: '#e91e63', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.espiritualidade}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Estatísticas de Combate */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 
                    onClick={() => toggleSection('combat')}
                    style={{ 
                        cursor: 'pointer',
                        margin: '0 0 1rem 0',
                        padding: '0.75rem',
                        background: 'rgba(255, 107, 107, 0.1)',
                        borderLeft: '4px solid #ff6b6b',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Estatísticas de Combate
                    <span style={{ fontSize: '0.9rem' }}>
                        {expandedSection === 'combat' ? '▼' : '▶'}
                    </span>
                </h3>

                {expandedSection === 'combat' && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'rgba(42, 42, 46, 0.5)',
                        borderRadius: '6px'
                    }}>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                Pontos de Vida
                            </div>
                            <div style={{ color: '#ff6b6b', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {enemy.healthPoints} PV
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                Iniciativa
                            </div>
                            <div style={{ color: '#4ecdc4', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.initiative}d10
                            </div>
                            {enemy.initiativeBreakdown && (
                                <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                    {enemy.initiativeBreakdown}
                                </small>
                            )}
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                Defesa
                            </div>
                            <div style={{ color: '#a978f8', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.defense}d10
                            </div>
                            {enemy.defenseBreakdown && (
                                <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                    {enemy.defenseBreakdown}
                                </small>
                            )}
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                Absorção
                            </div>
                            <div style={{ color: '#ffd93d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.absorption}d10
                            </div>
                            {enemy.absorptionBreakdown && (
                                <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                    {enemy.absorptionBreakdown}
                                </small>
                            )}
                        </div>
                        <div>
                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                Movimento
                            </div>
                            <div style={{ color: '#b19cd9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {enemy.movement}m
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Ações de Combate */}
            {enemy.attacks.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 
                        onClick={() => toggleSection('attacks')}
                        style={{ 
                            cursor: 'pointer',
                            margin: '0 0 1rem 0',
                            padding: '0.75rem',
                            background: 'rgba(156, 39, 176, 0.1)',
                            borderLeft: '4px solid #9c27b0',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        Ações de Combate
                        <span style={{ fontSize: '0.9rem' }}>
                            {expandedSection === 'attacks' ? '▼' : '▶'}
                        </span>
                    </h3>

                    {expandedSection === 'attacks' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {enemy.attacks.map((attack, idx) => (
                                <div 
                                    key={idx}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(42, 42, 46, 0.5)',
                                        borderRadius: '6px',
                                        borderLeft: '4px solid #9c27b0'
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#fff' }}>
                                        {attack.name}
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Parada de Dados
                                            </div>
                                            <div style={{ color: '#4ecdc4', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {attack.dicePool}d10
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Dano
                                            </div>
                                            <div style={{ color: '#ff6b6b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                {attack.damage}
                                            </div>
                                        </div>
                                    </div>
                                    {attack.qualities && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Qualidades
                                            </div>
                                            <p style={{ margin: '0', color: '#ccc', fontSize: '0.9rem' }}>
                                                {attack.qualities}
                                            </p>
                                        </div>
                                    )}
                                    {attack.notes && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Notas
                                            </div>
                                            <p style={{ margin: '0', color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                                {attack.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Poderes e Habilidades */}
            {enemy.abilities.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 
                        onClick={() => toggleSection('abilities')}
                        style={{ 
                            cursor: 'pointer',
                            margin: '0 0 1rem 0',
                            padding: '0.75rem',
                            background: 'rgba(78, 205, 196, 0.1)',
                            borderLeft: '4px solid #4ecdc4',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        Poderes e Habilidades Especiais
                        <span style={{ fontSize: '0.9rem' }}>
                            {expandedSection === 'abilities' ? '▼' : '▶'}
                        </span>
                    </h3>

                    {expandedSection === 'abilities' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {enemy.abilities.map((ability, idx) => (
                                <div 
                                    key={idx}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(42, 42, 46, 0.5)',
                                        borderRadius: '6px',
                                        borderLeft: '4px solid #4ecdc4'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <h4 style={{ margin: '0', color: '#fff' }}>
                                            {ability.name}
                                        </h4>
                                        <span style={{ 
                                            background: 'rgba(169, 120, 248, 0.3)',
                                            color: '#a978f8',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {ability.actionType}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 0.75rem 0', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        {ability.description}
                                    </p>
                                    {ability.effects && (
                                        <div style={{ 
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            padding: '0.75rem',
                                            borderRadius: '4px',
                                            borderLeft: '2px solid #ff6b6b'
                                        }}>
                                            <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Efeitos
                                            </div>
                                            <p style={{ margin: '0', color: '#ccc', fontSize: '0.9rem' }}>
                                                {ability.effects}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Vulnerabilidades */}
            {(enemy.vulnerabilities || []).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 
                        onClick={() => toggleSection('vulnerabilities')}
                        style={{ 
                            cursor: 'pointer',
                            margin: '0 0 1rem 0',
                            padding: '0.75rem',
                            background: 'rgba(244, 67, 54, 0.1)',
                            borderLeft: '4px solid #f44336',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        Vulnerabilidades
                        <span style={{ fontSize: '0.9rem' }}>
                            {expandedSection === 'vulnerabilities' ? '▼' : '▶'}
                        </span>
                    </h3>

                    {expandedSection === 'vulnerabilities' && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(244, 67, 54, 0.05)',
                            borderRadius: '6px',
                            borderLeft: '4px solid #f44336'
                        }}>
                            <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#ccc' }}>
                                {enemy.vulnerabilities?.map((vuln, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                        {vuln}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Fraquezas */}
            {(enemy.weaknesses || []).length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 
                        onClick={() => toggleSection('weaknesses')}
                        style={{ 
                            cursor: 'pointer',
                            margin: '0 0 1rem 0',
                            padding: '0.75rem',
                            background: 'rgba(255, 193, 7, 0.1)',
                            borderLeft: '4px solid #ffc107',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        Fraquezas
                        <span style={{ fontSize: '0.9rem' }}>
                            {expandedSection === 'weaknesses' ? '▼' : '▶'}
                        </span>
                    </h3>

                    {expandedSection === 'weaknesses' && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 193, 7, 0.05)',
                            borderRadius: '6px',
                            borderLeft: '4px solid #ffc107'
                        }}>
                            <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#ccc' }}>
                                {enemy.weaknesses?.map((weak, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                        {weak}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Notas */}
            {enemy.notes && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(78, 205, 196, 0.05)',
                    borderRadius: '6px',
                    borderLeft: '4px solid #4ecdc4'
                }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#4ecdc4' }}>Anotações</h4>
                    <p style={{ margin: '0', color: '#ccc', lineHeight: '1.6' }}>
                        {enemy.notes}
                    </p>
                </div>
            )}
        </div>
    );
};
