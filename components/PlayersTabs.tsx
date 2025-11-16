import React, { useState } from 'react';

type TabKey = 'Agentes' | 'Jogadores' | 'Combates';

const TabsNav: React.FC<{
  active: TabKey;
  onChange: (t: TabKey) => void;
}> = ({ active, onChange }) => {
  return (
    <nav className="bx-tabs" aria-label="Navegação principal">
      {(['Agentes', 'Jogadores', 'Combates'] as TabKey[]).map((t) => (
        <button
          key={t}
          className={`bx-tab ${active === t ? 'active' : ''}`}
          onClick={() => onChange(t)}
          type="button"
        >
          {t}
        </button>
      ))}
    </nav>
  );
};

export const PlayersTabs: React.FC<{ defaultActive?: TabKey }> = ({ defaultActive = 'Jogadores' }) => {
  const [active, setActive] = useState<TabKey>(defaultActive);

  return (
    <div className="bx-tabs-wrapper">
      {/* Local styles: self-contained, no global collisions */}
      <style>{`
        :root{
          --bx-bg:#1a1a1a;
          --bx-text:#e5e7eb;
          --bx-muted:#a1a1aa;
          --bx-active:#a3e635;
          --bx-card:#111113;
          --bx-border:#2a2a2a;
        }
        .bx-tabs-wrapper{ color:var(--bx-text); font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, sans-serif; }
        .bx-tabs{ display:flex; gap:1.25rem; border-bottom:1px solid var(--bx-border); margin-bottom:1rem; }
        .bx-tab{ appearance:none; background:none; border:none; padding:.75rem .25rem; color:var(--bx-muted); border-bottom:2px solid transparent; cursor:pointer; transition: color .2s ease, border-color .2s ease; font-size:1rem; }
        .bx-tab:hover{ color:#d4d4d8; }
        .bx-tab.active{ color:var(--bx-active); border-bottom-color:var(--bx-active); }
        .bx-content{ background:var(--bx-card); border:1px solid var(--bx-border); border-radius:.5rem; padding:1.25rem; }
        .bx-content p{ margin:0; color:#f4f4f5; }
      `}</style>

      <TabsNav active={active} onChange={setActive} />

      <section className="bx-content" aria-live="polite">
        {active === 'Jogadores' && <p>Nenhum jogador adicionado.</p>}
        {active === 'Agentes' && <p>Selecione um agente na lista.</p>}
        {active === 'Combates' && <p>Sem combates ativos.</p>}
      </section>
    </div>
  );
};

export default PlayersTabs;
