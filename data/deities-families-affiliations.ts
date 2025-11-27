/**
 * DEITIES, FAMILIES & AFFILIATIONS
 * Comprehensive reference for the Beyonders world
 * Includes all Orthodox Churches, Secret Societies, Bloodlines, and Organizations
 */

// ============================================================================
// ORTHODOX CHURCHES (7 Igrejas Ortodoxas)
// ============================================================================

export const ORTHODOX_CHURCHES = {
  EVERNIGHT_GODDESS: {
    name: "Igreja da Deusa da Noite Eterna",
    deity: "Deusa da Noite Eterna",
    aliases: ["Rainha das Trevas", "Deusa da Escuridão"],
    titles: [
      "Mãe do Ocultamento",
      "Imperatriz da Miséria e Horror",
      "Donzela do Recolhimento e do Silêncio",
      "Dama Carmesim"
    ],
    philosophy: "Senhora da noite, das sombras, morte natural e dos desvalidos. Protetora dos oprimidos e doentes terminais.",
    spheres: ["Noite", "Sombras", "Morte Natural", "Além-vida Sombrio", "Lua"],
    pathways: ["Caminho das Trevas", "Caminho da Morte"],
    characteristics: [
      "Igualdade de gênero promovida",
      "Valoriza casamento com papéis iguais",
      "Mulheres não obrigadas a usar sobrenome do marido",
      "Clérigos proibidos de beber em excesso (apenas champanhe, cerveja, vinho com moderança)"
    ],
    founded: "Quarta Época",
    influence: ["Loen", "Arquipélago Rorsted", "Zonas desértas e ilhas"],
    hierarchy: "13 Arcebispos, 9 Diáconos, 22 Cardeais, Esquadrão Nighthawks",
    sacred_artifact: "Portão Chanis",
    symbol: "Meia-lua carmesim cercada por pontos radiantes de luz",
    prayer_gesture: "4 batidas no peito, círculo no sentido horário",
    festivals: ["Dia dos Presentes de Inverno", "Missa da Lua"],
    honorary_name: "A Deusa da Noite Permanece mais alta que o cosmos e mais eterna que a eternidade. A Mãe da Ocultação, A Imperatriz do Infortúnio e do Horror, Senhora do Repouso e do Silêncio."
  },
  
  GOD_OF_COMBAT: {
    name: "Igreja do Deus do Combate",
    deity: "Deus da Guerra",
    aliases: ["Senhor da Batalha", "Lorde da Lâmina", "Badheil"],
    titles: [
      "Senhor dos Guerreiros",
      "Mestre do Conflito",
      "O Invicto"
    ],
    philosophy: "Personificação da arte da guerra, coragem heroica e disciplina marcial. Combate honrado.",
    spheres: ["Guerra", "Coragem", "Conflito Honrado", "Força Militar"],
    pathways: ["Caminho do Gigante"],
    characteristics: [
      "Fortemente masculino, desencoraja mulheres",
      "Membros tendem a gostar de combate e matança",
      "Más relações com Igreja da Deusa da Noite desde fundação",
      "Clérigos não proibidos de beber em excesso"
    ],
    founded: "Terceira Época",
    state_religion: "Império Feysac",
    hierarchy: "Punidores Mandatados (esquadrão oficial)",
    sacred_artifact: "Não mencionado especificamente",
    symbol: "Combinação de símbolo do crepúsculo e espada",
    prayer_gesture: "Soco com toda força no peito",
    honorary_name: "Símbolo de Poder e Glória, O Grande Cavaleiro Deus, Mestre da Guerra, Patrono das Armas, Crepúsculo de Todas as Coisas."
  },
  
  MOTHER_EARTH: {
    name: "Igreja da Mãe Terra",
    deity: "Mãe Terra",
    aliases: ["Deusa da Natureza", "Rainha do Solo"],
    titles: [
      "Fonte da Vida",
      "Mãe de Todas as Coisas",
      "A Terra que Sustenta"
    ],
    philosophy: "Fertilidade, ciclo natural, vida e morte. A vida é como uma planta que cresce, floresce e morre para retornar à terra.",
    spheres: ["Vida Natural", "Fecundidade", "Crescimento de Plantas", "Retorno dos Mortos à Terra"],
    pathways: ["Caminho da Mãe"],
    characteristics: [
      "Igualdade de gênero promovida",
      "Maior ênfase em reprodução como assunto sagrado",
      "Acreditam que toda vida é uma planta absorvendo nutrientes da terra",
      "Todos iguais em classificação - seguem ordens da Deusa"
    ],
    founded: "Terceira Época",
    state_religion: "Reino Feynapotter",
    hierarchy: "Freiras/Padres, estrutura cooperativa",
    sacred_artifact: "Não mencionado especificamente",
    symbol: "Bebê cercado por trigo, flores e água de nascente",
    prayer_gesture: "Mãos à frente da boca/nariz com dedos entrelaçados, palmas vazias",
    honorary_name: "A Fonte da Vida; A Mãe de Todas as Coisas; A Propagação da Terra Fértil; O Destino e o Ponto de Partida de Tudo"
  },
  
  LORD_OF_STORMS: {
    name: "Igreja do Senhor das Tempestades",
    deity: "Senhor das Tempestades",
    aliases: ["Deus da Tempestade e do Trovão", "O Ventoso", "Senhor dos Céus Turbulentos"],
    titles: [
      "Mestre das Chuvas e do Trovão"
    ],
    philosophy: "Fúria da natureza, purificação através do poder. Força e disciplina manifestados na natureza.",
    spheres: ["Ventos", "Marés", "Chuvas Torrenciais", "Tempestades", "Purificação"],
    pathways: ["Caminho do Tirano"],
    characteristics: [
      "Desencoraja igualdade de gênero",
      "Valores tradicionais: homem trabalha, mulher cuida da família",
      "Meninas não devem ir à escola, devem permanecer castas",
      "Sem membros femininos de alto escalão"
    ],
    founded: "Terceira Época",
    influence: "Imperador Feysac",
    headquarters: "Backlund até fim da Época 4, depois Ilha Pasu",
    hierarchy: "Punidores Mandatados (esquadrão oficial)",
    sacred_artifact: "Portão Azure (Azure Gate)",
    symbol: "Símbolos de vendavais e ondas tempestuosas",
    prayer_gesture: "Golpear a esquerda do peito com punho direito",
    followers: "Marinheiros, piratas, militares",
    honorary_name: "Rei dos Céus; Imperador dos Mares; Senhor da Calamidade; Deus das Tempestades"
  },
  
  GOD_OF_KNOWLEDGE: {
    name: "Igreja do Deus do Conhecimento e da Sabedoria",
    deity: "Deus do Conhecimento",
    aliases: ["Senhor da Sabedoria"],
    titles: [
      "Poder do Conhecimento",
      "Poder da Razão",
      "Deus da Sabedoria"
    ],
    philosophy: "Ignorância é a maior maldição, conhecimento é a única salvação. Busca da verdade intelectual.",
    spheres: ["Busca Intelectual", "Razão", "Verdade", "Empatia"],
    pathways: ["Caminho da Torre Branca", "Caminho do Eremita"],
    characteristics: [
      "Pratica discriminação de QI",
      "Membros mais inteligentes são mais valorizados",
      "Beyonders multitalentosos são comuns",
      "Valoriza lógica e razão acima de tudo"
    ],
    founded: "Terceira Época",
    influence: ["Lenburg", "Segar", "Masin"],
    headquarters: "Templo Sagrado do Conhecimento",
    libraries: "Vastas bibliotecas sagradas, tradução de textos antigos",
    symbol: "Olho onisciente em livro aberto",
    prayer_gesture: "Desenhando um olho no peito",
    honorary_name: "Poder do Conhecimento Poder da Razão Deus da Sabedoria!"
  },
  
  ETERNAL_BURNING_SUN: {
    name: "Igreja do Eterno Sol Ardente",
    deity: "Eterno Sol Ardente",
    aliases: ["Senhor do Sol", "O Sol Justo"],
    titles: [
      "O Sol Justo",
      "Luz do Mundo",
      "Patrono da Vida",
      "Encarnação da Ordem",
      "Deus dos Contratos",
      "Guardião dos Negócios"
    ],
    philosophy: "Luz, calor, pureza moral. Combate contra o mal sem medo. Esperança, cura e clareza.",
    spheres: ["Luz", "Calor", "Pureza Moral", "Esperança", "Cura", "Clareza"],
    pathways: ["Caminho do Sol"],
    characteristics: [
      "Catedrais têm resplandecente base dourada",
      "\"Irmão\" para homens de fé, \"Irmã\" para mulheres",
      "Alguma discriminação e desigualdade de gênero",
      "Menos severa que Igreja do Combate"
    ],
    founded: "Terceira Época",
    state_religion: "República Intis",
    headquarters: "Trier (Ilha Central)",
    influence: ["Highlands", "West Balam"],
    hierarchy: "Sacerdotes presidem festivais, Inquisição",
    symbol: "Sol abstrato feito de ouro",
    prayer_gesture: "Levantar cabeça e abrir braços como abraçando a luz",
    festivals: "Festivais ao solstício",
    honorary_name: "Eterno Sol Ardente, Luz Inextinguível, Encarnação da Ordem, Deus dos Contratos, Guardião dos Negócios."
  },
  
  GOD_OF_STEAM_MACHINES: {
    name: "Igreja do Deus do Vapor e Máquinas",
    deity: "Deus do Vapor e Máquinas",
    aliases: ["Mestre das Máquinas", "Senhor das Engrenagens", "Deus do Vapor", "Patrono da Inovação"],
    titles: [
      "O Forjador Celestial",
      "Engenheiro Divino"
    ],
    philosophy: "Tecnologia e progresso, ligando o mundo espiritual à manufatura mecânica. Razão criativa.",
    spheres: ["Tecnologia", "Progresso", "Manufatura Mecânica", "Inovação"],
    pathways: ["Caminho do Paragon"],
    characteristics: [
      "Incentiva participação de mulheres na força de trabalho",
      "Igualdade de gênero promovida",
      "Pratica: guildas de engenharia e escolas técnicas",
      "Menos Artefatos Selados que outras igrejas"
    ],
    founded: "Quarta Época (após nascimento do Deus)",
    influence: ["República Intis", "Loen", "Colônias do Continente Sul"],
    headquarters: "Templos em centros industriais urbanos",
    symbol: "Triângulo sólido com símbolos de vapor, engrenagens e alavancas",
    prayer_gesture: "Desenhar um triângulo no peito",
    honorary_name: "Incorporação da Essência Guardião dos Artesãos Brilho da Tecnologia"
  }
} as const;

