import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Enemy, Attributes, BeyonderAbility, LearnedParticle } from '../types';
import PATHWAYS_DATA from '../data/pathways';
import { PATHWAY_DESCRIPTIONS } from '../data/pathway-descriptions';

// Simple UUID generator
const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

const UNIVERSAL_PARTICLES: Record<string, { name: string; word: string; category: string }[]> = {
  'Ocultismo': [
    { name: 'Revelar', word: 'Il', category: 'Ocultismo' },
    { name: 'Espírito', word: 'Pneuma', category: 'Ocultismo' }
  ],
  'Acadêmicos': [
    { name: 'Informação', word: 'Azi', category: 'Acadêmicos' },
    { name: 'Alterar', word: 'Al', category: 'Acadêmicos' }
  ],
  'Ciência': [
    { name: 'Fogo', word: 'Ig', category: 'Ciência' },
    { name: 'Água', word: 'Quan', category: 'Ciência' }
  ]
};

export const CompanionCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  // Core selections
  const [origin, setOrigin] = useState<'Despertado'|'Herdeiro'|'Antigo'>('Despertado');
  const [mold, setMold] = useState<'Predador Ápice'|'Predador Astuto'|'Sobrevivente Adaptável'>('Predador Ápice');
  const PATHWAYS = useMemo(() => Object.keys(PATHWAYS_DATA), []);
  const [pathway, setPathway] = useState<string>('');

  // Attribute distribution (6/4/3). Start from 1 each, espirit starts at 1.
  const initialAttrs: Attributes = {
    forca: 1, destreza: 1, vigor: 1, carisma: 1, manipulacao: 1, autocontrole: 1, percepcao: 1, inteligencia: 1, raciocinio: 1, espiritualidade: 1
  };
  const [attrs, setAttrs] = useState<Attributes>(initialAttrs);
  const [priority, setPriority] = useState<{ primary: string|null, secondary: string|null, tertiary: string|null }>({ primary: null, secondary: null, tertiary: null });

  const ATTRIBUTE_CATEGORIES: Record<string, (keyof Attributes)[]> = {
    fisicos: ['forca','destreza','vigor'],
    sociais: ['carisma','manipulacao','autocontrole'],
    mentais: ['percepcao','inteligencia','raciocinio']
  };

  const getCategoryPoints = (category: string) => {
    const attrsKeys = ATTRIBUTE_CATEGORIES[category] || [];
    const used = attrsKeys.reduce((s, k) => s + (attrs[k] - 1), 0);
    const pointsMap: Record<string, number> = { primary: 6, secondary: 4, tertiary: 3 };
    let available = 0;
    if (priority.primary === category) available = pointsMap.primary;
    else if (priority.secondary === category) available = pointsMap.secondary;
    else if (priority.tertiary === category) available = pointsMap.tertiary;
    return { used, available };
  };

  // Particles and innate
  const [selectedUniversals, setSelectedUniversals] = useState<{ name: string; word: string; category: string }[]>([]);

  const toggleUniversal = (u: any) => {
    setSelectedUniversals(prev => {
      const found = prev.find(p => p.name === u.name && p.word === u.word);
      if (found) return prev.filter(p => p !== found);
      if (prev.length >= 2) return prev;
      return [...prev, u];
    });
  };

  const adjustAttr = (key: keyof Attributes, delta: number) => {
    setAttrs(prev => {
      // Intelligence cannot be greater than 1 at creation for animal companions
      if (key === 'inteligencia' && delta > 0) return prev;

      // Espiritualidade always stays at 1 at creation
      if (key === 'espiritualidade') return prev;

      const category = Object.keys(ATTRIBUTE_CATEGORIES).find(cat => ATTRIBUTE_CATEGORIES[cat].includes(key));
      if (!category) return prev;
      const { used, available } = getCategoryPoints(category!);

      // If increasing, ensure we have available points
      if (delta > 0 && used >= available) return prev;

      const nextVal = Math.max(1, Math.min(5, prev[key] + delta));
      return { ...prev, [key]: nextVal } as Attributes;
    });
  };

  const canProceedStep1 = pathway !== '';
  const canProceedStep2 = (() => {
    if (!priority.primary || !priority.secondary || !priority.tertiary) return false;
    // unique priorities
    const vals = [priority.primary, priority.secondary, priority.tertiary];
    if (new Set(vals).size !== 3) return false;
    // all category points used
    const cats = Object.keys(ATTRIBUTE_CATEGORIES);
    return cats.every(cat => {
      const { used, available } = getCategoryPoints(cat);
      return used === available;
    });
  })();
  const canProceedStep3 = selectedUniversals.length === 2;

  const buildCompanionObject = () => {
    // Choose innate seq9
    const pd = (PATHWAYS_DATA as any)[pathway];
    const innates = pd?.poderesInatos || [];
    // If user selected an innate explicitly, use it; otherwise fallback to seq9 or first
    const chosenInnate = (selectedInnateId
      ? innates.find((p: any, i: number) => String(i) === String(selectedInnateId))
      : innates.find((p: any) => String(p.seq).trim() === '9')) || innates[0];

    const abilities: BeyonderAbility[] = chosenInnate ? [{ id: Date.now(), name: chosenInnate.nome, description: chosenInnate.desc, acquisitionMethod: 'free', seqName: chosenInnate.seq || null }] : [];

    const learned: LearnedParticle[] = [];
    const domainPart = pd?.domain?.particulas?.[0];
    if (domainPart) learned.push({ id: generateUUID(), type: 'Domínio', name: domainPart.name || domainPart.translation || domainPart.conceito || 'Domínio', description: domainPart.conceito || '', palavra: domainPart.example || '', isDomain: true } as any);
    selectedUniversals.forEach(u => learned.push({ id: generateUUID(), type: 'Universal', name: u.name, description: '', palavra: u.word, acquisitionMethod: 'universal' } as any));

    // Apply biological mold bonuses (after distribution)
    const finalAttrs = { ...attrs } as Attributes;
    if (mold === 'Predador Ápice') {
      finalAttrs.forca = Math.min(5, finalAttrs.forca + 1);
      finalAttrs.vigor = Math.min(5, finalAttrs.vigor + 1);
    } else if (mold === 'Predador Astuto') {
      finalAttrs.destreza = Math.min(5, finalAttrs.destreza + 1);
      finalAttrs.percepcao = Math.min(5, finalAttrs.percepcao + 1);
    } else if (mold === 'Sobrevivente Adaptável') {
      finalAttrs.raciocinio = Math.min(5, finalAttrs.raciocinio + 1);
      finalAttrs.autocontrole = Math.min(5, finalAttrs.autocontrole + 1);
    }

    // Starting skills: two from mold, one general + one investigative from pathway (defaults)
    const moldSkillsMap: Record<string, string[]> = {
      'Predador Ápice': ['Briga', 'Sobrevivência'],
      'Predador Astuto': ['Furtividade', 'Briga'],
      'Sobrevivente Adaptável': ['Percepção', 'Prontidão']
    };
    const moldSkills = moldSkillsMap[mold] || ['Briga', 'Sobrevivência'];
    const pathwayGeneral = 'Empatia';
    const pathwayInvestigative = 'Ocultismo';

    const skillAttrMap: Record<string, keyof Attributes> = {
      'Briga': 'forca',
      'Sobrevivência': 'raciocinio',
      'Furtividade': 'destreza',
      'Percepção': 'percepcao',
      'Prontidão': 'raciocinio',
      'Empatia': 'percepcao',
      'Ocultismo': 'inteligencia'
    };

    const skillsObj: any = {};
    [...moldSkills, pathwayGeneral, pathwayInvestigative].forEach(skillName => {
      const attrKey = skillAttrMap[skillName] || 'raciocinio';
      skillsObj[skillName.toLowerCase().replace(/\s+/g, '_')] = finalAttrs[attrKey] || 1;
    });

    const companion: Enemy = {
      id: generateUUID(),
      name: `Companheiro - ${pathway}`,
      description: `Companheiro Beyonder - Origem: ${origin}, Molde: ${mold}`,
      threatLevel: 'Média',
      recommendedSequence: 'Seq. 9',
      attributes: finalAttrs,
      espiritualidade: Math.max(1, finalAttrs.espiritualidade || 1) + (origin === 'Herdeiro' ? 5 : 0),
      skills: skillsObj,
      creatureSkills: [],
      healthPoints: 20 + (finalAttrs.vigor * 2) + (mold === 'Predador Astuto' ? -1 : 0),
      initiative: finalAttrs.raciocinio,
      defense: 3,
      absorption: 3,
      movement: 6,
      attacks: [],
      abilities: abilities.map(a => ({ name: a.name, actionType: 'Passivo', description: a.description })) ,
      vulnerabilities: [],
      weaknesses: [],
      notes: `Pathway: ${pathway} | Learned particles: ${selectedUniversals.map(u=>u.name).join(', ')} | OriginEffect: ${origin}`
    };

    return { companion, abilities, learned } as any;
  };

  const saveCompanion = async () => {
    const userRes = await supabase.auth.getUser();
    const userId = userRes?.data?.user?.id;
    if (!userId) {
      alert('Você precisa estar logado para salvar o companheiro.');
      return;
    }

    const { companion } = buildCompanionObject();

    const { error } = await supabase.from('creatures').insert([{ owner_id: userId, data: companion }]);
    if (error) {
      console.error('Erro ao salvar companheiro:', error);
      alert('Erro ao salvar companheiro. Veja o console.');
    } else {
      alert('Companheiro salvo com sucesso!');
      navigate('/creatures');
    }
  };

  // --- Selected innate state for user choice ---
  const [availableInnates, setAvailableInnates] = useState<any[]>(() => {
    const pd = (PATHWAYS_DATA as any)[pathway];
    return pd?.poderesInatos || [];
  });
  const [selectedInnateId, setSelectedInnateId] = useState<string | null>(null);

  // update available innates whenever pathway changes
  React.useEffect(() => {
    const pd = (PATHWAYS_DATA as any)[pathway];
    setAvailableInnates(pd?.poderesInatos || []);
    setSelectedInnateId(null);
  }, [pathway]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ color: '#d4af37' }}>Criação de Companheiro Beyonder</h1>
      <p style={{ color: '#aaa' }}>Siga os passos para criar um Companheiro Beyonder (sempre começa na Sequência 9).</p>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Passo {step} / 4</strong>
        </div>

        {step === 1 && (
          <div>
            <h3>1) Origem & Molde Biológico</h3>
            <button onClick={() => setShowGuide(s => !s)} style={{ marginBottom: 8 }}>
              {showGuide ? 'Ocultar Guia Completo' : 'Mostrar Guia Completo' }
            </button>
            {showGuide && (
              <div style={{ padding: 12, border: '1px solid #444', borderRadius: 6, marginBottom: 12, background: '#0f0f10' }}>
                <h4 style={{ color: '#d4af37' }}>Companheiros Beyonder — Guia Completo</h4>
                <div style={{ color: '#ddd', maxHeight: 300, overflow: 'auto', fontSize: 13 }}>
                  <p>No mundo sombrio dos Beyonders, a lealdade é uma moeda rara. Para alguns, o vínculo mais forte é forjado não com humanos, mas com uma criatura que compartilha seu caminho sobrenatural. Um Companheiro Beyonder é mais do que um animal de estimação; é um parceiro, uma âncora e uma alma senciente ligada à sua.</p>
                  <h5>A Criação</h5>
                  <p>Um Companheiro Beyonder não é simplesmente adotado. Ele é o resultado de um evento sobrenatural significativo, geralmente por ter consumido uma poção de Beyonder (sempre começando na Sequência 9). Isso deve ser parte da história do seu personagem, decidido em conjunto com o Narrador.</p>
                  <h5>Passo 1: A Origem</h5>
                  <p><strong>Despertado:</strong> Era um animal comum que consumiu uma poção. Mecânica: Vínculo Sensorial com você tem dificuldade reduzida em 1.</p>
                  <p><strong>Herdeiro:</strong> Nascido Beyonder. Mecânica: +5 de PE máximo inicial.</p>
                  <p><strong>Antigo:</strong> Linhagem adormecida. Mecânica: uma vez por história você pode fazer uma pergunta ao Narrador sobre uma lenda/rastreamento místico.</p>
                  <h5>Passo 2: Molde Biológico</h5>
                  <p><strong>Predador Ápice:</strong> +1 Força, +1 Vigor. Forte, mas visão de túnel (-1 Prontidão em certas situações).</p>
                  <p><strong>Predador Astuto:</strong> +1 Destreza, +1 Percepção. Furtividade superior; porém Vigor reduzido para cálculo de PV.</p>
                  <p><strong>Sobrevivente Adaptável:</strong> +1 Raciocínio, +1 Autocontrole. Muito resiliente; aptidão de pressentir perigo uma vez por sessão.</p>
                  <h5>Passo 3: Atributos</h5>
                  <p>Distribua 6/4/3 por categorias (Físicos/Sociais/Mentais). Inteligência não pode ser maior que 1 na criação. Espiritualidade começa em 1.</p>
                  <h5>Passo 4: Habilidades Iniciais</h5>
                  <p>O Companheiro recebe: Partícula de Domínio (automática), 2 Partículas Universais (escolha), 4 perícias iniciais (2 do Molde, 1 geral do Caminho e 1 investigativa do Caminho) e 1 habilidade gratuita da Sequência 9 do seu Caminho.</p>
                  <h5>Dons da Besta</h5>
                  <p>Ataques Naturais (1d6 letal + Força), Armadura Natural = metade do Vigor (arredondado para cima), Sexto Sentido (re-rolar 1 ou 2 em Percepção uma vez por teste).</p>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Origem</label>
                <select value={origin} onChange={e => setOrigin(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="Despertado">Despertado (Pela Poção)</option>
                  <option value="Herdeiro">Herdeiro (Nascido Beyonder)</option>
                  <option value="Antigo">Antigo (Linhagem Adormecida)</option>
                </select>
              </div>
              <div>
                <label>Molde Biológico</label>
                <select value={mold} onChange={e => setMold(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="Predador Ápice">Predador Ápice</option>
                  <option value="Predador Astuto">Predador Astuto</option>
                  <option value="Sobrevivente Adaptável">Sobrevivente Adaptável</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>2) Escolha o Caminho</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {PATHWAYS.map(p => (
                <button key={p} onClick={() => setPathway(p)} style={{ padding: '0.6rem', borderRadius: 8, border: pathway===p? '2px solid #d4af37':'1px solid #444', background: pathway===p ? 'rgba(212,175,55,0.08)' : 'transparent' }}>
                  {PATHWAY_DESCRIPTIONS[p]?.themeName || p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>3) Atributos (Distribuição 6/4/3)</h3>
            <p style={{ color: '#999' }}>Escolha qual categoria será Primária (6), Secundária (4) e Terciária (3). Depois ajuste os atributos dentro dos limites.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setPriority({ primary: 'fisicos', secondary: 'sociais', tertiary: 'mentais' })}>Físicos Pri.</button>
              <button onClick={() => setPriority({ primary: 'mentais', secondary: 'fisicos', tertiary: 'sociais' })}>Mentais Pri.</button>
              <button onClick={() => setPriority({ primary: 'sociais', secondary: 'mentais', tertiary: 'fisicos' })}>Sociais Pri.</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {['forca','destreza','vigor','carisma','manipulacao','autocontrole','percepcao','inteligencia','raciocinio'].map((k:any) => (
                <div key={k} style={{ padding: '0.5rem', border: '1px solid #333', borderRadius: 6 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>{k}</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => adjustAttr(k, -1)}>-</button>
                    <div>{(attrs as any)[k]}</div>
                    <button onClick={() => adjustAttr(k, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3>4) Partículas & Habilidade Seq.9</h3>
            <p style={{ color: '#999' }}>Partícula de Domínio será atribuída automaticamente. Selecione 2 Partículas Universais:</p>
            <div>
              {Object.entries(UNIVERSAL_PARTICLES).map(([cat, arr]) => (
                <div key={cat} style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#d4af37' }}>{cat}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {arr.map(u => (
                      <button key={u.name} onClick={() => toggleUniversal(u)} style={{ padding: '0.4rem', border: selectedUniversals.some(s=>s.name===u.name)?'2px solid #4a9bff':'1px solid #444' }}>{u.name} "{u.word}"</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #444' }}>
              <h4>Resumo</h4>
              <p>Origem: {origin} • Molde: {mold} • Caminho: {pathway}</p>
              <p>Partículas Universais: {selectedUniversals.map(u=>u.name).join(', ') || '—'}</p>
              <p>Habilidade Seq.9: escolha abaixo (se disponível).</p>
              <div style={{ marginTop: 8 }}>
                {availableInnates.length === 0 ? (
                  <p style={{ color: '#999' }}>Nenhuma habilidade inata listada para este caminho.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {availableInnates.map((inn: any, idx: number) => (
                      <label key={idx} style={{ display: 'block', border: selectedInnateId === String(idx) ? '2px solid #4a9bff' : '1px solid #333', padding: 8, borderRadius: 6 }}>
                        <input type="radio" name="innate" checked={selectedInnateId === String(idx)} onChange={() => setSelectedInnateId(String(idx))} /> {' '}
                        <strong>{inn.nome}</strong> — <span style={{ color: '#bbb' }}>{inn.desc}</span> <em style={{ color: '#777' }}>({inn.seq})</em>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
          {step > 1 && <button onClick={() => setStep(s => Math.max(1, s-1))}>← Voltar</button>}
          {step < 4 && <button onClick={() => {
            // Validate before advancing
            if (step === 1 && !canProceedStep1) { alert('Escolha um Caminho antes de continuar.'); return; }
            if (step === 2 && !canProceedStep2) { alert('Complete a distribuição de atributos (6/4/3) antes de continuar.'); return; }
            if (step === 3 && !canProceedStep3) { alert('Selecione 2 Partículas Universais antes de continuar.'); return; }
            setStep(s => Math.min(4, s+1));
          }}>Próximo →</button>}
          {step === 4 && <button onClick={saveCompanion} style={{ background: '#4caf50', color: '#fff' }}>Salvar Companheiro</button>}
        </div>
      </div>
    </div>
  );
};

export default CompanionCreationWizard;
