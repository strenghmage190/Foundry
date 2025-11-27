import { MagicParticle } from '../complete-magic-particles';

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
