/**
 * MAESTRIA ARCANA: O Domínio da Gramática da Magia
 * 
 * Cada Beyonder possui um Nível de Maestria que define seu controle
 * sobre os Complementos, Modificadores e Criadores.
 * 
 * A Maestria não é aprendida - é inata desde a primeira dose.
 * O que muda é a eficiência, segurança e poder com que as ferramentas gramaticais são usadas.
 */

export type SequenceLevel = 'seq9' | 'seq8' | 'seq7' | 'seq6' | 'seq5' | 'seq4' | 'seq3' | 'seq2' | 'seq1';
export type MasteryLevel = 'Estudante' | 'Praticante' | 'Mestre';
export type GrammarToolType = 'Complemento' | 'Modificador' | 'Criador';

/**
 * Mapeamento: Sequência → Nível de Maestria
 * A progressão representa o aprofundamento no Caminho
 */
export const SEQUENCE_TO_MASTERY: Record<SequenceLevel, MasteryLevel> = {
  seq9: 'Estudante',
  seq8: 'Estudante',
  seq7: 'Praticante',
  seq6: 'Praticante',
  seq5: 'Praticante',
  seq4: 'Mestre',
  seq3: 'Mestre',
  seq2: 'Mestre',
  seq1: 'Mestre',
};

/**
 * REGRAS DE MAESTRIA ARCANA
 * Definem os modificadores, bônus e custos para cada nível
 */
export const MASTERY_RULES: Record<MasteryLevel, {
  title: string;
  sequenceRange: string;
  description: string;
  grammarDifficulty: number; // Modificador na dificuldade do teste
  testRequired: boolean; // Se requer teste de ativação
  willPointCost: number; // Custo em Pontos de Vontade para contornar teste
  maxSpellLevelForFreeCast: number; // Nível máximo de magia para dispensar teste com PV
  specialAbility: string;
}> = {
  Estudante: {
    title: 'Gramática Instável',
    sequenceRange: 'Seq. 9 - 8',
    description: 'Você está copiando regras que mal entende. A chance de errar a "pronúncia" é alta.',
    grammarDifficulty: +1, // +1 na dificuldade do teste de ativação
    testRequired: true,
    willPointCost: 0, // Não pode usar PV para contornar
    maxSpellLevelForFreeCast: 0,
    specialAbility: 'Nenhuma - você deve dominar as regras através da prática.',
  },
  Praticante: {
    title: 'Gramática Intuitiva',
    sequenceRange: 'Seq. 7 - 5',
    description: 'Usar a gramática se torna natural. Você não sofre penalidades ao conectar ferramentas gramaticais.',
    grammarDifficulty: 0, // Sem modificadores
    testRequired: true,
    willPointCost: 0,
    maxSpellLevelForFreeCast: 0,
    specialAbility: 'Testes de ativação não sofrem modificadores por uso de gramática complexa.',
  },
  Mestre: {
    title: 'Gramática Volitiva',
    sequenceRange: 'Seq. 4 - 1',
    description: 'Você não apenas usa as regras, você as impõe. Sua vontade é a magia, e a realidade obedece.',
    grammarDifficulty: 0,
    testRequired: false, // Pode contornar o teste
    willPointCost: 1, // Custa 1 PV para dispensar teste
    maxSpellLevelForFreeCast: 3, // Pode dispensar para magias Nível 3 ou inferior
    specialAbility: 'Ao gastar 1 Ponto de Vontade, dispense o teste de ativação para magias de Nível 3 ou inferior usando Complementos, Modificadores ou Criadores.',
  },
};

/**
 * FERRAMENTAS GRAMATICAIS
 * Categorias de modificadores que afetam as Frases Mágicas
 */
export interface GrammarToolData {
  id: string;
  name: string;
  type: GrammarToolType;
  category: string;
  description: string;
  effect: string;
  examples: string[];
  riskLevel: 'Baixo' | 'Moderado' | 'Alto'; // Como afeta a dificuldade
}

