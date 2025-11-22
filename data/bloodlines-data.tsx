export interface Bloodline {
    id: string;
    name: string;
    cost: number;
    description: string;
    privileges: string[];
    curses: string[];
    mechanics: {
        freeBackgrounds?: {
            status?: number;
            recursos?: number;
            aliados?: number;
            contatos?: number;
            mentor?: number;
        };
        attributeBonus?: {
            attribute: string;
            bonus: number;
        }[];
        vitalityBonus?: number;
        skillCostReduction?: string[];
        startingSkills?: {
            skill: string;
            dots: number;
        }[];
        resistance?: {
            type: string;
            bonus: number;
        }[];
        penaltyDifficulty?: {
            situation: string;
            penalty: number;
        }[];
    };
    enemies?: {
        name: string;
        level: number;
    }[];
    pathway?: string[];
}

export const BLOODLINES: Bloodline[] = [
    {
        id: 'none',
        name: 'Sem Linhagem',
        cost: 0,
        description: 'Você é um Beyonder comum, sem herança de sangue especial.',
        privileges: [],
        curses: [],
        mechanics: {}
    },
    {
        id: 'augustus',
        name: 'Linhagem Augustus (Família Real de Loen)',
        cost: 3,
        description: 'Sangue da realeza de Loen corre em suas veias. Você carrega o peso da coroa e a arrogância da ordem.',
        privileges: [
            'Status (Nobreza de Loen) em 3',
            'Recursos em 3',
            'Conexões políticas poderosas',
            'Educação de elite (+1 em Acadêmicos e Etiqueta)',
            'Afinidade com a Lei: -1 PE em habilidades de Ordem/Liderança',
            'Dom da Autoridade: +2 dados em Intimidação e Liderança ao impor regras',
            'Mente do Legislador: Direito 1 gratuito'
        ],
        curses: [
            'Inimigo Poderoso: Forças revolucionárias e facções rivais (3 pontos)',
            'Arrogância da Ordem: -2 em testes sociais com plebeus',
            'Alvo constante de conspirações políticas',
            'Vulnerável a poderes de Caos: -2 dados vs Erro e Roda da Fortuna',
            'A Sombra do Tirano: Teste de Vontade ao avançar sequência ou torna-se opressivo'
        ],
        mechanics: {
            freeBackgrounds: {
                status: 3,
                recursos: 3
            },
            startingSkills: [
                { skill: 'direito', dots: 1 }
            ],
            resistance: [
                { type: 'ordem', bonus: 2 }
            ],
            penaltyDifficulty: [
                { situation: 'social_plebeus', penalty: 2 },
                { situation: 'caos_poderes', penalty: -2 }
            ]
        },
        enemies: [
            { name: 'Forças Revolucionárias', level: 3 }
        ],
        pathway: ['justiceiro', 'imperador-negro']
    },
    {
        id: 'sanguine',
        name: 'Linhagem Sanguine (Vampiro)',
        cost: 6,
        description: 'Você é da verdadeira aristocracia da noite. O sangue é sua herança, a noite é seu império, e a imortalidade é seu direito de primogenitura.',
        privileges: [
            'Sangue Puro: -1 PE em habilidades de Sangue e Sedução',
            'Hierarquia da Noite: +1 Status (Sociedade Sanguine)',
            'Domínio Nato: 1 habilidade adicional da sequência atual gratuita',
            'Resiliência Imortal: +1 Nível de Vitalidade, regeneração acelerada'
        ],
        curses: [
            'A Sede Profunda: Precisa se alimentar a cada 2 dias (penalidades mais severas)',
            'Vulnerabilidade à Tradição: Dano Agravado de fogo, desconforto em locais sagrados (-1 dado)',
            'A Besta Inerente: +1 dificuldade em testes para resistir frenesi'
        ],
        mechanics: {
            vitalityBonus: 1,
            freeBackgrounds: {
                status: 1
            },
            penaltyDifficulty: [
                { situation: 'frenesi', penalty: 1 },
                { situation: 'locais_sagrados', penalty: -1 }
            ]
        },
        pathway: ['lua']
    },
    {
        id: 'tudor',
        name: 'Linhagem Tudor (Os Caídos)',
        cost: 3,
        description: 'Descendente do Império Tudor caído. Seu sangue carrega o fogo de conquistadores, mas também a loucura de um império em ruínas.',
        privileges: [
            'Fogo do Imperador de Sangue: -1 PE em habilidades de Fogo e Provocação',
            'Mente do Estrategista: Liderança 1 gratuito, -1 dificuldade em conspiração',
            'Herança Fragmentada: Artefato Selado Grau 3 inicial',
            'Legado de Riqueza: Recursos 3'
        ],
        curses: [
            'A Marca dos Caçados: Inimigos (Sete Igrejas) 5 pontos',
            'A Loucura do Imperador: +2 dificuldade em Vontade vs provocação/frenesi',
            'Sangue Vigiado: +1 Dado de Corrupção em rolagens Beyonder'
        ],
        mechanics: {
            freeBackgrounds: {
                recursos: 3
            },
            startingSkills: [
                { skill: 'lideranca', dots: 1 }
            ],
            penaltyDifficulty: [
                { situation: 'vontade_provocacao', penalty: 2 }
            ]
        },
        enemies: [
            { name: 'Sete Igrejas', level: 5 }
        ],
        pathway: ['padre-vermelho']
    },
    {
        id: 'antigono',
        name: 'Linhagem Antígono (Os Tolos Perdidos)',
        cost: 5,
        description: 'Herdeiro de segredos incríveis e de uma insanidade cósmica. Mestres do Caminho do Tolo, caçados pela Igreja da Noite.',
        privileges: [
            'Sangue do Tolo: -1 dificuldade em Adivinhação e Ilusão',
            'Mestre das Marionetes Nato: Controle de Fios Espirituais na Seq. 7',
            'Herança do Vazio Histórico: Vislumbres de memórias da Quarta Época',
            'Resistência à Ordem: +2 dados vs Justiceiro'
        ],
        curses: [
            'A Loucura de Antígono: -2 Sanidade Máxima permanente',
            'Botch causa perda de controle (age como tolo)',
            'O Alvo da Meia-Noite: Inimigos (Igreja da Noite) 4 pontos',
            'Vulnerabilidade ao Caos Cósmico: Intrusões de loucura sem falha'
        ],
        mechanics: {
            resistance: [
                { type: 'justiceiro', bonus: 2 }
            ],
            penaltyDifficulty: [
                { situation: 'adivinhacao_ilusao', penalty: -1 }
            ]
        },
        enemies: [
            { name: 'Igreja da Noite Eterna', level: 4 }
        ],
        pathway: ['tolo']
    },
    {
        id: 'castiya',
        name: 'Linhagem Castiya (Lei Encarnada)',
        cost: 6,
        description: 'Família real de Feynapotter, mestres do Caminho do Justiceiro. A ordem flui de seu sangue.',
        privileges: [
            'Sangue da Justiça: -1 PE em habilidades de Ordem/Lei',
            'Autoridade Real: Status (Nobreza Feynapotter) 3',
            'Mente Ordenada: +3 dados vs Caos e Ilusão',
            'Afinidade com Território: Estabelecer território em metade do tempo, +50% área'
        ],
        curses: [
            'Rigidez Inflexível: -2 dados em enigmas/paradoxos/criatividade',
            'Inimigos da Ordem: Inimigos (Facções Caóticas) 4 pontos',
            'O Fardo do Julgamento: Teste de Vontade para não intervir em transgressões'
        ],
        mechanics: {
            freeBackgrounds: {
                status: 3
            },
            resistance: [
                { type: 'caos_ilusao', bonus: 3 }
            ],
            penaltyDifficulty: [
                { situation: 'criatividade', penalty: -2 }
            ]
        },
        enemies: [
            { name: 'Seita Demoníaca', level: 4 },
            { name: 'Escola Rose (Indulgência)', level: 4 }
        ],
        pathway: ['justiceiro']
    },
    {
        id: 'medici',
        name: 'Linhagem Medici (A Chama Vingativa)',
        cost: 4,
        description: 'Casa caída do Império Tudor, mestres da conspiração e do fogo. Caçados pela Igreja das Tempestades.',
        privileges: [
            'Sangue do Anjo Vermelho: 1 habilidade Seq. 9/8 gratuita',
            'Mestre da Conspiração: -1 dificuldade em Manha/Lábia/Investigação',
            'Afinidade com a Chama: +3 dados vs fogo, mãos imunes por 1 PE',
            'Legado de Riqueza: Recursos 3'
        ],
        curses: [
            'O Alvo da Tempestade: Inimigos (Igreja das Tempestades) 5 pontos',
            'A Chama da Arrogância: -2 dados para seguir ordens de "inferiores"',
            'O Sussurro da Vingança: Teste de Vontade vs Igreja das Tempestades ou ataca'
        ],
        mechanics: {
            freeBackgrounds: {
                recursos: 3
            },
            resistance: [
                { type: 'fogo', bonus: 3 }
            ],
            penaltyDifficulty: [
                { situation: 'conspiração', penalty: -1 }
            ]
        },
        enemies: [
            { name: 'Igreja do Senhor das Tempestades', level: 5 }
        ],
        pathway: ['padre-vermelho']
    },
    {
        id: 'sauron',
        name: 'Linhagem Sauron (A Lança Quebrada)',
        cost: 4,
        description: 'Nobreza militar caída de Intis. Poder marcial imenso, mas baixa influência política.',
        privileges: [
            'Sangue de General: -1 dificuldade em Comando/Liderança/Estratégia',
            'Mestre de Armas Nato: Proficiência em 2 categorias de armas',
            'Influência Militar: Contatos (Militares Intis) 3',
            'Resistência do Soldado: +2 dados vs exaustão/dor/medo em combate'
        ],
        curses: [
            'A Sombra de Roselle: Inimigos (Igreja do Vapor) 3 pontos',
            'Obsessão pela Glória: Teste de Vontade após derrota ou fica obcecado',
            'O Estigma do Passado: +1 dificuldade em Liderança/Diplomacia com políticos'
        ],
        mechanics: {
            freeBackgrounds: {
                contatos: 3
            },
            resistance: [
                { type: 'exaustao_combate', bonus: 2 }
            ],
            penaltyDifficulty: [
                { situation: 'comando', penalty: -1 }
            ]
        },
        enemies: [
            { name: 'Igreja do Vapor e Máquinas', level: 3 }
        ],
        pathway: ['padre-vermelho']
    },
    {
        id: 'einhorn',
        name: 'Linhagem Einhorn (Os Chifres do Império)',
        cost: 6,
        description: 'Família imperial de Feysac, descendentes de gigantes. Guerreiros colossais de força sobre-humana.',
        privileges: [
            'Sangue de Gigante: +1 Força, +1 Vigor, +1 Nível de Vitalidade',
            'Autoridade Imperial: Status (Nobreza Feysac) 3',
            'Mestre do Combate Nato: -1 PA para Luta/Armas Brancas/Liderança',
            'Afinidade com a Honra: +2 dados vs manipulação/engano'
        ],
        curses: [
            'Mente Simplória do Guerreiro: -1 em todos os atributos Mentais',
            'Desprezo pela Magia: +2 dificuldade em Ocultismo/Direito',
            'Inimizade Herdada: Inimigos (Casas Antigas) 3 pontos, teste vs atacar descendentes'
        ],
        mechanics: {
            attributeBonus: [
                { attribute: 'forca', bonus: 1 },
                { attribute: 'vigor', bonus: 1 }
            ],
            vitalityBonus: 1,
            freeBackgrounds: {
                status: 3
            },
            skillCostReduction: ['luta', 'armas-brancas', 'lideranca'],
            resistance: [
                { type: 'manipulacao', bonus: 2 }
            ],
            penaltyDifficulty: [
                { situation: 'ocultismo', penalty: 2 },
                { situation: 'atributos_mentais', penalty: -1 }
            ]
        },
        enemies: [
            { name: 'Casas Tudor/Medici/Sauron', level: 3 }
        ],
        pathway: ['deus-combate', 'gigante-crepusculo']
    }
];
