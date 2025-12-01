import React, { useState, useEffect } from 'react';
import { Attack } from '../../types';
import { initialHabilidadesState } from '../../constants';

// Constants for dropdowns
const allSkills = [
    ...initialHabilidadesState.gerais.map(s => s.name),
    ...initialHabilidadesState.investigativas.map(s => s.name)
].sort();

const allAttributes = [
    'forca', 'destreza', 'vigor', 'carisma', 'manipulacao', 'autocontrole',
    'percepcao', 'inteligencia', 'raciocinio', 'espiritualidade'
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface AddWeaponModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Support two prop names: `onSave` (older) and `onAddAttack` (used by CharacterSheetPage)
    onSave?: (attack: Omit<Attack, 'id'> & { id?: string }) => void;
    onAddAttack?: (attack: Omit<Attack, 'id'> & { id?: string }) => void;
    initialData?: Attack | null;
    attributes?: Record<string, number>;
    skills?: Array<{ name: string; points: number }>;
}

const initialWeaponState: Omit<Attack, 'id'> = {
    name: '',
    damageFormula: '1d8',
    quality: 'Comum',
    specialQualities: '',
    enhancements: '',
    skill: 'Briga',
    attribute: 'forca',
    bonusAttack: 0,
    range: 'Toque',
    ammo: 0,
    maxAmmo: 0,
};

export const AddWeaponModal: React.FC<AddWeaponModalProps> = ({ isOpen, onClose, onSave, onAddAttack, initialData, attributes = {}, skills = [] }) => {
    const [weapon, setWeapon] = useState<Omit<Attack, 'id'> & { id?: string }>(initialData || initialWeaponState);

    useEffect(() => {
        if (isOpen) {
            setWeapon(initialData || initialWeaponState);
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof Attack, value: string | number) => {
        setWeapon(prev => ({ ...prev, [field]: value }));
    };

    // Calcular parada de ataque automaticamente
    const getAttributeValue = (attr: string): number => {
        return attributes[attr] || 0;
    };

    const getSkillValue = (skillName: string): number => {
        const skill = skills.find(s => s.name === skillName);
        return skill?.points || 0;
    };

    const attributeValue = getAttributeValue(weapon.attribute);
    const skillValue = getSkillValue(weapon.skill);
    const totalAttackPool = attributeValue + skillValue;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // prefer onAddAttack if provided (page uses that), fallback to onSave
        const weaponToSave = { ...weapon, id: weapon.id || `atk-${Date.now()}` };
        if (typeof (onAddAttack as any) === 'function') {
            (onAddAttack as any)(weaponToSave);
        } else if (typeof (onSave as any) === 'function') {
            (onSave as any)(weaponToSave);
        } else {
            console.warn('No save handler provided for AddWeaponModal');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">{initialData ? 'Editar Arma' : 'Adicionar Nova Arma'}</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="add-attack-form">
                    <div className="form-grid">
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label>Nome da Arma</label>
                            <input type="text" value={weapon.name} onChange={e => handleChange('name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Fórmula de Dano</label>
                            <input type="text" value={weapon.damageFormula} onChange={e => handleChange('damageFormula', e.target.value)} placeholder="ex: 1d8"/>
                        </div>
                         <div className="form-group">
                            <label>Qualidade de Fabricação</label>
                            <select value={weapon.quality} onChange={e => handleChange('quality', e.target.value)}>
                                <option value="Comum">Comum</option>
                                <option value="Superior">Superior (+1)</option>
                                <option value="Obra-Prima">Obra-Prima (+2)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Atributo</label>
                            <select value={weapon.attribute} onChange={e => handleChange('attribute', e.target.value)}>
                                {allAttributes.map(attr => <option key={attr} value={attr}>{capitalize(attr)}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Perícia</label>
                            <select value={weapon.skill} onChange={e => handleChange('skill', e.target.value)}>
                                {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Parada de Ataque</label>
                            <div style={{ 
                                padding: '0.75rem', 
                                background: 'rgba(169, 120, 248, 0.1)', 
                                border: '1px solid #a978f8',
                                borderRadius: '4px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                color: '#a978f8'
                            }}>
                                {totalAttackPool} 
                                <small style={{ color: '#aaa', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                    ({capitalize(weapon.attribute)} {attributeValue} + {weapon.skill} {skillValue})
                                </small>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Bônus Adicional</label>
                            <input type="number" value={weapon.bonusAttack} onChange={e => handleChange('bonusAttack', Number(e.target.value))} placeholder="Bônus de arma ou qualidade (+n)" />
                        </div>
                        <div className="form-group">
                            <label>Alcance</label>
                            <input type="text" value={weapon.range} onChange={e => handleChange('range', e.target.value)} />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label>Qualidades Especiais</label>
                            <input type="text" value={weapon.specialQualities} onChange={e => handleChange('specialQualities', e.target.value)} placeholder="ex: Precisa, Defensiva, Rápida" />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label>Aprimoramentos (Opcional)</label>
                            <textarea value={weapon.enhancements} onChange={e => handleChange('enhancements', e.target.value)} placeholder="Descreva melhorias de Ferreiro, Engenheiro ou Ocultas aqui..." />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};