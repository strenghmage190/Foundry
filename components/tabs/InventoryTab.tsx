import React, { useState, useMemo, useCallback } from 'react';
import { InventoryItem, Artifact, Money, Attack } from '../../types.ts';
import { AddEquipmentModal } from '../modals/AddEquipmentModal';
import { Weapon } from '../../data/equipment.ts';

interface InventoryTabProps {
    inventory: InventoryItem[];
    onInventoryChange: (newItems: InventoryItem[]) => void;
    artifacts: Artifact[];
    onArtifactsChange: (newArtifacts: Artifact[]) => void;
    money: Money;
    onMoneyChange: (newMoney: Money) => void;
    onAddAttack?: (attack: Attack) => void;
}

const LIBRAS_TO_PENNIES = 240; // 20 soli * 12 pennies
const SOLI_TO_PENNIES = 12;

export const InventoryTab: React.FC<InventoryTabProps> = ({
    inventory = [], onInventoryChange, artifacts = [], onArtifactsChange, money, onMoneyChange, onAddAttack
}) => {
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [amounts, setAmounts] = useState({ libras: '', soli: '', pennies: '' });
    const [showEquipmentModal, setShowEquipmentModal] = useState(false);
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(inventory.map(item => item.category));
        return ['Todos', ...Array.from(cats)];
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        if (activeFilter === 'Todos') return inventory;
        return inventory.filter(item => item.category === activeFilter);
    }, [inventory, activeFilter]);
    
    const handleItemChange = (id: number, field: keyof InventoryItem, value: any) => {
        onInventoryChange(inventory.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    const handleAddItem = () => {
        const newItem: InventoryItem = { id: Date.now(), name: 'Novo Item', quantity: 1, category: 'Geral', description: '', imageUrl: '' };
        onInventoryChange([...inventory, newItem]);
    };

    // Abrir modal de equipamentos
    const handleOpenEquipmentModal = () => {
        setShowEquipmentModal(true);
    };

    // Adicionar equipamentos do modal
    const handleAddEquipmentFromModal = (newEquipments: InventoryItem[]) => {
        onInventoryChange([...inventory, ...newEquipments]);
        setShowEquipmentModal(false);
    };

    // Adicionar arma em Combate
    const handleAddWeaponToCombat = useCallback((weapon: InventoryItem & Weapon) => {
        if (!onAddAttack) return;
        
        const attack: Attack = {
            id: Math.random().toString(36).substr(2, 9),
            name: weapon.name,
            attribute: '',
            skill: '',
            bonusAttack: 0,
            damageFormula: weapon.dano || '1d6',
            quality: 'Comum',
            secondaryAttribute: undefined,
            specialQualities: '',
            enhancements: '',
            range: weapon.alcance || '0m',
            ammo: weapon.municao || 0,
            maxAmmo: weapon.municao || 0,
        };
        
        onAddAttack(attack);
        setShowEquipmentModal(false);
    }, [onAddAttack]);

    // Calcular N.A. máximo entre todos os equipamentos
    const maxNA = useMemo(() => {
        if (inventory.length === 0) return 0;
        const naValues = inventory
            .filter((item) => item.na !== undefined && item.na !== null)
            .map((item) => item.na || 0);
        return naValues.length > 0 ? Math.max(...naValues) : 0;
    }, [inventory]);

    // Calcular peso total
    const totalWeight = useMemo(() => {
        return inventory.reduce((sum, item) => {
            const itemWeight = (item.peso || 0) * item.quantity;
            return sum + itemWeight;
        }, 0);
    }, [inventory]);
    const handleDeleteItem = (id: number) => {
        onInventoryChange(inventory.filter(item => item.id !== id));
    };

    const handleArtifactChange = (id: number, field: keyof Artifact, value: any) => {
        onArtifactsChange(artifacts.map(art => art.id === id ? { ...art, [field]: value } : art));
    };
    const handleAddArtifact = () => {
        const newArtifact: Artifact = { id: Date.now(), name: 'Novo Artefato', grau: 0, poderContido: '', maldicao: '', afinidade: '', ritualSelamento: '', imageUrl: '' };
        onArtifactsChange([...artifacts, newArtifact]);
    };
    const handleDeleteArtifact = (id: number) => {
        onArtifactsChange(artifacts.filter(art => art.id !== id));
    };
    
    const handleAmountChange = (currency: keyof Money, value: string) => {
        setAmounts(prev => ({...prev, [currency]: value}));
    }

    const handleUpdateMoney = useCallback((changeLibras: number, changeSoli: number, changePennies: number) => {
        const currentMoney = money || { libras: 0, soli: 0, pennies: 0 };
        
        // 1. Convert everything to the smallest unit (pennies)
        let totalPennies = (currentMoney.libras * LIBRAS_TO_PENNIES) + 
                           (currentMoney.soli * SOLI_TO_PENNIES) + 
                           currentMoney.pennies;
    
        // 2. Apply the change
        totalPennies += (changeLibras * LIBRAS_TO_PENNIES) + 
                        (changeSoli * SOLI_TO_PENNIES) + 
                        changePennies;
    
        // Ensure total doesn't go below zero
        totalPennies = Math.max(0, totalPennies);
    
        // 3. Convert back to libras, soli, and pennies
        const libras = Math.floor(totalPennies / LIBRAS_TO_PENNIES);
        const remainingAfterLibras = totalPennies % LIBRAS_TO_PENNIES;
        const soli = Math.floor(remainingAfterLibras / SOLI_TO_PENNIES);
        const pennies = remainingAfterLibras % SOLI_TO_PENNIES;
    
        onMoneyChange({ libras, soli, pennies });
    
    }, [money, onMoneyChange]);

    const handleAddMoney = (currency: keyof Money) => {
        const value = parseInt(amounts[currency], 10);
        if (isNaN(value) || value <= 0) return;

        if (currency === 'libras') handleUpdateMoney(value, 0, 0);
        if (currency === 'soli') handleUpdateMoney(0, value, 0);
        if (currency === 'pennies') handleUpdateMoney(0, 0, value);
        
        handleAmountChange(currency, '');
    };
    
    const handleRemoveMoney = (currency: keyof Money) => {
        const value = parseInt(amounts[currency], 10);
        if (isNaN(value) || value <= 0) return;

        if (currency === 'libras') handleUpdateMoney(-value, 0, 0);
        if (currency === 'soli') handleUpdateMoney(0, -value, 0);
        if (currency === 'pennies') handleUpdateMoney(0, 0, -value);

        handleAmountChange(currency, '');
    };
    
    const renderCurrencyManager = (name: string, key: keyof Money) => {
        const currentMoney = money || { libras: 0, soli: 0, pennies: 0 };
        return (
            <div style={{ 
                background: 'var(--background-color)', 
                padding: '0.75rem', 
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
            }}>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>
                    {name} Total: <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>{currentMoney[key] || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input 
                        type="number"
                        value={amounts[key]}
                        onChange={(e) => handleAmountChange(key, e.target.value)}
                        placeholder="Qtd"
                        min="1"
                        style={{ width: '60px', fontSize: '0.8rem' }}
                    />
                    <button onClick={() => handleAddMoney(key)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', flex: 1 }}>+ Add</button>
                    <button onClick={() => handleRemoveMoney(key)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', flex: 1 }}>- Rem</button>
                </div>
            </div>
        );
    };

    const currentMoney = money || { libras: 0, soli: 0, pennies: 0 };

    return (
        <div>
            <AddEquipmentModal
                isOpen={showEquipmentModal}
                onClose={() => setShowEquipmentModal(false)}
                onAdd={handleAddEquipmentFromModal}
                onAddWeaponToCombat={handleAddWeaponToCombat}
            />

            <div className="inventory-section">
                <div className="tab-header">
                    <div>
                        <h4>Equipamentos & Itens</h4>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem', display: 'flex', gap: '1.5rem' }}>
                            <span>N.A. Máximo: <span style={{ color: '#a978f8', fontWeight: 'bold' }}>{maxNA}</span></span>
                            <span>Peso Total: <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>{totalWeight.toFixed(1)}</span> espaços</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleOpenEquipmentModal} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>⚔️ Adicionar Equipamento</button>
                        <button onClick={handleAddItem} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>+ Novo Item</button>
                    </div>
                </div>
                <div className="category-filters" style={{ marginBottom: '0.75rem' }}>
                    {categories.map(cat => (
                        <button key={cat} className={activeFilter === cat ? 'active' : ''} onClick={() => setActiveFilter(cat)} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                            {cat}
                        </button>
                    ))}
                </div>
                {filteredInventory.map(item => {
                    const isExpanded = expandedItemId === item.id;
                    const isWeapon = item.category === 'Armas';
                    const weapon = item as InventoryItem & Weapon;
                    
                    return (
                    <div key={item.id}>
                        {/* Card compacto */}
                        <div 
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            style={{ 
                                background: 'var(--background-color)', 
                                padding: '0.6rem 0.75rem', 
                                border: '1px solid var(--border-color)',
                                marginBottom: isExpanded ? '0.5rem' : '0.3rem',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: isExpanded ? 'rgba(169, 120, 248, 0.15)' : 'var(--background-color)',
                                borderColor: isExpanded ? '#a978f8' : 'var(--border-color)',
                            }}>
                            {/* Chevron */}
                            <span style={{ 
                                color: isExpanded ? '#a978f8' : '#aaa', 
                                fontSize: '1rem',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                minWidth: '16px'
                            }}>
                                ▼
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', minWidth: 'max-content' }}>
                                    {item.name}
                                </span>
                                {item.quantity > 1 && (
                                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                                        x{item.quantity}
                                    </span>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {item.na !== undefined && item.na !== null && (
                                    <span style={{ color: '#a978f8' }}>N.A. {item.na}</span>
                                )}
                                {item.peso !== undefined && item.peso !== null && (
                                    <span style={{ color: '#4ecdc4' }}>Esp. {item.peso}</span>
                                )}
                                <span style={{ color: '#aaa' }}>
                                    {item.category}
                                </span>
                            </div>

                            {item.category === 'Armas' && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddWeaponToCombat(weapon);
                                    }}
                                    style={{ 
                                        background: '#ff6b6b', 
                                        border: 'none', 
                                        color: '#fff', 
                                        fontSize: '0.75rem', 
                                        cursor: 'pointer',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '3px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                >
                                    ⚔️
                                </button>
                            )}

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id);
                                }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#e57373', 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Detalhes expandidos */}
                        {isExpanded && (
                            <div style={{
                                background: 'rgba(42, 42, 46, 0.8)',
                                border: '1px solid #a978f8',
                                borderTop: 'none',
                                borderRadius: '0 0 4px 4px',
                                padding: '1rem',
                                marginBottom: '0.3rem',
                                fontSize: '0.85rem',
                                color: '#ccc',
                                animation: 'slideDown 0.2s ease'
                            }}>
                                {/* Edit Section */}
                                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #555' }}>
                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Editar Item</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ color: '#aaa', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>Nome</label>
                                            <input 
                                                type="text"
                                                value={item.name}
                                                onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.4rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid #555',
                                                    color: '#ccc',
                                                    borderRadius: '3px',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ color: '#aaa', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>Categoria</label>
                                            <input 
                                                type="text"
                                                value={item.category}
                                                onChange={e => handleItemChange(item.id, 'category', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.4rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid #555',
                                                    color: '#ccc',
                                                    borderRadius: '3px',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ color: '#aaa', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>Quantidade</label>
                                            <input 
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.4rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid #555',
                                                    color: '#ccc',
                                                    borderRadius: '3px',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <label style={{ color: '#aaa', fontSize: '0.7rem', display: 'block', marginBottom: '0.3rem' }}>Descrição</label>
                                        <textarea 
                                            value={item.description || ''}
                                            onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.4rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid #555',
                                                color: '#ccc',
                                                borderRadius: '3px',
                                                fontSize: '0.85rem',
                                                minHeight: '2.5rem',
                                                fontFamily: 'inherit',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Info Headers */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Categoria</div>
                                        <div style={{ color: '#4ecdc4', fontWeight: 'bold' }}>{item.category}</div>
                                    </div>

                                    {item.na !== undefined && item.na !== null && (
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>N.A.</div>
                                            <div style={{ color: '#a978f8', fontWeight: 'bold' }}>{item.na}</div>
                                        </div>
                                    )}

                                    {item.peso !== undefined && item.peso !== null && (
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Espaços</div>
                                            <div style={{ color: '#4ecdc4', fontWeight: 'bold' }}>{item.peso}</div>
                                        </div>
                                    )}

                                    {item.quantity && (
                                        <div>
                                            <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Quantidade</div>
                                            <div style={{ color: '#ffd93d', fontWeight: 'bold' }}>{item.quantity}</div>
                                        </div>
                                    )}
                                </div>

                                {isWeapon && (
                                    <div style={{ borderTop: '1px solid #555', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{ color: '#aaa', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 'bold' }}>Detalhes da Arma</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                            {weapon.dano && (
                                                <div>
                                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Dano</div>
                                                    <div style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '1rem' }}>{weapon.dano}</div>
                                                </div>
                                            )}

                                            {weapon.critico && (
                                                <div>
                                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Crítico</div>
                                                    <div style={{ color: '#ffd93d', fontWeight: 'bold' }}>{weapon.critico}</div>
                                                </div>
                                            )}

                                            {weapon.tipo && (
                                                <div>
                                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Tipo</div>
                                                    <div style={{ color: '#4ecdc4' }}>{weapon.tipo}</div>
                                                </div>
                                            )}

                                            {weapon.alcance && (
                                                <div>
                                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Alcance</div>
                                                    <div style={{ color: '#b19cd9' }}>{weapon.alcance}</div>
                                                </div>
                                            )}

                                            {weapon.municao !== undefined && weapon.municao !== null && (
                                                <div>
                                                    <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase' }}>Munição</div>
                                                    <div style={{ color: '#ff9800' }}>{weapon.municao}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {weapon.qualidades && weapon.qualidades.length > 0 && (
                                    <div style={{ borderTop: '1px solid #555', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>Qualidades</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {weapon.qualidades.map((q, idx) => (
                                                <span 
                                                    key={idx}
                                                    style={{
                                                        backgroundColor: 'rgba(169, 120, 248, 0.3)',
                                                        color: '#a978f8',
                                                        padding: '0.4rem 0.7rem',
                                                        borderRadius: '3px',
                                                        fontSize: '0.75rem',
                                                        border: '1px solid rgba(169, 120, 248, 0.5)'
                                                    }}
                                                >
                                                    {q}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.description && (
                                    <div style={{ borderTop: '1px solid #555', paddingTop: '0.75rem', color: '#aaa' }}>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#999' }}>Descrição</div>
                                        <div style={{ fontStyle: 'italic', lineHeight: '1.4', color: '#bbb' }}>
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            <div className="artifacts-section" style={{ marginTop: '1.5rem' }}>
                <div className="tab-header">
                    <h4 style={{ margin: 0 }}>Artefatos Selados</h4>
                    <button onClick={handleAddArtifact} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>+ Novo Artefato</button>
                </div>
                {artifacts.map(art => (
                    <div key={art.id} style={{ 
                        background: 'var(--background-color)', 
                        padding: '0.75rem', 
                        border: '1px solid var(--border-color)',
                        marginBottom: '0.5rem',
                        marginTop: '0.75rem',
                        borderRadius: '4px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <input 
                                type="text" 
                                value={art.name} 
                                onChange={e => handleArtifactChange(art.id, 'name', e.target.value)}
                                style={{ fontSize: '0.95rem', fontWeight: '600', flex: 1 }}
                            />
                            <button 
                                onClick={() => handleDeleteArtifact(art.id)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#e57373', 
                                    fontSize: '1.4rem', 
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '24px',
                                    height: '24px',
                                    flexShrink: 0
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <textarea 
                                value={art.poderContido} 
                                onChange={e => handleArtifactChange(art.id, 'poderContido', e.target.value)} 
                                placeholder="Poder Contido..."
                                style={{ fontSize: '0.8rem', minHeight: '50px' }}
                            />
                            <textarea 
                                value={art.maldicao} 
                                onChange={e => handleArtifactChange(art.id, 'maldicao', e.target.value)} 
                                placeholder="Maldição..."
                                style={{ fontSize: '0.8rem', minHeight: '50px' }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="money-section" style={{ marginTop: '1.5rem' }}>
                <div className="tab-header" style={{ marginBottom: '0.75rem' }}><h4 style={{ margin: 0 }}>Dinheiro</h4></div>
                <div style={{ 
                    background: 'var(--background-color)', 
                    padding: '0.75rem', 
                    border: '1px solid var(--border-color)',
                    marginBottom: '0.75rem',
                    borderRadius: '4px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    textAlign: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Libras</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#a978f8', textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>{currentMoney.libras}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Solis</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ecdc4', textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>{currentMoney.soli}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Pennies</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffd93d', textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>{currentMoney.pennies}</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                    {renderCurrencyManager("Libras", "libras")}
                    {renderCurrencyManager("Solis", "soli")}
                    {renderCurrencyManager("Pennies", "pennies")}
                </div>
            </div>
        </div>
    );
};