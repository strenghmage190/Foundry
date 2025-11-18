import React, { useEffect, useState, useMemo } from 'react';
import { Ritual, LearnedParticle, AgentData, ToastData } from '../../types.ts';

// --- Modal Component Definition ---
interface ArcaneDeconstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentData;
    onUpdate: (update: Partial<AgentData>) => void;
    addLogEntry: (log: Omit<ToastData, 'id'>) => void;
}

const ArcaneDeconstructionModal: React.FC<ArcaneDeconstructionModalProps> = ({ isOpen, onClose, agent, onUpdate, addLogEntry }) => {
    const [selectedAbilityId, setSelectedAbilityId] = useState<string>('');
    const [newParticleName, setNewParticleName] = useState('');

    const COST = 50;
    const canAfford = agent.character.paDisponivel >= COST;

    const handleConfirm = () => {
        if (!canAfford || !selectedAbilityId || !newParticleName.trim()) {
            return;
        }

        const newParticle: LearnedParticle = {
            id: Date.now() + Math.random(),
            type: 'Descoberta',
            name: newParticleName.trim(),
            description: `Partícula descoberta através da desconstrução da habilidade: ${agent.habilidadesBeyonder.find(h => h.id === Number(selectedAbilityId))?.name || 'Desconhecida'}.`,
            isDomain: false,
        };

        onUpdate({
            character: {
                ...agent.character,
                paDisponivel: agent.character.paDisponivel - COST,
                paTotalGasto: agent.character.paTotalGasto + COST,
            },
            learnedParticles: [...agent.learnedParticles, newParticle],
        });
        
        addLogEntry({
            type: 'info',
            title: 'Desconstrução Arcana',
            message: `Você aprendeu a Partícula: ${newParticle.name}.`,
            details: `Gastou ${COST} PA para desconstruir uma habilidade.`,
        });

        onClose();
    };
    
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedAbilityId('');
            setNewParticleName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">Desconstrução Arcana</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p>Este processo requer intensa meditação e um profundo entendimento do seu poder. Você gastará 50 Pontos de Atuação para desconstruir uma habilidade e revelar sua Partícula Mágica fundamental.</p>
                    
                    <div className="form-group">
                        <label htmlFor="skill-to-deconstruct-select">Habilidade a Desconstruir:</label>
                        <select
                            id="skill-to-deconstruct-select"
                            value={selectedAbilityId}
                            onChange={(e) => setSelectedAbilityId(e.target.value)}
                        >
                            <option value="" disabled>Selecione uma habilidade...</option>
                            {agent.habilidadesBeyonder.filter(ability => ability.isDomain).map(ability => (
                                <option key={ability.id} value={ability.id.toString()}>
                                    {ability.name} ({ability.seqName || 'Única'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="revealed-particle-input">Partícula Revelada:</label>
                        <input 
                            id="revealed-particle-input"
                            type="text"
                            value={newParticleName}
                            onChange={(e) => setNewParticleName(e.target.value)}
                            placeholder="Ex: Neurospasta (Objeto)"
                        />
                    </div>

                    <div>
                        <strong>Custo:</strong> {COST} PA
                        {!canAfford && <p style={{ color: 'var(--error-color)', marginTop: '0.5rem' }}>PA insuficiente.</p>}
                    </div>

                </div>
                <div className="modal-footer">
                    <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--secondary-text-color)', color: 'var(--secondary-text-color)' }}>Cancelar</button>
                    <button 
                        id="confirm-deconstruction-btn"
                        onClick={handleConfirm}
                        disabled={!canAfford || !selectedAbilityId || !newParticleName.trim()}
                    >
                        Confirmar e Aprender
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Particle Detail Popup ---
interface ParticleDetailPopupProps {
    particle: LearnedParticle | null;
    onClose: () => void;
}

const ParticleDetailPopup: React.FC<ParticleDetailPopupProps> = ({ particle, onClose }) => {
    if (!particle) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="particle-popup" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: 'var(--character-color, #a978f8)', margin: 0 }}>{particle.name}</h3>
                <span className="particle-type">{particle.type} {particle.palavra ? `(${particle.palavra})` : ''}</span>
                <p className="particle-description">{particle.description}</p>
                <div className="popup-actions">
                    <button onClick={onClose} className="button-primary">Fechar</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Tab Component ---
interface MagicTabProps {
    agent: AgentData;
    onUpdate: (update: Partial<AgentData>) => void;
    onOpenMagicGrimoire: () => void;
    addLogEntry: (log: Omit<ToastData, 'id'>) => void;
}

export const MagicTab: React.FC<MagicTabProps> = ({
    agent, onUpdate, onOpenMagicGrimoire, addLogEntry
}) => {
    if (!agent) return null;

    const [isDeconstructionModalOpen, setIsDeconstructionModalOpen] = useState(false);
    const { rituais = [], learnedParticles = [], character } = agent;

    const [selectedParticle, setSelectedParticle] = useState<LearnedParticle | null>(null);

    const groupedParticles = useMemo(() => {
        const groups: Record<string, LearnedParticle[]> = {
            'Função': [],
            'Objeto': [],
            'Característica': [],
            'Complemento': [],
            'Criador': [],
            'Outro': [],
        };
        learnedParticles.forEach(p => {
            const t = p.type || 'Outro';
            if (!groups[t]) groups[t] = [];
            groups[t].push(p);
        });
        return groups;
    }, [learnedParticles]);

    const handleRitualChange = (id: number, field: keyof Ritual, value: any) => {
        const newRituals = rituais.map(r => r.id === id ? { ...r, [field]: value } : r);
        onUpdate({ rituais: newRituals });
    };

    const handleAddRitual = () => {
        const newRitual: Ritual = { id: Date.now(), name: 'Novo Ritual', description: '' };
        onUpdate({ rituais: [...rituais, newRitual] });
    };

    const handleDeleteRitual = (id: number) => {
        const newRituals = rituais.filter(r => r.id !== id);
        onUpdate({ rituais: newRituals });
    };
    
    const handleDeleteParticle = (id: number) => {
        console.log('Tentando deletar partícula:', id);
        console.log('Partículas antes:', learnedParticles);
        const particleToDelete = learnedParticles.find(p => p.id === id);
        console.log('Partícula a deletar:', particleToDelete);
        
        if (particleToDelete?.isDomain) {
            console.warn('Tentativa de deletar partícula de domínio bloqueada');
            return;
        }
        
        const newParticles = learnedParticles.filter(p => p.id !== id);
        console.log('Partículas depois:', newParticles);
        console.log('Chamando onUpdate com:', { learnedParticles: newParticles });
        onUpdate({ learnedParticles: newParticles });
    };

    return (
        <div className="magic-tab">
            <div className="magic-section">
                <div className="magic-section-header">
                    <h3>Rituais & Feitiçaria</h3>
                    <button className="button-primary" onClick={handleAddRitual}>+ Novo Ritual</button>
                </div>
                <div className="magic-section-content">
                    {rituais.length === 0 ? (
                        <p className="empty-state-text">Nenhum ritual criado ainda.</p>
                    ) : (
                        rituais.map(ritual => (
                            <div key={ritual.id} className="tab-list-item">
                                <div className="item-header">
                                    <input type="text" value={ritual.name} onChange={e => handleRitualChange(ritual.id, 'name', e.target.value)} />
                                    <button onClick={() => handleDeleteRitual(ritual.id)}>&times;</button>
                                </div>
                                <textarea value={ritual.description} onChange={e => handleRitualChange(ritual.id, 'description', e.target.value)} placeholder="Descrição do ritual..."></textarea>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="magic-section">
                <div className="magic-section-header">
                    <h3>Partículas Arcanas Aprendidas</h3>
                    <div>
                        {character.sequence <= 4 && (
                            <button className="button-secondary" onClick={() => setIsDeconstructionModalOpen(true)}>Desconstrução Arcana</button>
                        )}
                        <button className="button-secondary" onClick={onOpenMagicGrimoire} style={{ marginLeft: '0.5rem' }}>Adicionar do Grimório</button>
                    </div>
                </div>
                <div className="magic-section-content">
                    {/* Single-column list with popup for details */}
                    <div className="particles-list-container">
                        {Object.entries(groupedParticles).map(([groupName, items]) => (
                            <div key={groupName} className="particle-group">
                                <h4>{groupName}</h4>
                                <div className="particles-grid">
                                    {items.length === 0 ? (
                                        <span className="empty-group">— nenhum —</span>
                                    ) : (
                                        items.map(particle => {
                                            const isDomainParticle = particle.isDomain === true;
                                            return (
                                            <div
                                                key={particle.id}
                                                className={`particle-tag ${isDomainParticle ? 'domain-particle' : ''}`}
                                                title={isDomainParticle ? `${particle.description}\n\n⚠️ Partículas de domínio não podem ser removidas` : particle.description}
                                                onClick={() => setSelectedParticle(particle)}
                                            >
                                                <span>{particle.name} {particle.palavra ? `(${particle.palavra})` : ''}</span>
                                                {!isDomainParticle && (
                                                    <button
                                                        className="remove-particle-btn"
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            console.log('Clicou para remover:', particle.name, particle.id, 'isDomain:', particle.isDomain);
                                                            handleDeleteParticle(particle.id); 
                                                        }}
                                                        aria-label={`Remover ${particle.name}`}
                                                        title="Remover partícula"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        )})
                                    )}
                                </div>
                            </div>
                        ))}
                        {learnedParticles.length === 0 && (
                            <p className="empty-state-text">Nenhuma partícula aprendida.</p>
                        )}
                    </div>

                    {/* When a particle is selected show popup (we keep selection for keyboard/nav too) */}
                    <ParticleDetailPopup particle={selectedParticle} onClose={() => setSelectedParticle(null)} />
                </div>
            </div>

            {isDeconstructionModalOpen && <ArcaneDeconstructionModal 
                isOpen={isDeconstructionModalOpen}
                onClose={() => setIsDeconstructionModalOpen(false)}
                agent={agent}
                onUpdate={onUpdate}
                addLogEntry={addLogEntry}
            />}
        </div>
    );
};