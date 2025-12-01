import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentData } from '../types.ts';
import { SettingsIcon } from './icons.tsx';
import CharacterCard from './CharacterCard';
import { supabase } from '../supabaseClient';
import { isFoundry } from '../src/foundryAdapter';
import { useMyContext } from '../MyContext';
import { reviveInfinityInObject } from '../utils/serializationUtils';

export const AgentListPage: React.FC = () => {
    const navigate = useNavigate();
    const { addLiveToast } = useMyContext();
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [deletingAgentId, setDeletingAgentId] = useState<number | string | null>(null);

    useEffect(() => {
        async function fetchAgents() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (isFoundry()) {
                try {
                    // Use Foundry's game.actors collection and prefer SystemActor.getAgentData()
                    const collection = (window as any).game?.actors?.contents || [];
                    const lista = collection.map((actor: any) => {
                        const agent = typeof actor.getAgentData === 'function' ? actor.getAgentData() : actor.getFlag?.('beyonders-system', 'agentData') || null;
                        return agent ? { ...reviveInfinityInObject(agent), id: actor.id } : { id: actor.id, character: { name: actor.name, avatarUrl: actor.img } };
                    });
                    setAgents(lista);
                } catch (e) {
                    console.error('Erro ao buscar atores do Foundry:', e);
                    setAgents([]);
                }
                return;
            }

            if (!user) {
                console.log("Usuário não encontrado, não buscando agentes.");
                setAgents([]); // Limpa os agentes se o usuário deslogar
                return;
            }

            const { data, error } = await supabase
                .from("agents")
                .select("data, id")
                .eq("user_id", user.id);

            if (error) {
                console.error("Erro ao buscar agentes:", error.message);
            } else if (data) {
                const formattedAgents = data.map((item) => {
                    const agentData = item.data as AgentData;
                    // Revive Infinity values that were serialized as "∞_INFINITY"
                    const revivedAgentData = reviveInfinityInObject(agentData);
                    return {
                        ...revivedAgentData,
                        id: item.id,
                    };
                });
                setAgents(formattedAgents);
            }
        }

        fetchAgents();
    }, []);

    useEffect(() => {
            if (isFoundry()) {
            const onCreate = (actor: any) => {
                const agent = actor.getFlag ? actor.getFlag('beyonders-system', 'agentData') : null;
                const newAgent = agent ? { ...reviveInfinityInObject(agent), id: actor.id } : { id: actor.id, character: { name: actor.name, avatarUrl: actor.img } };
                setAgents((prev) => {
                    if (prev.some((a) => a.id === newAgent.id)) return prev;
                    return [...prev, newAgent];
                });
            };

            const onUpdate = (actor: any) => {
                const agent = actor.getFlag ? actor.getFlag('beyonders-system', 'agentData') : null;
                const updatedAgent = agent ? { ...reviveInfinityInObject(agent), id: actor.id } : { id: actor.id, character: { name: actor.name, avatarUrl: actor.img } };
                setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)));
            };

            const onDelete = (actor: any) => {
                setAgents((prev) => prev.filter((a) => a.id !== actor.id));
            };

            (window as any).Hooks.on('createActor', onCreate);
            (window as any).Hooks.on('updateActor', onUpdate);
            (window as any).Hooks.on('deleteActor', onDelete);

            return () => {
                try {
                    (window as any).Hooks.off('createActor', onCreate);
                    (window as any).Hooks.off('updateActor', onUpdate);
                    (window as any).Hooks.off('deleteActor', onDelete);
                } catch (e) {
                    // ignore
                }
            };
        }

        // Fallback: Supabase realtime subscription
        const channel = supabase
            .channel("agents-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "agents" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newAgent = {
                            ...(payload.new.data as AgentData),
                            id: payload.new.id,
                        };
                        setAgents((prev) => {
                            if (prev.some((agent) => agent.id === newAgent.id)) return prev;
                            return [...prev, newAgent];
                        });
                    }
                    if (payload.eventType === "UPDATE") {
                        const updatedAgent = {
                            ...(payload.new.data as AgentData),
                            id: payload.new.id,
                            lastModified: payload.new.lastModified,
                        };
                        setAgents((prev) =>
                            prev.map((agent) =>
                                agent.id === updatedAgent.id ? updatedAgent : agent
                            )
                        );
                    }
                    if (payload.eventType === "DELETE") {
                        setAgents((prev) =>
                            prev.filter((agent) => agent.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDeleteAgent = useCallback(async (id: number | string) => {
        if (
            window.confirm(
                "Tem certeza que deseja apagar este agente? Esta ação não pode ser desfeita."
            )
        ) {
            if (isFoundry()) {
                try {
                    const actor = (window as any).game?.actors?.get?.(String(id));
                    if (actor) await actor.delete();
                    setAgents((prev) => prev.filter((agent) => agent.id !== id));
                } catch (e) {
                    console.error('Erro ao apagar ator no Foundry:', e);
                    addLiveToast({ type: 'failure', title: 'Erro', message: 'Não foi possível apagar o ator no Foundry.' });
                }
                return;
            }

            const { error } = await supabase.from("agents").delete().eq("id", id);
            if (error) {
                console.error(`Erro ao apagar agente ${id}:`, error);
                addLiveToast({
                    type: "failure",
                    title: "Erro de Rede",
                    message: "Não foi possível apagar o agente.",
                });
            } else {
                setAgents((prev) => prev.filter((agent) => agent.id !== id));
            }
        }
    }, []);
    
    return (
        <div className="agent-list-page">
            <div className="page-header">
                <h1>Selecione um Agente</h1>
                <button className="button-primary" onClick={() => navigate('/create-character')}>+ Novo Agente</button>
            </div>
            {agents.length > 0 ? (
                <div className="agent-grid">
                    {agents.map((agent) => {
                        const primaryPath = (
                            agent?.character?.pathways?.primary
                            || (agent?.character?.pathways?.secondary && agent.character.pathways.secondary[0])
                            || (Array.isArray(agent?.character?.pathway) ? agent.character.pathway[0] : agent?.character?.pathway)
                            || (agent as any)?.pathways?.primary // fallback for legacy wrong nesting
                        );
                        const pathLabel = `${primaryPath || 'Caminho não definido'} - Sequência ${agent?.character?.sequence ?? '-'}`;
                        return (
                        <CharacterCard
                            key={agent.id}
                            avatarUrl={agent?.character?.avatarUrl}
                            name={agent?.character?.name || '[Sem nome]'}
                            path={pathLabel}
                            createdAt={agent.lastModified}
                            customization={agent.customization}
                            sanity={agent?.character?.sanity ?? 0}
                            maxSanity={agent?.character?.maxSanity ?? 1}
                            vitality={agent?.character?.vitality ?? 0}
                            maxVitality={agent?.character?.maxVitality ?? 1}
                            onOpen={() => navigate(`/agent/${agent.id}`)}
                            onEdit={() => setDeletingAgentId(deletingAgentId === agent.id ? null : agent.id)}
                            onRemove={() => handleDeleteAgent(agent.id!)}
                        />
                        );
                    })}
                </div>
            ) : (
                <p>Nenhum agente encontrado. Clique em "+ Novo Agente" para começar.</p>
            )}
        </div>
    );
};