// ============================================================================
// NON-ORTHODOX DEITIES
// ============================================================================

export const NON_ORTHODOX_DEITIES = {
  TRUE_CREATOR: {
    name: "Verdadeiro Criador",
    aliases: ["Deus Criador", "Deus Todo-Poderoso", "Deus Onipotente", "Criador Verdadeiro", "Fallen Creator"],
    type: "Seita Clandestina",
    philosophy: "Criador primordial, onisciência e onipotência absolutas. Responsável pela criação do universo.",
    worship: "Seitas ocultas como Ordem Aurora",
    cults: ["Ordem Aurora"],
    characteristics: [
      "Não possui templos visíveis",
      "Visto como rival dos deuses ortodoxos",
      "Raramente mencionado abertamente",
      "Culto minoritário e marginal"
    ],
    symbols: "Sol ou olho radiante (simbólico de onisciência), cetro ou globo",
    honorary_name: "O Senhor que criou tudo, o Senhor que reina por trás da cortina de sombras, a natureza degenerada de todas as coisas vivas"
  },

  GOD_OF_DEATH: {
    name: "Deus da Morte",
    aliases: ["Imperador do Submundo", "Rei dos Ossos", "Senhor das Almas"],
    type: "Culto Secreto",
    philosophy: "Morte, ocaso e pós-vida. Poder sobre cadáveres, pestes e envelhecimento rápido. Ciclo inevitável de fim e renascimento.",
    worship: "Culto secreto sediado na antiga Balam",
    characteristics: [
      "Associado a envelhecimento acelerado, pestes e necromancia",
      "Culto vinculado a necromantes antigos",
      "Totalmente clandestino",
      "Extremamente temido e repudiado"
    ],
    historic_influence: "Imperador da Legião Balam do Sul",
    symbol: "Pirâmide invertida",
    honorary_name: "A essência da Morte; Senhor dos mortos; Lar definitivo para todos os seres vivos"
  },

  HIDDEN_SAGE: {
    name: "Sábio Oculto",
    aliases: ["Espírito do Conhecimento", "Deus do Saber Proibido", "O Velho dos Números", "Mestre dos Mistérios"],
    type: "Conhecimento Proibido",
    philosophy: "Conhecimento puro e numerologia espiritual. Estrutura numérica do cosmos é sagrada. Leis ocultas do universo.",
    worship: "Ordem Ascética de Moisés",
    characteristics: [
      "Personificação do conhecimento puro",
      "Rege leis ocultas, especialmente numerologia espiritual",
      "Não possui templos visíveis",
      "Sussurra conhecimento em Beyonders",
      "99% do conhecimento do Eremita vem dele"
    ],
    danger: "Falhar em assimilar conhecimento causa loucura ou transformação em monstro",
    knowledge_quality: "Conhecimento correto mas método de entrega é pior. Pode anexar influências negativas.",
    symbol: "Olho aberto no centro de pentagrama ou hexagrama numérico",
    honorary_name: "Não especificado"
  },

  DARK_SIDE_UNIVERSE: {
    name: "Lado Negro do Universo",
    aliases: ["Senhor do Abismo", "Deus Abissal", "Primeiro Caos", "Abismo Infinito"],
    type: "Culto Maligno",
    philosophy: "Caos cósmico e destruição inevitável. Toda criação deve retornar ao vazio. Corrupção universal.",
    worship: "Congregação Sangue Sagrado",
    characteristics: [
      "Culto por famílias diabólicas (Nois, Andariel, Beria)",
      "Sem templos oficiais, apenas esconderijos",
      "Rituais de sacrifício sanguíneo",
      "Extremamente temido"
    ],
    domains: ["Abismo do Caos", "Decomposição de todas as coisas"],
    symbols: "Olho negro ou estrela de oito pontas em sombra. Mãos esqueléticas mergulhando no cosmos.",
    honorary_name: "Não especificado"
  },

  LILITH: {
    name: "Lilith",
    aliases: ["Rainha das Sombras", "Madrugada Escarlate", "Primordial Rainha Vampira", "Mãe das Trevas"],
    type: "Deusa Arquetípica",
    philosophy: "Noite, sangue, sedução e imortalidade. Poder da lua e sobrevivência eterna.",
    worship: "Cultos vampíricos secretos",
    characteristics: [
      "Ancestral dos vampiros",
      "Oferendas de sangue em altares escondidos",
      "Nome sinônimo de bruxaria",
      "Culto inteiramente oculto"
    ],
    followers: "Vampiros locais, sociedades secretas",
    symbols: "Lua vermelha ou crescente sombria com morcego estilizado. Rosas negras. Número 13.",
    representation: "Mulher jovem com olhos vermelhos e cabelos longos escuros",
    honorary_name: "Não especificado"
  },

  PRIMORDIAL_DEMON: {
    name: "Demônio Primordial",
    aliases: ["Demônia Primordial", "Mãe do Caos", "Velha do Fim", "Original dos Pesadelos"],
    type: "Ser Ancestral",
    philosophy: "Mal absoluto, caos primordial. Primeira demônia a existir, nascida do Caos antes das eras. Destino inevitável de destruição universal.",
    worship: "Seita Demoníaca (praticamente extinta)",
    characteristics: [
      "Aliadade com Deus da Morte contra deuses ortodoxos",
      "Praticamente não há culto público",
      "Qualquer menção é tabu",
      "Extremamente temida"
    ],
    symbols: "Homem ou mulher sem rosto. Espelhos quebrados. Pentagrama invertido sobre sol negro. Demônio esquelético com longos chifres.",
    honorary_name: "Não especificado"
  }
} as const;

