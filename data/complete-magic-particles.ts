/**
 * Tipos e Interfaces para o Sistema de Partículas Mágicas
 * Baseado no sistema de Linguagem Mágica de Beyonders
 */

export interface MagicParticle {
  id: string;
  word: string; // Palavra em Grego Arcano (ex: "Ivi", "Al")
  name: string; // Nome em Português (ex: "Pessoa", "Alterar")
  type: 'Objeto' | 'Função' | 'Característica' | 'Complemento' | 'Criador';
  description: string;
  usage: string; // Exemplo de uso ou contexto
  examples: string[];
  difficulty?: 'fácil' | 'moderado' | 'difícil' | 'lendário';
}

export interface DomainParticle {
  id: string;
  word: string;
  name: string;
  type: 'Objeto' | 'Função' | 'Característica';
  pathway: string; // Caminho Beyonder que possui
  description: string;
  concept: string;
  examples: Array<{ usage: string; description: string }>;
}

export interface PathwayMagic {
  pathway: string;
  particles: DomainParticle[];
}

export interface PathwayDescription {
  id: string;
  name: string;
  description: string;
  themes: string[];
  roleArchetypes: string[];
  philosophy: string;
}

// ============================================================================
// OBJETOS (Alvos da Magia)
// ============================================================================

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

// ============================================================================
// FUNÇÕES (Ações Mágicas)
// ============================================================================

