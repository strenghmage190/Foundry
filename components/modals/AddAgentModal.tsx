import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { linkAgentToCampaign } from '../../api/campaigns';
import { AgentData } from '../../types';

interface Props {
  campaignId: string;
  onClose: () => void;
  onAgentAdded: () => void;
}

const AddAgentModal: React.FC<Props> = ({ campaignId, onClose, onAgentAdded }) => {
  const [myAgents, setMyAgents] = useState<AgentData[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca todos os agentes que pertencem ao usuário logado (o mestre)
  useEffect(() => {
    async function fetchMyAgents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .select('id, data')
        .eq('user_id', user.id);

      if (data) {
        // Formata os dados para o formato AgentData
        const formattedAgents = data.map(item => ({ ...(item.data as any), id: item.id }));
        setMyAgents(formattedAgents);
      }
      setIsLoading(false);
    }
    fetchMyAgents();
  }, []);

  const handleAddAgent = async () => {
    if (!selectedAgentId) return;
    try {
      await linkAgentToCampaign(campaignId, selectedAgentId);
      console.log("1. MODAL: Sucesso na API! Chamando onAgentAdded..."); // LOG 1
      onAgentAdded(); // Garanta que não está passando nenhum parâmetro
    } catch (error) {
      alert('Erro ao adicionar o agente.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Adicionar Agente (NPC)</h2>
        <p>Selecione um de seus agentes para adicionar a esta campanha.</p>

        <div className="agent-list">
          {isLoading ? (
            <p>Carregando agentes...</p>
          ) : myAgents.length === 0 ? (
            <p>Você ainda não criou nenhum agente.</p>
          ) : (
            myAgents.map(agent => (
              <div
                key={agent.id}
                className={`agent-card ${selectedAgentId === agent.id.toString() ? 'selected' : ''}`}
                onClick={() => setSelectedAgentId(agent.id.toString())}
              >
                <img
                  src={agent.character.avatarUrl || 'https://placehold.co/60x60?text=NPC'}
                  alt="Avatar do Agente"
                  className="agent-avatar"
                />
                <div className="agent-info">
                  <span className="agent-name">{agent.character.name || '[Sem nome]'}</span>
                  <span className="agent-path">
                    {agent.character.pathways?.primary || 
                     (Array.isArray(agent.character.pathway) ? agent.character.pathway[0] : agent.character.pathway) || 
                     'NPC'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleAddAgent} disabled={!selectedAgentId}>
            Adicionar à Campanha
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;
