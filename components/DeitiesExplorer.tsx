import React, { useState } from 'react';
import { ORTHODOX_CHURCHES, NON_ORTHODOX_DEITIES } from '../data/deities-families-affiliations';

type ChurchEntry = typeof ORTHODOX_CHURCHES[keyof typeof ORTHODOX_CHURCHES] | typeof NON_ORTHODOX_DEITIES[keyof typeof NON_ORTHODOX_DEITIES];

export const DeitiesExplorer: React.FC = () => {
  const [selectedChurch, setSelectedChurch] = useState<string>('EVERNIGHT_GODDESS');
  const [filterType, setFilterType] = useState<'orthodox' | 'non-orthodox'>('orthodox');
  const [searchTerm, setSearchTerm] = useState('');

  const allChurches: Record<string, ChurchEntry & { type: 'orthodox' | 'non-orthodox' }> = {
    ...Object.entries(ORTHODOX_CHURCHES).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: { ...value, type: 'orthodox' as const }
    }), {}),
    ...Object.entries(NON_ORTHODOX_DEITIES).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: { ...value, type: 'non-orthodox' as const }
    }), {})
  };

  const filteredChurches = Object.entries(allChurches).filter(([_, church]) => {
    if ((church as any).type !== filterType) return false;
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (church as any).name.toLowerCase().includes(searchLower) ||
      (church as any).deity.toLowerCase().includes(searchLower) ||
      ((church as any).aliases && (church as any).aliases.some((a: string) => a.toLowerCase().includes(searchLower)))
    );
  });

  const currentChurch = allChurches[selectedChurch] as ChurchEntry & { type: 'orthodox' | 'non-orthodox' };

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
        select {
          background-color: rgba(100, 116, 139, 0.5) !important;
          color: #e0e7ff !important;
        }
        select option {
          background-color: #1e232d !important;
          color: #e0e7ff !important;
          padding: 0.5rem;
        }
      `}</style>
      {/* Sidebar */}
      <div style={{ overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', color: '#ec4899' }}>🙏 Deuses</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar deidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(100, 116, 139, 0.2)',
            border: '1px solid #ec4899',
            borderRadius: '0.5rem',
            color: '#e0e7ff',
            fontSize: '0.9rem'
          }}
        />

        {/* Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#ec4899' }}>
            Filtrar por Tipo:
          </label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'orthodox' | 'non-orthodox');
              setSelectedChurch('');
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(100, 116, 139, 0.2)',
              border: '1px solid #ec4899',
              borderRadius: '0.5rem',
              color: '#e0e7ff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <option value="orthodox">Ortodoxos</option>
            <option value="non-orthodox">Não-Ortodoxos</option>
          </select>
        </div>

        {/* Church List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredChurches.map(([key, church]) => (
            <button
              key={key}
              onClick={() => setSelectedChurch(key)}
              style={{
                padding: '0.75rem',
                backgroundColor: selectedChurch === key ? 'rgba(236, 72, 153, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                border: selectedChurch === key ? '2px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '0.5rem',
                color: selectedChurch === key ? '#f8a5d9' : '#e0e7ff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontSize: '0.9rem',
                fontWeight: selectedChurch === key ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (selectedChurch !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChurch !== key) {
                  e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.1)';
                }
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{church.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>{church.deity}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      {currentChurch && (
        <div style={{ overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'rgba(30, 35, 45, 0.9)', border: '2px solid #ec4899', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: '#ec4899' }}>
              {currentChurch.name}
            </h2>

            {/* Deity Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#ec4899' }}>Divindade</h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>{currentChurch.deity}</p>
            </div>

            {/* Aliases */}
            {currentChurch.aliases && currentChurch.aliases.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#ec4899' }}>Outros Nomes</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentChurch.aliases.map((alias: string, i: number) => (
                    <span key={i} style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.9rem' }}>
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Philosophy */}
            {currentChurch.philosophy && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Filosofia</h3>
                <p style={{ margin: 0, lineHeight: '1.6' }}>{currentChurch.philosophy}</p>
              </div>
            )}

            {/* Spheres */}
            {currentChurch.spheres && currentChurch.spheres.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Esferas de Domínio</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {currentChurch.spheres.map((sphere: string, i: number) => (
                    <div key={i} style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      {sphere}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pathways */}
            {currentChurch.pathways && currentChurch.pathways.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Caminhos Associados</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentChurch.pathways.map((pathway: string, i: number) => (
                    <span key={i} style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: '0.5rem 0.75rem', border: '1px solid #ec4899', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      {pathway}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Characteristics */}
            {currentChurch.characteristics && currentChurch.characteristics.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Características</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {currentChurch.characteristics.map((char: string, i: number) => (
                    <li key={i}>{char}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            {(currentChurch as any).influence && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Influência / Localização</h3>
                <p style={{ margin: 0 }}>
                  {Array.isArray((currentChurch as any).influence)
                    ? (currentChurch as any).influence.join(', ')
                    : (currentChurch as any).influence}
                </p>
              </div>
            )}

            {/* Honorary Name */}
            {currentChurch.honorary_name && (
              <div style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #ec4899' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#ec4899' }}>Nome Honorifico</h3>
                <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>"{currentChurch.honorary_name}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