/**
 * COMPLEMENTOS: Modificam a forma e escala da magia
 * Exemplos: Maior, Menor, Forma, Duração, etc.
 */
export const COMPLEMENTOS: GrammarToolData[] = [
  {
    id: 'comp_maior',
    name: 'Maior (Sar)',
    type: 'Complemento',
    category: 'Escala',
    description: 'Aumenta significativamente o alcance, área ou intensidade do efeito mágico.',
    effect: 'O efeito afeta uma área 3x maior ou 3x mais poderoso que a base.',
    examples: [
      'Ig Sar (Fogo Maior) - Uma explosão que queima um raio de 10m em vez de 3m',
      'Quan Sar (Água Maior) - Uma inundação controlada em vez de um jato direcionado',
      'Lum Sar (Luz Maior) - Uma luminosidade que cega ao invés de apenas iluminar',
    ],
    riskLevel: 'Moderado',
  },
  {
    id: 'comp_menor',
    name: 'Menor (Min)',
    type: 'Complemento',
    category: 'Escala',
    description: 'Reduz o alcance, área ou intensidade do efeito, mas aumenta a precisão e controle.',
    effect: 'O efeito é mais fraco, mas muito mais preciso e controlável.',
    examples: [
      'Ig Min (Fogo Menor) - Uma chama que queima apenas o que você escolhe',
      'Imu Min (Ilusão Menor) - Um disfarce sutil que passa despercebido em multidões',
    ],
    riskLevel: 'Baixo',
  },
  {
    id: 'comp_forma',
    name: 'Forma (Sin)',
    type: 'Complemento',
    category: 'Estrutura',
    description: 'Molda a magia em uma forma física específica: armas, armaduras, estruturas.',
    effect: 'A magia assume uma forma sólida e tangível, geralmente usada em combinação com Objetos.',
    examples: [
      'Ig Sin (Fogo em Forma) - Uma espada de magma que queima ao toque',
      'Quan Sin (Água em Forma) - Uma muralha de gelo que bloqueia passagens',
      'Mun Sin (Terra em Forma) - Uma lança de pedra que pode ser arremessada',
    ],
    riskLevel: 'Moderado',
  },
  {
    id: 'comp_duracao',
    name: 'Duração Estendida (Durans)',
    type: 'Complemento',
    category: 'Tempo',
    description: 'Prolonga o efeito da magia muito além de sua duração normal.',
    effect: 'O efeito persiste por horas, dias ou até permanentemente, dependendo da magia.',
    examples: [
      'Lum Durans (Luz Duradoura) - Uma orbe que brilha por um mês inteiro',
      'Phys Durans (Escudo Físico Permanente) - Uma barreira que protege uma sala indefinidamente',
    ],
    riskLevel: 'Alto',
  },
  {
    id: 'comp_velocidade',
    name: 'Velocidade (Vel)',
    type: 'Complemento',
    category: 'Tempo',
    description: 'Acelera a ativação ou manifestação da magia.',
    effect: 'O efeito acontece instantaneamente ou em fração de segundo.',
    examples: [
      'Ig Vel (Fogo Acelerado) - Explosão que se ativa em um piscar de olhos',
      'Aer Vel (Vento Acelerado) - Uma ventania que aparece do nada',
    ],
    riskLevel: 'Moderado',
  },
];

/**
 * MODIFICADORES: Alteram como a magia funciona no nível conceitual
 * Exemplos: Ritual, Sanguis, Inverso, etc.
 */