// ============================================================================
// SECRET SOCIETIES
// ============================================================================

export const SECRET_SOCIETIES = {
  ASCETIC_ORDER_MOSES: {
    name: "Ordem Ascética De Moisés",
    founding: "Por humanos que leram Blasfêmia Ardósia",
    deity: "Sábio Oculto",
    original_status: "Respeitável, boas relações com outras igrejas",
    current_status: "Caída, transformada em culto maligno",
    philosophy: "Conhecimento puro, numerologia espiritual, leis matemáticas do universo. Máxima: 'Faça o que quiser, mas não faça mal.'",
    beliefs: [
      "Universo governado por leis matemáticas, não deuses",
      "Numerologia é a linguagem de Deus",
      "Sábio Oculto é personificação do conhecimento"
    ],
    practices: [
      "Vidas ascéticas para resistir à perda de controle",
      "Guardavam rigorosamente segredos",
      "Silêncio de cinco anos para Pryer Misterioso",
      "Recitação de livros sagrados e debates públicos"
    ],
    corrupted_by: "Sábio Oculto despertou como divindade maligna",
    current_form: "Células fragmentadas de hereges"
  },

  DEMONIC_SECT: {
    name: "Seita Demoníaca",
    founding: "Quarta Época como Família Demoníaca",
    deity: "Demônio Primordial",
    philosophy: "Não há criação, apenas queda inevitável. Adoram o fim. Acreditam Demônio Primordial é herdeira verdadeira do Criador.",
    characteristics: [
      "Originalmente só membros femininos (explicação invertida sobre herança)",
      "Começaram a recrutar pessoas não-relacionadas",
      "Transformaram em Seita Demoníaca",
      "Niilistas, terroristas, arautos do apocalipse"
    ],
    beliefs: [
      "Demônio Primordial nasceu do Caos",
      "Primeira a nascer do corpo do Criador",
      "Final definido que acaba com tudo"
    ],
    current_status: "Praticamente extinta, totalmente clandestina"
  },

  SACRED_BLOOD_SECT: {
    name: "Seita Do Sangue Santificado",
    founding: "Quarta Época como aliança de famílias diabólicas",
    deity: "Lado Negro do Universo",
    families: ["Nois", "Andariel", "Beria"],
    philosophy: "Universo luminoso dos deuses é anomalia. Verdadeira realidade reside no vazio glorioso. Consagração de sangue liga ao Abismo.",
    characteristics: [
      "Pacto antigo com Lado Negro do Universo",
      "Praticam rituais de sacrifício sanguíneo",
      "Buscam imortalidade através de consagrações",
      "Divisão tripartite de forças entre famílias"
    ],
    current_status: "Beria e Andariel enfraquecidas, vassalos de Nois desde décadas"
  },

  DAWN_ORDER: {
    name: "Ordem Aurora",
    founding: "Há 200-300 anos",
    deity: "Verdadeiro Criador",
    philosophy: "Ser humano tem qualidades divinas. Através de provação e sacrifício podem se tornar anjos. Dor é catalisador para poder.",
    characteristics: [
      "Acreditam no Verdadeiro Criador como deus original",
      "Orquestram calamidades como 'farol' para trazer deus de volta",
      "Lunáticos e mártires, terroristas com causa nobre",
      "Mantêm sacrifícios rituais"
    ],
    members: "Lunáticos, pessoas com potencial para loucura",
    reputation: "Organização terrorista ilegal",
    artefacts: "2-3 Anjos e Grade 0 Artefatos Selados",
    prayer_gesture: "Movimento baixo para cima, direita para esquerda no peito (cruz de cabeça para baixo)"
  },

  ROSE_SCHOOL_THOUGHT: {
    name: "Escola Rose de Pensamento",
    founding: "Antes da Quarta Época, formalizou início Quinta Época",
    original_deity: "Deus Acorrentado",
    current_deity: "Árvore Mãe do Desejo (após corrupção)",
    original_philosophy: "Temperança, compreensão e controle de desejos",
    philosophy: "Toda magia é arte e ciência que muda conforme vontade. Rituais sangrentos e sacrifícios primitivos.",
    factions: {
      temperance: {
        name: "Facção Temperança",
        philosophy: "Controle de desejos através da temperança",
        status: "Quase extinta, fugiu para Igreja do Louco"
      },
      indulgence: {
        name: "Facção Indulgência",
        philosophy: "Liberar desejos para ganhar poder. Sofrer para se tornar mais forte.",
        status: "Dominante, devotos de Árvore Mãe do Desejo"
      }
    },
    practices: ["Esfolação de pessoas", "Crânios de crianças em rituais", "Sacrifícios sangrentos"],
    influence: "Continente Sul",
    current_status: "Guerra interna entre facções"
  }
} as const;

