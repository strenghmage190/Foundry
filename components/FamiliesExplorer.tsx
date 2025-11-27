import React, { useState } from 'react';
import { ANGEL_FAMILIES, SANGUINE_BLOODLINE } from '../data/deities-families-affiliations';

export const FamiliesExplorer: React.FC = () => {
  const [selectedFamily, setSelectedFamily] = useState<string>('AUGUSTO');
  const [searchTerm, setSearchTerm] = useState('');

  const allFamilies = {
    ...ANGEL_FAMILIES,
    SANGUINE: SANGUINE_BLOODLINE as any
  };

  const filteredFamilies = Object.entries(allFamilies).filter(([_, family]) => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (family as any).name.toLowerCase().includes(searchLower) ||
      ((family as any).current_reign && (family as any).current_reign.toLowerCase().includes(searchLower)) ||
      ((family as any).origin && (family as any).origin.toLowerCase().includes(searchLower))
    );
  });

  const currentFamily = allFamilies[selectedFamily as keyof typeof allFamilies] as any;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: '100vh', padding: '2rem', backgroundColor: '#0f1419', color: '#e0e7ff' }}>
      <style>{`
        div::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        div {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      {/* Sidebar */}
      <div style={{ overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', color: '#22c55e' }}>👑 Famílias</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar família..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(100, 116, 139, 0.2)',
            border: '1px solid #22c55e',
            borderRadius: '0.5rem',
            color: '#e0e7ff',
            fontSize: '0.9rem'
          }}
        />

        {/* Family List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredFamilies.map(([key, family]) => (
            <button
              key={key}
              onClick={() => setSelectedFamily(key)}
              style={{
                padding: '0.75rem',
                backgroundColor: selectedFamily === key ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                border: selectedFamily === key ? '2px solid #22c55e' : '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '0.5rem',
                color: selectedFamily === key ? '#86efac' : '#e0e7ff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontSize: '0.9rem',
                fontWeight: selectedFamily === key ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (selectedFamily !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFamily !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.1)';
                }
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{family.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
                {family.current_reign || family.origin || 'Linhagem'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      {currentFamily && (
        <div style={{ overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'rgba(30, 35, 45, 0.9)', border: '2px solid #22c55e', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: '#22c55e' }}>
              {currentFamily.name}
            </h2>

            {/* Type */}
            {currentFamily.type && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', color: '#86efac' }}>
                  {currentFamily.type}
                </span>
              </div>
            )}

            {/* Origin */}
            {currentFamily.origin && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#22c55e' }}>Origem</h3>
                <p style={{ margin: 0 }}>{currentFamily.origin}</p>
              </div>
            )}

            {/* Current Status/Reign */}
            {(currentFamily.current_reign || currentFamily.current_status) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#22c55e' }}>Status Atual</h3>
                <p style={{ margin: 0 }}>{currentFamily.current_reign || currentFamily.current_status}</p>
              </div>
            )}

            {/* Ancestor */}
            {currentFamily.ancestor && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#22c55e' }}>Ancestral</h3>
                <p style={{ margin: 0 }}>{currentFamily.ancestor}</p>
              </div>
            )}

            {/* Pathways */}
            {currentFamily.pathways && currentFamily.pathways.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Caminhos Domínio</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentFamily.pathways.map((pathway: string, i: number) => (
                    <span key={i} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 0.75rem', border: '1px solid #22c55e', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      {pathway}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Philosophy */}
            {currentFamily.philosophy && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Filosofia</h3>
                <p style={{ margin: 0, lineHeight: '1.6' }}>{currentFamily.philosophy}</p>
              </div>
            )}

            {/* Characteristics */}
            {currentFamily.characteristics && currentFamily.characteristics.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Características</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {currentFamily.characteristics.map((char: string, i: number) => (
                    <li key={i}>{char}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Details */}
            {currentFamily.hierarchy && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Hierarquia</h3>
                <p style={{ margin: 0 }}>{currentFamily.hierarchy}</p>
              </div>
            )}

            {currentFamily.deposition && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Queda</h3>
                <p style={{ margin: 0 }}>{currentFamily.deposition}</p>
              </div>
            )}

            {currentFamily.destruction && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Destruição</h3>
                <p style={{ margin: 0 }}>{currentFamily.destruction}</p>
              </div>
            )}

            {/* History Details */}
            {currentFamily.history && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>História</h3>
                <p style={{ margin: 0, lineHeight: '1.6' }}>{currentFamily.history}</p>
              </div>
            )}

            {currentFamily.current_state && (
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #22c55e' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#22c55e' }}>Estado Atual</h3>
                <p style={{ margin: 0 }}>{currentFamily.current_state}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
