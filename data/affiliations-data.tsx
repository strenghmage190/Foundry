export interface AffiliationBenefit {
    status: number;
    title: string;
    description: string;
    benefits: string[];
}

export interface Affiliation {
    id: string;
    name: string;
    type: 'orthodox' | 'secret';
    category: 'igreja' | 'sociedade-secreta' | 'escola';
    description: string;
    philosophy: string;
    pathways: string[];
    duties: string[];
    statusBenefits: AffiliationBenefit[];
    mechanics: {
        freeStatus?: number;
        initialBackgrounds?: {
            type: string;
            value: number;
        }[];
    };
}

export const AFFILIATIONS: Affiliation[] = [
    {
        id: 'none',
        name: 'Sem Afiliação',
        type: 'orthodox',
        category: 'igreja',
        description: 'Você não pertence a nenhuma organização formal.',
        philosophy: '',
        pathways: [],
        duties: [],
        statusBenefits: [],
        mechanics: {}
    },
    {
        id: 'noite-eterna',
        name: 'Igreja da Deusa da Noite Eterna',
        type: 'orthodox',
        category: 'igreja',
        description: 'A fé dos desamparados, dos que sofrem e dos que temem o desconhecido.',
        philosophy: 'A Deusa oferece consolo na escuridão, paz no silêncio e descanso sereno. Seus seguidores protegem segredos e selam horrores que não devem ver a luz.',
        pathways: ['trevas', 'morte'],
        duties: [
            'A Sobriedade: Proibido beber em excesso',
            'A Contenção: Selar artefatos perigosos, nunca destruir',
            'A Inimizade: Evitar relações com Igreja do Combate'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Fiel / Acólito',
                description: 'Membro reconhecido, novato nos Nighthawks',
                benefits: [
                    'Acesso aos templos como porto seguro',
                    'Materiais para rituais de purificação',
                    'Oração da Noite Serena: +1 PV temporário/semana'
                ]
            },
            {
                status: 2,
                title: 'Nighthawks / Diácono Menor',
                description: 'Agente oficial investigando distúrbios sobrenaturais',
                benefits: [
                    'Arsenal: Artefato Selado Grau 3 para missões',
                    '-1 PA em Ocultismo e Furtividade'
                ]
            },
            {
                status: 3,
                title: 'Capitão dos Nighthawks / Diácono',
                description: 'Líder de equipe com autonomia operacional',
                benefits: [
                    'Comando: 1d4 Nighthawks Seq. 9',
                    'Autoridade para selar artefatos no Portão Chanis',
                    'Ritual: Bolha de Silêncio'
                ]
            },
            {
                status: 4,
                title: 'Alto Escalão / Bispo',
                description: 'Autoridade regional com grande influência',
                benefits: [
                    'Contatos (Igreja) 3 gratuito',
                    'Biblioteca restrita: -dificuldade em pesquisas',
                    'Requisitar Artefato Grau 2 com supervisão'
                ]
            },
            {
                status: 5,
                title: 'Arcebispo / Cardeal / Santo Vivo',
                description: 'Pilar da Igreja, voz da Deusa',
                benefits: [
                    'Exército da Noite: mobilizar força massiva 1x/história',
                    'Segredos Divinos: pistas do Narrador',
                    'Guardião do Abismo: consultar Artefato Grau 1'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'combate',
        name: 'Igreja do Deus do Combate',
        type: 'orthodox',
        category: 'igreja',
        description: 'Guerreiros que veem o combate como ato sagrado. Força e glória acima de tudo.',
        philosophy: 'A paz é ilusão. Verdadeira honra só vem do campo de batalha. Fraqueza e covardia são os únicos pecados.',
        pathways: ['gigante-crepusculo', 'guerreiro', 'justiceiro'],
        duties: [
            'A Honra Acima de Tudo: Não fugir de batalha',
            'Supremacia da Força: Evitar engano/subterfúgio',
            'Rivalidade Eterna: Não cooperar com Igreja da Noite'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Recruta / Soldado',
                description: 'Soldado nas legiões da Igreja',
                benefits: [
                    'Alojamento, rações, armas de aço',
                    'Treinado em Briga automaticamente'
                ]
            },
            {
                status: 2,
                title: 'Veterano / Punidor Mandatado',
                description: 'Membro de esquadrão de elite',
                benefits: [
                    'Armas/armaduras obra-prima (+1 dado)',
                    '-1 PA em Armas Brancas, Armas de Fogo e Luta'
                ]
            },
            {
                status: 3,
                title: 'Oficial / Capitão dos Punidores',
                description: 'Líder de homens em batalha',
                benefits: [
                    'Comando: 1d6+2 soldados veteranos',
                    'Requisitar item Beyonder Grau 3',
                    'Grito de Guerra: +1 Vitalidade temporário para aliados'
                ]
            },
            {
                status: 4,
                title: 'Alto Oficial / Comandante',
                description: 'Comando de fortalezas e campanhas',
                benefits: [
                    'Contatos (Militares) 4 gratuito',
                    'Arma Beyonder Grau 2 personalizada',
                    'Aura de Liderança: aliados imunes ao medo'
                ]
            },
            {
                status: 5,
                title: 'General Divino / Mão do Deus da Guerra',
                description: 'Lenda viva, manifestação do Deus',
                benefits: [
                    'Comandar legião inteira 1x/história',
                    'Bênção: +1 Força e Vigor permanente',
                    'Favor do Arsenal: Artefato Grau 1'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'mae-terra',
        name: 'Igreja da Mãe Terra',
        type: 'orthodox',
        category: 'igreja',
        description: 'Veneradores da vida em todas formas. Curandeiros, protetores de florestas.',
        philosophy: 'O mundo é um jardim. Tudo cresce, floresce, murcha e retorna à terra. O ciclo é sagrado.',
        pathways: ['mae', 'sol', 'tirano'],
        duties: [
            'Respeito à Vida: Não destruir natureza',
            'Ciclo da Decomposição: Enterrar mortos, não cremar',
            'Colaboração e Generosidade: Ajudar comunidades'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Devoto / Iniciado',
                description: 'Membro da congregação, aprendiz',
                benefits: [
                    'Bem-vindo em comunidades agrícolas',
                    'Identificar plantas comestíveis e medicinais'
                ]
            },
            {
                status: 2,
                title: 'Curandeiro / Sacerdote Menor',
                description: 'Curandeiro reconhecido de comunidade',
                benefits: [
                    'Acesso ao Herbário: materiais raros 1x/mês',
                    '-1 PA em Medicina e Ofícios (Herbalismo)'
                ]
            },
            {
                status: 3,
                title: 'Protetor / Sacerdote Maior',
                description: 'Guardião de área sagrada',
                benefits: [
                    'Comunhão com a Terra: detectar distúrbios',
                    'Sementes Consagradas de plantas Beyonder',
                    'Bênção da Terra Fértil: garantir colheita'
                ]
            },
            {
                status: 4,
                title: 'Alto Sacerdote / Arauto da Mãe',
                description: 'Voz de autoridade para nação',
                benefits: [
                    'Status (Governo) 3 gratuito em Feynapotter',
                    'Laboratório de Vida: experimentos Seq. Semideus',
                    'Despertar Guardião: Golem de Madeira por 24h (10 PE)'
                ]
            },
            {
                status: 5,
                title: 'Voz da Terra / Santo Vivo',
                description: 'Personificação da vontade da Mãe Terra',
                benefits: [
                    'Chamar Colheita/Praga em reino inteiro 1x/história',
                    'Corpo da Mãe: renascer em árvore após 1 ano',
                    'Dádiva da Vida: ressuscitar ecossistema (1 PV permanente)'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'tempestades',
        name: 'Igreja do Senhor das Tempestades',
        type: 'orthodox',
        category: 'igreja',
        description: 'Marinheiros e soldados que veneram o poder da tempestade. Disciplina militarista.',
        philosophy: 'Poder e disciplina na fúria da natureza. Ventos que varrem fraqueza, relâmpagos que golpeiam injustos.',
        pathways: ['tirano', 'guerreiro'],
        duties: [
            'A Palavra é Lei: Hierarquia estrita, desobediência é pecado',
            'Desprezo pela Fraqueza: Evitar engano e subterfúgio',
            'Rivalidade Hostil: Não cooperar com Igreja do Sol ou Conhecimento'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Marinheiro / Grumete',
                description: 'Membro de baixo escalão em frotas',
                benefits: [
                    'Passagem em navios afiliados',
                    'Nunca sofre enjoo',
                    'Sobrevivência (Mares) 1 gratuito'
                ]
            },
            {
                status: 2,
                title: 'Oficial Menor / Guardião do Trovão',
                description: 'Patente menor em navio de guerra',
                benefits: [
                    'Acesso ao Estaleiro: reparos e mapas secretos',
                    '+2 dados em Navegação e prever tempestades',
                    'Chamado do Vento: vento favorável (2 PE)'
                ]
            },
            {
                status: 3,
                title: 'Capitão de Navio / Sacerdote da Tempestade',
                description: 'Comando de navio próprio',
                benefits: [
                    'Comando de Navio: brigue/escuna + 1d6+5 marinheiros',
                    'Artefato Grau 3: controlar correntes/névoa',
                    'Fúria do Trovão: canhões causam dano elétrico +1h'
                ]
            },
            {
                status: 4,
                title: 'Comodoro / Alto Sacerdote',
                description: 'Comando de pequena frota',
                benefits: [
                    'Status (Marinha) 4 gratuito',
                    'Coração da Tempestade: Artefato Grau 2, furacão 1x/semana',
                    'Passagem pelo Portão Azure'
                ]
            },
            {
                status: 5,
                title: 'Almirante / Mão da Tempestade',
                description: 'Lorde supremo dos mares',
                benefits: [
                    'Comandar frota principal 1x/história',
                    'Ira do Deus: +1 Vigor, elétrico ignora resistência',
                    'Chamar o Leviatã: ritual supremo'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1,
            initialBackgrounds: [
                { type: 'sobrevivencia-mares', value: 1 }
            ]
        }
    },
    {
        id: 'conhecimento',
        name: 'Igreja do Deus do Conhecimento e da Sabedoria',
        type: 'orthodox',
        category: 'igreja',
        description: 'Estudiosos que buscam a verdade através da razão. Bibliotecas e universidades.',
        philosophy: 'Ignorância é a maior maldição. Conhecimento é salvação. A magia é ciência a ser compreendida.',
        pathways: ['torre-branca', 'eremita'],
        duties: [
            'A Verdade Acima de Tudo: Não destruir conhecimento',
            'Teste do QI: Discriminação intelectual',
            'Desprezo pela Ignorância: Desafiar crenças infundadas'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Estudante / Acólito',
                description: 'Estudante em academias',
                benefits: [
                    'Acesso às bibliotecas públicas',
                    'Aprende 1 Língua Morta gratuita'
                ]
            },
            {
                status: 2,
                title: 'Pesquisador / Escriba',
                description: 'Pesquisador júnior, tradutor',
                benefits: [
                    'Acesso seção restrita: Caminhos e Artefatos básicos',
                    '-1 PA em Acadêmicos, Ocultismo e Ciências'
                ]
            },
            {
                status: 3,
                title: 'Professor / Mestre de Guilda',
                description: 'Professor universitário, autoridade',
                benefits: [
                    'Fundos para projetos e laboratório',
                    'Lacaio 2: estudante dedicado',
                    'Estudar Artefato Grau 3 supervisionado'
                ]
            },
            {
                status: 4,
                title: 'Alto Acadêmico / Guardião do Conhecimento',
                description: 'Reitor de academia, curador',
                benefits: [
                    'Contatos (Academia) 4 gratuito',
                    'Segredos Arcanos: rituais Seq. 4-3, natureza de Anjos',
                    'Tutor Privado: Mentor Semideus'
                ]
            },
            {
                status: 5,
                title: 'O Olho da Sabedoria',
                description: 'Líder supremo, mente vasta',
                benefits: [
                    'Conhecimento é Poder: 1 pergunta ao Narrador 1x/história',
                    'Decreto da Razão: declarar verdade oficial',
                    'Guardião da Primeira Placa: acesso Grau 0'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'sol',
        name: 'Igreja do Sol Ardente',
        type: 'orthodox',
        category: 'igreja',
        description: 'Cavaleiros sagrados e inquisidores. Pureza, ordem e erradicação das trevas.',
        philosophy: 'A luz revela verdade, o calor nutre vida, a chama incinera corrupção. Sem espaço para sombras.',
        pathways: ['sol', 'justiceiro'],
        duties: [
            'Intolerância às Trevas: Confrontar mortos-vivos e demônios',
            'Pureza de Corpo e Alma: Vida regrada, evitar desonra',
            'Eterna Rivalidade: Não cooperar com Tempestades ou Conhecimento'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Iniciado / Guarda do Templo',
                description: 'Novo devoto, guarda de templo',
                benefits: [
                    'Abrigos e rituais de purificação',
                    'Criar Água Benta',
                    'Ataques desarmados sagrados'
                ]
            },
            {
                status: 2,
                title: 'Guerreiro Sagrado / Inquisidor Júnior',
                description: 'Soldado ou inquisidor novato',
                benefits: [
                    'Armas de prata com runas: +1 dado vs trevas',
                    '-1 PA em Investigação e Intimidação vs criaturas noturnas'
                ]
            },
            {
                status: 3,
                title: 'Cavaleiro do Sol / Inquisidor Sênior',
                description: 'Cavaleiro condecorado, caçador',
                benefits: [
                    'Comando: 1d4+2 Guerreiros Sagrados',
                    'Bênção do Fogo Purificador: dano Agravado (5 PE)',
                    'Autoridade Inquisitorial: julgar hereges'
                ]
            },
            {
                status: 4,
                title: 'Alto Cavaleiro / Grande Inquisidor',
                description: 'Comandante, líder da Inquisição',
                benefits: [
                    'Status (Governo Intis) 3 gratuito',
                    'Artefato Grau 2: explosão de luz/purificação',
                    'Aura de Pureza: +2 dificuldade para mentir'
                ]
            },
            {
                status: 5,
                title: 'Paladino do Sol / Santo da Chama',
                description: 'Campeão sagrado, lenda viva',
                benefits: [
                    'Convocar Cruzada Solar 1x/história',
                    'Vaso Divino: +1 Presença (Fé), +1 Vigor',
                    'Palavra de Luz: Luz da Verdade sem PE 1x/sessão'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'vapor',
        name: 'Igreja do Deus do Vapor e Máquinas',
        type: 'orthodox',
        category: 'igreja',
        description: 'Inventores e engenheiros. A divindade se manifesta na criação e inovação.',
        philosophy: 'Progresso é liturgia. Uma oficina é catedral. A máquina a vapor é ato de adoração.',
        pathways: ['paragon', 'torre-branca'],
        duties: [
            'O Progresso é Sagrado: Sempre criar e inventar',
            'Lógica Acima da Superstição: Evitar magia "irracional"',
            'Cooperação com a Ordem: Amistoso com Sol e Noite em Loen'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Aprendiz / Mecânico',
                description: 'Aprendiz em guildas',
                benefits: [
                    'Acesso a ferramentas e oficinas',
                    'Ofícios (Engenharia) 1 gratuito'
                ]
            },
            {
                status: 2,
                title: 'Engenheiro / Artesão Qualificado',
                description: 'Engenheiro reconhecido',
                benefits: [
                    'Requisitar materiais de qualidade',
                    '-1 PA em Ofícios, Maquinaria e Ciência'
                ]
            },
            {
                status: 3,
                title: 'Mestre Artesão / Chefe de Oficina',
                description: 'Mestre com oficina própria',
                benefits: [
                    'Equipe: 1d4+2 aprendizes e mecânicos',
                    'Diagramas: Itens Modulares Seq. 8-7',
                    'Bênção do Forjador: imbuir criação (5 PE)'
                ]
            },
            {
                status: 4,
                title: 'Inventor de Renome / Alto Engenheiro',
                description: 'Grande inventor comparado a Roselle',
                benefits: [
                    'Contatos (Indústria) 4 gratuito',
                    'Laboratório de ponta com artefatos',
                    'Assistente Autômato: Lacaio 3'
                ]
            },
            {
                status: 5,
                title: 'Forjador Celestial / Santo da Máquina',
                description: 'Pilar da Igreja, santo do progresso',
                benefits: [
                    'Patente Divina: tecnologia sagrada produzida em massa',
                    'Inspiração Divina: diagrama de item Seq. 4- por Gênio',
                    'Coração da Máquina: mente coletiva 1x/história'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1,
            initialBackgrounds: [
                { type: 'oficios-engenharia', value: 1 }
            ]
        }
    },
    {
        id: 'moises',
        name: 'Ordem Ascética de Moisés',
        type: 'secret',
        category: 'sociedade-secreta',
        description: 'Sociedade caída de estudiosos. Numerologia Espiritual e conhecimento proibido.',
        philosophy: 'O universo é governado por leis matemáticas. Buscar iluminação através do conhecimento ascético.',
        pathways: ['eremita', 'abismo', 'enforcado'],
        duties: [
            'Voto de Silêncio: Segredo absoluto',
            'Prova Constante: Cuidado com atenção do Sábio Oculto',
            'Caçado por Todos: As Sete Igrejas te caçam'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Iniciado',
                description: 'Novo recruta em período probatório',
                benefits: [
                    'Acesso a esconderijo seguro',
                    '+1 dado em Ocultismo para decifrar textos'
                ]
            },
            {
                status: 2,
                title: 'Asceta',
                description: 'Membro pleno provado',
                benefits: [
                    'Acesso aos Manuscritos: -1 PA em Ocultismo/Acadêmicos',
                    'Disciplina Mental: 1 PV ignora surto temporário'
                ]
            },
            {
                status: 3,
                title: 'Guardião do Conhecimento',
                description: 'Protetor de segredos e artefatos',
                benefits: [
                    'Ritual Proibido da Ordem',
                    'Contato com Sábio Oculto: 1 pergunta/história (1d3 Sanidade)',
                    'Biblioteca Secreta: nomes de Anjos, fraquezas de Deuses'
                ]
            },
            {
                status: 4,
                title: 'Mestre da Célula',
                description: 'Líder de célula local',
                benefits: [
                    'Contatos (Ocultismo) 4 gratuito',
                    'Guardião de Artefato Grau 2',
                    'Vontade do Sábio: influenciar ocultação de eventos'
                ]
            },
            {
                status: 5,
                title: 'Oráculo dos Números',
                description: 'Líder supremo, comunhão constante',
                benefits: [
                    'Conhecimento Divino: pergunta sobre mecânica universal 1x/história',
                    'Manipular a Lei: editar lei matemática (25+ PE)',
                    'Imunidade à Loucura Externa, mas Sanidade Máx. 3'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'demoniaca',
        name: 'Seita Demoníaca',
        type: 'secret',
        category: 'sociedade-secreta',
        description: 'Culto do Demônio Primordial. Arautos do apocalipse e da entropia.',
        philosophy: 'Toda criação retornará ao nada. Decadência, praga e dor são manifestações da verdade universal.',
        pathways: ['demonio', 'enforcado', 'abismo'],
        duties: [
            'Acelerar o Fim: Enfraquecer estruturas sociais',
            'Caçado e Odiado: Inimigo de todas as Igrejas',
            'Tentação da Besta: Teste de Vontade vs frenesi destrutivo'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Iniciado no Fim',
                description: 'Sendo testado pela célula',
                benefits: [
                    'Ritual: conversar com a decadência',
                    '+1 dado em Intimidação'
                ]
            },
            {
                status: 2,
                title: 'Agente do Caos',
                description: 'Lealdade provada por destruição',
                benefits: [
                    'Ferramentas: venenos, doenças, explosivos',
                    'Aura de Medo: +1 dificuldade para resistir'
                ]
            },
            {
                status: 3,
                title: 'Mestre da Praga',
                description: 'Especialista em espalhar miséria',
                benefits: [
                    'Bênção do Demônio: lançar como Seq. superior 1x/sessão (1d3 Sanidade)',
                    'Praga Personalizada: criar doença sobrenatural',
                    'Toque de Entropia: acelerar decomposição'
                ]
            },
            {
                status: 4,
                title: 'Arauto do Apocalipse',
                description: 'Líder de célula terrorista',
                benefits: [
                    'Lacaios 4 gratuito: cultistas fanáticos',
                    'Artefato da Ruína Grau 2',
                    'Imunidade à Dor: sem penalidades por ferimentos'
                ]
            },
            {
                status: 5,
                title: 'A Mão Esquerda do Demônio',
                description: 'Canal direto, ameaça continental',
                benefits: [
                    'Invocar o Fim: catástrofe localizada 1x/história',
                    'Corpo da Aniquilação: RD 10, mas Sanidade Máx. 2',
                    'Sussurro da Verdade: pergunta sobre Criador (destrói mente)'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'sangue-santificado',
        name: 'Seita do Sangue Santificado',
        type: 'secret',
        category: 'sociedade-secreta',
        description: 'Nobres que fizeram pacto com o Lado Negro. Rituais de sangue e imortalidade.',
        philosophy: 'O universo luminoso é ilusão. Verdade está no vazio glorioso do Abismo.',
        pathways: ['abismo', 'lua'],
        duties: [
            'Pureza do Sangue: Não se misturar com "impuros"',
            'Dever do Sacrifício: Participar de rituais sanguíneos',
            'Guerra Sombria: Contra Igreja do Sol'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Neófito',
                description: 'Membro de família menor',
                benefits: [
                    'Primeira Consagração: +2 dados vs sagrado',
                    'Recursos 2'
                ]
            },
            {
                status: 2,
                title: 'Iniciado',
                description: 'Membro reconhecido da casa',
                benefits: [
                    'Tomos da família: -1 PA em Ocultismo',
                    'Sangue Corrompido: veneno para quem o ingere'
                ]
            },
            {
                status: 3,
                title: 'Nobre Menor',
                description: 'Título e servos sob comando',
                benefits: [
                    'Lacaios 2 gratuito',
                    'Ritual do Vínculo: ver através de servos',
                    'Segunda Consagração: desarmado causa Agravado'
                ]
            },
            {
                status: 4,
                title: 'Lorde / Herdeiro',
                description: 'Lorde ou herdeiro direto',
                benefits: [
                    'Recursos 4',
                    'Artefato do Abismo Grau 2 ancestral',
                    'Aura de Domínio: +1 dificuldade vs tentação'
                ]
            },
            {
                status: 5,
                title: 'Patriarca / Matriarca da Casa',
                description: 'Líder de grande família',
                benefits: [
                    'Comandar Seita: ritual massivo 1x/história',
                    'Canal Direto: ocultação divina por semana',
                    'Sangue como Poder: gastar Vitalidade no lugar de PE'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1,
            initialBackgrounds: [
                { type: 'recursos', value: 2 }
            ]
        }
    },
    {
        id: 'aurora',
        name: 'Ordem Aurora',
        type: 'secret',
        category: 'sociedade-secreta',
        description: 'Culto do Verdadeiro Criador. Sofrimento como catalisador para divindade.',
        philosophy: 'Todo ser pode se tornar Anjo. Sofrimento é oração. Desespero é farol para o Criador perdido.',
        pathways: ['enforcado', 'porta', 'vidente'],
        duties: [
            'Causa Acima de Tudo: Missão acima de moralidade',
            'Lunáticos em Potencial: Teste vs chamado do Criador',
            'Inimigo Público: Caçado como terrorista'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Recruta',
                description: 'Recém-recrutado em doutrinação',
                benefits: [
                    'Rede de esconderijos',
                    '+1 dado vs medo'
                ]
            },
            {
                status: 2,
                title: 'Agente',
                description: 'Agente de campo coletando recursos',
                benefits: [
                    'Fragmentos sobre Verdadeiro Criador: +1 Ocultismo (divindades)',
                    'Preparação Ritualística: identificar locais e pessoas'
                ]
            },
            {
                status: 3,
                title: 'Mártir',
                description: 'Sobreviveu a sacrifício, lidera células',
                benefits: [
                    'Bênção do Mártir: ser sacrifício dobra ritual 1x/história',
                    'Lacaios 2: desesperados recrutados',
                    'Toque da Aurora: conceder bênção menor'
                ]
            },
            {
                status: 4,
                title: 'Oráculo / Líder de Célula',
                description: 'Recebe visões diretas do Criador',
                benefits: [
                    'Visão do Criador: enigma 1x/sessão',
                    'Artefato "Divino" Grau 2',
                    'Chamado à Rebelião: instigar revoltas'
                ]
            },
            {
                status: 5,
                title: 'A Mão da Aurora',
                description: 'Líder supremo, "Anjo" preparando retorno',
                benefits: [
                    'Orquestrar Calamidade: desastre massivo 1x/história',
                    'Conexão Direta: sabe vontade dele, Sanidade Máx. 3',
                    'Anjo do Criador: transformar em Anjo (1d3 Sanidade permanente)'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    },
    {
        id: 'rose',
        name: 'Escola Rose de Pensamento',
        type: 'secret',
        category: 'escola',
        description: 'Organização dividida entre Temperança (controle) e Indulgência (liberar desejos).',
        philosophy: 'Facção Temperança: Controlar desejos domina o monstro interior. Facção Indulgência: Liberar desejos traz poder.',
        pathways: ['acorrentado', 'lua'],
        duties: [
            'Guerra Interna: Escolher Temperança ou Indulgência',
            'Dever do Desejo (Indulgência): Satisfazer desejos sombrios',
            'Inimigos Naturais: Caçados por Igrejas do Norte'
        ],
        statusBenefits: [
            {
                status: 1,
                title: 'Iniciado',
                description: 'Aceito em uma facção',
                benefits: [
                    'Rituais básicos: selos (Temperança) ou sacrifício (Indulgência)',
                    '+1 dado Sobrevivência (ambientes selvagens)'
                ]
            },
            {
                status: 2,
                title: 'Membro Juramentado',
                description: 'Ato significativo para facção',
                benefits: [
                    'Item menor: artefato anti-frenesi ou chicote sacrificial',
                    '-1 PA em Medicina e Ocultismo (mutações)'
                ]
            },
            {
                status: 3,
                title: 'Guardião / Tentador',
                description: 'Guardião de local ou recrutador',
                benefits: [
                    'Temperança: Transe anula Maldição Sequencial (5 PE)',
                    'Indulgência: Aura do Desejo (NPCs suscetíveis)',
                    'Contatos 2'
                ]
            },
            {
                status: 4,
                title: 'Mestre / Favorito da Árvore',
                description: 'Mestre da filosofia',
                benefits: [
                    'Comandar célula inteira',
                    'Artefato Grau 2 do Deus Acorrentado',
                    'Temperança: Âncora da Alma (mitigar Sanidade)',
                    'Indulgência: Bênção da Árvore Mãe'
                ]
            },
            {
                status: 5,
                title: 'Hierofante / Voz do Desejo',
                description: 'Líder supremo da facção',
                benefits: [
                    'Mobilizar facção inteira 1x/história',
                    'Favor divino: +1 Força ou Vigor',
                    'Temperança: Imune a frenesi/tentação',
                    'Indulgência: Avatar do desejo (inspirar orgia/motim)'
                ]
            }
        ],
        mechanics: {
            freeStatus: 1
        }
    }
];