// ============================================================================
// ANGEL FAMILIES & BLOODLINES
// ============================================================================

export const ANGEL_FAMILIES = {
  AUGUSTO: {
    name: "Família Augusto",
    origin: "Império Trunsoest",
    current_reign: "Reino de Loen",
    type: "Angel Family - Royal",
    pathways: ["Caminho do Justiceiro", "Caminho do Imperador Negro (secreto)"],
    philosophy: "Lei encarnada. Ordem que protege e tirania que oprime.",
    characteristics: [
      "Mestres incontestáveis do Caminho do Justiceiro",
      "Fundadores do Reino de Loen após Trunsoest",
      "Palavra é lei",
      "Nascidos para governar"
    ]
  },

  TUDOR: {
    name: "Família Tudor",
    origin: "Império Tudor (Quarta Época)",
    current_status: "Caída, em esconderijo",
    type: "Angel Family - Caídos",
    pathways: ["Caminho do Padre Vermelho"],
    philosophy: "Astutos, tortuosos, cuidadosos, mas imprudentes em momentos críticos",
    characteristics: [
      "Linhagem do Imperador de Sangue",
      "Todos herdam loucura do Imperador",
      "Foram caçados até quase extinção",
      "Alguns descendentes ainda se escondem"
    ],
    downfall: "Derrotados na Guerra dos Quatro Imperadores"
  },

  ANTIGONO: {
    name: "Família Antígono",
    origin: "Império Salomão (Quarta Época)",
    current_status: "Praticamente destruída",
    type: "Angel Family - Destruída",
    pathways: ["Caminho do Tolo"],
    founder: "Antígono, descendente de Lobo Demoníaco Flegrea e irmão de Mãe do Céu",
    history: "Apoiaram estabelecimento Império Tudor, depois caçados",
    destruction: "Destruída pelas mãos da Igreja da Deusa Evernight",
    current_state: "Sobrevivente ancestral em Cordilheira Hornacis atrai outros Beyonders do caminho Tolo"
  },

  CASTIYA: {
    name: "Família Castiya",
    origin: "Império Trunsoest",
    current_reign: "Reino Feynapotter",
    type: "Angel Family - Royal",
    pathways: ["Caminho do Justiceiro"],
    philosophy: "Ordem encarnada. Ordem não é ideal, é realidade a ser imposta.",
    characteristics: [
      "Mestres absolutos e guardiões sagrados do Caminho do Justiceiro",
      "Juízes, legisladores e carrascos",
      "Senso de dever inabalável",
      "Força sobrenatural que dobra realidade"
    ]
  },

  MEDICI: {
    name: "Família Medici",
    origin: "Império Tudor (Quarta Época)",
    current_status: "Fragmentada, secreta, espalhada pelo continente",
    type: "Angel Family - Hidden",
    ancestor: "Anjo Vermelho Medici - um dos 8 Reis dos Anjos do Deus Sol Antigo",
    pathways: ["Caminho do Padre Vermelho"],
    philosophy: "Poder através de conspiração e fogo. Objetivo: vingança contra inimigos.",
    characteristics: [
      "Genialidade para conspiração",
      "Afinidade com fogo",
      "Operacionalizam nas sombras",
      "Muitos descendentes em Bansy Harbor"
    ]
  },

  SAURON: {
    name: "Família Sauron",
    origin: "Império Trunsoest",
    current_status: "Nobreza secundária, controla militares",
    type: "Angel Family - Depostos",
    original_reign: "República Intis",
    pathways: ["Caminho do Padre Vermelho"],
    deposition: "Derrotados por Roselle Gustav em 1173",
    current_position: [
      "Perderam controle do país",
      "Ainda controlam partes das forças armadas",
      "Ainda controlam inteligência",
      "Veem-se como 'lança quebrada'"
    ]
  },

  EINHORN: {
    name: "Família Einhorn",
    origin: "Império Trunsoest",
    current_reign: "Império Feysac",
    type: "Angel Family - Royal",
    ancestor: "Descem de gigantes da antiguidade",
    pathways: ["Caminho do Deus do Combate", "Caminho do Gigante"],
    philosophy: "Poder é responsabilidade mantida através de força e dominação. Honra rígida, brutalidade em batalha.",
    characteristics: [
      "Guerreiros colossais, força sobre-humana",
      "Descendem de gigantes",
      "Desprezo por tudo 'fraco' ou 'desonroso'",
      "Governam Império Feysac"
    ],
    control: "Marinha de Feysac (Frota de Sonia)"
  }
} as const;

