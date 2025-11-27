import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { linkPlayerCharacter } from '../../api/campaigns';
import { reviveInfinityInObject } from '../../utils/serializationUtils';
import { AgentData } from '../../types';

interface Props {
  campaignId: string;
  onClose: () => void;
  onCharacterLinked: () => void;
}

const LinkCharacterModal: React.FC<Props> = ({ campaignId, onClose, onCharacterLinked }) => {
  const [myAgents, setMyAgents] = useState<AgentData[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca todos os agentes que pertencem ao usuário logado (o jogador)
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
        const formattedAgents = data.map(item => {
          const agentData = item.data as any;
          const revivedData = reviveInfinityInObject(agentData);
          return { ...revivedData, id: item.id };
        });
        setMyAgents(formattedAgents);
      }
      setIsLoading(false);
    }
    fetchMyAgents();
  }, []);

  const handleLinkCharacter = async () => {
    if (!selectedAgentId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('🔗 Tentando vincular personagem:', {
      campaignId,
      userId: user.id,
      agentId: selectedAgentId
    });

    try {
      await linkPlayerCharacter(campaignId, user.id, selectedAgentId);
      console.log('✅ Personagem vinculado com sucesso!');
      alert('Personagem vinculado com sucesso!');
      onCharacterLinked();
    } catch (error: any) {
      console.error('❌ Erro ao vincular personagem:', error);
      console.error('Detalhes do erro:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      alert(`Erro ao vincular o personagem: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Vincular Personagem</h2>
        <p>Selecione um de seus agentes para vincular a esta campanha.</p>

        <div className="agent-list">
          {isLoading ? <p>Carregando agentes...</p> : myAgents.map(agent => (
            <div
              key={agent.id}
              className={`result-item ${selectedAgentId === agent.id.toString() ? 'selected' : ''}`}
              onClick={() => setSelectedAgentId(agent.id.toString())}
            >
              {agent.character.name || 'Agente sem nome'}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleLinkCharacter} disabled={!selectedAgentId}>
            Vincular à Campanha
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkCharacterModal;
