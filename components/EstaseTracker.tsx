import React from 'react';
import { AgentData } from '../types';

interface EstaseTrackerProps {
  character: AgentData['character'];
  onUpdate: (field: 'estasePoints', value: number) => void;
}

export const EstaseTracker: React.FC<EstaseTrackerProps> = ({ character, onUpdate }) => {
  const currentPEt = character.estasePoints ?? character.maxEstasePoints ?? 0;
  const maxPEt = character.maxEstasePoints ?? 0;

  console.log('EstaseTracker Debug:', { 
    maxPEt, 
    currentPEt, 
    hasMax: character.maxEstasePoints,
    pathways: character.pathways 
  });

  // Só exibe se o personagem tem Pontos de Estase (Caminho do Éon)
  if (maxPEt === 0) return null;

  const handleIncrement = () => {
    if (currentPEt < maxPEt) {
      onUpdate('estasePoints', currentPEt + 1);
    }
  };

  const handleDecrement = () => {
    if (currentPEt > 0) {
      onUpdate('estasePoints', currentPEt - 1);
    }
  };

  return (
    <div className="estase-tracker" style={{
      backgroundColor: '#1a1a1c',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#9c27b0',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          ⏳ Pontos de Estase (PEt)
        </h4>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: currentPEt === 0 ? '#f44336' : '#9c27b0'
        }}>
          {currentPEt} / {maxPEt}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        <button
          onClick={handleDecrement}
          disabled={currentPEt === 0}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: currentPEt === 0 ? '#333' : '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPEt === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          - Gastar PEt
        </button>
        
        <button
          onClick={handleIncrement}
          disabled={currentPEt >= maxPEt}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: currentPEt >= maxPEt ? '#333' : '#388e3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPEt >= maxPEt ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          + Recuperar PEt
        </button>
      </div>

      <div style={{
        marginTop: '0.75rem',
        padding: '0.5rem',
        backgroundColor: '#0a0a0a',
        borderRadius: '4px',
        fontSize: '0.85rem',
        color: '#aaa'
      }}>
        <strong style={{ color: '#9c27b0' }}>Máx PEt:</strong> Vigor + Espiritualidade
        <br />
        <strong style={{ color: '#9c27b0' }}>Intervenção Causal:</strong> Gaste 1 PEt ao ver rolagem; converta 1 ou 10 em 5 ou 6
      </div>
    </div>
  );
};