export const MODIFICADORES: GrammarToolData[] = [
  {
    id: 'mod_ritus',
    name: 'Ritual (Ritus)',
    type: 'Modificador',
    category: 'Método de Ativação',
    description: 'A magia é canalisada lentamente através de um ritual, ao invés de ativação instantânea.',
    effect: 'Requer tempo para ativar, mas amplifica o poder da magia e reduz o custo mental.',
    examples: [
      'Ig Ritus (Ritual de Fogo) - Canalizar durante 1 minuto para criar um inferno controlado',
      'Imu Ritus (Ritual Mental) - Meditar por 10 minutos para implantar uma sugestão permanente na mente de alguém',
    ],
    riskLevel: 'Baixo',
  },
  {
    id: 'mod_sanguis',
    name: 'Sanguis (Sanguis)',
    type: 'Modificador',
    category: 'Custo de Poder',
    description: 'A magia é alimentada pelo seu próprio sangue, aumentando seu poder exponencialmente.',
    effect: 'A magia fica muito mais poderosa, mas causa dano ao próprio lançador (Espiritualidade em dano).',
    examples: [
      'Ig Sanguis (Chama Sangrenta) - Uma explosão devastadora que deixa você ferido',
      'Imu Sanguis (Controle Mental Sangrento) - Domina completamente a mente de um inimigo, mas você sangra',
    ],
    riskLevel: 'Alto',
  },
  {
    id: 'mod_inverso',
    name: 'Inverso (Inv)',
    type: 'Modificador',
    category: 'Efeito Oposto',
    description: 'Inverte o efeito da magia para seu oposto conceitual.',
    effect: 'Uma magia de destruição se torna cura, proteção se torna vulnerabilidade, etc.',
    examples: [
      'Ig Inv (Fogo Invertido) - Ao invés de queimar, resfria e congela',
      'Lum Inv (Luz Invertida) - Cria escuridão absoluta ao invés de luz',
      'Phys Inv (Proteção Invertida) - Enfraquece inimigos ao invés de fortalecer aliados',
    ],
    riskLevel: 'Alto',
  },
  {
    id: 'mod_reflexo',
    name: 'Reflexo (Refl)',
    type: 'Modificador',
    category: 'Redirecionamento',
    description: 'A magia rebate ou reflete efeitos similares direcionados ao lançador.',
    effect: 'Magias de mesma natureza que te atingem são refletidas de volta à origem.',
    examples: [
      'Ig Refl (Escudo de Fogo) - Fogo direcionado a você é devolvido ao atacante',
      'Imu Refl (Espelho Mental) - Controle mental contra você é refletido de volta',
    ],
    riskLevel: 'Moderado',
  },
  {
    id: 'mod_silencio',
    name: 'Silêncio (Sil)',
    type: 'Modificador',
    category: 'Discrição',
    description: 'A magia ativa silenciosamente, sem sinais mágicos visíveis ou auditivos.',
    effect: 'A magia não deixa aura, não faz som, e passa despercebida por detecção mágica comum.',
    examples: [
      'Imu Sil (Sugestão Silenciosa) - Implanta uma ideia na mente de alguém sem eles perceberem',
      'Phys Sil (Cura Discreta) - Cura alguém sem ninguém notar a magia acontecendo',
    ],
    riskLevel: 'Moderado',
  },
];

/**
 * CRIADORES (PREFIXOS LÓGICOS): Constroem novas combinações de partículas
 * A gramática da criação mágica
 */
