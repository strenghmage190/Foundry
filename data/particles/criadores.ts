import { MagicParticle } from '../complete-magic-particles';

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
