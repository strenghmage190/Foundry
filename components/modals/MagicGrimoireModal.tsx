import React, { useState } from 'react';
import { magicData } from '../../data/magic-data.tsx';
import { LearnedParticle } from '../../types.ts';
import { getParticleType } from '../../data/magic-particles';

interface MagicGrimoireModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddParticles: (particles: Omit<LearnedParticle, 'id'>[]) => void;
}

export const MagicGrimoireModal: React.FC<MagicGrimoireModalProps> = ({ isOpen, onClose, onAddParticles }) => {
    const [selectedParticles, setSelectedParticles] = useState<Record<string, Omit<LearnedParticle, 'id'>>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [acquisitionMethod, setAcquisitionMethod] = useState<'universal' | 'study' | 'revelation'>('study');
    const [associatedSkill, setAssociatedSkill] = useState('');
    const [arcanaName, setArcanaName] = useState('');

    if (!isOpen) return null;

    const handleSelectParticle = (particle: Omit<LearnedParticle, 'id'>) => {
        setSelectedParticles(prev => {
            const newSelected = { ...prev };
            const key = `${particle.type}-${particle.name}`;
            if (newSelected[key]) {
                delete newSelected[key];
            } else {
                newSelected[key] = particle;
            }
            return newSelected;
        });
    };

    const handleAdd = () => {
        // Add acquisition method to all selected particles
        const particlesWithMethod = Object.values(selectedParticles).map(p => ({
            ...p,
            acquisitionMethod,
            associatedSkill: acquisitionMethod === 'universal' ? associatedSkill : undefined,
            arcanaName: acquisitionMethod === 'revelation' ? arcanaName : undefined,
            isCorrupted: false
        }));
        onAddParticles(particlesWithMethod);
        setSelectedParticles({});
        setAssociatedSkill('');
        setArcanaName('');
        onClose();
    };
    
    const allParticles = {
        'Funções': magicData.funcoes.map(p => ({ ...p, type: 'Função' })),
        'Objetos': magicData.objetos.map(p => ({ ...p, type: 'Objeto' })),
        'Características': Object.values(magicData.caracteristicas).flat().map(p => ({ ...p, type: 'Característica' })),
        'Complementos': magicData.complementos.map(p => ({ ...p, type: 'Complemento' })),
        'Criadores': magicData.criadores.map(p => ({ ...p, type: 'Criador' })),
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">Grimório de Partículas Arcanas</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>
                
                {/* Acquisition Method Selector */}
                <div className="acquisition-method-selector">
                    <div className="form-group">
                        <label>Método de Aquisição:</label>
                        <select value={acquisitionMethod} onChange={(e) => setAcquisitionMethod(e.target.value as any)}>
                            <option value="study">📚 Estudo (10 PA + 1 semana + teste)</option>
                            <option value="universal">🌐 Universal (de habilidade investigativa)</option>
                            <option value="revelation">✨ Revelação (de Arcana)</option>
                        </select>
                    </div>
                    
                    {acquisitionMethod === 'universal' && (
                        <div className="form-group">
                            <label>Habilidade Associada:</label>
                            <input 
                                type="text" 
                                value={associatedSkill} 
                                onChange={(e) => setAssociatedSkill(e.target.value)}
                                placeholder="Ex: Antropologia, História, Oculto..."
                            />
                            <small style={{color: '#888', fontSize: '0.85rem'}}>
                                Cada 3 pontos em habilidades investigativas = 1 partícula universal
                            </small>
                        </div>
                    )}
                    
                    {acquisitionMethod === 'revelation' && (
                        <div className="form-group">
                            <label>Nome da Arcana:</label>
                            <input 
                                type="text" 
                                value={arcanaName} 
                                onChange={(e) => setArcanaName(e.target.value)}
                                placeholder="Ex: Sacerdotisa, Hierofante..."
                            />
                            <small style={{color: '#888', fontSize: '0.85rem'}}>
                                Revelada ao atingir 100% de digestão (Seq 8, 7, 5, 2)
                            </small>
                        </div>
                    )}
                    
                    {acquisitionMethod === 'study' && (
                        <div className="form-group">
                            <small style={{color: '#ffa500', fontSize: '0.85rem'}}>
                                ⚠️ Requer 10 PA, 1 semana de tempo e teste de Int+Oculto. Falha crítica = partícula corrompida.
                            </small>
                        </div>
                    )}
                </div>
                
                <div className="grimoire-body">
                    {Object.entries(allParticles).map(([category, particles]) => (
                        <div key={category} className="grimoire-column">
                            <h4>{category}</h4>
                            <div className="grimoire-list">
                                {particles.map((particle) => {
                                    const pKey = `${particle.type}-${particle.nome}`;
                                    const isSelected = !!selectedParticles[pKey];
                                    return (
                                        <div key={pKey} className={`grimoire-item ${isSelected ? 'selected' : ''}`} onClick={() => handleSelectParticle({ type: particle.type, name: particle.nome, palavra: particle.palavra, description: particle.desc })}>
                                            <h5>{particle.nome} {particle.palavra ? `(${particle.palavra})` : ''}</h5>
                                            <p>{particle.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose}>Cancelar</button>
                    <button 
                        onClick={handleAdd} 
                        disabled={
                            Object.keys(selectedParticles).length === 0 ||
                            (acquisitionMethod === 'universal' && !associatedSkill.trim()) ||
                            (acquisitionMethod === 'revelation' && !arcanaName.trim())
                        }
                    >
                        Adicionar {Object.keys(selectedParticles).length} Partículas
                    </button>
                </div>
            </div>
        </div>
    );
};