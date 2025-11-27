import React, { useState, useMemo } from 'react';
import { OBJETOS } from '../data/particles/objetos';
import { FUNCOES } from '../data/particles/funcoes';
import { CARACTERISTICAS } from '../data/particles/caracteristicas';
import { COMPLEMENTOS } from '../data/particles/complementos';
import { CRIADORES } from '../data/particles/criadores';
import { PATHWAY_DESCRIPTIONS } from '../data/particles/pathways';
import { MagicParticle, PathwayDescription } from '../data/complete-magic-particles';

type ParticleType = 'Objeto' | 'Função' | 'Característica' | 'Complemento' | 'Criador' | 'Todos';
type ViewMode = 'particles' | 'pathways';

interface ParticleFilterState {
  type: ParticleType;
  difficulty: string;
  searchTerm: string;
}

interface PathwayFilterState {
  searchTerm: string;
  selectedTheme: string;
  selectedArchetype: string;
}

const MagicParticlesGrimoire: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('particles');
  const [particleFilter, setParticleFilter] = useState<ParticleFilterState>({
    type: 'Todos',
    difficulty: 'todos',
    searchTerm: '',
  });
  const [pathwayFilter, setPathwayFilter] = useState<PathwayFilterState>({
    searchTerm: '',
    selectedTheme: '',
    selectedArchetype: '',
  });
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);

  // Obter partículas baseado no filtro
  const filteredParticles = useMemo(() => {
    let particles: MagicParticle[] = [];

    if (particleFilter.type === 'Todos') {
      particles = [...OBJETOS, ...FUNCOES, ...CARACTERISTICAS, ...COMPLEMENTOS, ...CRIADORES];
    } else if (particleFilter.type === 'Objeto') {
      particles = OBJETOS;
    } else if (particleFilter.type === 'Função') {
      particles = FUNCOES;
    } else if (particleFilter.type === 'Característica') {
      particles = CARACTERISTICAS;
    } else if (particleFilter.type === 'Complemento') {
      particles = COMPLEMENTOS;
    } else if (particleFilter.type === 'Criador') {
      particles = CRIADORES;
    }

    // Filtrar por dificuldade
    if (particleFilter.difficulty !== 'todos') {
      particles = particles.filter(p => p.difficulty === particleFilter.difficulty);
    }

    // Filtrar por termo de busca
    if (particleFilter.searchTerm) {
      const term = particleFilter.searchTerm.toLowerCase();
      particles = particles.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.word.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return particles;
  }, [particleFilter]);

  // Obter caminhos baseado no filtro
  const filteredPathways = useMemo(() => {
    let pathways = Object.values(PATHWAY_DESCRIPTIONS);

    if (pathwayFilter.searchTerm) {
      const term = pathwayFilter.searchTerm.toLowerCase();
      pathways = pathways.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.themes.some(t => t.toLowerCase().includes(term))
      );
    }

    if (pathwayFilter.selectedTheme) {
      pathways = pathways.filter(p => p.themes.includes(pathwayFilter.selectedTheme));
    }

    if (pathwayFilter.selectedArchetype) {
      pathways = pathways.filter(p => p.roleArchetypes.includes(pathwayFilter.selectedArchetype));
    }

    return pathways;
  }, [pathwayFilter]);

  // Cores baseadas em tipo de partícula
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Objeto':
        return '#a78bfa';
      case 'Função':
        return '#60a5fa';
      case 'Característica':
        return '#f97316';
      case 'Complemento':
        return '#10b981';
      case 'Criador':
        return '#ec4899';
      default:
        return '#8896a8';
    }
  };

  // Cor de dificuldade
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'fácil':
        return '#10b981';
      case 'moderado':
        return '#f59e0b';
      case 'difícil':
        return '#ef4444';
      case 'lendário':
        return '#d4af37';
      default:
        return '#8896a8';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(30, 35, 45, 0.9)',
        color: '#e8e8e8',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d4af37', marginBottom: '0.5rem' }}>
            📖 GRIMÓRIO DE PARTÍCULAS MÁGICAS
          </h1>
          <p style={{ fontSize: '1rem', color: '#8896a8' }}>
            Dicionário completo da Linguagem Mágica - Objetos, Funções, Características e Domínios
          </p>
        </div>

        {/* Modo de Visualização */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setViewMode('particles')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: viewMode === 'particles' ? '#d4af37' : 'transparent',
              color: viewMode === 'particles' ? '#1e2330' : '#d4af37',
              border: '2px solid #d4af37',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
          >
            ✨ Partículas Mágicas
          </button>
          <button
            onClick={() => setViewMode('pathways')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: viewMode === 'pathways' ? '#d4af37' : 'transparent',
              color: viewMode === 'pathways' ? '#1e2330' : '#d4af37',
              border: '2px solid #d4af37',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
          >
            🌟 Caminhos Beyonder
          </button>
        </div>

        {/* MODO PARTÍCULAS */}
        {viewMode === 'particles' && (
          <div>
            {/* Filtros */}
            <div
              style={{
                backgroundColor: 'rgba(50, 60, 80, 0.5)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {/* Busca */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                    🔍 Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Nome, palavra ou descrição..."
                    value={particleFilter.searchTerm}
                    onChange={e => setParticleFilter({ ...particleFilter, searchTerm: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(232, 232, 232, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#e8e8e8',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                    📋 Tipo
                  </label>
                  <select
                    value={particleFilter.type}
                    onChange={e => setParticleFilter({ ...particleFilter, type: e.target.value as ParticleType })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(232, 232, 232, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#e8e8e8',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="Todos">Todas as Partículas</option>
                    <option value="Objeto">Objetos</option>
                    <option value="Função">Funções</option>
                    <option value="Característica">Características</option>
                    <option value="Complemento">Complementos</option>
                    <option value="Criador">Criadores</option>
                  </select>
                </div>

                {/* Dificuldade */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                    ⚔️ Dificuldade
                  </label>
                  <select
                    value={particleFilter.difficulty}
                    onChange={e => setParticleFilter({ ...particleFilter, difficulty: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(232, 232, 232, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#e8e8e8',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="todos">Todas</option>
                    <option value="fácil">Fácil</option>
                    <option value="moderado">Moderado</option>
                    <option value="difícil">Difícil</option>
                    <option value="lendário">Lendário</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid de Partículas */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#8896a8', marginBottom: '1rem' }}>
                📊 {filteredParticles.length} partículas encontradas
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filteredParticles.map(particle => (
                  <div
                    key={particle.id}
                    style={{
                      backgroundColor: 'rgba(50, 60, 80, 0.6)',
                      border: `2px solid ${getTypeColor(particle.type)}`,
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.8)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(50, 60, 80, 0.6)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d4af37', margin: '0 0 0.25rem 0' }}>
                          {particle.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#a78bfa', margin: '0', fontStyle: 'italic' }}>
                          {particle.word}
                        </p>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: getTypeColor(particle.type),
                          color: '#1e2330',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {particle.type}
                      </span>
                    </div>

                    {/* Descrição */}
                    <p style={{ fontSize: '0.875rem', color: '#c0c0c0', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                      {particle.description}
                    </p>

                    {/* Uso */}
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8896a8', margin: '0 0 0.25rem 0' }}>
                        USO
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#e8e8e8', margin: '0', fontStyle: 'italic' }}>
                        {particle.usage}
                      </p>
                    </div>

                    {/* Exemplos */}
                    {particle.examples.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8896a8', margin: '0 0 0.5rem 0' }}>
                          EXEMPLOS
                        </p>
                        <ul style={{ margin: '0', paddingLeft: '1rem', color: '#a78bfa', fontSize: '0.8rem' }}>
                          {particle.examples.slice(0, 3).map((ex, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem' }}>
                              {ex}
                            </li>
                          ))}
                          {particle.examples.length > 3 && <li style={{ color: '#8896a8' }}>...</li>}
                        </ul>
                      </div>
                    )}

                    {/* Dificuldade */}
                    {particle.difficulty && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.375rem 0.75rem',
                            backgroundColor: getDifficultyColor(particle.difficulty),
                            color: '#1e2330',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        >
                          {particle.difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODO CAMINHOS */}
        {viewMode === 'pathways' && (
          <div>
            {/* Filtros */}
            <div
              style={{
                backgroundColor: 'rgba(50, 60, 80, 0.5)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#d4af37' }}>
                    🔍 Buscar Caminho
                  </label>
                  <input
                    type="text"
                    placeholder="Nome ou tema..."
                    value={pathwayFilter.searchTerm}
                    onChange={e => setPathwayFilter({ ...pathwayFilter, searchTerm: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(232, 232, 232, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#e8e8e8',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Lista de Caminhos */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredPathways.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    backgroundColor: 'rgba(50, 60, 80, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#8896a8',
                  }}
                >
                  Nenhum caminho encontrado com esses critérios
                </div>
              ) : (
                filteredPathways.map(pathway => (
                  <div
                    key={pathway.id}
                    style={{
                      backgroundColor: 'rgba(50, 60, 80, 0.6)',
                      border: '2px solid #d4af37',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header Clicável */}
                    <div
                      onClick={() => setExpandedPathway(expandedPathway === pathway.id ? null : pathway.id)}
                      style={{
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 0.3s',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d4af37', margin: '0 0 0.5rem 0' }}>
                          {pathway.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#8896a8', margin: '0', fontStyle: 'italic' }}>
                          {pathway.philosophy}
                        </p>
                      </div>
                      <span style={{ fontSize: '1.5rem', color: '#d4af37' }}>
                        {expandedPathway === pathway.id ? '▼' : '▶'}
                      </span>
                    </div>

                    {/* Conteúdo Expandido */}
                    {expandedPathway === pathway.id && (
                      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(50, 60, 80, 0.4)', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        {/* Descrição */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
                            📖 Descrição
                          </h4>
                          <p style={{ fontSize: '0.9375rem', color: '#c0c0c0', lineHeight: '1.6', margin: '0' }}>
                            {pathway.description}
                          </p>
                        </div>

                        {/* Temas */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.75rem' }}>
                            🎭 Temas Principais
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {pathway.themes.map(theme => (
                              <span
                                key={theme}
                                style={{
                                  display: 'inline-block',
                                  padding: '0.5rem 1rem',
                                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                  border: '1px solid #d4af37',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#d4af37',
                                }}
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Arquétipos */}
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.75rem' }}>
                            ⚔️ Arquétipos de Papel
                          </h4>
                          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#e8e8e8', fontSize: '0.9375rem' }}>
                            {pathway.roleArchetypes.map(archetype => (
                              <li key={archetype} style={{ marginBottom: '0.5rem' }}>
                                {archetype}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicParticlesGrimoire;
