import React, { useState } from 'react';
import {
  MASTERY_RULES,
  SEQUENCE_TO_MASTERY,
  COMPLEMENTOS,
  MODIFICADORES,
  CRIADORES,
  EXEMPLOS_FRASES,
  MASTERY_PHILOSOPHY,
  SequenceLevel,
  MasteryLevel,
} from '../data/arcane-mastery';

type TabView = 'maestria' | 'complementos' | 'modificadores' | 'criadores' | 'exemplos' | 'filosofia';

const ArcaneMasteryGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('maestria');
  const [selectedSequence, setSelectedSequence] = useState<SequenceLevel>('seq5');
  const [expandedExample, setExpandedExample] = useState<number | null>(null);

  const selectedMastery = SEQUENCE_TO_MASTERY[selectedSequence];
  const masteryRule = MASTERY_RULES[selectedMastery];

  const getSequenceColor = (seq: SequenceLevel): string => {
    const seq_num = parseInt(seq.replace('seq', ''));
    if (seq_num >= 9 || seq_num <= 8) return '#a78bfa'; // Purple para Estudantes
    if (seq_num >= 7 || seq_num <= 5) return '#60a5fa'; // Blue para Praticantes
    return '#fbbf24'; // Gold para Mestres
  };

  const getMasteryIcon = (mastery: MasteryLevel): string => {
    switch (mastery) {
      case 'Estudante':
        return '📚';
      case 'Praticante':
        return '⚡';
      case 'Mestre':
        return '👑';
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Baixo':
        return '#10b981';
      case 'Moderado':
        return '#f59e0b';
      case 'Alto':
        return '#ef4444';
      default:
        return '#d4af37';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'rgba(15, 20, 30, 0.95)', color: '#e0e7ff', padding: '2rem' }}>
      {/* Cabeçalho */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#d4af37' }}>⚔️ A Gramática da Magia</h1>
        <p style={{ fontSize: '1.1rem', color: '#a0aec0', marginBottom: '1.5rem' }}>
          Uma Linguagem Aberta: O Conhecimento é Universal, a Maestria é Progressão
        </p>

        {/* Navegação de Abas */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            borderBottom: '2px solid #d4af37',
            paddingBottom: '1rem',
          }}
        >
          {[
            { key: 'maestria', label: '👑 Maestria Arcana' },
            { key: 'complementos', label: '🔧 Complementos' },
            { key: 'modificadores', label: '⚙️ Modificadores' },
            { key: 'criadores', label: '🧙 Criadores' },
            { key: 'exemplos', label: '✨ Exemplos' },
            { key: 'filosofia', label: '📖 Filosofia' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabView)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === tab.key ? '#d4af37' : 'transparent',
                color: activeTab === tab.key ? '#000' : '#d4af37',
                border: '2px solid #d4af37',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* TAB: MAESTRIA ARCANA */}
        {activeTab === 'maestria' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>Níveis de Maestria Arcana</h2>

            {/* Seletor de Sequência */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Escolha uma Sequência:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['seq9', 'seq8', 'seq7', 'seq6', 'seq5', 'seq4', 'seq3', 'seq2', 'seq1'] as SequenceLevel[]).map(
                  (seq) => (
                    <button
                      key={seq}
                      onClick={() => setSelectedSequence(seq)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: selectedSequence === seq ? getSequenceColor(seq) : 'rgba(100, 116, 139, 0.3)',
                        color: selectedSequence === seq ? '#000' : '#e0e7ff',
                        border: `2px solid ${getSequenceColor(seq)}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: selectedSequence === seq ? 'bold' : 'normal',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {seq.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cardão de Maestria Selecionada */}
            <div
              style={{
                backgroundColor: 'rgba(30, 35, 45, 0.9)',
                border: `3px solid ${selectedMastery === 'Estudante' ? '#a78bfa' : selectedMastery === 'Praticante' ? '#60a5fa' : '#fbbf24'}`,
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{getMasteryIcon(selectedMastery)}</span>
                <div>
                  <h3 style={{ fontSize: '1.8rem', margin: '0 0 0.25rem 0', color: '#d4af37' }}>
                    {masteryRule.title}
                  </h3>
                  <p style={{ margin: '0', color: '#a0aec0' }}>{masteryRule.sequenceRange}</p>
                </div>
              </div>

              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {masteryRule.description}
              </p>

              {/* Regras Mecânicas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginTop: '1.5rem',
                }}
              >
                <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>Dificuldade Gramatical</h4>
                  <p style={{ margin: '0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {masteryRule.grammarDifficulty > 0 ? '+' : ''}{masteryRule.grammarDifficulty}
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>Teste Requerido</h4>
                  <p style={{ margin: '0', fontSize: '1.1rem' }}>
                    {masteryRule.testRequired ? 'Sim' : 'Pode Contornar'}
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>Custo em PV para Contornar</h4>
                  <p style={{ margin: '0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {masteryRule.willPointCost === 0 ? 'N/A' : masteryRule.willPointCost}
                  </p>
                </div>
                {masteryRule.maxSpellLevelForFreeCast > 0 && (
                  <div style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>Nível Máximo Sem Teste</h4>
                    <p style={{ margin: '0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                      Nível {masteryRule.maxSpellLevelForFreeCast}+
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(168, 139, 250, 0.1)', borderRadius: '0.5rem', borderLeft: '4px solid #a78bfa' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>Habilidade Especial</h4>
                <p style={{ margin: '0', lineHeight: '1.6' }}>{masteryRule.specialAbility}</p>
              </div>
            </div>

            {/* Comparação de Níveis */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>Progressão de Maestria</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {(['Estudante', 'Praticante', 'Mestre'] as MasteryLevel[]).map((mastery) => {
                const rule = MASTERY_RULES[mastery];
                return (
                  <div
                    key={mastery}
                    style={{
                      backgroundColor: 'rgba(30, 35, 45, 0.9)',
                      border: `2px solid ${mastery === 'Estudante' ? '#a78bfa' : mastery === 'Praticante' ? '#60a5fa' : '#fbbf24'}`,
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem 0', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getMasteryIcon(mastery)} {rule.title}
                    </h4>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                      <li>
                        <strong>Sequência:</strong> {rule.sequenceRange}
                      </li>
                      <li>
                        <strong>Modificador:</strong> {rule.grammarDifficulty > 0 ? '+' : ''}{rule.grammarDifficulty}
                      </li>
                      <li>
                        <strong>Teste:</strong> {rule.testRequired ? 'Requerido' : 'Opcional'}
                      </li>
                      {rule.maxSpellLevelForFreeCast > 0 && (
                        <li>
                          <strong>Livre até:</strong> Nível {rule.maxSpellLevelForFreeCast}
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: COMPLEMENTOS */}
        {activeTab === 'complementos' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>🔧 Complementos</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#a0aec0' }}>
              Modificam a forma, escala e estrutura da magia. São as ferramentas mais comuns na gramática arcana.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {COMPLEMENTOS.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.9)',
                    border: '2px solid #60a5fa',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>{comp.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ backgroundColor: '#60a5fa', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                      {comp.category}
                    </span>
                    <span
                      style={{
                        backgroundColor: getRiskColor(comp.riskLevel),
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {comp.riskLevel}
                    </span>
                  </div>
                  <p style={{ margin: '1rem 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <strong>Efeito:</strong> {comp.effect}
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#d4af37' }}>Exemplos:</p>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                      {comp.examples.map((ex, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MODIFICADORES */}
        {activeTab === 'modificadores' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>⚙️ Modificadores</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#a0aec0' }}>
              Alteram como a magia funciona no nível conceitual, mudando seu método de ativação, efeito ou alcance.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {MODIFICADORES.map((mod) => (
                <div
                  key={mod.id}
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.9)',
                    border: '2px solid #f59e0b',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>{mod.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ backgroundColor: '#f59e0b', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                      {mod.category}
                    </span>
                    <span
                      style={{
                        backgroundColor: getRiskColor(mod.riskLevel),
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {mod.riskLevel}
                    </span>
                  </div>
                  <p style={{ margin: '1rem 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <strong>Efeito:</strong> {mod.effect}
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#d4af37' }}>Exemplos:</p>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                      {mod.examples.map((ex, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CRIADORES */}
        {activeTab === 'criadores' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>🧙 Criadores (Prefixos Lógicos)</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#a0aec0' }}>
              Constroem novas combinações de partículas. São operações lógicas que permitem criar efeitos completamente novos.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {CRIADORES.map((criador) => (
                <div
                  key={criador.id}
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.9)',
                    border: '2px solid #a78bfa',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#d4af37' }}>{criador.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ backgroundColor: '#a78bfa', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                      {criador.category}
                    </span>
                    <span
                      style={{
                        backgroundColor: getRiskColor(criador.riskLevel),
                        color: '#000',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {criador.riskLevel}
                    </span>
                  </div>
                  <p style={{ margin: '1rem 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <strong>Efeito:</strong> {criador.effect}
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#d4af37' }}>Exemplos:</p>
                    <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                      {criador.examples.map((ex, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EXEMPLOS */}
        {activeTab === 'exemplos' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>✨ Exemplos de Frases Mágicas</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#a0aec0' }}>
              Veja como a mesma Frase Mágica é usada por Estudantes, Praticantes e Mestres.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {EXEMPLOS_FRASES.map((exemplo, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(30, 35, 45, 0.9)',
                    border: '2px solid #d4af37',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                  }}
                >
                  <button
                    onClick={() => setExpandedExample(expandedExample === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'rgba(100, 116, 139, 0.2)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#d4af37',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      ✨ {exemplo.nome} - <code style={{ color: '#60a5fa', fontSize: '0.9rem' }}>{exemplo.particulas}</code>
                    </span>
                    <span>{expandedExample === idx ? '−' : '+'}</span>
                  </button>

                  {expandedExample === idx && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
                      <p style={{ marginTop: '0', fontSize: '1rem', lineHeight: '1.6', color: '#a0aec0' }}>
                        {exemplo.descricao}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '1rem',
                          marginTop: '1.5rem',
                        }}
                      >
                        {/* Estudante */}
                        <div
                          style={{
                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                            border: '1px solid #a78bfa',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                          }}
                        >
                          <h4 style={{ margin: '0 0 0.75rem 0', color: '#a78bfa' }}>📚 Estudante (Seq. 9)</h4>
                          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <p>
                              <strong>Dificuldade:</strong> {exemplo.estudante.dificuldade}
                            </p>
                            <p>
                              <strong>Penalidade:</strong> {exemplo.estudante.penalidade}
                            </p>
                            <p style={{ color: '#ef4444' }}>
                              <strong>Risco:</strong> {exemplo.estudante.risco}
                            </p>
                          </div>
                        </div>

                        {/* Praticante */}
                        <div
                          style={{
                            backgroundColor: 'rgba(96, 165, 250, 0.1)',
                            border: '1px solid #60a5fa',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                          }}
                        >
                          <h4 style={{ margin: '0 0 0.75rem 0', color: '#60a5fa' }}>⚡ Praticante (Seq. 7)</h4>
                          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <p>
                              <strong>Dificuldade:</strong> {exemplo.praticante.dificuldade}
                            </p>
                            <p>
                              <strong>Penalidade:</strong> {exemplo.praticante.penalidade}
                            </p>
                            <p style={{ color: '#10b981' }}>
                              <strong>Risco:</strong> {exemplo.praticante.risco}
                            </p>
                          </div>
                        </div>

                        {/* Mestre */}
                        <div
                          style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid #fbbf24',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                          }}
                        >
                          <h4 style={{ margin: '0 0 0.75rem 0', color: '#fbbf24' }}>👑 Mestre (Seq. 4)</h4>
                          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <p>
                              <strong>Dificuldade:</strong> {exemplo.mestre.dificuldade}
                            </p>
                            <p>
                              <strong>Custo em PV:</strong> {exemplo.mestre.custoPV > 0 ? exemplo.mestre.custoPV + ' (opcional)' : 'Sem custo'}
                            </p>
                            <p style={{ color: '#10b981' }}>
                              <strong>Risco:</strong> {exemplo.mestre.risco}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FILOSOFIA */}
        {activeTab === 'filosofia' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#d4af37' }}>📖 A Filosofia da Maestria</h2>
            <div
              style={{
                backgroundColor: 'rgba(30, 35, 45, 0.9)',
                border: '3px solid #d4af37',
                borderRadius: '1rem',
                padding: '2rem',
                lineHeight: '1.8',
                fontSize: '1.05rem',
                whiteSpace: 'pre-wrap',
                fontFamily: '"Courier New", monospace',
              }}
            >
              {MASTERY_PHILOSOPHY}
            </div>

            <div
              style={{
                marginTop: '2rem',
                backgroundColor: 'rgba(30, 35, 45, 0.9)',
                border: '2px solid #d4af37',
                borderRadius: '1rem',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', color: '#d4af37' }}>Princípios Fundamentais</h3>
              <ul style={{ margin: '0', paddingLeft: '1.5rem', lineHeight: '2' }}>
                <li>
                  <strong>Conhecimento Universal:</strong> Todo Beyonder, desde a Sequência 9, tem acesso teórico a todas as ferramentas gramaticais.
                </li>
                <li>
                  <strong>Progressão através da Maestria:</strong> O que muda com a sequência não é o acesso, mas a eficiência e segurança.
                </li>
                <li>
                  <strong>Risco Diminui com Profundidade:</strong> Estudantes pagam com testes e penalidades. Mestres pagam apenas com vontade.
                </li>
                <li>
                  <strong>Vontade como Moeda Final:</strong> Um Mestre não segue regras - ele as reescreve com sua própria vontade.
                </li>
                <li>
                  <strong>Falha é Aprendizado:</strong> Cada falha de um Estudante é uma pronúncia errada que ele nunca mais cometerá.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArcaneMasteryGuide;
