import React, { useState, useEffect } from 'react';
import { Enemy } from '../../types';
import { supabase } from '../../supabaseClient';

interface SelectCreatureModalProps {
    isOpen: boolean;
    onSelect: (creature: Enemy) => void;
    onClose: () => void;
}

export const SelectCreatureModal: React.FC<SelectCreatureModalProps> = ({ isOpen, onSelect, onClose }) => {
    const [creatures, setCreatures] = useState<Enemy[]>([]);
    const [loading, setLoading] = useState(true);

    const getCurrentUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id;
    };

    const fetchCreatures = async () => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;

            const { data, error } = await supabase
                .from('creatures')
                .select('data')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const creaturesList = (data || []).map(row => row.data as Enemy);
            setCreatures(creaturesList);
        } catch (error) {
            console.error('Erro ao buscar criaturas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchCreatures();
        }
    }, [isOpen]);

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
                maxWidth: '600px',
                maxHeight: '80vh',
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
                    <h2 style={{ margin: 0, color: '#fff' }}>Selecione uma Criatura</h2>
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

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1.5rem'
                }}>
                    {loading ? (
                        <div style={{ color: '#aaa', textAlign: 'center' }}>
                            Carregando criaturas...
                        </div>
                    ) : creatures.length === 0 ? (
                        <div style={{ color: '#aaa', textAlign: 'center' }}>
                            Nenhuma criatura criada. Crie uma em Criaturas primeiro!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {creatures.map((creature, idx) => (
                                <button
                                    key={`creature-${creature.id}-${idx}`}
                                    onClick={() => {
                                        onSelect(creature);
                                        onClose();
                                    }}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(42, 42, 46, 0.8)',
                                        border: '1px solid #444',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(169, 120, 248, 0.2)';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#a978f8';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(42, 42, 46, 0.8)';
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#444';
                                    }}
                                >
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>
                                            {creature.name}
                                        </h4>
                                        <p style={{ margin: '0', color: '#999', fontSize: '0.85rem' }}>
                                            {creature.healthPoints} PV · {creature.threatLevel}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'rgba(169, 120, 248, 0.3)',
                                        color: '#a978f8',
                                        borderRadius: '3px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        + Adicionar
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectCreatureModal;
