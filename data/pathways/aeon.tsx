import { PathwayData } from '../../types';

// CAMINHO DO ÉON ETERNO (Secreto)
// Dados estruturados derivados da descrição fornecida.
export const aeonData: PathwayData = {
    category: 'Éon Eterno',
    pathway: 'CAMINHO DO AEON ETERNO',
    pvBase: 10, // Versátil (10 / +4)
    pvPorAvanço: 4,
    peBase: 20, // Canalizador (20 / +6)
    pePorAvanço: 5,
    vontadeBonus: 1, // Equilibrado (+1)
    sanidade: 7, // Equilibrado indicado (7)
    mecanicaUnica: {
        titulo: 'Pontos de Estase (PEt) e Fluxo Causal',
        items: [
            { nome: 'Reserva de PEt', desc: 'Sua reserva total de Pontos de Estase (PEt) = Vigor + Espiritualidade.' },
            { nome: 'Intervenção Causal', desc: 'Reação Livre: Gaste 1 PEt ao ver qualquer rolagem; converta um extremo (1 ou 10) em 5 ou 6, estabilizando o Fado.' },
            { nome: 'Cumprimento do Fado', desc: 'Após sofrer Botch, teste Vigor + Autocontrole (Dif.8). Se vencer, gaste 2 PEt para Transferir a Culpa Causal: a falha é rerrolada contra alvo de Sequência ≤ sua (exceto Luz/Ordem).'},
            { nome: 'Dança da Finalidade', desc: 'Âncora Ritualística. Se omitida em criação de feitiços, -2 dados nos testes de ativação. Dura 5+ minutos no início/fim de rituais.' },
            { nome: 'Lei Inevitável (Progressão)', desc: 'Avanço por PA obtidos via coerção do destino, sacrifício pessoal e cumprimento das Correntes de Fado.' }
        ]
    },
    poderesInatos: [
        { seq: '9', nome: 'Flexibilidade Mística', desc: '+1 dado em testes de Esportes envolvendo acrobacia, equilíbrio ou fuga.' },
        { seq: '8', nome: 'Resistência Ascética', desc: '+2 dados para resistir Fadiga física/mental; ignora penalidades de clima não mágico.' },
        { seq: '7', nome: 'Língua Mística do Destino', desc: 'Compreende qualquer contrato/acordo mágico, identificando brechas e obrigações.' },
        { seq: '6', nome: 'Acúmulo de Poder', desc: 'Uma vez por cena comprime um ritual/habilidade para ativá-lo como Reação futura.' },
        { seq: '5', nome: 'Afinidade com Fragmentos', desc: 'Pode armazenar até 3 Fragmentos de Fado (acima do limite normal).'},
        { seq: '4', nome: 'Consciência Cíclica', desc: 'Nunca é surpreendido; +2 permanente na Iniciativa.'},
        { seq: '3', nome: 'Couro da Aflição', desc: 'RD 2 contra todos os tipos de dano; +2 dados para resistir tortura/intimidação.'},
        { seq: '2', nome: 'Maestria Causal', desc: 'Custo em PEt para manipulação de dados reduzido pela metade (mín.1).'},
        { seq: '1', nome: 'Farol do Destino', desc: 'Uma vez por sessão declara uma ação de um oponente como fadada ao fracasso: falha automática.'}
    ],
    formaMitica: {
        nome: 'Gigante da Trindade Causal',
        disponivel: '(Disponível a partir da Sequência 4)',
        ativacao: 'Ação completa, causa Degradação de Sanidade e acumula Corrupção Mítica (custos variam por Sequência).',
        descricao: 'Forma colossal de 5m encarnando Passado (Pecador), Presente (Sofredor) e Futuro (Redentor). Três cabeças, seis braços e aura de causalidade que pesa sobre todos.',
        bonus: '+2 Espiritualidade, +2 Vigor.',
        poderes: [
            { tipo: 'Passivo', nome: 'Presença Causal - Seq.4', desc: 'Extremos (Botch/Critical) em rolagens a 15m tornam-se falha ou sucesso normal.' },
            { tipo: 'Ação', nome: 'Reencenar o Sofrimento - Seq.3', desc: 'Gaste 8 PE. Ataque Espiritualidade + Intimidação vs Vontade. Sucesso: alvo revive dor máxima, sofre 2 Degradação de Sanidade e fica paralisado 1 turno.' },
            { tipo: 'Reação', nome: 'Corrente do Pecado - Seq.2', desc: 'Gaste 5 PE ao ser atacado. Teste Espiritualidade vs Autocontrole do atacante; penalidade nos dados do ataque = seus sucessos, enquanto encara seus pecados.' },
            { tipo: 'Ação', nome: 'Decretar Redenção - Seq.1', desc: 'Gaste 10 PE e 1 Vontade. Toca aliado, removendo penalidades, condições negativas e restaurando até 3 níveis de Vitalidade.' }
        ]
    },
    domain: {
        description: 'Sentença, Fardo e Ciclo: imposição de resultados inevitáveis, contratos e loops causais que moldam destino e repetição.',
        particulas: [
            { name: 'Fatum', translation: 'Fado/Sentença', type: 'Objeto/Característica', conceito: 'Essência da causalidade como decreto inevitável.', exemplo: 'Im Ivi Fatum — Declara que alvo irá se ferir; realidade conspira.', uso: 'An Ivi Fatum — Declara que destino era não ter sido ferido; ferimento fecha gerando débito cósmico.' },
            { name: 'Onus', translation: 'Fardo/Ônus', type: 'Objeto', conceito: 'Lei de que todo poder requer preço; origem de pactos e sacrifícios.', exemplo: 'Ev Onus — Vincula um fardo conceitual a uma criatura em troca de serviço.', uso: 'Lues Ani Onus — Impõe fardo espiritual esmagando a Vontade do alvo.' },
            { name: 'Anados', translation: 'Ciclo/Retorno', type: 'Função', conceito: 'Função primordial da repetição: loops, padrões, reencarnação.', exemplo: 'Anados Locus — Grava estado de área e define gatilho para retorno.', uso: 'As Anados — Destrói ciclo recorrente (maldição, ressurreição, padrão emocional).' }
        ]
    },
    sequences: {
        // Habilidades compráveis e chave por Sequência
        'Sequência 9: Dançarino': [
            { name: 'Dança de Invocação', desc: 'Ritual 1 min. Sangue (1 dano superficial) + 3 PE. Invoca espírito menor concedendo traço por 3 turnos; expulsão exige Vontade Dif.6.' },
            { name: 'Visão Rítmica', desc: 'Gaste 1 PEt. Transe por uma cena: vê auras/destino; +2 dados Percepção + Ocultismo para perigos ocultos.' },
            { name: 'Dança Enigmática', desc: 'Gaste 3 PE. Por 3 turnos inimigos têm -1 dado contra você e adivinhação/leitura de mente +2 dificuldade.' },
            { name: 'Pirueta Evasiva', desc: 'Reação a ataque. Gaste 2 PE. Adiciona Inteligência à parada de Defesa.' },
            { name: 'Canalização de Memórias', desc: 'Ritual sobre cadáver (<24h) gaste 5 PE; obtém visão vívida de uma memória final.' }
        ],
        'Sequência 8: Monge Eremita': [
            { name: 'Ritual de Profecia', desc: '10 min em cadáver (<7 dias). Gaste 5 PE; responde 3 perguntas sobre futuro (enigmáticas).' },
            { name: 'Transferência de Infortúnio', desc: 'Ritual 1 min gaste 4 PE. Imbuir objeto com azar; primeiro a aceitar sofre -2 na próxima ação; melhora sua sorte narrativa.' },
            { name: 'Substituição de Fado', desc: 'Ritual 1h + 1 Vontade. Por 1 semana redireciona vingança/maldição/rastreamento com chance 50% para substituto.' },
            { name: 'Exorcismo', desc: 'Ritual 1h gaste 6 PE + nome e item do espírito; bane definitivamente entidade.' },
            { name: 'Criação Animal', desc: 'Gaste 5 PE. Cobre alvo com pele; transforma em animal por até 1h mantendo mente.' }
        ],
        'Sequência 7: Contratado': [
            { name: 'Forjar Contrato', desc: 'Ritual narrativo: teste Manipulação + Ocultismo. Sucesso: ganha 1 habilidade da entidade, paga preço e aceita maldição permanente. Máx contratos = Espiritualidade.' },
            { name: 'Visão do Destino Aprimorada', desc: 'Intuição mais precisa: vislumbre narrativo específico em sucesso.' },
            { name: 'Dança de Poder Aprimorada', desc: 'Dança de Invocação atrai entidades mais fortes; duração passa a 1 min.' },
            { name: 'Resistência Contratual', desc: 'Teste Vontade Dif.7 para ignorar penalidades de ambientes extremos não mágicos por cena.' },
            { name: 'Revisar Cláusulas', desc: 'Reação 1x sessão. Gaste 4 PE para rerrolar resistência contra poderes de ordem/compulsão.' }
        ],
        'Sequência 6: Asceta': [
            { name: 'Compressão Mental', desc: 'Livre: suprime emoção/penalidade de Corrente. Teste Autocontrole Dif.7; próxima liberação adiciona +1d6 dano de Sanidade.' },
            { name: 'Compressão de Força', desc: 'Ação completa gaste 5 PE. Carrega por até 3 turnos; libera como Reação tornando-se gigante +2 Força/Vigor e ataque desarmado Letal por 2 turnos.' },
            { name: 'Ritual Compresso', desc: 'Gaste 4 PE para versão instantânea reduzida de ritual Seq.8 (efeitos atenuados).'},
            { name: 'Reserva Causal', desc: 'Prazo da Transferência de Infortúnio estendido de 3 para 13 dias.' },
            { name: 'Quietude da Neve', desc: 'Imunidade total a ambientes extremos não mágicos.' }
        ],
        'Sequência 5: Apropriador do Destino': [
            { name: 'Observação do Destino', desc: 'Ação gaste 4 PE. Percepção + Ocultismo Dif.7 revela fatos/futuros conforme sucessos.' },
            { name: 'Apropriação de Fado', desc: 'Toque + teste Espiritualidade vs Vontade. Sucesso: rouba Fragmento (memória, bênção, chance). Máx 3 armazenados.' },
            { name: 'Troca de Fado', desc: 'Toque gaste 5 PE. Substitui fragmento do alvo por um que você carrega de peso equivalente.' },
            { name: 'Maldição de Destino Ampliado', desc: 'Gaste 3 PEt para aumentar probabilidade de evento simples ocorrer em 3 turnos.' },
            { name: 'Ritual de Fado Corrompido', desc: '10 min + 8 PE + amostra; impõe direção geral negativa de curto prazo ao destino do alvo.' }
        ],
        'Sequência 4: Habitante do Círculo': [
            { name: 'Criar Círculo de Destino', desc: 'Ação completa gaste 8 PE. Define Estado Ancorado, Condição e Ciclos (3 a Espiritualidade). Retrocede tempo local ao ancorado.' },
            { name: 'Apropriação Instantânea', desc: 'Melhora: Apropriação de Fado vira Ação Livre (mantém teste).'},
            { name: 'Troca Incondicional', desc: 'Gaste 5 PE. Troca de Fado sem contato físico, instantânea.' },
            { name: 'Filtro da Clarividência', desc: 'Filtra informações irrelevantes ou perigosas ao Observar Destino.' },
            { name: 'Rebobinar Aspecto', desc: 'Ao criar Círculo pode gastar +2 PE para retroceder apenas Corpo, Mente ou Espírito.' }
        ],
        'Sequência 3: Sofredor': [
            { name: 'Reencenar Sofrimento', desc: 'Gaste 7 PE. Ataque Espiritualidade + Empatia vs Vontade: Dor Física 4d10 Agravado ou Dor Mental 2 Degradações.' },
            { name: 'Ancorar o Presente', desc: 'Reação 1x cena gaste 5 PE. Cancela efeito de alteração mental sem ativar gatilhos de loops.' },
            { name: 'Maestria dos Ciclos', desc: 'Mantém até 2 Círculos simultâneos; max ciclos = Espiritualidade x2.' },
            { name: 'Santuário da Dor', desc: 'Gaste 10 PE. Designa aliado: todo dano físico dele vai para você; dano de Sanidade seu vai para ele (1h).' }
        ],
        'Sequência 2: Pecador': [
            { name: 'Regressão Temporal', desc: 'Gaste 12 PE + 1 Vontade. Assume estado de Sequência anterior por uma cena (não usa poderes atuais).'},
            { name: 'Implantar Causa Virtual', desc: 'Gaste 8 PE + 3 PEt. Cria causa falsa que gera efeito imediato (teste Espiritualidade vs Vontade).'},
            { name: 'Ancorar Pecado', desc: 'Gaste 7 PE. Revela pecado passado do alvo; por 3 turnos dificuldade de suas habilidades contra ele -2.' },
            { name: 'Passado Indestrutível', desc: 'Reação Livre 1x cena ao ser reduzido a 0 Vitalidade: ignora dano e reposiciona até 10m.' },
            { name: 'Corpo Dual', desc: 'Forma Mítica mais estável: pode apropriar seres de nível Anjo (teste) e reencenar dois sofrimentos simultaneamente.' }
        ],
        'Sequência 1: Anjo da Redenção': [
            { name: 'Decretar Destino', desc: 'Gaste 15 PE + 2 Vontade. Declara resultado plausível em alvo; acontece automaticamente.' },
            { name: 'Mergulho no Rio do Destino', desc: 'Gaste 10 PE. Fuga do Fim (reação salvadora única) ou Autoredengção (remove 1 Corrente/Maldição).'},
            { name: 'Criar Possibilidade', desc: 'Uso épico. Gaste 50 PE + toda Vontade + 1d3 Sanidade permanente. Cria novo afluente milagroso.' },
            { name: 'Presença do Juízo Final', desc: 'Habilidades baseadas em sorte contra você têm dificuldade +3.' },
            { name: 'Forma Trina', desc: 'Evolução final: acesso simultâneo a 1 habilidade de cada Sequência anterior de Semideus/Anjo enquanto transformado.' }
        ]
    },
    correntes: [
        {
            id: 1,
            sequence: 'Sequência 9',
            titulo: 'Compulsão Rítmica',
            beneficio: 'O Ritmo do Mundo: Seu corpo ressoa com o fluxo da causalidade. Uma vez por cena, ao realizar uma ação baseada em Esportes ou Furtividade, você pode gastar 1 PEt para rolar novamente qualquer dado que tenha falhado no teste. O destino corrige seu passo.',
            risco: 'A Dança Incontrolável: Ao testemunhar caos, violência ou grande sofrimento, você deve passar num teste de Vontade (Dif. 6). Se falhar, é magicamente compelido a dançar, perdendo sua próxima ação e atraindo atenção indesejada.'
        },
        {
            id: 2,
            sequence: 'Sequência 8',
            titulo: 'Abstinência Forçada',
            beneficio: 'A Alma Desapegada: Enquanto você estiver cumprindo sua abstinência (recusando luxos e excessos), seu espírito se fortalece. Você ganha +1 dado em todos os testes de Vontade para resistir a poderes de tentação ou controle mental.',
            risco: 'O Fardo da Pobreza: Ao consumir qualquer item ou serviço luxuoso, você sofre uma penalidade cumulativa de -1 Dado em todos os testes Sociais até realizar um ato de caridade significativo (a critério do Narrador).'
        },
        {
            id: 3,
            sequence: 'Sequência 7',
            titulo: 'A Lição do Fado',
            beneficio: 'Eficiência do Cobrador: Seu entendimento do sacrifício torna sua coerção mais eficiente. O custo em PE para qualquer habilidade sua que imponha uma maldição ou fardo a um alvo é reduzido em 1 (mínimo 1).',
            risco: 'O Combustível da Dor: Sua conexão com a causalidade agora depende de transferir fardos. Você não recupera PEt com descanso. A única forma de recuperá-los é através da mecânica Colhendo o Fado: uma vez por sessão, quando você sofre uma consequência negativa por causa de uma de suas Correntes de Fado, você recupera 1d3 PEt.'
        },
        {
            id: 4,
            sequence: 'Sequência 6',
            titulo: 'Erupção Irrestrita',
            beneficio: 'Poder Comprimido: Ao usar uma habilidade de "Erupção" (liberar poder acumulado), ela se torna mais potente. Você adiciona +2 ao seu dano ou efeito final.',
            risco: 'Transbordamento Causal: Após usar uma habilidade de "Erupção", a energia residual ameaça transbordar. Você deve fazer um teste de Autocontrole (Dif. 7). Se falhar, você perde o controle e é forçado a usar sua próxima ação para atacar o alvo mais próximo (amigo ou inimigo) com um ataque básico.'
        },
        {
            id: 5,
            sequence: 'Sequência 5',
            titulo: 'Obsessão Roubada',
            beneficio: 'Ladrão de Destinos: Sua maestria em roubar o fado é inigualável. A dificuldade para os alvos resistirem às suas habilidades de Apropriação ou Troca de Destino diminui em 1.',
            risco: 'O Eco do Fado: Ao roubar um Fragmento de Destino de alguém, você não rouba apenas a sorte, mas um eco de sua essência. Você deve fazer um teste de Vontade (Dif. 7) ou desenvolverá uma compulsão menor ou tique narrativo ligado ao destino roubado por 24 horas (ex: roubar o destino de um jogador e se tornar viciado em cartas; roubar de um assassino e se tornar paranoico).'
        },
        {
            id: 6,
            sequence: 'Sequência 4',
            titulo: 'Estigma da Burocracia Cósmica',
            beneficio: 'Eficiência Burocrática: Seus Ciclos de Destino (Loops) são mais estáveis. O custo em PE para manter um loop ativo a cada turno é reduzido em 1.',
            risco: 'Taxa de Processamento: O Fado exige "papelada". Criar um Loop é uma ação completa. Se desejar criar um segundo Loop no mesmo dia, você deve realizar um ritual de 10 minutos e pagar um custo adicional de 2 PEt para "acelerar o processo" na burocracia cósmica.'
        },
        {
            id: 7,
            sequence: 'Sequência 3',
            titulo: 'Reflexo de Tormento',
            beneficio: 'Colheita da Dor: Você aprendeu a transformar agonia em poder. Sempre que você sofre dano Letal ou Agravado, você imediatamente recupera uma quantidade de PEt igual ao número de níveis de vitalidade perdidos.',
            risco: 'A Alma Inquieta: Sua mente só encontra clareza no sofrimento. Você não recupera Pontos de Vontade temporários com descanso ou paz. A única maneira de recuperá-los é sofrendo dano em combate ou participando de uma cena de grande angústia pessoal.'
        },
        {
            id: 8,
            sequence: 'Sequência 2',
            titulo: 'Abismo do Passado',
            beneficio: 'Foco Superior: Sua mente angelical está focada no poder superior. A dificuldade para usar qualquer habilidade da Sequência 2 ou superior diminui em 1.',
            risco: 'Rejeição dos Pactos Menores: O poder do Passado rejeita os acordos do passado. Usar qualquer habilidade advinda de seus Contratos (Seq. 7) agora custa um adicional de +1 PEt por uso, como se você estivesse forçando uma conexão que o Fado considera obsoleta.'
        },
        {
            id: 9,
            sequence: 'Sequência 1',
            titulo: 'Sacrifício do Éon',
            beneficio: 'Aura de Salvação: Sua presença é um farol de esperança contra o desespero. Aliados que possam vê-lo ganham +1 dado em todos os testes para resistir a medo, loucura ou perda de controle.',
            risco: 'O Dever da Redenção: Você deve realizar uma Prece da Redenção diária por um ser destinado ao sofrimento. Se você ignorar este ritual por 24 horas, na próxima vez que um aliado estiver prestes a morrer em sua presença, você será magicamente compelido a usar sua reação para se sacrificar no lugar dele, assumindo o golpe fatal.'
        }
    ],
    isSecret: true,
    allowedAgentIds: [],
    allowedUserIds: []
};
