import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface PathwaySequence {
    name: string;
    desc: string;
}

interface PathwaySequences {
    [sequenceName: string]: PathwaySequence[];
}

interface MagicParticle {
    name: string;
    translation: string;
    type: string;
    conceito: string;
    exemplo: string;
    uso?: string;
}

interface PathwayDomain {
    description: string;
    particulas: MagicParticle[];
}

interface PathwayData {
    category: string;
    pathway: string;
    domain: PathwayDomain;
    sequences: PathwaySequences;
}

interface CreatePathwayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (pathwayData: PathwayData) => Promise<void>;
}

export const CreatePathwayModal: React.FC<CreatePathwayModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [pathwayName, setPathwayName] = useState('');
    const [category, setCategory] = useState('');
    const [domainDescription, setDomainDescription] = useState('');
    const [particles, setParticles] = useState<MagicParticle[]>([]);
    const [sequences, setSequences] = useState<{ [key: string]: PathwaySequence[] }>({});
    const [currentParticle, setCurrentParticle] = useState<MagicParticle>({
        name: '',
        translation: '',
        type: 'Objeto',
        conceito: '',
        exemplo: '',
        uso: ''
    });
    const [currentSequence, setCurrentSequence] = useState('Sequência 9');
    const [currentAbility, setCurrentAbility] = useState({ name: '', desc: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setPathwayName('');
        setCategory('');
        setDomainDescription('');
        setParticles([]);
        setSequences({});
        setCurrentParticle({
            name: '',
            translation: '',
            type: 'Objeto',
            conceito: '',
            exemplo: '',
            uso: ''
        });
        setCurrentSequence('Sequência 9');
        setCurrentAbility({ name: '', desc: '' });
    };

    const handleAddParticle = () => {
        if (currentParticle.name && currentParticle.translation && currentParticle.conceito) {
            setParticles([...particles, currentParticle]);
            setCurrentParticle({
                name: '',
                translation: '',
                type: 'Objeto',
                conceito: '',
                exemplo: '',
                uso: ''
            });
        }
    };

    const handleRemoveParticle = (index: number) => {
        setParticles(particles.filter((_, i) => i !== index));
    };

    const handleAddAbility = () => {
        if (currentAbility.name && currentAbility.desc && currentSequence) {
            setSequences(prev => ({
                ...prev,
                [currentSequence]: [...(prev[currentSequence] || []), currentAbility]
            }));
            setCurrentAbility({ name: '', desc: '' });
        }
    };

    const handleRemoveAbility = (sequenceName: string, index: number) => {
        setSequences(prev => ({
            ...prev,
            [sequenceName]: prev[sequenceName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!pathwayName || !category || !domainDescription) {
            alert('Por favor, preencha os campos obrigatórios: Nome do Caminho, Categoria e Descrição do Domínio.');
            return;
        }

        setIsSubmitting(true);

        const newPathwayData: PathwayData = {
            category,
            pathway: pathwayName,
            domain: {
                description: domainDescription,
                particulas: particles
            },
            sequences
        };

        try {
            await onCreate(newPathwayData);
            onClose();
        } catch (error) {
            console.error('Erro ao criar caminho:', error);
            alert('Erro ao criar o caminho. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h3 className="title-font">Criar Novo Caminho Personalizado</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Informações Básicas */}
                    <div className="form-section">
                        <h4 style={{ marginBottom: '0.75rem', color: '#aaa' }}>Informações Básicas</h4>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                                <label>Nome do Caminho *</label>
                                <input
                                    type="text"
                                    value={pathwayName}
                                    onChange={e => setPathwayName(e.target.value)}
                                    placeholder="Ex: CAMINHO DO COLECIONADOR"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoria *</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    placeholder="Ex: Lord of Mysteries"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Descrição do Domínio *</label>
                            <textarea
                                value={domainDescription}
                                onChange={e => setDomainDescription(e.target.value)}
                                placeholder="Descreva a essência mágica e filosófica deste caminho..."
                                rows={3}
                                required
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Partículas Mágicas */}
                    <div className="form-section">
                        <h4 style={{ marginBottom: '0.75rem', color: '#aaa' }}>Partículas Mágicas</h4>
                        
                        {/* Lista de Partículas Adicionadas */}
                        {particles.length > 0 && (
                            <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {particles.map((particle, index) => (
                                    <div key={index} className="particle-tag">
                                        <span>{particle.name} ({particle.translation})</span>
                                        <button type="button" onClick={() => handleRemoveParticle(index)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Formulário para Adicionar Partícula */}
                        <div style={{ background: '#1a1a1c', padding: '1rem', borderRadius: '6px', border: '1px solid #333' }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Nome</label>
                                    <input
                                        type="text"
                                        value={currentParticle.name}
                                        onChange={e => setCurrentParticle({ ...currentParticle, name: e.target.value })}
                                        placeholder="Ex: Apatē"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tradução</label>
                                    <input
                                        type="text"
                                        value={currentParticle.translation}
                                        onChange={e => setCurrentParticle({ ...currentParticle, translation: e.target.value })}
                                        placeholder="Ex: Falha"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select
                                        value={currentParticle.type}
                                        onChange={e => setCurrentParticle({ ...currentParticle, type: e.target.value })}
                                    >
                                        <option value="Objeto">Objeto</option>
                                        <option value="Função">Função</option>
                                        <option value="Conceito">Conceito</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Conceito</label>
                                <textarea
                                    value={currentParticle.conceito}
                                    onChange={e => setCurrentParticle({ ...currentParticle, conceito: e.target.value })}
                                    placeholder="Descreva o conceito fundamental desta partícula..."
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>Exemplo de Uso</label>
                                <textarea
                                    value={currentParticle.exemplo}
                                    onChange={e => setCurrentParticle({ ...currentParticle, exemplo: e.target.value })}
                                    placeholder="Exemplo de como usar esta partícula..."
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>Uso Adicional (opcional)</label>
                                <textarea
                                    value={currentParticle.uso}
                                    onChange={e => setCurrentParticle({ ...currentParticle, uso: e.target.value })}
                                    placeholder="Outro exemplo de uso..."
                                    rows={2}
                                />
                            </div>
                            <button type="button" onClick={handleAddParticle} className="button-secondary">
                                + Adicionar Partícula
                            </button>
                        </div>
                    </div>

                    {/* Sequências e Habilidades */}
                    <div className="form-section">
                        <h4 style={{ marginBottom: '0.75rem', color: '#aaa' }}>Sequências e Habilidades</h4>
                        
                        {/* Lista de Sequências Adicionadas */}
                        {Object.keys(sequences).length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                {Object.entries(sequences).map(([seqName, abilities]: [string, PathwaySequence[]]) => (
                                    <div key={seqName} style={{ marginBottom: '1rem', background: '#151517', padding: '1rem', borderRadius: '6px' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--character-color, #a978f8)' }}>{seqName}</h5>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                            {abilities.map((ability: PathwaySequence, index: number) => (
                                                <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span><strong>{ability.name}:</strong> {ability.desc}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAbility(seqName, index)}
                                                        className="remove-btn"
                                                        style={{ marginLeft: '0.5rem' }}
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Formulário para Adicionar Habilidade */}
                        <div style={{ background: '#1a1a1c', padding: '1rem', borderRadius: '6px', border: '1px solid #333' }}>
                            <div className="form-group">
                                <label>Sequência</label>
                                <select
                                    value={currentSequence}
                                    onChange={e => setCurrentSequence(e.target.value)}
                                >
                                    {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(num => (
                                        <option key={num} value={`Sequência ${num}`}>Sequência {num}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nome da Habilidade</label>
                                <input
                                    type="text"
                                    value={currentAbility.name}
                                    onChange={e => setCurrentAbility({ ...currentAbility, name: e.target.value })}
                                    placeholder="Ex: Controle dos Fios Espirituais"
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição da Habilidade</label>
                                <textarea
                                    value={currentAbility.desc}
                                    onChange={e => setCurrentAbility({ ...currentAbility, desc: e.target.value })}
                                    placeholder="Descreva os efeitos, custo de PE, testes necessários..."
                                    rows={3}
                                />
                            </div>
                            <button type="button" onClick={handleAddAbility} className="button-secondary">
                                + Adicionar Habilidade
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="button-secondary" disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Criando...' : 'Criar Caminho'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
