import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Enemy } from '../types.ts';
import { supabase } from '../supabaseClient.ts';
import { EnemySheet } from './EnemySheet.tsx';
import { EditCreatureModal } from './modals/EditCreatureModal.tsx';

export const CreaturesListPage: React.FC = () => {
    const navigate = useNavigate();
    // cada criatura inclui agora a propriedade interna `__rowId` (id da linha no Supabase)
    const [creatures, setCreatures] = useState<Array<Enemy & { __rowId?: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCreature, setSelectedCreature] = useState<Enemy | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCreature, setEditingCreature] = useState<Enemy | null>(null);

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
                .select('id, data')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Extrair os dados das criaturas do JSONB e preservar o id da linha
            const creaturesList = (data || []).map((row: any) => ({ ...(row.data as Enemy), __rowId: row.id }));
            setCreatures(creaturesList);
        } catch (error) {
            console.error('Erro ao buscar criaturas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreatures();
    }, []);

    const handleCreateCreature = async (creature: Enemy) => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;

            const { data: inserted, error } = await supabase
                .from('creatures')
                .insert([{ 
                    owner_id: userId,
                    data: creature
                }])
                .select('id, data')
                .single();

            if (error) throw error;

            const created = inserted ? { ...(inserted.data as Enemy), __rowId: inserted.id } : { ...creature };
            setCreatures([created, ...creatures]);
            setShowEditModal(false);
            setEditingCreature(null);
        } catch (error) {
            console.error('Erro ao criar criatura:', error);
        }
    };

    const handleUpdateCreature = async (creature: Enemy) => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;

            // Encontrar a criatura pela row id
            const rowId = (creature as any).__rowId || creatures.find(c => c.id === creature.id)?.__rowId;
            if (!rowId) {
                console.warn('Row id da criatura não encontrado; abortando update.');
                return;
            }

            // Atualizar no banco usando o id da linha para evitar colisões em data->>id
            const { error } = await supabase
                .from('creatures')
                .update({ data: creature })
                .eq('owner_id', userId)
                .eq('id', rowId);

            if (error) throw error;

            // Atualizar localmente
            const updatedCreatures = creatures.map(c => (c.__rowId === rowId ? { ...(creature as Enemy), __rowId: rowId } : c));
            setCreatures(updatedCreatures);
            setSelectedCreature({ ...(creature as Enemy), __rowId: rowId });
            setShowEditModal(false);
            setEditingCreature(null);
        } catch (error) {
            console.error('Erro ao atualizar criatura:', error);
        }
    };

    const handleSaveCreature = async (creature: Enemy) => {
        if (editingCreature) {
            // Atualizar criatura existente
            await handleUpdateCreature(creature);
        } else {
            // Criar nova criatura
            await handleCreateCreature(creature);
        }
    };

    const handleDeleteCreature = async (rowId: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta criatura?')) return;

        try {
            const userId = await getCurrentUserId();
            if (!userId) return;

            const { error } = await supabase
                .from('creatures')
                .delete()
                .eq('owner_id', userId)
                .eq('id', rowId);

            if (error) throw error;
            setCreatures(creatures.filter(c => c.__rowId !== rowId));
            setSelectedCreature(null);
        } catch (error) {
            console.error('Erro ao deletar criatura:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Carregando criaturas...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #a978f8'
            }}>
                <h1 style={{ margin: '0', color: '#a978f8', fontSize: '2rem' }}>Criaturas</h1>
                <button
                    onClick={() => {
                        setEditingCreature(null);
                        setShowEditModal(true);
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#a978f8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                    }}
                >
                    + Nova Criatura
                </button>
            </div>

            <EditCreatureModal
                isOpen={showEditModal}
                creature={editingCreature}
                onSave={handleSaveCreature}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingCreature(null);
                }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Lista de Criaturas */}
                <div>
                    <h3 style={{ color: '#a978f8', marginBottom: '1rem' }}>Suas Criaturas ({creatures.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {creatures.length === 0 ? (
                            <p style={{ color: '#777', fontStyle: 'italic' }}>Nenhuma criatura criada ainda.</p>
                        ) : (
                            creatures.map(creature => (
                                <div
                                    key={creature.__rowId || creature.id}
                                    onClick={() => setSelectedCreature(creature)}
                                    style={{
                                        padding: '1rem',
                                        background: selectedCreature?.__rowId === creature.__rowId ? 'rgba(169, 120, 248, 0.3)' : 'rgba(42, 42, 46, 0.8)',
                                        border: selectedCreature?.__rowId === creature.__rowId ? '1px solid #a978f8' : '1px solid #444',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
                                        {creature.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'rgba(169, 120, 248, 0.3)',
                                            color: '#a978f8',
                                            fontSize: '0.75rem',
                                            borderRadius: '3px'
                                        }}>
                                            {creature.threatLevel}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detalhes da Criatura Selecionada */}
                <div>
                    {selectedCreature ? (
                        <div>
                            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        setEditingCreature(selectedCreature);
                                        setShowEditModal(true);
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#a978f8',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteCreature(selectedCreature.__rowId || selectedCreature.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#f44336',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🗑️ Deletar
                                </button>
                            </div>
                            <EnemySheet enemy={selectedCreature} />
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            color: '#777',
                            padding: '3rem',
                            fontSize: '1.1rem'
                        }}>
                            Selecione uma criatura para visualizar seus detalhes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
