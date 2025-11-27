import { MagicParticle } from '../complete-magic-particles';

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
