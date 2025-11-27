import React, { useState } from 'react';
import { PATHWAY_DESCRIPTIONS } from '../data/particles/pathways';

type PathwayKey = keyof typeof PATHWAY_DESCRIPTIONS;

const PathwaysExplorer: React.FC = () => {
  const [selectedPathway, setSelectedPathway] = useState<PathwayKey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const pathwayKeys = Object.keys(PATHWAY_DESCRIPTIONS) as PathwayKey[];

  // Coletar todos os temas únicos
  const allThemes = Array.from(
    new Set(
      pathwayKeys.flatMap((key) => PATHWAY_DESCRIPTIONS[key].themes)
    )
  ).sort();

  // Filtrar caminhos
  const filteredPathways = pathwayKeys.filter((key) => {
    const pathway = PATHWAY_DESCRIPTIONS[key];
    const matchesSearch =
      pathway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pathway.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !selectedTheme || pathway.themes.includes(selectedTheme);
    return matchesSearch && matchesTheme;
  });

  const selectedPathwayData = selectedPathway ? PATHWAY_DESCRIPTIONS[selectedPathway] : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'rgba(15, 20, 30, 0.95)', color: '#e0e7ff', padding: '2rem' }}>
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#d4af37' }}>
          🌟 Os 22 Caminhos Beyonder
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#a0aec0', marginBottom: '2rem' }}>
          Explore as filosofias, temas e arquétipos de cada caminho
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* SIDEBAR: Lista de Caminhos */}
          <div>
            {/* Busca */}
              <input
                type="text"
                placeholder="Buscar caminho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid #d4af37',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.9rem',
                }}
              />            {/* Filtro de Tema */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#d4af37' }}>
                Filtrar por Tema:
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid #d4af37',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="">Todos os temas</option>
                {allThemes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de Caminhos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {filteredPathways.map((key) => {
                const pathway = PATHWAY_DESCRIPTIONS[key];
                const isSelected = selectedPathway === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPathway(key)}
                    style={{
                      padding: '1rem',
                      backgroundColor: isSelected ? 'rgba(99, 66, 194, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                      border: isSelected ? '2px solid #6342c2' : '1px solid rgba(99, 66, 194, 0.3)',
                      borderRadius: '0.5rem',
                      color: isSelected ? '#b5a3ff' : '#e0e7ff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 'bold' : 'normal',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(99, 66, 194, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(100, 116, 139, 0.1)';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{pathway.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                      {pathway.themes.slice(0, 2).join(', ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN: Detalhes do Caminho */}
          <div>
            {selectedPathwayData ? (
              <div
                style={{
                  backgroundColor: 'rgba(30, 35, 45, 0.9)',
                  border: '2px solid #d4af37',
                  borderRadius: '1rem',
                  padding: '2rem',
                }}
              >
                <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: '#d4af37' }}>
                  🌟 {selectedPathwayData.name}
                </h2>

                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '1rem', lineHeight: '1.8', margin: '0' }}>
                    {selectedPathwayData.description}
                  </p>
                </div>

                {/* Temas */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#d4af37' }}>Temas Centrais</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {selectedPathwayData.themes.map((theme, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(96, 165, 250, 0.2)',
                          border: '1px solid #60a5fa',
                          color: '#60a5fa',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arquétipos */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#d4af37' }}>Arquétipos de Papel</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {selectedPathwayData.roleArchetypes.map((archetype, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(167, 139, 250, 0.2)',
                          border: '1px solid #a78bfa',
                          color: '#a78bfa',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        {archetype}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Filosofia */}
                <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #d4af37' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#d4af37' }}>Filosofia</h3>
                  <p style={{ margin: '0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {selectedPathwayData.philosophy}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(30, 35, 45, 0.9)',
                  border: '2px dashed #d4af37',
                  borderRadius: '1rem',
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#a0aec0',
                }}
              >
                <p style={{ fontSize: '1.2rem', margin: '0' }}>
                  ✨ Selecione um caminho para explorar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwaysExplorer;
