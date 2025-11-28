import { PathwayData } from '../../types';

// Substituído: Conteúdo do Véu atualizado para representar o Caminho do Primogênito do Caos
// OBS: arquivo permanece em './veu' para compatibilidade com permissões/SQL existentes.
export const veuData: PathwayData = {
  category: 'Caos e Corrupção Biológica',
  pathway: 'CAMINHO DO PRIMOGÊNITO DO CAOS',
  title: 'CAMINHO DO PRIMOGÊNITO DO CAOS',
  pvBase: 12,
  pvPorAvanço: 4,
  peBase: 20,
  pePorAvanço: 6,
  vontadeBonus: 0,
  sanidade: 6,
  mecanicaUnica: {
    titulo: 'O Jardim da Carne',
    items: [
      { nome: 'Alquimia de Sangue (A Colheita)', desc: 'Use seu sangue como componente: Potencializar (+50% potência) ou Corromper (efeito colateral de corrupção). Custa 1 Ponto de Corrupção Física ao usuário (nova trilha, máximo 10).' },
      { nome: 'A Forma Mutável (O Plantio)', desc: 'Gaste tempo em ritual para gastar Pontos de Corrupção Física e adquirir Dádivas Profanas temporárias (guelras, pele quitinosa, garras, etc.).' },
      { nome: 'Metástase Incontrolável (O Risco)', desc: 'Cada 5 pontos de Corrupção Física aumenta a dificuldade de testes de Vontade para resistir à perda de controle. Em 10 pontos traços se tornam permanentes.' }
    ]
  },
  poderesInatos: [
    { seq: '9', nome: 'Aura de Dominância', desc: 'Passivo: dificuldade para usar Intimidação diminui em 1; mortais de Vontade baixa hesitam.' },
    { seq: '8', nome: 'Dedo Verde', desc: 'Passivo: identifique plantas e faça-as crescer mais rápido e saudáveis.' },
    { seq: '7', nome: 'Sangue Corrompido', desc: 'Passivo: quando usado como componente em rituais de corrupção, seu sangue adiciona +1 dado ao teste de ativação.' },
    { seq: '6', nome: 'Semente de Vida', desc: 'Ativo: 1x/semana gaste 5 PE para encantar uma semente que gera criatura vegetal obediente por 1 hora.' },
    { seq: '5', nome: 'Metamorfose Inevitável', desc: 'Passivo: sua forma física altera-se permanentemente para feminina.' },
    { seq: '4', nome: 'Voz da Soberana', desc: 'Passivo: seus comandos verbais têm autoridade sobrenatural; dificuldade para resistir aumenta em 1 para alvos de Sequência inferior.' },
    { seq: '3', nome: 'Domínio da Procriação', desc: 'Ativo: gaste PE para acelerar gestação ou tornar um ser fértil (efeito a critério do Narrador).' },
    { seq: '2', nome: 'Toque da Realidade', desc: 'Ativo/Reação: 1x/sessão gaste 1 Ponto de Vontade para declarar um objeto inanimado "real" (indestrutível por cena) ou "irreal" (se desfaz).'},
    { seq: '1', nome: 'Ressurreição Profana', desc: 'Ativo/Ritual: toque em um recém-falecido e traga-o de volta. Ritual perigoso e custoso, quase sempre chamando a atenção divina.' }
  ],
  mythicalForm: {
    availableAtSeq: 4,
    name: 'A Mãe Fecunda do Pecado',
    activation: 'Ação Completa — exige Degradação de Sanidade; acumula Pontos de Corrupção Mítica',
    passive: {
      titulo: 'Aura da Fertilidade Profana',
      desc: 'Plantas crescem descontroladamente; pequenas criaturas tornam-se hostis a outros. Aliados em 10m recuperam 1 nível de Vitalidade/turno; após 3 turnos devem passar em Vontade (DT 5) ou sofrer um traço físico grotesco temporário.'
    },
    bonusesIniciais: { forca: 2, vigor: 2 },
    abilities: [
      { name: 'Nascimento de Prole', requisito: 'Seq.4', custo: '8 PE', desc: 'Sua massa corporal gera 1d3 criaturas vegetais/monstruosas que servem você até o fim da cena.' },
      { name: 'Toque da Mãe Divina', requisito: 'Seq.3', custo: '10 PE', desc: 'Toque voluntário: restaura todos os níveis de Vitalidade e cura doenças/venenos. O alvo recebe uma fraqueza permanente decidida pelo Narrador.' },
      { name: 'Velo da Realidade', requisito: 'Seq.2', custo: '5 PE (Reação)', desc: 'Anula um ataque/poder que manipule realidade/tempo/espaço na sua direção; o poder falha como se não tivesse sido ativado.' }
    ]
  },
  domain: {
    description: 'Apelidados de "Os Jardineiros Profanos": intimidação primordial, alquimia floral e manipulação da vida para propagar corrupção. Catalisador ambulante para criação, corrupção e mutação.',
    particulas: [
      { name: 'Bios', translation: 'Vida', type: 'Característica', conceito: 'Crescimento e reprodução selvagens; criação e manipulação de organismos.' },
      { name: 'Haema', translation: 'Sangue', type: 'Objeto', conceito: 'Sangue como catalisador; feitiçaria de sangue e alquimia biológica.' },
      { name: 'Profanus', translation: 'Profano', type: 'Função', conceito: 'Herético, corrupção de rituais e conceitos sagrados.' }
    ]
  },
  sequences: {
    'Sequência 9': [
      { name: 'Aura de Pavor (Ativo)', custo: '2 PE', desc: 'Gaste 2 PE: alvo na linha de visão faz teste de Vontade (DT 6) ou sofre -1 dado em todas as ações por 3 turnos.' },
      { name: 'Físico Aprimorado (Passivo)', desc: 'Ganhe +1 permanente em Força ou Vigor.' },
      { name: 'Golpe Brutal (Ativo)', custo: '3 PE', desc: 'Ataque corpo a corpo que ignora 2 pontos de Armadura; empurra alvo 2m se não tiver armadura.' }
    ],
    'Sequência 8': [
      { name: 'Conhecimento Botânico (Passivo)', desc: 'Crie poções simples (Agente Cicatrizante, Veneno de Escorpião, Agente Casca-grossa) mediante teste Inteligência + Ofícios.' },
      { name: 'Mestre das Lâminas de Poda (Passivo)', desc: 'Ferramentas de jardinagem não sofrem penalidade e causam +2 dano.' },
      { name: 'Aura do Semeador (Ativo)', custo: '2 PE', desc: '10m: plantas animadas hostis aos seus inimigos por 1 hora; terreno difícil e -1 dado em Furtividade.' }
    ],
    'Sequência 7': [
      { name: 'Ritual: Santuário de Sangue (Ativo/Ritual)', custo: '10 PE', tempo: '1h', desc: 'Santuário com bônus: custos de habilidades de vida reduzidos pela metade; Olhos da Deusa (percepção) e Vínculo Vital.' },
      { name: 'Feitiço: Forma Espectral (Ativo)', custo: '4 PE/turno', desc: 'Dentro do Santuário você torna-se intangível e invisível.' },
      { name: 'Feitiço: Animação de Sangue (Ativo)', custo: '6 PE', desc: 'Reanima cadáver como Espírito de Sangue (Força 4, Vigor 4, comportamento simples).' }
    ],
    'Sequência 6': [
      { name: 'Dádiva da Vida (Ativo/Ritual)', desc: 'Ritual íntimo que gera gestação acelerada; o feto é ingrediente místico e cria vínculo com o caster.' },
      { name: 'Criação de Sementes-Vínculo (Ativo)', custo: '3 PE', desc: 'Encante sementes para comunicação telepática e sensibilidade sobre o portador.' },
      { name: 'Cura pelo Toque (Ativo)', custo: '4 PE', desc: 'Restaura 3 níveis de Vitalidade; deixa cicatrizes grotescas; uso repetido tem risco.' }
    ],
    'Sequência 5': [
      { name: 'Grito da Banshee (Ativo)', custo: '4 PE', desc: 'Cone 10m: inimigos fazem teste de Vontade (DT 7) ou sofrem 1 Nível de Degradação de Sanidade.' },
      { name: 'Maldição Enfraquecedora (Ativo)', custo: '3 PE', desc: 'Toque/aponte: teste disputado; impõe -2 dados em testes Físicos na próxima cena.' }
    ],
    'Sequência 4': [
      { name: 'Metamorfose Inevitável (Passivo)', desc: 'Seu gênero físico altera-se para feminino permanentemente.' },
      { name: 'Invocação Profana (Ativo/Ritual)', custo: '10 PE', tempo: '1 min', desc: 'Abra uma fenda e convoque uma criatura maligna por 1 cena.' }
    ],
    'Sequência 3': [
      { name: 'Domínio da Procriação (Ativo)', desc: 'Acelere gestação ou torne um ser fértil mediante gasto de PE significativo.' }
    ],
    'Sequência 2': [
      { name: 'Velo da Realidade (Reação)', custo: '5 PE', desc: 'Anula um ataque/poder que manipule realidade/tempo/espaço.' }
    ],
    'Sequência 1': [
      { name: 'Ressurreição Profana (Ativo/Ritual)', desc: 'Ressuscitar um ser recém-falecido mediante grande sacrifício narrativo/mecânico.' }
    ]
  },
  isSecret: true,
  allowedAgentIds: [],
  allowedUserIds: []
};

