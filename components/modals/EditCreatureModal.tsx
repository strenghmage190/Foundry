import React, { useState, useEffect } from 'react';
import { Enemy, Attributes } from '../types.ts';

// Função para gerar UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const createEmptyCreature = (): Enemy => ({
    id: generateUUID(),
    name: '',
    description: '',
    threatLevel: 'Média',
    recommendedSequence: '',
    attributes: initialAttributes,
    espiritualidade: 1,
    healthPoints: 20,
    initiative: 3,
    defense: 3,
    absorption: 3,
    movement: 6,
    attacks: [],
    abilities: [],
    vulnerabilities: [],
    weaknesses: [],
    skills: {
        vontade: 3,
        vigor: 3,
        percepcao: 3,
        inteligencia: 2,
        raciocinio: 2
    },
    creatureSkills: [
        { name: 'Vontade', attr: 'Autocontrole', points: 3 },
        { name: 'Vigor', attr: 'Vigor', points: 3 },
        { name: 'Percepção', attr: 'Sabedoria', points: 3 },
        { name: 'Inteligência', attr: 'Inteligência', points: 2 },
        { name: 'Raciocínio', attr: 'Inteligência', points: 2 }
    ]
});

interface EditCreatureModalProps {
    isOpen: boolean;
    creature?: Enemy | null;
    onSave: (creature: Enemy) => void;
    onClose: () => void;
}

const initialAttributes: Attributes = {
    forca: 3,
    destreza: 3,
    vigor: 3,
    carisma: 2,
    manipulacao: 2,
    autocontrole: 2,
    percepcao: 3,
    inteligencia: 2,
    raciocinio: 2,
    espiritualidade: 1
};

