import { MagicParticle } from '../complete-magic-particles';

export const OBJETOS: MagicParticle[] = [
  {
    id: 'ivi',
    word: 'Ivi',
    name: 'Pessoa',
    type: 'Objeto',
    description: 'O receptáculo mortal. Refere-se a qualquer ser humanoide senciente, englobando seu corpo, mente e vontade de forma holística. Usado para afetar diretamente pessoas.',
    usage: 'Alvo direto em seres humanoides',
    examples: [
      'Et Ivi (Controlar Pessoa)',
      'Im Ivi (Atacar Pessoa)',
      'Am Ivi (Proteger Pessoa)',
      'Al Ivi (Alterar Pessoa)'
    ]
  },
  {
    id: 'ali',
    word: 'Ali',
    name: 'Animal',
    type: 'Objeto',
    description: 'A besta primordial. Refere-se a criaturas não sencientes, de insetos a feras, que operam primariamente pelo instinto.',
    usage: 'Alvo em animais e criaturas não-sencientes',
    examples: [
      'Et Ali (Controlar Animal)',
      'Im Ali (Atacar Animal)',
      'Am Ali (Proteger Animal)'
    ]
  },
  {
    id: 'exa',
    word: 'Exa',
    name: 'Inanimado',
    type: 'Objeto',
    description: 'A criação do homem. Refere-se a qualquer objeto fabricado e sem vida, desde uma simples chave a uma complexa máquina a vapor.',
    usage: 'Alvo em objetos inanimados',
    examples: [
      'Al Exa (Alterar Inanimado)',
      'As Exa (Destruir Inanimado)',
      'An Exa (Restaurar Inanimado)'
    ]
  },
  {
    id: 'ora',
    word: 'Ora',
    name: 'Vegetação',
    type: 'Objeto',
    description: 'O pulso da terra. Refere-se a toda forma de vida vegetal, desde um musgo delicado até uma floresta ancestral.',
    usage: 'Alvo em plantas e vegetação',
    examples: [
      'Al Ora (Alterar Vegetação)',
      'Et Ora (Controlar Vegetação)',
      'Im Ora (Atacar Vegetação)'
    ]
  },
  {
    id: 'eli',
    word: 'Eli',
    name: 'Elemento',
    type: 'Objeto',
    description: 'A matéria bruta do cosmos. Refere-se às forças primordiais da natureza — fogo, água, terra, ar — que devem ser definidas por uma Característica.',
    usage: 'Alvo em elementos naturais',
    examples: [
      'Im Eli Ig (Atacar com Fogo)',
      'Al Eli Quan (Alterar com Água)',
      'Et Eli Aer (Controlar Ar)'
    ]
  },
  {
    id: 'ani',
    word: 'Ani',
    name: 'Alma',
    type: 'Objeto',
    description: 'A essência imaterial. Refere-se à energia espiritual, à consciência pura e à força vital de um ser. Uma das Partículas mais perigosas e difíceis de manipular.',
    usage: 'Alvo em almas e essência espiritual',
    examples: [
      'Et Ani (Controlar Alma)',
      'An Ani (Restaurar Alma)',
      'Im Ani (Atacar Alma)'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'azi',
    word: 'Azi',
    name: 'Informação',
    type: 'Objeto',
    description: 'O segredo sussurrado. Refere-se a conhecimentos, memórias, dados, segredos e a verdade abstrata contida em textos, pensamentos ou no próprio ambiente.',
    usage: 'Alvo em conhecimento e informação',
    examples: [
      'Il Azi (Revelar Informação)',
      'Al Azi (Alterar Informação)',
      'Am Azi (Proteger Informação)'
    ]
  },
  {
    id: 'ala',
    word: 'Ala',
    name: 'Abstrato',
    type: 'Objeto',
    description: 'O conceito intangível. Um Objeto abrangente que se refere a forças ou ideias sem forma física: o som, o tempo, a sorte, a coragem, o medo, a dor.',
    usage: 'Alvo em conceitos e abstratos',
    examples: [
      'Al Ala (Alterar Conceito)',
      'In Ala (Enfraquecer Conceito)',
      'As Ala (Destruir Conceito)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'eva',
    word: 'Eva',
    name: 'Cadáver',
    type: 'Objeto',
    description: 'A casca vazia. Refere-se aos restos de qualquer criatura que já foi viva, mantendo um eco residual de sua antiga existência. A base para a necromancia.',
    usage: 'Alvo em restos mortais',
    examples: [
      'Et Eva (Controlar Cadáver)',
      'Ev Eva (Invocar Cadáver)',
      'An Eva (Restaurar Cadáver)'
    ]
  },
  {
    id: 'omu',
    word: 'Omu',
    name: 'Construção',
    type: 'Objeto',
    description: 'A obra da civilização. Refere-se a estruturas arquitetônicas complexas: prédios, pontes, muralhas, navios. Diferente de Inanimado, foca em estruturas maiores.',
    usage: 'Alvo em estruturas arquitetônicas',
    examples: [
      'Am Omu (Proteger Construção)',
      'Al Omu (Alterar Construção)',
      'As Omu (Destruir Construção)'
    ]
  },
  {
    id: 'pneuma',
    word: 'Pneuma',
    name: 'Espírito',
    type: 'Objeto',
    description: 'O eco do invisível. Refere-se a espectros, fantasmas e outras entidades não corpóreas que habitam o Mundo Espiritual. Diferente de Alma, não está (ou nunca esteve) atrelado a um corpo físico.',
    usage: 'Alvo em espíritos e fantasmas',
    examples: [
      'Et Pneuma (Controlar Espírito)',
      'Im Pneuma (Atacar Espírito)',
      'Il Pneuma (Revelar Espírito)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'hypnos',
    word: 'Hypnos',
    name: 'Sonho',
    type: 'Objeto',
    description: 'A realidade maleável. Refere-se ao plano dos sonhos, ao subconsciente e às paisagens mentais de um ser adormecido. Um domínio com suas próprias regras e perigos.',
    usage: 'Alvo em sonhos e subconsciente',
    examples: [
      'Et Hypnos (Controlar Sonho)',
      'Al Hypnos (Alterar Sonho)',
      'Ev Hypnos (Invocar Sonho)'
    ],
    difficulty: 'moderado'
  },
  {
    id: 'locus',
    word: 'Locus',
    name: 'Lugar/Terreno',
    type: 'Objeto',
    description: 'O palco do mundo. Refere-se a um local específico e suas propriedades ambientais — o chão de um beco, o ar de uma sala, a água de um poço.',
    usage: 'Alvo em locais e ambientes',
    examples: [
      'Al Locus (Alterar Lugar)',
      'Am Locus (Proteger Lugar)',
      'Ev Locus (Criar Lugar)'
    ]
  }
];