export const FUNCOES: MagicParticle[] = [
  {
    id: 'al',
    word: 'Al',
    name: 'Alterar',
    type: 'Função',
    description: 'O poder da modificação. Alterar não cria nem destrói, apenas transforma o que já existe. É a Função dos ilusionistas, transmutadores e sabotadores sutis. Ela modifica propriedades, não a substância.',
    usage: 'Modificar propriedades de um alvo existente',
    examples: [
      'Al Ivi (Alterar Pessoa)',
      'Al Locus (Alterar Lugar)',
      'Al Exa (Alterar Objeto)',
      'Al Ala (Alterar Conceito)'
    ]
  },
  {
    id: 'ar',
    word: 'Ar',
    name: 'Aprisionar',
    type: 'Função',
    description: 'O poder da contenção. Aprisionar impõe barreiras e restrições, sejam elas físicas ou conceituais. É a Função dos guardiões e caçadores.',
    usage: 'Conter ou restringir um alvo',
    examples: [
      'Ar Ivi (Aprisionar Pessoa)',
      'Ar Locus (Aprisionar Lugar)',
      'Ar Ani (Aprisionar Alma)'
    ]
  },
  {
    id: 'im',
    word: 'Im',
    name: 'Atacar/Ferir',
    type: 'Função',
    description: 'O poder do dano bruto e direto. É a manifestação mais simples e agressiva da magia, focada em causar dano através de uma força manifesta.',
    usage: 'Causar dano a um alvo',
    examples: [
      'Im Eli (Atacar com Elemento)',
      'Im Ivi (Atacar Pessoa)',
      'Im Pneuma (Atacar Espírito)'
    ]
  },
  {
    id: 'am',
    word: 'Am',
    name: 'Proteger',
    type: 'Função',
    description: 'O poder da defesa. Proteger cria escudos e barreiras contra forças externas. É a Função da salvaguarda e da preservação.',
    usage: 'Defender ou criar barreiras',
    examples: [
      'Am Ivi (Proteger Pessoa)',
      'Am Locus (Proteger Lugar)',
      'Am Exa (Proteger Objeto)'
    ]
  },
  {
    id: 'et',
    word: 'Et',
    name: 'Controlar',
    type: 'Função',
    description: 'O poder da manipulação e do domínio. Controlar comanda o movimento ou as ações de um alvo. Diferente de Alterar, ele impõe vontade, não apenas modifica.',
    usage: 'Comandar ou dominar um alvo',
    examples: [
      'Et Ivi (Controlar Pessoa)',
      'Et Ali (Controlar Animal)',
      'Et Locus (Controlar Lugar)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'as',
    word: 'As',
    name: 'Destruir',
    type: 'Função',
    description: 'O poder da desconstrução e da entropia. Destruir não apenas danifica, ele desfaz a estrutura fundamental de um alvo. É a magia da ferrugem, da podridão e do esquecimento.',
    usage: 'Destruir ou desintegrar um alvo',
    examples: [
      'As Exa (Destruir Objeto)',
      'As Mageia (Destruir Feitiço)',
      'As Ani (Destruir Alma)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'in',
    word: 'In',
    name: 'Enfraquecer',
    type: 'Função',
    description: 'O poder da debilitação. Enfraquecer suprime as propriedades ou a força de um alvo, tornando-o menos eficaz.',
    usage: 'Reduzir poder ou capacidade de um alvo',
    examples: [
      'In Ivi (Enfraquecer Pessoa)',
      'In Magia (Enfraquecer Magia)',
      'In Ala (Enfraquecer Conceito)'
    ]
  },
  {
    id: 'ev',
    word: 'Ev',
    name: 'Invocar/Criar',
    type: 'Função',
    description: 'O poder da criação a partir do nada. Invocar traz à existência algo que não estava lá antes. É a mais fundamental de todas as Funções, ecoando o ato da própria Criação.',
    usage: 'Criar ou invocar algo do nada',
    examples: [
      'Ev Eli (Invocar Elemento)',
      'Ev Omu (Criar Construção)',
      'Ev Pneuma (Invocar Espírito)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'an',
    word: 'An',
    name: 'Restaurar',
    type: 'Função',
    description: 'O poder da cura e do conserto. Restaurar reverte um estado danificado para um estado anterior de plenitude.',
    usage: 'Curar ou restaurar um alvo',
    examples: [
      'An Ivi (Restaurar Pessoa)',
      'An Exa (Restaurar Objeto)',
      'An Ani (Restaurar Alma)'
    ]
  },
  {
    id: 'il',
    word: 'Il',
    name: 'Revelar',
    type: 'Função',
    description: 'O poder do conhecimento e da percepção. Revelar traz à tona o que está oculto, seja invisível, secreto ou codificado.',
    usage: 'Descobrir ou revelar algo oculto',
    examples: [
      'Il Azi (Revelar Informação)',
      'Il Exa (Revelar Estrutura)',
      'Il Ala (Revelar Conceito)'
    ]
  },
  {
    id: 'it',
    word: 'It',
    name: 'Transportar',
    type: 'Função',
    description: 'O poder do movimento anômalo. Transportar move algo ou alguém de um ponto a outro sem cruzar o espaço intermediário.',
    usage: 'Teleportar ou mover instantaneamente',
    examples: [
      'It Ivi (Transportar Pessoa)',
      'It Exa (Transportar Objeto)',
      'It Pneuma (Transportar Espírito)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'un',
    word: 'Un',
    name: 'Juntar/Conectar',
    type: 'Função',
    description: 'O poder da união. Juntar cria uma ligação, física ou etérea, entre dois ou mais alvos, fazendo-os compartilhar propriedades ou destino.',
    usage: 'Criar vínculos ou conexões',
    examples: [
      'Un Ivi-Ivi (Conectar Pessoa-Pessoa)',
      'Un Ala-Ani (Conectar Conceito-Alma)',
      'Un Exa (Juntar Objeto)'
    ],
    difficulty: 'moderado'
  },
  {
    id: 'es',
    word: 'Es',
    name: 'Marcar',
    type: 'Função',
    description: 'O poder do rastreamento e da simbologia. Marcar aplica um sigilo arcano a um alvo, permitindo ao conjurador rastreá-lo ou afetá-lo à distância.',
    usage: 'Marcar um alvo para rastreamento',
    examples: [
      'Es Ivi (Marcar Pessoa)',
      'Es Exa (Marcar Objeto)',
      'Es Ani (Marcar Alma)'
    ]
  },
  {
    id: 'lues',
    word: 'Lues',
    name: 'Corromper',
    type: 'Função',
    description: 'O poder da mácula e da blasfêmia. Uma Função perigosa que infunde um alvo com a energia caótica do Abismo ou da insanidade.',
    usage: 'Corromper ou perverter um alvo',
    examples: [
      'Lues Ivi (Corromper Pessoa)',
      'Lues Locus (Corromper Lugar)',
      'Lues Magia (Corromper Feitiço)'
    ],
    difficulty: 'lendário'
  }
];

// ============================================================================
// CARACTERÍSTICAS (Natureza do Poder)
// ============================================================================

export const CARACTERISTICAS: MagicParticle[] = [
  // Elementais Fundamentais
  {
    id: 'ig',
    word: 'Ig',
    name: 'Fogo',
    type: 'Característica',
    description: 'A essência do calor, combustão e fúria. Associado ao ataque direto.',
    usage: 'Ataques com fogo e calor',
    examples: [
      'Im Eli Ig (Atacar com Fogo)',
      'Ev Eli Ig (Criar Fogo)',
      'Al Locus Ig (Alterar com Fogo)'
    ]
  },
  {
    id: 'quan',
    word: 'Quan',
    name: 'Água',
    type: 'Característica',
    description: 'A essência do frio, fluidez e adaptabilidade. Usado tanto para ataques de gelo quanto para controle.',
    usage: 'Ataques com gelo/água e controle fluido',
    examples: [
      'Im Eli Quan (Atacar com Água)',
      'Et Eli Quan (Controlar Água)',
      'Al Eli Quan (Alterar com Água)'
    ]
  },
  {
    id: 'aer',
    word: 'Aer',
    name: 'Ar',
    type: 'Característica',
    description: 'A essência do vento, do som e da eletricidade. A Característica da velocidade e da tempestade.',
    usage: 'Ataques com ar e eletricidade',
    examples: [
      'Im Eli Aer (Atacar com Ar)',
      'Et Eli Aer (Controlar Ar)',
      'Ev Locus Aer (Criar Tempestade)'
    ]
  },
  {
    id: 'mun',
    word: 'Mun',
    name: 'Terra',
    type: 'Característica',
    description: 'A essência da pedra, estabilidade, peso e metal. A base de toda defesa e solidez.',
    usage: 'Defesa com pedra/terra e estabilidade',
    examples: [
      'Am Eli Mun (Proteger com Terra)',
      'Al Eli Mun (Alterar com Terra)',
      'Ev Locus Mun (Criar Estrutura de Pedra)'
    ]
  },
  // Essência e Percepção
  {
    id: 'lum',
    word: 'Lum',
    name: 'Luz',
    type: 'Característica',
    description: 'A natureza da iluminação, verdade, ordem e purificação. Essencial para rituais de consagração e para combater a escuridão.',
    usage: 'Iluminação e purificação',
    examples: [
      'Ev Locus Lum (Criar Luz)',
      'Al Locus Lum (Alterar com Luz)',
      'Il Azi Lum (Revelar com Luz)'
    ]
  },
  {
    id: 'ten',
    word: 'Ten',
    name: 'Escuridão',
    type: 'Característica',
    description: 'A natureza das sombras, ocultação, silêncio e medo. Perfeita para feitiços de sigilo e terror.',
    usage: 'Sigilo e medo',
    examples: [
      'Ev Locus Ten (Criar Escuridão)',
      'Al Locus Ten (Alterar com Escuridão)',
      'Im Ivi Ten (Atacar com Medo)'
    ]
  },
  {
    id: 'imu',
    word: 'Imu',
    name: 'Mente',
    type: 'Característica',
    description: 'A natureza dos pensamentos, da lógica, da memória e da percepção. O alicerce de toda magia de ilusão e telepatia.',
    usage: 'Ilusão e telepatia',
    examples: [
      'Al Ivi Imu (Alterar Mente)',
      'Et Ivi Imu (Controlar Mente)',
      'Il Izi Imu (Revelar Pensamento)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'phys',
    word: 'Phys',
    name: 'Corpo',
    type: 'Característica',
    description: 'A natureza da carne, da biologia, das doenças e da vitalidade física. Usado para cura, maldições biológicas ou aprimoramento físico.',
    usage: 'Modificação biológica e cura',
    examples: [
      'An Ivi Phys (Restaurar Corpo)',
      'Al Ivi Phys (Alterar Corpo)',
      'Im Ivi Phys (Atacar Corpo)'
    ]
  },
  {
    id: 'pneuma2',
    word: 'Pneuma',
    name: 'Espírito',
    type: 'Característica',
    description: 'A natureza do etéreo, de almas, fantasmas e da energia do Mundo Espiritual. Indispensável para necromancia, exorcismos e viagens astrais.',
    usage: 'Magia espiritual e necromancia',
    examples: [
      'Im Pneuma Pneuma (Atacar Espírito)',
      'Et Pneuma Pneuma (Controlar Espírito)',
      'Il Pneuma Pneuma (Revelar Espírito)'
    ],
    difficulty: 'difícil'
  },
  // Conceituais e Divinas
  {
    id: 'divinatio',
    word: 'Divinatio',
    name: 'Adivinhação',
    type: 'Característica',
    description: 'A essência da premonição e do conhecimento obtido por meios sobrenaturais. Adiciona um efeito profético ou de busca da verdade a qualquer feitiço.',
    usage: 'Previsão e conhecimento sobrenatural',
    examples: [
      'Il Azi Divinatio (Revelar Futuro)',
      'Il Fatum Divinatio (Adivinhação de Destino)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'miasma',
    word: 'Miasma',
    name: 'Corrupção',
    type: 'Característica',
    description: 'A essência da insanidade, da decadência e da influência maligna do Abismo. Infunde magia com um poder que mancha e degrada. É perigoso para a sanidade do conjurador.',
    usage: 'Corrupção e degradação',
    examples: [
      'Al Ivi Miasma (Corromper Pessoa)',
      'Lues Locus Miasma (Corromper Lugar)'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'fatum',
    word: 'Fatum',
    name: 'Destino',
    type: 'Característica',
    description: 'A essência da sorte, azar, probabilidade e causalidade. Magias com esta Característica podem forçar novos testes, garantir sucessos críticos ou infligir falhas catastróficas.',
    usage: 'Manipular sorte e destino',
    examples: [
      'Im Ivi Fatum (Atacar com Destino)',
      'Un Ala Fatum (Conectar Destino)',
      'Il Fatum (Revelar Destino)'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'rat',
    word: 'Rat',
    name: 'Dimensional',
    type: 'Característica',
    description: 'A essência do espaço e dos portais. Usada para dobrar ou rasgar a realidade, permitindo teleporte, criação de bolsões dimensionais e defesa espacial.',
    usage: 'Portais e manipulação espacial',
    examples: [
      'It Ivi Rat (Teleportar Pessoa)',
      'Ev Locus Rat (Criar Portal)',
      'Am Locus Rat (Defender Espaço)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'kronos',
    word: 'Kronos',
    name: 'Tempo',
    type: 'Característica',
    description: 'A essência da causalidade. Magias com esta Característica podem acelerar, retardar ou até mesmo reverter o tempo em uma escala muito limitada.',
    usage: 'Manipulação temporal limitada',
    examples: [
      'Al Locus Kronos (Acelerar Tempo)',
      'In Locus Kronos (Retardar Tempo)',
      'Il Fatum Kronos (Revelar Futuro)'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'kaos',
    word: 'Kaos',
    name: 'Caos',
    type: 'Característica',
    description: 'A essência da entropia e do paradoxo. Adiciona um efeito imprevisível e aleatório a qualquer feitiço, quebrando a lógica da realidade e da magia.',
    usage: 'Efeitos aleatórios e paradoxais',
    examples: [
      'Al Locus Kaos (Alterar com Caos)',
      'Ev Kaos (Invocar Caos)',
      'In Kaos (Enfraquecer Caos)'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'machina',
    word: 'Machina',
    name: 'Tecnologia',
    type: 'Característica',
    description: 'A essência das engrenagens, do vapor e dos diagramas. Usada para entender, consertar ou sabotar maquinário complexo. É a magia da era industrial.',
    usage: 'Entender e manipular máquinas',
    examples: [
      'Il Exa Machina (Revelar Máquina)',
      'Al Exa Machina (Alterar Máquina)',
      'As Exa Machina (Destruir Máquina)'
    ]
  }
];

// ============================================================================
// COMPLEMENTOS (Modificadores)
// ============================================================================

export const COMPLEMENTOS: MagicParticle[] = [
  {
    id: 'mor',
    word: 'Mor',
    name: 'Maior',
    type: 'Complemento',
    description: 'Aumenta a escala geral do feitiço (dano, área, duração, etc.). É o modificador de intensidade mais direto e comum.',
    usage: 'Aumentar escala de feitiço',
    examples: [
      'Im Eli Ig Mor (Ataque com Fogo Maior)',
      'Ev Locus Mor (Criar Lugar Maior)',
      'Am Locus Mor (Proteção em Área Maior)'
    ]
  },
  {
    id: 'min',
    word: 'Min',
    name: 'Menor',
    type: 'Complemento',
    description: 'Diminui a escala geral do feitiço (dano, área, duração, etc.). Reduz o custo energético.',
    usage: 'Diminuir escala de feitiço',
    examples: [
      'Im Eli Ig Min (Ataque com Fogo Menor)',
      'Ev Omu Min (Criar Estrutura Pequena)',
      'Am Ivi Min (Proteção Menor)'
    ]
  },
  {
    id: 'san',
    word: 'San',
    name: 'Forma: Esfera',
    type: 'Complemento',
    description: 'Manifesta a magia como uma aura esférica ao redor de um ponto, uma cúpula protetora ou um orbe de energia.',
    usage: 'Manifestar como esfera',
    examples: [
      'Ev Lum San (Criar Esfera de Luz)',
      'Am Locus San (Proteção em Cúpula)',
      'In Kaos San (Silenciar Caos em Esfera)'
    ]
  },
  {
    id: 'sar',
    word: 'Sar',
    name: 'Forma: Parede',
    type: 'Complemento',
    description: 'Manifesta a magia como uma barreira linear e reta, como um muro ou uma linha no chão.',
    usage: 'Manifestar como barreira linear',
    examples: [
      'Ev Mun Sar (Criar Muro de Pedra)',
      'Am Locus Sar (Proteção em Parede)',
      'Im Eli Ten Sar (Linha de Escuridão)'
    ]
  },
  {
    id: 'sin',
    word: 'Sin',
    name: 'Forma: Objeto',
    type: 'Complemento',
    description: 'Condensa a energia mágica na forma de um objeto simples e temporário (uma chave de gelo, uma espada de sombras). O objeto é visivelmente mágico e se desfaz após o uso ou com o tempo.',
    usage: 'Condensar em objeto temporário',
    examples: [
      'Ev Quan Sin (Criar Arma de Gelo)',
      'Ev Ten Sin (Criar Lâmina de Sombra)',
      'Ev Ig Sin (Criar Bola de Fogo)'
    ]
  },
  {
    id: 'itam',
    word: 'Itam',
    name: 'Inerte',
    type: 'Complemento',
    description: 'Torna o feitiço dormente e vinculado a um "gatilho" narrativo definido pelo conjurador no momento da criação. A magia só se ativa quando a condição é cumprida.',
    usage: 'Criar feitiço com gatilho',
    examples: [
      'Al Locus Itam (Armadilha que Ativa)',
      'Im Locus Itam (Alarme que Detona)',
      'Ev Pneuma Itam (Espírito que Desperta)'
    ],
    difficulty: 'moderado'
  },
  {
    id: 'ritus',
    word: 'Ritus',
    name: 'Ritual',
    type: 'Complemento',
    description: 'Transforma o feitiço em um ritual de no mínimo 10 minutos. Isso permite canalizar muito mais poder. Ao usar Ritus, você pode dobrar a potência de um dos outros componentes do feitiço.',
    usage: 'Ritual de longa duração',
    examples: [
      'Ev Ani Ritus (Invocar Alma por Ritual)',
      'Al Locus Ritus (Transformar Lugar por Ritual)',
      'Un Ivi-Ani Ritus (Conectar Pessoa à Alma por Ritual)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'durans',
    word: 'Durans',
    name: 'Persistente',
    type: 'Complemento',
    description: 'O efeito do feitiço torna-se permanente até ser ativamente desfeito. Para manter essa magia, o conjurador deve sacrificar 1 Ponto de Espiritualidade (PE) permanentemente.',
    usage: 'Criar efeito permanente',
    examples: [
      'Am Locus Durans (Proteção Permanente)',
      'Al Ivi Durans (Alteração Permanente)',
      'Es Ivi Durans (Marca Permanente)'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'sanguis',
    word: 'Sanguis',
    name: 'Sanguis (Sacrifício de Sangue)',
    type: 'Complemento',
    description: 'Modificador que permite ao conjurador pagar com sua própria força vital para quebrar os limites da magia. Requer sofrer um Nível de Vitalidade em dano letal.',
    usage: 'Quebrar limites mágicos com sangue',
    examples: [
      'Im Ivi Sanguis (Ataque Letal)',
      'Ev Ani Sanguis (Invocar com Sangue)',
      'As Mageia Sanguis (Destruir Magia Potente)'
    ],
    difficulty: 'lendário'
  }
];

// ============================================================================
// CRIADORES (Prefixos Lógicos)
// ============================================================================

export const CRIADORES: MagicParticle[] = [
  {
    id: 'ada',
    word: 'Ada-',
    name: 'Variação',
    type: 'Criador',
    description: 'Prefixo que cria uma variação lógica de uma Característica conectada a ele, desdobrando-a em um conceito relacionado.',
    usage: 'Criar variação de Característica',
    examples: [
      'adaQuan → Gelo (Variação de Água)',
      'adaPhys → Metamorfose (Variação de Corpo)',
      'adaAzi → Segredo (Variação de Informação)',
      'adaLum → Iridescência (Variação de Luz)'
    ],
    difficulty: 'moderado'
  },
  {
    id: 'no',
    word: 'No-',
    name: 'Negação',
    type: 'Criador',
    description: 'Prefixo que nega completamente o conceito de uma Característica, criando seu oposto direto.',
    usage: 'Negar aspecto de Característica',
    examples: [
      'noLum → Escuridão Absoluta (mais potente que Ten)',
      'noMun → Leveza Absoluta',
      'noFatum → Anarquia Probabilística',
      'noAer → Vácuo Absoluto'
    ],
    difficulty: 'lendário'
  },
  {
    id: 'ag',
    word: 'Ag',
    name: 'Adição',
    type: 'Criador',
    description: 'Conector que une duas Características para criar um efeito híbrido, combinando as qualidades de ambas.',
    usage: 'Combinar duas Características',
    examples: [
      'IgAgMun → Magma (Fogo + Terra)',
      'AerAgQuan → Tempestade (Ar + Água)',
      'LumAgHem → Sangue Sagrado (Luz + Sangue)',
      'TenAgMiasma → Escuridão Corrupta'
    ],
    difficulty: 'difícil'
  },
  {
    id: 'mut',
    word: 'Mut-',
    name: 'Derivação',
    type: 'Criador',
    description: 'Prefixo que transforma um Objeto em uma Característica, permitindo imbuir outra coisa com suas qualidades.',
    usage: 'Transformar Objeto em Característica',
    examples: [
      'Ev Eli MutIvi → Elemento com Forma Humanoide',
      'Am Phys MutMun → Corpo com Propriedade de Pedra',
      'Al Locus MutAni → Lugar com Essência de Alma',
      'Et Omu MutPhobetor → Estrutura com Medo'
    ],
    difficulty: 'lendário'
  }
];

// ============================================================================
// DOMÍNIOS DE SEQUÊNCIA (Partículas Exclusivas por Caminho)
// ============================================================================

export const PATHWAY_DOMAINS: Record<string, PathwayMagic> = {
  'CAMINHO DO TOLO': {
    pathway: 'CAMINHO DO TOLO',
    particles: [
      {
        id: 'neurospasta',
        word: 'Neurospasta',
        name: 'Marionete',
        type: 'Objeto',
        pathway: 'CAMINHO DO TOLO',
        description: 'A essência dos "Fios do Espírito", os elos invisíveis de controle e destino que conectam todas as coisas.',
        concept: 'Controle através de fios invisíveis',
        examples: [
          { usage: 'Et Neurospasta', description: 'Controlar Marionete — Base para controlar corpos de outras criaturas' },
          { usage: 'As Neurospasta', description: 'Destruir Marionete — Corta permanentemente os Fios do Espírito' }
        ]
      },
      {
        id: 'apate',
        word: 'Apatē',
        name: 'Falha',
        type: 'Função',
        pathway: 'CAMINHO DO TOLO',
        description: 'A magia do "erro". Introduz uma falha lógica e fundamental em um sistema.',
        concept: 'Introduzir erros em sistemas',
        examples: [
          { usage: 'Apatē Machina', description: 'Falha em Mecanismo — Faz uma arma emperrar no momento crucial' },
          { usage: 'Apatē Imu', description: 'Falha na Mente — Introduz lapso de memória ou erro de julgamento' }
        ]
      },
      {
        id: 'historia',
        word: 'Historia',
        name: 'História',
        type: 'Objeto',
        pathway: 'CAMINHO DO TOLO',
        description: 'O registro etéreo do passado, os ecos de eventos que já aconteceram.',
        concept: 'Invocar e manipular fantasmas do tempo',
        examples: [
          { usage: 'Ev Historia', description: 'Invocar História — Traz uma Projeção Histórica à existência' },
          { usage: 'Al Historia', description: 'Alterar História — Altera sutilmente o eco de um evento' }
        ]
      }
    ]
  },
  'CAMINHO DA PORTA': {
    pathway: 'CAMINHO DA PORTA',
    particles: [
      {
        id: 'pyle',
        word: 'Pylē',
        name: 'Porta',
        type: 'Objeto',
        pathway: 'CAMINHO DA PORTA',
        description: 'A essência das passagens, portais, limiares e fronteiras, sejam elas físicas ou dimensionais.',
        concept: 'Passagens e portais',
        examples: [
          { usage: 'It Ivi Pylē', description: 'Transportar Pessoa via Porta — Base para teleporte e viagens espaciais' },
          { usage: 'Ar Locus Pylē', description: 'Aprisionar Lugar com Porta — Cria um Selo de inacessibilidade' }
        ]
      }
    ]
  }
  // ... (adicionar outros caminhos conforme necessário)
};

// ============================================================================
// DESCRIÇÕES DOS 22 CAMINHOS BEYONDER
// ============================================================================

export const PATHWAY_DESCRIPTIONS: Record<string, PathwayDescription> = {
  'CAMINHO DO TOLO': {
    id: 'foolpath',
    name: 'CAMINHO DO TOLO',
    description: 'À primeira vista, o Caminho do Tolo parece ser sobre enganos e truques. Seus seguidores são mestres da ilusão, adivinhos enigmáticos e contorcionistas sobrenaturais. Mas por baixo das máscaras e dos sorrisos, jaz um segredo mais profundo: o controle sobre os "Fios Espirituais". Para um Tolo, todas as criaturas são, em potencial, marionetes esperando por seu mestre. Eles manipulam percepções, corpos e até a história, rindo do conceito de uma "realidade" imutável.',
    themes: ['Ilusão', 'Engano', 'Controle', 'Fios Espirituais', 'Manipulação da Realidade'],
    roleArchetypes: ['Mestre de Ilusão', 'Adivinho Enigmático', 'Contorcionista Sobrenatural', 'Marionetista'],
    philosophy: 'A realidade é uma ilusão a ser manipulada. Todas as coisas são fios esperando por seu mestre.'
  },

  'CAMINHO DA PORTA': {
    id: 'doorpath',
    name: 'CAMINHO DA PORTA',
    description: 'O universo é uma casa cheia de portas trancadas, e o seguidor do Caminho da Porta possui a chave-mestra. Este Caminho é para os aventureiros, exploradores e curiosos que desejam desbravar os segredos do cosmos. Seus seguidores começam como aprendizes que podem "abrir" passagens onde não deveriam existir, evoluindo para astrólogos que leem os segredos das estrelas e viajantes que podem pisar em outros mundos. Em seu ápice, eles se tornam as próprias Chaves das Estrelas, capazes de conectar ou isolar qualquer ponto do universo, ou até mesmo exilar seus inimigos em dimensões esquecidas.',
    themes: ['Portais', 'Viagem', 'Exploração', 'Espaço', 'Chaves'],
    roleArchetypes: ['Explorador', 'Astrólogo', 'Viajante Interdimensional', 'Chave das Estrelas'],
    philosophy: 'O universo é um mapa esperando ser explorado. Toda porta pode ser aberta pelo escolhido.'
  },

  'CAMINHO DO ERRO': {
    id: 'errorpath',
    name: 'CAMINHO DO ERRO',
    description: 'O Caminho do Erro começa com o simples ato de pegar o que não é seu. Seus seguidores são ladrões, vigaristas e criptógrafos, mestres em enganar sentidos e sistemas. Conforme avançam, no entanto, o conceito de "roubo" se expande. Eles aprendem a roubar conhecimento de mentes, poderes de outros Beyonders e, por fim, o próprio tempo. Um Erro de alto nível é um paradoxo ambulante, uma anomalia viva que manipula a causalidade, aproveitando-se das "lacunas" e "bugs" da realidade para criar seu próprio poder.',
    themes: ['Roubo', 'Engano', 'Lacunas da Realidade', 'Paradoxo', 'Causalidade'],
    roleArchetypes: ['Ladrão', 'Vigarista', 'Criptógrafo', 'Anomalia Viva'],
    philosophy: 'A realidade é um sistema bugado. O poder pertence àquele que sabe explorar suas falhas.'
  },

  'CAMINHO DO VISIONÁRIO': {
    id: 'visionarypath',
    name: 'CAMINHO DO VISIONÁRIO',
    description: 'Para um Visionário, o mundo exterior é apenas um reflexo do universo interior. Este é o Caminho da mente, da psicologia e do sonho. Seus seguidores começam como observadores passivos da psique humana, tornando-se telepatas, psiquiatras e mestres do reino dos sonhos. Eles entendem que a maior batalha é travada na mente e que a realidade é, em última instância, uma percepção coletiva que pode ser influenciada, manipulada e reescrita. Um Visionário pode curar uma mente quebrada ou estilhaçar a mais sã das almas, tudo com um simples olhar ou um sussurro no subconsciente.',
    themes: ['Mente', 'Sonho', 'Psicologia', 'Percepção', 'Subconsciente'],
    roleArchetypes: ['Observador de Psique', 'Telepata', 'Psiquiatra', 'Mestre dos Sonhos'],
    philosophy: 'A maior batalha é travada na mente. A realidade é percepção, e a percepção pode ser reescrita.'
  },

  'CAMINHO DO SOL': {
    id: 'sunpath',
    name: 'CAMINHO DO SOL',
    description: 'Em um mundo repleto de sombras, alguns escolhem ser a chama. O Caminho do Sol é a trilha dos campeões da luz, guerreiros imbuídos com o poder purificador e a fúria radiante do sol. Seus seguidores começam como bardos que inspiram coragem, evoluindo para sacerdotes que curam com a luz e notários que selam pactos sob o olhar divino. Em seus níveis mais altos, eles se tornam verdadeiros anjos brancos, avatares da esperança e da purificação, capazes de queimar a corrupção e banir as trevas. Um seguidor do Sol é um farol de esperança para seus aliados e uma supernova de destruição para seus inimigos.',
    themes: ['Luz', 'Purificação', 'Esperança', 'Glória', 'Destruição Divina'],
    roleArchetypes: ['Bardo Inspirador', 'Sacerdote Curador', 'Notário Divino', 'Anjo Branco'],
    philosophy: 'A luz dissipa toda escuridão. Esperança e glória são as armas mais poderosas do universo.'
  },

  'CAMINHO DO TIRANO': {
    id: 'tyrantpath',
    name: 'CAMINHO DO TIRANO',
    description: 'O Caminho do Tirano é a fúria indomável da natureza. Seus seguidores não suplicam aos céus por poder; eles são a tempestade. Este é o caminho dos marinheiros que se tornam um com o mar, dos guerreiros que lutam com a força de um furacão e dos xamãs que comandam raios e trovões. Eles são a personificação da força bruta, da ira climática e do poder esmagador dos elementos. Um Tirano não busca conhecimento ou engana seus inimigos; ele os afoga, os eletrocuta e os esmaga sob o peso de sua fúria elemental.',
    themes: ['Tempestade', 'Elementos', 'Força Bruta', 'Fúria', 'Poder Esmagador'],
    roleArchetypes: ['Marinheiro Elemental', 'Guerreiro de Furacão', 'Xamã de Trovões', 'Personificação da Tempestade'],
    philosophy: 'O poder não é questão de vontade, é uma força da natureza. Seja a tempestade.'
  },

  'CAMINHO DA TORRE BRANCA': {
    id: 'whitetowerpath',
    name: 'CAMINHO DA TORRE BRANCA',
    description: 'Se o universo é um grande livro, o seguidor do Caminho da Torre Branca é aquele que se dedica a lê-lo, da primeira à última página. Este é o Caminho do Conhecimento puro e da sabedoria ilimitada. Seus seguidores começam como leitores vorazes, evoluindo para estudantes do raciocínio, detetives lógicos, e sábios que podem prever o futuro não por magia, mas por pura dedução. Em seus níveis mais altos, eles não apenas leem o livro do universo; eles se tornam a própria biblioteca, uma consciência viva de todo o conhecimento que já existiu e que existirá. Um Sábio da Torre Branca entende o porquê de uma mentira ter sido contada.',
    themes: ['Conhecimento', 'Lógica', 'Razão', 'Dedução', 'Sabedoria'],
    roleArchetypes: ['Leitor Voraz', 'Estudante de Lógica', 'Detetive Lógico', 'Sábio Supremo'],
    philosophy: 'O universo é um sistema decifrável. O conhecimento puro é o poder supremo.'
  },

  'CAMINHO DO ENFORCADO': {
    id: 'hangedmanpath',
    name: 'CAMINHO DO ENFORCADO',
    description: 'Alguns buscam poder na ordem, outros no caos. O seguidor do Caminho do Enforcado busca poder no sacrifício. Esta é a trilha do conhecimento que só é obtido através do sofrimento. Seus seguidores são suplicantes que ouvem os sussurros do abismo, ascetas que se tornam um com as sombras, e pastores que colecionam as almas dos perdidos. Eles entendem que para ganhar, algo deve ser perdido. Eles sacrificam sua sanidade por segredos, sua carne por poder, e sua humanidade por uma compreensão distorcida da divindade. Um Enforcado é um mártir e um monstro, um erudito e um louco, para sempre pendurado entre este mundo e um abismo faminto.',
    themes: ['Sacrifício', 'Sofrimento', 'Abismo', 'Conhecimento Proibido', 'Maldição'],
    roleArchetypes: ['Suplicante do Abismo', 'Asceta Sombrío', 'Colecionador de Almas', 'Mártir Corrompido'],
    philosophy: 'Todo poder tem um preço. Pagar com a alma é o caminho para o verdadeiro conhecimento.'
  },

  'CAMINHO DAS TREVAS': {
    id: 'darknesspath',
    name: 'CAMINHO DAS TREVAS',
    description: 'Para o seguidor do Caminho das Trevas, a noite não é a ausência de luz, mas a presença de seu maior aliado. Este é o caminho dos seres que se tornam um com a escuridão, caçadores que dominam o medo e a noite. Seus seguidores começam como insones que veem perfeitamente no escuro, evoluindo para poetas que tecem pesadelos e feiticeiros que colecionam as almas dos aflitos. Em seus níveis mais altos, eles não apenas se escondem nas sombras; eles são as sombras. Um servo das Trevas é um pesadelo manifesto, um guardião de segredos sombrios e um predador cujo verdadeiro poder só se revela quando o sol se põe.',
    themes: ['Escuridão', 'Medo', 'Noite', 'Segredos', 'Pesadelo'],
    roleArchetypes: ['Insone Nocturno', 'Poeta de Pesadelos', 'Feiticeiro de Almas', 'Sombra Viva'],
    philosophy: 'A escuridão é mais que ausência de luz; é um poder vivo. Seja a noite.'
  },

  'CAMINHO DA MORTE': {
    id: 'deathpath',
    name: 'CAMINHO DA MORTE',
    description: 'Todas as coisas chegam a um fim. O seguidor do Caminho da Morte é aquele que se torna o mestre desse fim. Este não é um caminho de violência caótica, mas da autoridade solene e inevitável da mortalidade. Seus seguidores começam como colecionadores de cadáveres e espiritualistas que conversam com os mortos, evoluindo para barqueiros que guiam almas e cônsules que decretam o fim. Em seu ápice, eles não apenas comandam os mortos; eles são a própria Morte, uma divindade sombria e silenciosa cuja mera presença pode murchar a vida e silenciar almas.',
    themes: ['Morte', 'Finitude', 'Almas', 'Mortos-vivos', 'Inevitabilidade'],
    roleArchetypes: ['Colecionador de Cadáveres', 'Espiritualista', 'Barqueiro de Almas', 'Morte Encarnada'],
    philosophy: 'A morte não é terror, é inevitabilidade. Dominar o fim é dominar a realidade.'
  },

  'CAMINHO DO GIGANTE': {
    id: 'giantpath',
    name: 'CAMINHO DO GIGANTE',
    description: 'Em eras antigas, quando deuses caminhavam na terra, gigantes travavam batalhas que moldavam montanhas. O Caminho do Gigante do Crepúsculo é o legado desse poder primordial. Seus seguidores são guerreiros que transcendem os limites humanos, transformando seus corpos em fortalezas vivas e sua força em uma calamidade natural. Eles não usam truques ou ilusões; seu poder é honesto, direto e devastador. Um Gigante não negocia, ele enfrenta. Ele não se esconde, ele se torna a muralha. São guardiões, campeões e, em seu ápice, a personificação da honra e da força do fim dos dias.',
    themes: ['Força Primordial', 'Honra', 'Defesa', 'Poder Direto', 'Crepúsculo'],
    roleArchetypes: ['Guerreiro Transcendente', 'Fortaleza Viva', 'Campeão Primordial', 'Muralha Viva'],
    philosophy: 'A força verdadeira é simples, direta e honesta. Seja a muralha que nunca cai.'
  },

  'CAMINHO DO DEMÔNIO': {
    id: 'demonpath',
    name: 'CAMINHO DO DEMÔNIO',
    description: 'Onde há medo, há um Demônio à espreita. Este Caminho não é sobre sedução ou pactos, mas sobre o prazer primordial de inspirar terror e espalhar a desordem. Seus seguidores são mestres da instigação, bruxas que criam substitutos de si mesmas e seres que espalham pragas e desespero. Eles se deleitam na miséria alheia e usam o pavor como sua principal arma. Para um Demônio, um mundo em pânico é um playground, e uma alma aterrorizada é a mais doce das iguarias.',
    themes: ['Terror', 'Desordem', 'Instigação', 'Medo', 'Caos Prazeroso'],
    roleArchetypes: ['Mestre da Instigação', 'Bruxa Substituta', 'Espalhador de Pragas', 'Avatar do Terror'],
    philosophy: 'O medo é o alimento supremo. Desordem é a arte suprema.'
  },

  'CAMINHO DO PADRE VERMELHO': {
    id: 'redpriestpath',
    name: 'CAMINHO DO PADRE VERMELHO',
    description: 'O Caminho do Padre Vermelho é a personificação da guerra, mas não do combate selvagem, e sim da guerra como uma arte. Seus seguidores são caçadores ardilosos, piromaníacos táticos, conspiradores brilhantes e, por fim, generais divinos. Eles veem o campo de batalha como um tabuleiro de xadrez e o fogo como sua peça mais poderosa. Um Padre Vermelho não apenas luta; ele provoca, manipula e comanda, usando a fúria dos outros e a sua própria chama interior para incinerar inimigos e inspirar legiões.',
    themes: ['Guerra', 'Estratégia', 'Fogo', 'Intriga', 'Comando'],
    roleArchetypes: ['Caçador Ardiloso', 'Piromaníaco Tático', 'Conspirador Brilhante', 'General Divino'],
    philosophy: 'A guerra é uma arte. O poder pertence àquele que entende o tabuleiro.'
  },

  'CAMINHO DO EREMITA': {
    id: 'hermitpath',
    name: 'CAMINHO DO EREMITA',
    description: 'O mundo está cheio de segredos trancados em cofres, mentes e no próprio tecido da realidade. O Eremita é aquele que detém a chave. Este Caminho é a trilha do conhecimento arcano, da introspecção e da busca pela verdade oculta. Seus seguidores começam como espreitadores que veem através de paredes e ilusões, evoluindo para bruxos que criam sua própria magia a partir de pós e ervas, e místicos que podem vagar pelos cosmos. Um Eremita não busca poder para governar ou destruir; ele busca conhecimento por si só, acreditando que entender um segredo é a forma mais pura de poder.',
    themes: ['Segredos', 'Conhecimento Arcano', 'Introspecção', 'Verdade Oculta', 'Magia Criada'],
    roleArchetypes: ['Espreitador de Realidade', 'Bruxo de Ervas', 'Místico Cósmico', 'Guardião de Segredos'],
    philosophy: 'Os segredos são poder. Entender a verdade oculta é mais poderoso que qualquer magia.'
  },

  'CAMINHO PARAGON': {
    id: 'paragonpath',
    name: 'CAMINHO PARAGON',
    description: 'Em um mundo regido por deuses e monstros, o Paragon prova que a maior força pode vir da mente e das mãos humanas. Este é o Caminho do Artesão, do Inventor e do Gênio. Seus seguidores são arqueólogos que desvendam os segredos do passado, engenheiros que constroem o futuro e alquimistas que unem ciência e misticismo. Eles não conjuram fogo, eles forjam um canhão que dispara fogo grego. Eles não se teleportam, eles constroem um portão. O poder de um Paragon não está no que ele é, mas no que ele pode criar. Seus artefatos e invenções são maravilhas que podem rivalizar com o poder de semideuses.',
    themes: ['Invenção', 'Alquimia', 'Engenharia', 'Criação', 'Gênio'],
    roleArchetypes: ['Arqueólogo Pesquisador', 'Engenheiro Inventor', 'Alquimista', 'Mestre Artesão'],
    philosophy: 'O verdadeiro poder não é mágico, é criativo. O que você cria define seu poder.'
  },

  'CAMINHO DA MÃE': {
    id: 'motherpath',
    name: 'CAMINHO DA MÃE',
    description: 'O Caminho da Mãe é composto por seres profundamente conectados ao ciclo da vida e da morte na natureza. Seus seguidores são fazendeiros que abençoam a terra, doutores que costuram almas e biólogos que criam formas de vida. Eles representam a fertilidade, a abundância e a cura. No entanto, o ciclo da natureza também inclui decomposição, pragas e venenos. Uma Mãe pode ser uma fonte de vida sem fim, mas irritá-la pode trazer pestilência e decomposição sobre seus inimigos, provando que a Natureza é tão cruel quanto generosa.',
    themes: ['Vida', 'Natureza', 'Ciclo', 'Fertilidade', 'Decomposição'],
    roleArchetypes: ['Fazendeiro Abençoado', 'Doutor de Almas', 'Biólogo Criador', 'Mãe da Natureza'],
    philosophy: 'O ciclo da vida inclui morte. A natureza é tão cruel quanto generosa.'
  },

  'CAMINHO DA LUA': {
    id: 'moonpath',
    name: 'CAMINHO DA LUA',
    description: 'Sob a pálida luz do luar, movem-se os filhos da noite. O Caminho da Lua é o caminho dos predadores imortais, conhecidos pelos mortais como Vampiros. Seus seguidores são seres de graça e poder sobrenaturais, mestres da sedução, da caça e do comando sobre as feras da noite. Eles começam como simples fabricantes de poções e domadores, mas rapidamente florescem em aristocratas da escuridão, com uma sede insaciável por sangue e uma conexão profunda com o poder místico da lua. Um Beyonder deste Caminho é beleza e terror encarnados, um ser de desejos eternos e poder aterrorizante.',
    themes: ['Lua', 'Sangue', 'Sedução', 'Noite', 'Imortalidade'],
    roleArchetypes: ['Fabricante de Poções', 'Domador de Feras', 'Aristocrata Sombrio', 'Vampiro Perfeito'],
    philosophy: 'A beleza e o terror são faces da mesma moeda. O sangue é poder eterno.'
  },

  'CAMINHO DO ABISMO': {
    id: 'abysspath',
    name: 'CAMINHO DO ABISMO',
    description: 'O Caminho do Abismo é a trilha daqueles que não temem barganhar com as trevas. Seus seguidores são sedutores, criminosos, e demônios em formação, que extraem poder dos desejos e pecados do mundo. Eles começam explorando a fraqueza alheia, mas rapidamente aprendem a invocar poderes profanos e a transformar seus próprios corpos em receptáculos para a malevolência do Abismo. Um Beyonder deste Caminho é um avatar da tentação, prometendo poder e prazer, mas sempre cobrando a alma como preço.',
    themes: ['Tentação', 'Desejo', 'Corrupção', 'Pecado', 'Malevolência'],
    roleArchetypes: ['Sedutor', 'Criminoso Profano', 'Demônio em Formação', 'Avatar da Tentação'],
    philosophy: 'Os desejos são poder. A alma é a moeda de verdade do universo.'
  },

  'CAMINHO ACORRENTADO': {
    id: 'chainedpath',
    name: 'CAMINHO ACORRENTADO',
    description: 'O Caminho do Acorrentado é uma trilha de poder amaldiçoado. Seus seguidores ganham força, velocidade e regeneração sobrenaturais, mas a um preço terrível. Cada gota de poder vem de uma mutação, uma maldição que os prende a uma natureza bestial e a uma insanidade crescente. Eles podem se transformar em lobisomens, comandar mortos-vivos ou se tornar fantasmas, mas cada nova forma é mais uma corrente em sua alma. Um Acorrentado vive em uma prisão de sua própria carne e poder, constantemente lutando para não ser consumido pela besta que ele mesmo alimenta.',
    themes: ['Mutação', 'Maldição', 'Besta Interior', 'Correntes', 'Poder Amaldiçoado'],
    roleArchetypes: ['Lobisomem', 'Comandante Mortos-vivos', 'Fantasma Corporificado', 'Besta Aprisionada'],
    philosophy: 'O poder tem correntes. Quanto mais forte você se torna, mais preso fica à bestialidade.'
  },

  'CAMINHO DO JUSTICEIRO': {
    id: 'justicerorpath',
    name: 'CAMINHO DO JUSTICEIRO',
    description: 'Em um mundo assombrado por monstros e corrompido por segredos, alguns poucos ousam ser a muralha. O Caminho do Justiceiro é o caminho da ordem inflexível e da autoridade inquestionável. Seus seguidores são os xerifes que caçam o mal, os juízes que proíbem o caos e os paladinos que defendem os inocentes. Eles não manipulam, eles decretam. Eles não enganam, eles proíbem. Um Justiceiro é a personificação da lei, um bastião de ordem em um oceano de entropia. Desafiar sua autoridade não é apenas um crime; é desafiar as próprias regras da realidade.',
    themes: ['Lei', 'Ordem', 'Justiça', 'Autoridade', 'Proibição'],
    roleArchetypes: ['Xerife Caçador', 'Juiz Supremo', 'Paladino Protetor', 'Basião de Ordem'],
    philosophy: 'A lei é a base da realidade. A ordem prevalecerá sobre o caos.'
  },

  'CAMINHO DO IMPERADOR NEGRO': {
    id: 'blackemperorpath',
    name: 'CAMINHO DO IMPERADOR NEGRO',
    description: 'A sociedade é construída sobre regras. O Imperador Negro é aquele que domina a arte de quebrá-las. Este Caminho começa com a advocacia e a diplomacia, usando a lei como uma arma e uma desculpa. Seus seguidores são bárbaros que desprezam a civilidade, subornadores que compram almas e barões que corrompem tudo o que tocam. Conforme avançam, eles aprendem a distorcer não apenas as leis dos homens, mas as leis da realidade, espalhando desordem e caos por onde passam, não por loucura, mas por um desejo calculado de poder e anarquia. Um Imperador Negro é o tirano que se esconde atrás de um sorriso, o caos que veste um terno e a ruína que chega com um contrato na mão.',
    themes: ['Anarquia', 'Subversão', 'Corrupção', 'Caos Calculado', 'Poder através da Desordem'],
    roleArchetypes: ['Bárbaro Corrupto', 'Subornador de Almas', 'Barão Corrompedor', 'Tirano Mascarado'],
    philosophy: 'As regras são ferramentas para serem quebradas. O verdadeiro poder está na anarquia calculada.'
  },

  'CAMINHO DA RODA DA FORTUNA': {
    id: 'fortunewheelpath',
    name: 'CAMINHO DA RODA DA FORTUNA',
    description: 'Apelidados de "Os Apostadores do Destino", os Beyonders deste Caminho não acreditam em sorte; eles a veem como uma lei fundamental do universo, tão palpável quanto a gravidade. Eles são mestres da probabilidade e do acaso, capazes de vislumbrar os fios do destino e torcê-los a seu favor... ou contra seus inimigos. Um encontro com eles pode ser o dia mais sortudo de sua vida ou o início de uma calamidade inescapável. Eles caminham na corda bamba entre a fortuna e o desastre, sabendo que a Roda sempre gira.',
    themes: ['Destino', 'Probabilidade', 'Acaso', 'Sorte', 'Causalidade'],
    roleArchetypes: ['Apostador de Destino', 'Manipulador de Probabilidade', 'Vislumbrador de Fios', 'Dançarino da Roda'],
    philosophy: 'A sorte é uma lei fundamental. Quem domina a probabilidade, domina o destino.'
  }
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

export function getParticlesByType(type: 'Objeto' | 'Função' | 'Característica' | 'Complemento' | 'Criador'): MagicParticle[] {
  switch (type) {
    case 'Objeto':
      return OBJETOS;
    case 'Função':
      return FUNCOES;
    case 'Característica':
      return CARACTERISTICAS;
    case 'Complemento':
      return COMPLEMENTOS;
    case 'Criador':
      return CRIADORES;
    default:
      return [];
  }
}

export function findParticleByWord(word: string): MagicParticle | undefined {
  const allParticles = [...OBJETOS, ...FUNCOES, ...CARACTERISTICAS, ...COMPLEMENTOS, ...CRIADORES];
  return allParticles.find(p => p.word.toLowerCase() === word.toLowerCase());
}

export function findParticleByName(name: string): MagicParticle | undefined {
  const allParticles = [...OBJETOS, ...FUNCOES, ...CARACTERISTICAS, ...COMPLEMENTOS, ...CRIADORES];
  return allParticles.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getPathwayDomain(pathway: string): DomainParticle[] {
  const pathwayData = PATHWAY_DOMAINS[pathway];
  return pathwayData ? pathwayData.particles : [];
}

export function getAllParticles(): MagicParticle[] {
  return [...OBJETOS, ...FUNCOES, ...CARACTERISTICAS, ...COMPLEMENTOS, ...CRIADORES];
}

export function getPathwayDescription(pathwayName: string): PathwayDescription | undefined {
  return PATHWAY_DESCRIPTIONS[pathwayName];
}

export function getAllPathways(): PathwayDescription[] {
  return Object.values(PATHWAY_DESCRIPTIONS);
}

export function getPathwaysByTheme(theme: string): PathwayDescription[] {
  return Object.values(PATHWAY_DESCRIPTIONS).filter(p => 
    p.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  );
}

export function getPathwaysByArchetype(archetype: string): PathwayDescription[] {
  return Object.values(PATHWAY_DESCRIPTIONS).filter(p => 
    p.roleArchetypes.some(a => a.toLowerCase().includes(archetype.toLowerCase()))
  );
}