// ============================================================================
// SANGUINE LINEAGE
// ============================================================================

export const SANGUINE_BLOODLINE = {
  name: "Linhagem Sanguine",
  type: "Vampiros",
  description: "Verdadeira aristocracia da noite. Não meros Beyonders do Caminho da Lua, mas personificação dele.",
  origin: "Pacto primordial com entidade da noite (possivelmente Lilith)",
  lifespan: "Muito longa, alguns vivem milhares de anos",
  becoming: {
    birth: "Nascer de pais Sanguines",
    embrace: "Ritual do 'Beijo' realizado por Sanguine mais velho"
  },
  hierarchy_titles: [
    "Barão (Sequência 6)",
    "Visconde (Sequência 5)",
    "Conde (Sequência 4)",
    "Marquês (Sequência 3)",
    "Duque (Sequência 2)",
    "Rainha (Sequência 1)",
    "Lilith (Ancestral no topo)"
  ],
  characteristics: [
    "Vivem vida longa, bebem sangue, dormem em caixões",
    "Nascem com poder Sequência 7 do Caminho da Lua",
    "Podem converter humanos usando características em excesso",
    "Maturidade: plenamente controlar poder"
  ],
  distinction: "Odeiam 'vampiros artificiais' (Beyonders humanos do Caminho da Lua)",
  advancement: "Rituals e poções como humanos, mas número limitado de características torna extremamente difícil",
  reproduction: "Extremamente difícil, requer características Beyonder sobressalentes prontas",
  abilities: "Mestres de poções - Sequência 6 é Professor De Poções",
  current_dukes: "3 Duques/Sequência 2 governam o clã atualmente"
} as const;