export const CRIADORES: GrammarToolData[] = [
  {
    id: 'criador_ada',
    name: 'Adicionar (Ada-)',
    type: 'Criador',
    category: 'Operação Lógica',
    description: 'Combina dois efeitos diferentes em um único feitiço, adicionando suas propriedades.',
    effect: 'Duas partículas trabalham juntas, criando um efeito híbrido ou amplificado.',
    examples: [
      'Ada-Ig-Mun (Adicionar Fogo à Terra) - Magma que queima e enterra',
      'Ada-Quan-Aer (Adicionar Água ao Ar) - Neblina congelante que sufoca',
      'Ada-Lum-Phys (Adicionar Luz à Proteção) - Um escudo que brilha e regenera',
    ],
    riskLevel: 'Moderado',
  },
  {
    id: 'criador_no',
    name: 'Negar (No-)',
    type: 'Criador',
    category: 'Operação Lógica',
    description: 'Nega ou cancela um efeito específico, criando seu oposto lógico.',
    effect: 'Cria um efeito que desfaz ou contradiz outro efeito.',
    examples: [
      'No-Ig (Negar Fogo) - Um escudo que absorve chama e dissipa calor',
      'No-Imu (Negar Ilusão) - Revela verdades ocultas e dissipa enganos',
      'No-Kronos (Negar Tempo) - Pausa temporal localizada em um objeto',
    ],
    riskLevel: 'Alto',
  },
  {
    id: 'criador_ag',
    name: 'Amplificar (Ag)',
    type: 'Criador',
    category: 'Operação Lógica',
    description: 'Amplifica um efeito existente, tornando-o exponencialmente mais poderoso.',
    effect: 'O efeito base fica muito mais forte, mas mais instável e arriscado.',
    examples: [
      'Ag-Ig (Amplificar Fogo) - Um inferno que consome tudo em seu caminho',
      'Ag-Imu (Amplificar Ilusão) - Uma ilusão tão convincente que a mente a trata como realidade',
      'Ag-Phys (Amplificar Escudo) - Uma proteção quase impenetrável',
    ],
    riskLevel: 'Alto',
  },
  {
    id: 'criador_mut',
    name: 'Derivar (Mut-)',
    type: 'Criador',
    category: 'Operação Lógica',
    description: 'Cria uma variação ou derivação de um efeito existente, explorando novos aspectos.',
    effect: 'Transforma um efeito em algo relacionado mas diferente, abrindo novas possibilidades.',
    examples: [
      'Mut-Ig (Derivar Fogo) - Plasticidade de magma ao invés de queimadura',
      'Mut-Quan (Derivar Água) - Congelamento ao invés de encharcamento',
      'Mut-Imu (Derivar Ilusão) - Transmutação de forma ao invés de apenas enganar os sentidos',
    ],
    riskLevel: 'Moderado',
  },
];

/**
 * EXEMPLOS DE FRASES MÁGICAS COMPLETAS
 * Demonstrando como Estudantes, Praticantes e Mestres usam a gramática
 */
export interface ExemploFraseMagica {
  nome: string;
  particulas: string;
  descricao: string;
  estudante: {
    dificuldade: number;
    penalidade: string;
    risco: string;
  };
  praticante: {
    dificuldade: number;
    penalidade: string;
    risco: string;
  };
  mestre: {
    dificuldade: number;
    custoPV: number;
    risco: string;
  };
}

