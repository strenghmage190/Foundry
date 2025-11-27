import { MagicParticle } from '../complete-magic-particles';

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