// ============================================================================
// STATUS & HIERARCHY SYSTEMS
// ============================================================================

export const ORGANIZATION_STATUS_LEVELS = {
  LEVEL_1: {
    tier: "●",
    description: "Fiel/Acólito, Recruta, Iniciado, Devoto",
    benefits: [
      "Acesso básico a recursos",
      "Perícias iniciais da organização",
      "Acesso a templos/esconderijos seguros"
    ]
  },
  LEVEL_2: {
    tier: "●●",
    description: "Nighthawks/Diácono Menor, Veterano, Pesquisador, Curandeiro",
    benefits: [
      "Acesso a arsenais/herbários",
      "Treinamento especializado",
      "Equipamento de qualidade superior"
    ]
  },
  LEVEL_3: {
    tier: "●●●",
    description: "Capitão, Protetor, Oficial, Professor, Guardião",
    benefits: [
      "Comando de pequenas unidades",
      "Acesso a artefatos de Grau 3",
      "Rituais especializados"
    ]
  },
  LEVEL_4: {
    tier: "●●●●",
    description: "Alto Oficial/Comandante, Alto Sacerdote, Professor Sênior, Mestre",
    benefits: [
      "Influência significativa",
      "Acesso a conhecimento profundo",
      "Artefatos de Grau 2",
      "Equipes sob comando"
    ]
  },
  LEVEL_5: {
    tier: "●●●●●",
    description: "General Divino, Arcebispo/Cardeal, Santo Vivo, Oráculo",
    benefits: [
      "Poder quase supremo",
      "Acesso a Artefatos Grau 0-1",
      "Comunicação direta com divindade",
      "Influência continental"
    ]
  }
} as const;

