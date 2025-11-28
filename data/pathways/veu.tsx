import { PathwayData } from '../../types';

// CAMINHO DO VÉU (CAOS) - Caminho Secreto
// Domínio do Caos, Vida Profana, Corrupção e Alquimia Herética
export const veuData: PathwayData = {
  category: 'Caos e Vida Profana',
  pathway: 'CAMINHO DO VÉU',
  pvBase: 10, // Versátil (corpo como ferramenta/laboratório)
  pvPorAvanço: 4,
  peBase: 15, // Híbrido (manipulação física + feitiçaria espiritual)
  pePorAvanço: 5,
  vontadeBonus: 0, // Instável (dominação, impulsos sombrios)
  sanidade: 7, // Equilibrado (corrupção gradual, não verdades cósmicas)
  mecanicaUnica: {
    titulo: 'Abraço do Caos',
    items: [
      { nome: 'Imprevisibilidade', desc: 'O Caos rejeita ordem. Sempre que rolar dados, role 1d10 adicional: se for 10, algo inesperado acontece a seu favor; se for 1, contra você.' },
      { nome: 'Entropia Crescente', desc: 'Cada vez que usa uma habilidade do Véu, acumula 1 ponto de Entropia. Com 5 pontos, deve fazer teste de Sanidade (Dif. 7) ou sofrer efeito aleatório de Caos.' },
      { nome: 'Manipulação de Probabilidade', desc: 'Gaste 3 PE: force rerrolagem de qualquer teste (seu ou de outro). O novo resultado é final.' },
      { nome: 'TODO: Adicionar mais mecânicas únicas', desc: '' }
    ]
  },
  poderesInatos: [
    { seq: '9', nome: 'Toque da Desordem', desc: '+2 dados em testes para causar confusão, desordem ou sabotagem.' },
    { seq: '8', nome: 'Sorte do Caos', desc: '1x por sessão, transforme uma falha crítica em sucesso marginal.' },
    { seq: '7', nome: 'Aura Entrópica', desc: 'Objetos complexos perto de você (10m) têm chance de falhar (armas emperram, portas travam, etc).' },
    { seq: '6', nome: 'TODO: Poder Seq 6', desc: '' },
    { seq: '5', nome: 'TODO: Poder Seq 5', desc: '' },
    { seq: '4', nome: 'Olho do Caos', desc: 'Pode ver linhas de probabilidade e eventos caóticos antes de acontecerem (+3 Iniciativa).' },
    { seq: '3', nome: 'TODO: Poder Seq 3', desc: '' },
    { seq: '2', nome: 'TODO: Poder Seq 2', desc: '' },
    { seq: '1', nome: 'Avatar do Caos', desc: 'Você se torna um ponto focal de entropia pura. Realidade se distorce ao seu redor.' }
  ],
  mythicalForm: {
    incomplete: {
      tempHpBonus: 0,
      attributeBoosts: {
        destreza: 2,
        manipulacao: 2,
        percepcao: 1
      },
      sanityCostPerTurn: '1d6',
      abilities: [
        { name: 'Forma Caótica', desc: 'Seu corpo muda constantemente. +2 Defesa contra ataques físicos.' },
        { name: 'Irradiar Caos', desc: 'Inimigos a 5m sofrem -1 dado em todos os testes.' },
        { name: 'TODO: Adicionar mais habilidades da forma incompleta', desc: '' }
      ]
    },
    complete: {
      tempHpBonus: 10,
      attributeBoosts: {
        destreza: 3,
        manipulacao: 3,
        percepcao: 2,
        raciocinio: 1
      },
      abilities: [
        { name: 'Senhor da Entropia', desc: 'Controle total sobre caos local. +3 Defesa, +2 Absorção.' },
        { name: 'Reescrever Destino', desc: 'Ação: Altere o resultado de qualquer rolagem feita na cena para qualquer valor.' },
        { name: 'Aura de Improbabilidade', desc: 'Eventos impossíveis se tornam possíveis ao seu redor. O Mestre narra fenômenos caóticos.' },
        { name: 'TODO: Adicionar mais habilidades da forma completa', desc: '' }
      ]
    }
  },
  domain: {
    description: 'Vida Profana, Sangue, Mutação, Alquimia Herética e Corrupção Biológica. Domínio visceral sobre carne, ciclos de vida e rituais proibidos.',
    particulas: [
      { name: 'Bios', translation: 'Vida Primal', type: 'Objeto/Característica', conceito: 'Essência da vida caótica — crescimento, mutação, procriação. Poder do câncer, evolução e criação de monstros.', exemplo: 'Ev Phys Bios — Invocar Corpo com Vida Primal (criar quimeras, forçar crescimento celular aberrante)', uso: 'Lues Phys Bios — Corromper Corpo com Vida Primal (impor mutação: tumores, membros extras, deformações)' },
      { name: 'Haema', translation: 'Sangue', type: 'Objeto/Característica', conceito: 'Sangue como veículo da vida, linhagem e poder. Governa vitalidade líquida, roubo vampírico e feitiçaria de sangue.', exemplo: 'Im Eli Haema — Atacar com Elemento Sangue (lâminas, projéteis ou tentáculos de sangue endurecido)', uso: 'Na Phys Haema — Restaurar Corpo com Sangue (cura perigosa que acelera coagulação, deixa cicatrizes grotescas)' },
      { name: 'Profanus', translation: 'Profano/Herético', type: 'Função', conceito: 'Desafiar e perverter ordem divina. Blasfêmia, ritual proibido, corrupção conceitual. Mancha luz, torce vida.', exemplo: 'Profanus Magia — Profanar Magia (corromper cura em tumores/dor, transformar selos sagrados em atratores de mal)', uso: 'Corromper conceitos sagrados, inverter propósitos de feitiços benéficos, poluir rituais' },
      { name: 'TODO: Partícula 4', translation: 'TODO', type: 'TODO', conceito: 'TODO', exemplo: 'TODO', uso: 'TODO' }
    ]
  },
  sequences: {
    'Sequência 9': [
      { name: 'Toque Entrópico', desc: 'Gaste 2 PE: toque causa mal funcionamento em objeto simples (arma, fechadura, etc) por 1 cena.' },
      { name: 'Confundir Sentidos', desc: 'Gaste 2 PE: alvo deve fazer teste de Percepção (Dif. 6) ou fica desorientado por 1 turno (-2 dados).' },
      { name: 'TODO: Habilidade Seq 9 #3', desc: '' }
    ],
    'Sequência 8': [
      { name: 'Cascata de Falhas', desc: 'Gaste 3 PE: equipamento tecnológico/complexo em área pequena falha por 1d6 turnos.' },
      { name: 'TODO: Habilidade Seq 8 #2', desc: '' }
    ],
    'Sequência 7': [
      { name: 'Desvio Probabilístico', desc: 'Gaste 4 PE: modifique +2 ou -2 em qualquer rolagem que você testemunhe (antes do resultado).' },
      { name: 'TODO: Habilidade Seq 7 #2', desc: '' }
    ],
    'Sequência 6': [
      { name: 'TODO: Habilidade Seq 6 #1', desc: '' },
      { name: 'TODO: Habilidade Seq 6 #2', desc: '' }
    ],
    'Sequência 5': [
      { name: 'Zona de Caos', desc: 'Gaste 7 PE: crie área de 10m onde eventos imprevisíveis acontecem (Mestre narra). Dura 3 turnos.' },
      { name: 'TODO: Habilidade Seq 5 #2', desc: '' }
    ],
    'Sequência 4': [
      { name: 'Reverter Causalidade', desc: 'Gaste 10 PE: desfaça 1 ação que aconteceu no turno anterior (incluindo dano).' },
      { name: 'TODO: Habilidade Seq 4 #2', desc: '' }
    ],
    'Sequência 3': [
      { name: 'TODO: Habilidade Seq 3 #1', desc: '' },
      { name: 'TODO: Habilidade Seq 3 #2', desc: '' }
    ],
    'Sequência 2': [
      { name: 'Tempestade de Entropia', desc: 'Gaste 15 PE: área grande sofre efeitos caóticos extremos. Todos fazem testes de Sanidade (Dif. 8).' },
      { name: 'TODO: Habilidade Seq 2 #2', desc: '' }
    ],
    'Sequência 1': [
      { name: 'Colapso da Ordem', desc: 'Gaste 25 PE: destrua completamente um sistema, estrutura ou padrão (físico ou abstrato).' },
      { name: 'Reescrever Realidade', desc: 'Gaste 30 PE e 2 Vontade: altere retroativamente 1 evento ocorrido na sessão.' }
    ]
  },
  correntes: [
    { id: 1, sequence: 'Seq. 9', titulo: 'Abraço da Desordem', beneficio: '+1 dado ao causar confusão ou caos social.', risco: 'Você também sofre -1 em testes de organização e planejamento.' },
    { id: 2, sequence: 'Seq. 8', titulo: 'TODO: Corrente Seq 8', beneficio: 'TODO', risco: 'TODO' },
    { id: 3, sequence: 'Seq. 7', titulo: 'TODO: Corrente Seq 7', beneficio: 'TODO', risco: 'TODO' },
    { id: 4, sequence: 'Seq. 6', titulo: 'TODO: Corrente Seq 6', beneficio: 'TODO', risco: 'TODO' },
    { id: 5, sequence: 'Seq. 5', titulo: 'Zona de Instabilidade', beneficio: 'Dentro de sua Zona de Caos, você ganha +2 Iniciativa.', risco: 'Aliados também são afetados por eventos aleatórios.' },
    { id: 6, sequence: 'Seq. 4', titulo: 'TODO: Corrente Seq 4', beneficio: 'TODO', risco: 'TODO' },
    { id: 7, sequence: 'Seq. 3', titulo: 'TODO: Corrente Seq 3', beneficio: 'TODO', risco: 'TODO' },
    { id: 8, sequence: 'Seq. 2', titulo: 'TODO: Corrente Seq 2', beneficio: 'TODO', risco: 'TODO' },
    { id: 9, sequence: 'Seq. 1', titulo: 'Agente do Caos Absoluto', beneficio: 'Imunidade a padrões e previsões. Ninguém pode prever suas ações.', risco: 'Você também não pode planejar com mais de 1 turno de antecedência.' }
  ],
  isSecret: true,
  allowedAgentIds: [],
  allowedUserIds: []
};

