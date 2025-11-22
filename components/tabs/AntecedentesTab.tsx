import React, { useState } from "react";
import type { AgentData, Antecedente, Afiliacao } from "../../types";

interface Props {
  agent: AgentData;
  onUpdate: (updates: Partial<AgentData>) => void;
}

// Lista de todos os antecedentes disponíveis
const ANTECEDENTES_BASE = [
  { id: 'aliados', name: 'Aliados' }, { id: 'contatos', name: 'Contatos' },
  { id: 'fama', name: 'Fama' }, { id: 'lacaio', name: 'Lacaio' },
  { id: 'mentor', name: 'Mentor' }, { id: 'recursos', name: 'Recursos' },
  { id: 'status', name: 'Status' },
];

export const AntecedentesTab: React.FC<Props> = ({ agent, onUpdate }) => {
  if (!agent) return <div>Carregando...</div>;

  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [newAffiliationName, setNewAffiliationName] = useState('');
  const [newAffiliationDesc, setNewAffiliationDesc] = useState('');
  const [newAnteName, setNewAnteName] = useState('');
  const [newAnteDesc, setNewAnteDesc] = useState('');
  const [expandedAnteId, setExpandedAnteId] = useState<string | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  
  const antecedentes = agent.antecedentes || [];
  const afiliacoes = agent.afiliacoes || [];
  const backgrounds = agent.backgrounds || null;
  const character = agent.character || {};

  // Calculate points from old system (customizable antecedentes)
  const totalPointsSpent = antecedentes.reduce((sum, ant) => sum + (ant.points || 0), 0);
  const pointsAvailable = 5 - totalPointsSpent;

  const availableOptions = ANTECEDENTES_BASE.filter(base => !antecedentes.some(a => a.id === base.id));


  const handleAddAntecedente = () => {
    if (!selectedToAdd || pointsAvailable < 1) {
      return;
    }
    if (selectedToAdd === 'CREATE_NEW') {
      setIsCreatingCustom(true);
      setSelectedToAdd('');
      return;
    }
    const base = ANTECEDENTES_BASE.find(b => b.id === selectedToAdd);
    if (base && !antecedentes.some(a => a.id === base.id)) {
      const newAnte: Antecedente = { ...base, points: 1, description: '', details: '' };
      onUpdate({ antecedentes: [...antecedentes, newAnte] });
    }
    setSelectedToAdd('');
  };

  const handleAddCustomAntecedente = () => {
    if (!newAnteName.trim() || pointsAvailable < 1) {
      return;
    }
    const customAnte: Antecedente = {
      id: `custom-${Date.now()}`,
      name: newAnteName.trim(),
      description: newAnteDesc.trim(),
      details: '',
      points: 1
    };
    onUpdate({ antecedentes: [...antecedentes, customAnte] });
    setNewAnteName('');
    setNewAnteDesc('');
    setIsCreatingCustom(false);
  };
  
  const handleRemoveAntecedente = (id: string) => {
    onUpdate({ antecedentes: antecedentes.filter(a => a.id !== id) });
  };
  
  const handlePointsChange = (id: string, newPoints: number) => {
    const existing = antecedentes.find(a => a.id === id);
    if (!existing) return;
    
    const currentPoints = existing.points || 0;
    const diff = newPoints - currentPoints;

    if (newPoints < 0 || newPoints > 5 || (diff > 0 && diff > pointsAvailable)) {
      return;
    }

    if (newPoints === 0) {
      handleRemoveAntecedente(id);
    } else {
      const updatedAntecedentes = antecedentes.map(ant => 
        ant.id === id ? { ...ant, points: newPoints } : ant
      );
      onUpdate({ antecedentes: updatedAntecedentes });
    }
  };
  
  const handleAddAffiliation = () => {
    if (!newAffiliationName.trim()) return;
    const newAffiliation: Afiliacao = { id: `aff-${Date.now()}`, name: newAffiliationName, description: newAffiliationDesc };
    onUpdate({ afiliacoes: [...afiliacoes, newAffiliation] });
    setNewAffiliationName('');
    setNewAffiliationDesc('');
  };
  
  const handleRemoveAffiliation = (id: string) => {
    onUpdate({ afiliacoes: afiliacoes.filter(aff => aff.id !== id) });
  };

  return (
    <div className="antecedentes-tab">
      {/* Linhagem e Afiliação da Criação */}
      {(character.bloodline || character.affiliation) && (
        <>
          <div className="tab-header">
            <h3>Linhagem & Afiliação (da Criação)</h3>
            <div className="info-text">Definidos na criação do personagem</div>
          </div>
          
          <div className="character-origin-display">
            {character.bloodline && character.bloodline !== 'Nenhuma' && (
              <div className="origin-item bloodline">
                <label>🩸 Linhagem</label>
                <strong>{character.bloodline}</strong>
                {character.bloodlineCost > 0 && (
                  <span className="cost-badge">Custo: {character.bloodlineCost} PB</span>
                )}
              </div>
            )}
            
            {character.affiliation && character.affiliation !== 'Nenhum' && (
              <div className="origin-item affiliation">
                <label>🏛️ Afiliação</label>
                <strong>{character.affiliation}</strong>
                {character.affiliationStatus > 0 && (
                  <div className="status-display">
                    <span>Status: {character.affiliationStatus}</span>
                    <div className="points-dots readonly">
                      {[1, 2, 3, 4, 5].map(p => (
                        <span key={p} className={`dot ${p <= character.affiliationStatus ? 'filled' : ''}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    
      {/* Backgrounds from Character Creation (Read-only display) */}
      {backgrounds && (
        <>
          <div className="tab-header">
            <h3>Antecedentes Base (da Criação)</h3>
            <div className="info-text">Definidos na criação do personagem</div>
          </div>
          
          <div className="backgrounds-display">
            {backgrounds.aliados > 0 && (
              <div className="background-item-display">
                <label>Aliados</label>
                <div className="points-dots readonly">
                  {[1, 2, 3, 4, 5].map(p => (
                    <span key={p} className={`dot ${p <= backgrounds.aliados ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="description-text">Amigos e contatos que o ajudarão quando precisar</span>
              </div>
            )}
            
            {backgrounds.recursos > 0 && (
              <div className="background-item-display">
                <label>Recursos</label>
                <div className="points-dots readonly">
                  {[1, 2, 3, 4, 5].map(p => (
                    <span key={p} className={`dot ${p <= backgrounds.recursos ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="description-text">Riqueza, propriedades e bens materiais</span>
              </div>
            )}
            
            {backgrounds.contatos > 0 && (
              <div className="background-item-display">
                <label>Contatos</label>
                <div className="points-dots readonly">
                  {[1, 2, 3, 4, 5].map(p => (
                    <span key={p} className={`dot ${p <= backgrounds.contatos ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="description-text">Fontes de informação e conhecimento</span>
              </div>
            )}
            
            {backgrounds.mentor > 0 && (
              <div className="background-item-display">
                <label>Mentor</label>
                <div className="points-dots readonly">
                  {[1, 2, 3, 4, 5].map(p => (
                    <span key={p} className={`dot ${p <= backgrounds.mentor ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="description-text">Um professor ou guia poderoso</span>
              </div>
            )}
            
            {backgrounds.status > 0 && (
              <div className="background-item-display">
                <label>Status (Hierarquia)</label>
                <div className="points-dots readonly">
                  {[1, 2, 3, 4, 5].map(p => (
                    <span key={p} className={`dot ${p <= backgrounds.status ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="description-text">Posição social e influência</span>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="tab-header">
        <h3>Antecedentes Adicionais (Pontos)</h3>
        <div className="points-tracker">
          Pontos Disponíveis: <span>{pointsAvailable} / 5</span>
        </div>
      </div>
      
      {/* Lista de Antecedentes Ativos */}
      <div className="antecedentes-list active">
        {antecedentes.map(ant => (
          <div key={ant.id} className="antecedente-item-wrapper">
            <div className="antecedente-item">
              <label 
                onClick={() => setExpandedAnteId(expandedAnteId === ant.id ? null : ant.id)}
                style={{ cursor: 'pointer' }}
              >
                {ant.name} {ant.description && '▼'}
              </label>
              <div className="points-dots">
                {[1, 2, 3, 4, 5].map(p => (
                  <span 
                    key={p} 
                    className={`dot ${p <= (ant.points || 0) ? 'filled' : ''}`}
                    onClick={() => handlePointsChange(ant.id, p === (ant.points || 0) ? p - 1 : p)}
                  />
                ))}
              </div>
            </div>
            {expandedAnteId === ant.id && ant.description && (
              <div className="antecedente-description">
                {ant.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário para Adicionar Novos */}
      <div className="add-antecedente-form compact">
        <select 
          value={selectedToAdd} 
          onChange={(e) => setSelectedToAdd(e.target.value)}
        >
          <option value="">Adicionar um antecedente...</option>
          {availableOptions.map(ant => (
            <option key={ant.id} value={ant.id}>{ant.name}</option>
          ))}
          <option value="CREATE_NEW">+ Criar novo antecedente...</option>
        </select>
        <button 
          onClick={handleAddAntecedente} 
          disabled={!selectedToAdd || pointsAvailable < 1}
        >
          Adicionar
        </button>
      </div>

      {/* Formulário para Criar Antecedente Personalizado (condicional) */}
      {isCreatingCustom && (
        <div className="add-custom-antecedente-form">
          <h4>Criar Antecedente Personalizado</h4>
          <input
            type="text"
            placeholder="Nome do antecedente"
            value={newAnteName}
            onChange={(e) => setNewAnteName(e.target.value)}
          />
          <textarea
            rows={2}
            placeholder="Descrição (opcional)"
            value={newAnteDesc}
            onChange={(e) => setNewAnteDesc(e.target.value)}
          />
          <div className="add-actions">
            <button onClick={handleAddCustomAntecedente} disabled={!newAnteName.trim() || pointsAvailable < 1}>
              Criar e Adicionar (1 ponto)
            </button>
            <button onClick={() => { setIsCreatingCustom(false); setNewAnteName(''); setNewAnteDesc(''); }} className="button-secondary">
              Cancelar
            </button>
            {pointsAvailable < 1 && <span className="warning-text">Sem pontos disponíveis</span>}
          </div>
        </div>
      )}

      <div className="tab-header">
        <h3>Afiliações / Linhagens (Grátis)</h3>
      </div>
      
      <div className="afiliacoes-list">
        {afiliacoes.map(aff => (
          <div key={aff.id} className="afiliacao-item">
            <div className="item-info">
              <strong>{aff.name}</strong>
              {aff.description && <p>{aff.description}</p>}
            </div>
            <button onClick={() => handleRemoveAffiliation(aff.id)} className="remove-btn">×</button>
          </div>
        ))}
      </div>

      <div className="add-afiliacao-form">
        <input 
          type="text" 
          placeholder="Nome da afiliação/linhagem" 
          value={newAffiliationName}
          onChange={(e) => setNewAffiliationName(e.target.value)}
        />
        <textarea 
          placeholder="Descrição breve..."
          rows={2}
          value={newAffiliationDesc}
          onChange={(e) => setNewAffiliationDesc(e.target.value)}
        ></textarea>
        <button onClick={handleAddAffiliation}>Adicionar</button>
      </div>
    </div>
  );
};
