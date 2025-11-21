import { PathwayData } from '../../types';

// Caminho Secreto: CAMINHO DO VÉU
// Placeholder inicial com Correntes separadas.
export const veuData: PathwayData = {
  category: 'Mistério e Ilusão',
  pathway: 'CAMINHO DO VÉU',
  pvBase: 9,
  pvPorAvanço: 3,
  peBase: 14,
  pePorAvanço: 4,
  vontadeBonus: 1,
  sanidade: 6,
  mecanicaUnica: {
    titulo: 'Tecelagem do Véu',
    items: [
      { nome: 'Névoa Sensorial', desc: 'Você pode gastar 1 PE para obscurecer brevemente sua presença (-1 dado em testes para detectá-lo).'},
      { nome: 'Fio de Ilusão', desc: 'Marque um objeto com 1 PE; pode remotamente alterar cor/formato superficial por uma cena.'}
    ]
  },
  poderesInatos: [
    { seq: '9', nome: 'Passo Sutil', desc: '+1 dado em Furtividade ao mover-se lentamente.'},
    { seq: '8', nome: 'Olhar da Miragem', desc: 'Resistência +2 dados contra ilusões externas.'}
  ],
  formaMitica: {
    nome: 'Avatar do Véu Sombrio',
    disponivel: '(Disponível a partir da Sequência 4)',
    ativacao: 'Ação completa; consome Sanidade conforme regras gerais.',
    descricao: 'Forma envolta em mantos de sombra prismática que refratam percepção.',
    bonus: '+2 Destreza, +2 Manipulação.',
    poderes: [
      { tipo: 'Passivo', nome: 'Refração', desc: 'Ataques à distância contra você têm -1 dado.'},
      { tipo: 'Ação', nome: 'Desvanecer', desc: 'Gaste 6 PE para ficar parcialmente etéreo por 1 turno (ignora terreno difícil e recebe +2 Defesa).'}
    ]
  },
  domain: {
    description: 'Ilusões sensoriais, distorção de percepção e manipulação de presença.',
    particulas: [
      { name: 'Caligo', translation: 'Névoa', type: 'Característica', conceito: 'Obscurecer percepção com névoa mística.', exemplo: 'Ev Locus Caligo — Criar zona de névoa opaca.', uso: 'An Ivi Caligo — Reverter névoa para clarear área.'},
      { name: 'Speculum', translation: 'Reflexo', type: 'Função', conceito: 'Duplicar ou espelhar presenças.', exemplo: 'Speculum Ivi — Criar reflexo móvel de um aliado.', uso: 'As Speculum — Quebrar reflexo para dissipar cópias.'}
    ]
  },
  sequences: {
    'Sequência 9': [
      { name: 'Véu Inicial', desc: 'Gaste 2 PE para gerar penumbra ao redor (-1 Percepção inimiga).'},
      { name: 'Foco Fragmentado', desc: 'Gaste 1 PE para impor -1 dado em próximo ataque de alvo distraído.'}
    ],
    'Sequência 8': [
      { name: 'Eco Ilusório', desc: 'Gaste 3 PE para criar cópia estática (1 turno).'}
    ],
    'Sequência 7': [
      { name: 'Desalinhamento Sensorial', desc: 'Gaste 4 PE; alvo sofre -2 dados em testes baseados em visão por 2 turnos.'}
    ],
    'Sequência 6': [
      { name: 'Trama de Confusão', desc: 'Gaste 5 PE; área pequena força teste de Vontade Dif.7 ou ações desordenadas (-1 dado geral).'}
    ],
    'Sequência 5': [
      { name: 'Roubar Silhueta', desc: 'Gaste 6 PE e toque alvo; assume aparência por 10 min.'}
    ],
    'Sequência 4': [
      { name: 'Matriz do Véu', desc: 'Gaste 8 PE; tece campo que reduz bônus de mira +2 em área.'}
    ],
    'Sequência 3': [
      { name: 'Dissolver Identidade', desc: 'Gaste 10 PE; alvo esquece detalhes de você por 24h (teste Vontade resiste).'}
    ],
    'Sequência 2': [
      { name: 'Silêncio Absoluto', desc: 'Gaste 14 PE; espaço cúbico 10m sem som por 1 minuto; falhas criticamente ruidosas são anuladas.'}
    ],
    'Sequência 1': [
      { name: 'Apagar Presença', desc: 'Gaste 20 PE e 1 Vontade; remove sua existência de registros mundanos por uma cena.'}
    ]
  },
  correntes: [
    { id: 1, sequence: 'Seq. 9', titulo: 'Impulso da Névoa', beneficio: '1x cena pode ignorar penalidade de iluminação.', risco: 'Falha em testes de Furtividade expõe clarão luminescente.'},
    { id: 2, sequence: 'Seq. 8', titulo: 'Abstinência de Forma', beneficio: 'Enquanto não altera aparência ganha +1 Defesa.', risco: 'Ao assumir disfarce sofre -1 dado em ataques por 2 turnos.'},
    { id: 3, sequence: 'Seq. 7', titulo: 'Debilidade Sensorial', beneficio: 'Resiste ilusões com +1 dado.', risco: 'Excesso de estímulo causa -1 Percepção até descansar.'},
    { id: 4, sequence: 'Seq. 6', titulo: 'Trama Instável', beneficio: 'Criar ilusão concede +1 dado em próximo teste social.', risco: 'Ilusões dissipadas precocemente geram -1 em Defesas por 1 turno.'},
    { id: 5, sequence: 'Seq. 5', titulo: 'Roubo Contaminante', beneficio: 'Disfarce concede acesso a 1 perícia social do alvo.', risco: 'Ao terminar disfarce teste Vontade Dif.7 ou sofre confusão (1 turno).'},
    { id: 6, sequence: 'Seq. 4', titulo: 'Campo Resonante', beneficio: 'Dentro da Matriz do Véu ganha +1 absorção.', risco: 'Sair abruptamente remove bônus e impõe -1 absorção por 2 turnos.'},
    { id: 7, sequence: 'Seq. 3', titulo: 'Memória Fragmentada', beneficio: 'Alvos que esquecem você sofrem -1 em rastrear pistas suas.', risco: 'Você também perde 1 detalhe menor próprio temporariamente.'},
    { id: 8, sequence: 'Seq. 2', titulo: 'Silêncio Exigente', beneficio: 'Enquanto em zona silenciosa +1 iniciativa.', risco: 'Grito inesperado quebra zona e você perde 2 PE.'},
    { id: 9, sequence: 'Seq. 1', titulo: 'Ausência Total', beneficio: 'Enquanto apagado imunidade a efeitos de alvo direto.', risco: 'Retorno impõe teste Sanidade Dif.8 ou -1 Sanidade temporária.'}
  ],
  isSecret: true,
  allowedAgentIds: [],
  allowedUserIds: []
};