export const EditCreatureModal: React.FC<EditCreatureModalProps> = ({ isOpen, creature, onSave, onClose }) => {
    const [formData, setFormData] = useState<Enemy>(
        creature || createEmptyCreature()
    );

    const [activeTab, setActiveTab] = useState<'basico' | 'atributos' | 'pericias' | 'combate' | 'ataques' | 'habilidades' | 'fraquezas'>('basico');

    useEffect(() => {
        if (creature) {
            setFormData(creature);
        } else if (isOpen) {
            // Quando o modal é aberto para criar uma nova criatura,
            // garantir que o form seja reiniciado com um novo UUID
            setFormData(createEmptyCreature());
        }
    }, [creature, isOpen]);

    const handleBasicChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (attr: keyof Attributes, value: number) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attr]: value }
        }));
    };

    const handleSkillChange = (skill: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            skills: { ...prev.skills, [skill]: value },
            // Também atualizar creatureSkills com a nova estrutura
            creatureSkills: (prev.creatureSkills || []).map(s => {
                if (s.name.toLowerCase() === skill.toLowerCase()) {
                    return { ...s, points: value };
                }
                return s;
            })
        }));
    };

    const handleCombatChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddAttack = () => {
        setFormData(prev => ({
            ...prev,
            attacks: [...(prev.attacks || []), {
                name: 'Novo Ataque',
                dicePool: 3,
                damage: '1d6'
            }]
        }));
    };

    const handleUpdateAttack = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newAttacks = [...(prev.attacks || [])];
            newAttacks[index] = { ...newAttacks[index], [field]: value };
            return { ...prev, attacks: newAttacks };
        });
    };

    const handleRemoveAttack = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attacks: (prev.attacks || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddAbility = () => {
        setFormData(prev => ({
            ...prev,
            abilities: [...(prev.abilities || []), {
                name: 'Nova Habilidade',
                actionType: 'Passivo',
                description: ''
            }]
        }));
    };

    const handleUpdateAbility = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newAbilities = [...(prev.abilities || [])];
            newAbilities[index] = { ...newAbilities[index], [field]: value };
            return { ...prev, abilities: newAbilities };
        });
    };

    const handleRemoveAbility = (index: number) => {
        setFormData(prev => ({
            ...prev,
            abilities: (prev.abilities || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddVulnerability = () => {
        setFormData(prev => ({
            ...prev,
            vulnerabilities: [...(prev.vulnerabilities || []), '']
        }));
    };

    const handleUpdateVulnerability = (index: number, value: string) => {
        setFormData(prev => {
            const newVulnerabilities = [...(prev.vulnerabilities || [])];
            newVulnerabilities[index] = value;
            return { ...prev, vulnerabilities: newVulnerabilities };
        });
    };

    const handleRemoveVulnerability = (index: number) => {
        setFormData(prev => ({
            ...prev,
            vulnerabilities: (prev.vulnerabilities || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddWeakness = () => {
        setFormData(prev => ({
            ...prev,
            weaknesses: [...(prev.weaknesses || []), '']
        }));
    };

    const handleUpdateWeakness = (index: number, value: string) => {
        setFormData(prev => {
            const newWeaknesses = [...(prev.weaknesses || [])];
            newWeaknesses[index] = value;
            return { ...prev, weaknesses: newWeaknesses };
        });
    };

    const handleRemoveWeakness = (index: number) => {
        setFormData(prev => ({
            ...prev,
            weaknesses: (prev.weaknesses || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#1a1a1c',
                border: '2px solid #a978f8',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '1000px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '2px solid #a978f8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#fff' }}>
                        {creature ? 'Editar Criatura' : 'Nova Criatura'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#aaa',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderBottom: '1px solid #444',
                    background: 'rgba(42, 42, 46, 0.5)',
                    overflowX: 'auto'
                }}>
                    {(['basico', 'atributos', 'pericias', 'combate', 'ataques', 'habilidades', 'fraquezas'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === tab ? '#a978f8' : 'transparent',
                                color: activeTab === tab ? '#fff' : '#aaa',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1.5rem'
                }}>
                    <form>
                        {/* Aba Básica */}
                        {activeTab === 'basico' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Nome</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleBasicChange('name', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Descrição</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => handleBasicChange('description', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            minHeight: '100px',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Nível de Ameaça</label>
                                        <select
                                            value={formData.threatLevel}
                                            onChange={e => handleBasicChange('threatLevel', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(42, 42, 46, 0.8)',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <option value="Baixa">Baixa</option>
                                            <option value="Média">Média</option>
                                            <option value="Alta">Alta</option>
                                            <option value="Crítica">Crítica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Sequência Recomendada</label>
                                        <input
                                            type="text"
                                            value={formData.recommendedSequence}
                                            onChange={e => handleBasicChange('recommendedSequence', e.target.value)}
                                            placeholder="ex: Sequência 8 ou 7"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(42, 42, 46, 0.8)',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Atributos */}
                        {activeTab === 'atributos' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {Object.entries(formData.attributes).map(([attr, value]) => (
                                    <div key={attr}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', textTransform: 'capitalize' }}>
                                            {attr}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={value}
                                            onChange={e => handleAttributeChange(attr as keyof Attributes, parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(42, 42, 46, 0.8)',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Aba Perícias */}
                        {activeTab === 'pericias' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                {(formData.creatureSkills || [
                                    { name: 'Vontade', attr: 'Autocontrole', points: 3 },
                                    { name: 'Vigor', attr: 'Vigor', points: 3 },
                                    { name: 'Percepção', attr: 'Sabedoria', points: 3 },
                                    { name: 'Inteligência', attr: 'Inteligência', points: 2 },
                                    { name: 'Raciocínio', attr: 'Inteligência', points: 2 }
                                ]).map((skill, idx) => (
                                    <div key={skill.name}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.85rem' }}>
                                            {skill.name} ({skill.attr})
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={skill.points}
                                            onChange={e => {
                                                const newSkills = [...(formData.creatureSkills || [])];
                                                newSkills[idx] = { ...skill, points: parseInt(e.target.value) };
                                                setFormData(prev => ({ ...prev, creatureSkills: newSkills }));
                                                // Também atualizar skills para compatibilidade
                                                handleSkillChange(skill.name.toLowerCase().replace('ã', 'a'), parseInt(e.target.value));
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(42, 42, 46, 0.8)',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Aba Combate */}
                        {activeTab === 'combate' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Pontos de Vida</label>
                                    <input
                                        type="number"
                                        value={formData.healthPoints}
                                        onChange={e => handleCombatChange('healthPoints', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Iniciativa</label>
                                    <input
                                        type="number"
                                        value={formData.initiative}
                                        onChange={e => handleCombatChange('initiative', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Defesa</label>
                                    <input
                                        type="number"
                                        value={formData.defense}
                                        onChange={e => handleCombatChange('defense', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Absorção</label>
                                    <input
                                        type="number"
                                        value={formData.absorption}
                                        onChange={e => handleCombatChange('absorption', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Movimento (metros)</label>
                                    <input
                                        type="number"
                                        value={formData.movement}
                                        onChange={e => handleCombatChange('movement', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Iniciativa (Descrição)</label>
                                    <input
                                        type="text"
                                        value={formData.initiativeBreakdown || ''}
                                        onChange={e => handleCombatChange('initiativeBreakdown', e.target.value)}
                                        placeholder="ex: Percepção 4 + Prontidão 3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Defesa (Descrição)</label>
                                    <input
                                        type="text"
                                        value={formData.defenseBreakdown || ''}
                                        onChange={e => handleCombatChange('defenseBreakdown', e.target.value)}
                                        placeholder="ex: Raciocínio 3 + Esquiva 3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Absorção (Descrição)</label>
                                    <input
                                        type="text"
                                        value={formData.absorptionBreakdown || ''}
                                        onChange={e => handleCombatChange('absorptionBreakdown', e.target.value)}
                                        placeholder="ex: Vigor 5 + Couro Resistente 1"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Aba Ataques */}
                        {activeTab === 'ataques' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {(formData.attacks || []).map((attack, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'rgba(42, 42, 46, 0.5)',
                                        border: '1px solid #555',
                                        borderRadius: '4px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ margin: 0, color: '#fff' }}>Ataque {idx + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttack(idx)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Nome</label>
                                                <input
                                                    type="text"
                                                    value={attack.name}
                                                    onChange={e => handleUpdateAttack(idx, 'name', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        background: 'rgba(42, 42, 46, 0.8)',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Parada de Dados</label>
                                                <input
                                                    type="number"
                                                    value={attack.dicePool}
                                                    onChange={e => handleUpdateAttack(idx, 'dicePool', parseInt(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        background: 'rgba(42, 42, 46, 0.8)',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Dano</label>
                                                <input
                                                    type="text"
                                                    value={attack.damage}
                                                    onChange={e => handleUpdateAttack(idx, 'damage', e.target.value)}
                                                    placeholder="ex: d8 + Sucessos Líquidos"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        background: 'rgba(42, 42, 46, 0.8)',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Qualidades</label>
                                            <input
                                                type="text"
                                                value={attack.qualities || ''}
                                                onChange={e => handleUpdateAttack(idx, 'qualities', e.target.value)}
                                                placeholder="ex: Cruel, Precisa"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Notas</label>
                                            <textarea
                                                value={attack.notes || ''}
                                                onChange={e => handleUpdateAttack(idx, 'notes', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    minHeight: '60px',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddAttack}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#4caf50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    + Adicionar Ataque
                                </button>
                            </div>
                        )}

                        {/* Aba Habilidades */}
                        {activeTab === 'habilidades' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {(formData.abilities || []).map((ability, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'rgba(42, 42, 46, 0.5)',
                                        border: '1px solid #555',
                                        borderRadius: '4px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ margin: 0, color: '#fff' }}>Habilidade {idx + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAbility(idx)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Nome</label>
                                                <input
                                                    type="text"
                                                    value={ability.name}
                                                    onChange={e => handleUpdateAbility(idx, 'name', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        background: 'rgba(42, 42, 46, 0.8)',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Tipo de Ação</label>
                                                <select
                                                    value={ability.actionType}
                                                    onChange={e => handleUpdateAbility(idx, 'actionType', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        background: 'rgba(42, 42, 46, 0.8)',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <option value="Ação Principal">Ação Principal</option>
                                                    <option value="Ação Livre">Ação Livre</option>
                                                    <option value="Reação">Reação</option>
                                                    <option value="Passivo">Passivo</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Descrição</label>
                                            <textarea
                                                value={ability.description}
                                                onChange={e => handleUpdateAbility(idx, 'description', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    minHeight: '80px',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Efeitos (Opcional)</label>
                                            <textarea
                                                value={ability.effects || ''}
                                                onChange={e => handleUpdateAbility(idx, 'effects', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    minHeight: '60px',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddAbility}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#4caf50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    + Adicionar Habilidade
                                </button>
                            </div>
                        )}

                        {/* Aba Fraquezas */}
                        {activeTab === 'fraquezas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#4ecdc4' }}>Vulnerabilidades</h4>
                                    {(formData.vulnerabilities || []).map((vuln, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={vuln}
                                                onChange={e => handleUpdateVulnerability(idx, e.target.value)}
                                                placeholder="ex: Ataques com prata causam dano agravado"
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVulnerability(idx)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    background: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddVulnerability}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#4ecdc4',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        + Adicionar Vulnerabilidade
                                    </button>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#ffc107' }}>Fraquezas</h4>
                                    {(formData.weaknesses || []).map((weak, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={weak}
                                                onChange={e => handleUpdateWeakness(idx, e.target.value)}
                                                placeholder="ex: Fúria da Lua Cheia aumenta dificuldade de resistir"
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    background: 'rgba(42, 42, 46, 0.8)',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveWeakness(idx)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    background: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddWeakness}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#ffc107',
                                            color: '#333',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginTop: '0.5rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        + Adicionar Fraqueza
                                    </button>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Anotações Gerais</label>
                                    <textarea
                                        value={formData.notes || ''}
                                        onChange={e => handleBasicChange('notes', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(42, 42, 46, 0.8)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            minHeight: '80px',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #444',
                    background: 'rgba(42, 42, 46, 0.5)',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'transparent',
                            color: '#aaa',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#a978f8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Salvar Criatura
                    </button>
                </div>
            </div>
        </div>
    );
};
