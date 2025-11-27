/**
 * Descrições básicas dos Caminhos Beyonder para ajudar jogadores na seleção
 * durante a criação de personagem
 */

export const PATHWAY_DESCRIPTIONS: Record<string, {
    shortDescription: string;
    themeName: string;
    archetype: string;
    mainThemes: string[];
}> = {
    'CAMINHO DO TOLO': {
        shortDescription: 'A magia do Mistério, da Fraude e da História. Um Tolo reescreve as regras sem que ninguém perceba, rindo do conceito de realidade absoluta.',
        themeName: 'Mistério, Fraude e História',
        archetype: 'O Enganador / O Manipulador de Destino',
        mainThemes: ['Ilusões', 'Controle Mental', 'Manipulação de Tempo', 'Disfarce']
    },
    'CAMINHO DA PORTA': {
        shortDescription: 'A magia do Espaço, da Viagem e da Chave Universal. Você possui a chave para todas as portas do universo.',
        themeName: 'Espaço e Viagem',
        archetype: 'O Viajante / O Explorador',
        mainThemes: ['Teleportação', 'Portais', 'Dimensões', 'Navegação']
    },
    'CAMINHO DO ERRO': {
        shortDescription: 'A magia da Falha, do Paradoxo e do poder nas brechas da realidade. Você se alimenta das falhas da ordem.',
        themeName: 'Falha e Paradoxo',
        archetype: 'O Parasita / O Ladrão',
        mainThemes: ['Roubo de Poderes', 'Exploração de Falhas', 'Parasitismo', 'Sabotagem']
    },
    'CAMINHO DO VISIONÁRIO': {
        shortDescription: 'A magia da Mente, da Percepção e da paisagem onírica. O verdadeiro campo de batalha é o subconsciente.',
        themeName: 'Mente e Sonho',
        archetype: 'O Telepata / O Manipulador Mental',
        mainThemes: ['Telepatia', 'Sonhos', 'Manipulação Mental', 'Ilusões Psíquicas']
    },
    'CAMINHO DO SOL': {
        shortDescription: 'A magia da Luz, da Verdade e da Revelação. Você brilha com poder solar absoluto e revela o que está oculto.',
        themeName: 'Luz e Revelação',
        archetype: 'O Herói Solar / O Revelador',
        mainThemes: ['Ataques Radiantes', 'Verdade e Revelação', 'Poder Solar', 'Cura']
    },
    'CAMINHO DO TIRANO': {
        shortDescription: 'A magia do Comando, da Tempestade e do Domínio. Você comanda a chuva, o raio e a vontade de outros.',
        themeName: 'Comando e Tempestade',
        archetype: 'O Tirano / O Senhor do Clima',
        mainThemes: ['Controle do Clima', 'Raios e Trovões', 'Domínio', 'Autoridade']
    },
    'CAMINHO DA TORRE BRANCA': {
        shortDescription: 'A magia da Lógica, da Razão e da Construção. Você organiza o caos através da pura razão.',
        themeName: 'Lógica e Razão',
        archetype: 'O Erudito / O Arquiteto',
        mainThemes: ['Conhecimento', 'Construção', 'Análise', 'Lógica Pura']
    },
    'CAMINHO DO ENFORCADO': {
        shortDescription: 'A magia da Âncora, do Sacrifício e da Redenção. Você ancora o que deveria flutuar livremente.',
        themeName: 'Âncora e Sacrifício',
        archetype: 'O Mártir / O Ancião Sábio',
        mainThemes: ['Sacrifício', 'Âncoras Místicas', 'Redenção', 'Sabedoria']
    },
    'CAMINHO DAS TREVAS': {
        shortDescription: 'A magia da Noite, da Sombra e do Oculto. Você domina a escuridão e o que nela habita.',
        themeName: 'Noite e Sombra',
        archetype: 'O Predador Noturno / O Senhor das Sombras',
        mainThemes: ['Escuridão', 'Sombras', 'Visão Noturna', 'Mistério']
    },
    'CAMINHO DA MORTE': {
        shortDescription: 'A magia da Morte, do Fim e da Transição. Você comanda os falecidos e conhece o caminho para o outro lado.',
        themeName: 'Morte e Transição',
        archetype: 'O Psicopompo / O Senhor da Morte',
        mainThemes: ['Necromancia', 'Espíritos', 'Morte', 'Ressurreição']
    },
    'CAMINHO DO GIGANTE DO CREPÚSCULO': {
        shortDescription: 'A magia do Combate, da Força Bruta e do Dusk. Você é um guerreiro supremo, abençoado pela era do crepúsculo.',
        themeName: 'Combate e Força',
        archetype: 'O Campeão / O Guerreiro Divino',
        mainThemes: ['Combate Corpo-a-Corpo', 'Força Extrema', 'Resistência', 'Habilidades de Guerra']
    },
    'CAMINHO DO DEMÔNIO': {
        shortDescription: 'A magia do Desejo, da Tentação e da Corrupção. Você encarna o poder do desejo desenfreado.',
        themeName: 'Desejo e Corrupção',
        archetype: 'O Tentador / O Corruptor',
        mainThemes: ['Corrupção', 'Tentação', 'Desejo Desenfreado', 'Poder Obscuro']
    },
    'CAMINHO DO PADRE VERMELHO': {
        shortDescription: 'A magia do Ardil Vermelho, da Estratégia e da Manipulação de Conflito. Você orquestra conflitos para seu ganho.',
        themeName: 'Ardil e Estratégia',
        archetype: 'O Estrategista / O Manipulador de Conflito',
        mainThemes: ['Estratégia', 'Ardis', 'Manipulação', 'Intriga']
    },
    'CAMINHO DO EREMITA': {
        shortDescription: 'A magia do Segredo, do Ocultismo e da Sabedoria Solitária. Você conhece os mistérios do universo.',
        themeName: 'Segredo e Ocultismo',
        archetype: 'O Mago / O Eremita Sábio',
        mainThemes: ['Magia Oculta', 'Segredos', 'Ritual', 'Conhecimento Arcano']
    },
    'CAMINHO DO PARAGON': {
        shortDescription: 'A magia do Diagrama, da Construção Perfeita e do Padrão Ideal. Você encarna a perfeição através de fórmulas.',
        themeName: 'Diagrama e Perfeição',
        archetype: 'O Construtor / O Artesão Perfeito',
        mainThemes: ['Construção', 'Padrões', 'Aperfeiçoamento', 'Harmonia']
    },
    'CAMINHO DA MÃE': {
        shortDescription: 'A magia da Vida, da Nutrição e da Fertilidade. Você é uma força de vida natural e criação.',
        themeName: 'Vida e Fertilidade',
        archetype: 'A Criadora / A Mãe Protetora',
        mainThemes: ['Cura', 'Crescimento', 'Vida', 'Proteção Maternal']
    },
    'CAMINHO DA LUA': {
        shortDescription: 'A magia da Lua, da Ilusão e do Ciclo Eterno. Você flutua entre mundos como a lua entre céu e terra.',
        themeName: 'Lua e Ciclo',
        archetype: 'O Ilusionista / O Navegador Lunar',
        mainThemes: ['Ilusão', 'Ciclos', 'Maré e Gravidade', 'Visão Alterada']
    },
    'CAMINHO DO ABISMO': {
        shortDescription: 'A magia da Corrupção, da Escuridão Primordial e da Queda. Você é uma âncora para o caos primordial.',
        themeName: 'Corrupção e Abismo',
        archetype: 'O Portador da Queda / O Corrompido',
        mainThemes: ['Corrupção', 'Abismo', 'Escuridão Primordial', 'Mutação']
    },
    'CAMINHO DO ACORRENTADO': {
        shortDescription: 'A magia da Mutação, da Transformação Selvagem e do Acorrentamento. Você pode transformar a carne e o espírito.',
        themeName: 'Mutação e Transformação',
        archetype: 'O Transformista / O Mutante',
        mainThemes: ['Transformação', 'Mutação', 'Forma Selvagem', 'Transmutação']
    },
    'CAMINHO DO JUSTICEIRO': {
        shortDescription: 'A magia da Lei, da Justiça e do Julgamento Divino. Você é a manifestação viva da lei universal.',
        themeName: 'Lei e Justiça',
        archetype: 'O Juiz / O Executor de Justiça',
        mainThemes: ['Lei', 'Julgamento', 'Punição', 'Ordem Cósmica']
    },
    'CAMINHO DO IMPERADOR NEGRO': {
        shortDescription: 'A magia da Lacuna, do Domínio Absoluto e da Ausência. Você apaga o que quiser da realidade.',
        themeName: 'Lacuna e Domínio',
        archetype: 'O Imperador / O Apagador',
        mainThemes: ['Deleção', 'Domínio Absoluto', 'Lacunas', 'Poder Destrutivo']
    },
    'CAMINHO DA RODA DA FORTUNA': {
        shortDescription: 'A magia do Destino, da Sorte e da Roda Eterna. Você manipula a própria tecelã do destino.',
        themeName: 'Destino e Sorte',
        archetype: 'O Destino / O Jogador de Azar',
        mainThemes: ['Sorte', 'Destino', 'Probabilidade', 'Manipulação de Acaso']
    },
    'CAMINHO DO ÉON ETERNO': {
        shortDescription: 'A magia do Tempo Infinito, da Eternidade e da Transcendência. Você existe fora do fluxo normal do tempo.',
        themeName: 'Tempo Eterno e Transcendência',
        archetype: 'O Eterno / O Transcendente',
        mainThemes: ['Viagem no Tempo', 'Eternidade', 'Manipulação Temporal', 'Transcendência']
    },
    'CAMINHO DO VÉU': {
        shortDescription: 'A magia da Névoa, da Invisibilidade e da Fronteira entre Mundos. Você caminha entre as fendas da realidade.',
        themeName: 'Névoa e Fronteira',
        archetype: 'O Espectro / O Andarilho da Fronteira',
        mainThemes: ['Invisibilidade', 'Furtividade', 'Fronteiras', 'Dimensões Paralelas']
    }
};