export const EXEMPLOS_FRASES: ExemploFraseMagica[] = [
  {
    nome: 'Pequena Muralha de Fogo',
    particulas: 'Ig Sar Min',
    descricao: 'Uma muralha de fogo que queima tudo em seu caminho, mas controlável em sua forma.',
    estudante: {
      dificuldade: 3, // Base 2 + 1 pela instabilidade gramatical
      penalidade: '+1 na dificuldade do teste de Inteligência + Ocultismo',
      risco: 'Alto risco de falha. Se falhar por 5+, a muralha escapa ao seu controle.',
    },
    praticante: {
      dificuldade: 2,
      penalidade: 'Nenhuma penalidade gramatical',
      risco: 'Risco moderado. Se falhar, o fogo sai de controle, mas você consegue contê-lo rapidamente.',
    },
    mestre: {
      dificuldade: 2,
      custoPV: 0, // Nível 4-5, então requer teste
      risco: 'Se gastar 1 PV, dispensa o teste completamente. A muralha se manifesta exatamente como você deseja.',
    },
  },
  {
    nome: 'Lança de Magma',
    particulas: 'Ig Ag Mun Sin',
    descricao: 'Uma lança de magma puro, criada por Adicionar Fogo Amplificado à Terra em Forma.',
    estudante: {
      dificuldade: 5, // Base 3 + 2 pela gramática complexa (Ag, Ada, Sin)
      penalidade: '+1 na dificuldade a cada ferramenta gramatical usada',
      risco: 'Risco extremo. Falha significa que a lança explode nas suas mãos.',
    },
    praticante: {
      dificuldade: 4,
      penalidade: 'Nenhuma penalidade adicional',
      risco: 'Risco moderado. Você mantém controle mesmo com falha parcial.',
    },
    mestre: {
      dificuldade: 4,
      custoPV: 1, // Nível 5, mas você pode gastar 1 PV para não precisar testar
      risco: 'Gastando 1 PV, você dispensa o teste e a lança se manifesta em sua mão, perfeitamente formada.',
    },
  },
  {
    nome: 'Ritual de Sugestão Mental',
    particulas: 'Imu Ritus Sil',
    descricao: 'Uma sugestão implantada na mente de alguém através de um ritual silencioso.',
    estudante: {
      dificuldade: 4,
      penalidade: '+1 pela gramática instável',
      risco: 'Se falhar, a vítima percebe a tentativa e sua mente se fecha para sugestões por horas.',
    },
    praticante: {
      dificuldade: 3,
      penalidade: 'Nenhuma',
      risco: 'Se falhar, a sugestão simplesmente não funciona, mas sem consecências imediatas.',
    },
    mestre: {
      dificuldade: 3,
      custoPV: 0, // Nível 3, você pode usar PV para dispensar
      risco: 'Gastando 1 PV, a sugestão é implantada sem qualquer teste. A mente da vítima aceita como pensamento próprio.',
    },
  },
  {
    nome: 'Escudo Refletor de Magia',
    particulas: 'Phys Refl Durans',
    descricao: 'Um escudo que reflete permanentemente magias da mesma natureza de volta ao atacante.',
    estudante: {
      dificuldade: 4,
      penalidade: '+1 pela instabilidade gramatical',
      risco: 'O escudo pode refletir para o lado errado ou desativar aleatoriamente.',
    },
    praticante: {
      dificuldade: 3,
      penalidade: 'Nenhuma',
      risco: 'O escudo é confiável, mantém-se ativo enquanto você concentrar.',
    },
    mestre: {
      dificuldade: 3,
      custoPV: 1, // Nível 4, pode usar PV
      risco: 'Gastando 1 PV, o escudo se ativa sem teste e permanece ativo indefinidamente sem concentração.',
    },
  },
];

/**
 * TESTE DE ATIVAÇÃO MÁGICA
 * Como é calculado o sucesso ou fracasso de um feitiço
 */
export interface TesteAtivacao {
  atributos: {
    inteligencia: number;
    espiritualidade: number;
    ocultismo: number;
  };
  fraseMagica: {
    dificuldadeBase: number;
    nivelMagia: number;
  };
  maestria: MasteryLevel;
  resultado: {
    sucesso: boolean;
    margem: number;
    conseq: string;
  };
}

/**
 * RESUMO: A Gramática é Universal, a Maestria é Progressão
 * 
 * Todos os Beyonders conhecem todas as regras.
 * O que muda é como eles pagam pelo uso dessa complexidade:
 * 
 * ESTUDANTE: Deve testar, sofre +1 na dificuldade. Falhas são perigosas.
 * PRATICANTE: Testa normalmente, sem penalidades. Falhas são contidas.
 * MESTRE: Pode gastar PV para contornar testes. Falhas não existem mais para magias leves.
 */
export const MASTERY_PHILOSOPHY = `
A Gramática da Magia é como a gramática de um idioma:

Todos aprendem a língua desde a infância. Todos conhecem as mesmas regras.
O que diferencia um analfabeto de um poeta não é quais palavras ele pode usar,
mas como ele as usa, com que elegância, e que risco ele está disposto a tomar.

Um Beyonder Estudante tenta escrever um romance épico com ferramentas que acabou de aprender.
As frases ficam desajeitadas, a pronúncia está errada, e há risco de não fazer sentido.

Um Beyonder Praticante escreve poesia fluente. Não há desajeitamento, mas também não há poder extraordinário.

Um Beyonder Mestre é um verdadeiro poeta. Sua vontade é a pena, e a realidade é a página em branco.
Ele não escreve mais palavras - ele reescreve a realidade.

A Maestria é a ponte entre conhecimento e domínio.
`;