// ============================================================================
// RELIGIOUS RELATIONSHIPS
// ============================================================================

export const RELIGIOUS_RELATIONSHIPS = {
  EVERNIGHT_vs_COMBAT: "Antagonista histórica - inimizade desde traição que levou à queda do guerreiro divino",
  EVERNIGHT_vs_DEATH: "Evitou por muito tempo",
  EVERNIGHT_vs_TEMPEST: "Relações cordiais",
  EVERNIGHT_vs_MACHINE: "Relações cordiais",
  STORM_vs_SUN: "Rivais tradicional - tríade beligerante (Tempestade, Sol, Sabedoria)",
  STORM_vs_KNOWLEDGE: "Rivais tradicional",
  SUN_vs_KNOWLEDGE: "Rivaliza - Sabedoria vista como fria",
  MACHINE_vs_SUN: "Aliados - 'deuses irmãos'",
  MACHINE_vs_STORM: "Aliados em Loen para controlar áreas costeiras",
  EARTH_vs_ALL: "Não prega antagonismo - acesso livre às outras catedrais"
} as const;

// ============================================================================
// KEY FIGURES
// ============================================================================

export const KEY_FIGURES = {
  ROSELLE_GUSTAV: {
    name: "Roselle Gustav",
    origins: "Família Gustav em declínio",
    achievements: [
      "Inventou máquina a vapor",
      "Melhorou veleiros",
      "Iniciou Revolução Industrial",
      "Lendário inventor"
    ],
    impact: "Igreja do Vapor recebeu mandamento sagrado para mudar título de 'Deus do Artesanato' para 'Deus do Vapor e Máquinas'",
    political: "Liderou revolução contra Reino Intis, derrubou monarquia, formou República Intis",
    governance: [
      "Reformou Código Penal",
      "Encorajou invenções",
      "Protegeu Revolução Industrial",
      "Aumentou força de Intis",
      "Fez Lenburg, Masini, Segar protetorados"
    ]
  }
} as const;

export type OrthodoxChurch = typeof ORTHODOX_CHURCHES[keyof typeof ORTHODOX_CHURCHES];
export type NonOrthodoxDeity = typeof NON_ORTHODOX_DEITIES[keyof typeof NON_ORTHODOX_DEITIES];
export type SecretSociety = typeof SECRET_SOCIETIES[keyof typeof SECRET_SOCIETIES];
export type AngelFamily = typeof ANGEL_FAMILIES[keyof typeof ANGEL_FAMILIES];
