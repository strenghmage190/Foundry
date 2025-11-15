export interface MagicParticle {
  id: string;
  name: string;
  description: string;
  type?: string; // e.g. 'Função', 'Objeto', 'Característica', 'Complemento', 'Criador'
  palavra?: string; // shorthand/word associated (ex: 'Al', 'Ivi')
}

export const FUNCOES: MagicParticle[] = [
  { id: 'Al', name: 'Alterar', palavra: 'Al', description: 'O poder da modificação.', type: 'Função' },
  { id: 'Ar', name: 'Aprisionar', palavra: 'Ar', description: 'O poder da contenção.', type: 'Função' },
  { id: 'Im', name: 'Atacar/Ferir', palavra: 'Im', description: 'O poder do dano bruto e direto.', type: 'Função' },
  { id: 'Am', name: 'Proteger', palavra: 'Am', description: 'O poder da defesa.', type: 'Função' },
  { id: 'Et', name: 'Controlar', palavra: 'Et', description: 'O poder da manipulação e do domínio.', type: 'Função' },
];

export const OBJETOS: MagicParticle[] = [
  { id: 'Ivi', name: 'Pessoa', palavra: 'Ivi', description: 'O receptáculo mortal.', type: 'Objeto' },
  { id: 'Ali', name: 'Animal', palavra: 'Ali', description: 'A besta primordial.', type: 'Objeto' },
  { id: 'Exa', name: 'Inanimado', palavra: 'Exa', description: 'A criação do homem.', type: 'Objeto' },
  { id: 'Ora', name: 'Vegetação', palavra: 'Ora', description: 'O pulso da terra.', type: 'Objeto' },
  { id: 'Eli', name: 'Elemento', palavra: 'Eli', description: 'A matéria bruta do cosmos.', type: 'Objeto' },
];

export const CARACTERISTICAS: MagicParticle[] = [
  { id: 'Ig', name: 'Fogo', palavra: 'Ig', description: 'A essência do calor, combustão e fúria.', type: 'Característica' },
  { id: 'Quan', name: 'Água', palavra: 'Quan', description: 'A essência do frio, fluidez e adaptabilidade.', type: 'Característica' },
  { id: 'Aer', name: 'Ar', palavra: 'Aer', description: 'A essência do vento, do som e da eletricidade.', type: 'Característica' },
  { id: 'Mun', name: 'Terra', palavra: 'Mun', description: 'A essência da pedra, estabilidade e peso.', type: 'Característica' },
  { id: 'Lum', name: 'Luz', palavra: 'Lum', description: 'A natureza da iluminação, verdade e ordem.', type: 'Característica' },
];

export const COMPLEMENTOS: MagicParticle[] = [
  { id: 'Mor', name: 'Maior', palavra: 'Mor', description: 'Aumenta a escala geral do feitiço.', type: 'Complemento' },
  { id: 'Min', name: 'Menor', palavra: 'Min', description: 'Diminui a escala geral do feitiço.', type: 'Complemento' },
  { id: 'San', name: 'Forma: Esfera', palavra: 'San', description: 'Manifesta a magia como uma aura esférica.', type: 'Complemento' },
];

export const CRIADORES: MagicParticle[] = [
  { id: 'Ada-', name: 'Variação', palavra: 'Ada-', description: 'Cria uma variação lógica de uma Característica.', type: 'Criador' },
  { id: 'No-', name: 'Negação', palavra: 'No-', description: 'Nega completamente o conceito de uma Característica.', type: 'Criador' },
  { id: 'Ag', name: 'Adição', palavra: 'Ag', description: 'Une duas Características para criar um efeito híbrido.', type: 'Criador' },
];

// Convenience map of all particles grouped by type
export const ALL_PARTICLES: Record<string, MagicParticle[]> = {
  Função: FUNCOES,
  Objeto: OBJETOS,
  Característica: CARACTERISTICAS,
  Complemento: COMPLEMENTOS,
  Criador: CRIADORES,
};
