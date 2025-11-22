import { AgentData, Character, Attributes, Habilidades, Attack, BeyonderAbility, Ritual, InventoryItem, Artifact, Money, Antecedente, Afiliacao, LearnedParticle, CustomizationSettings, InfernalAspect, ProtectionItem } from './types.ts';

// --- CONFIGURAÇÕES GLOBAIS DO JOGO ---
export const paRequirementsBySequence: { [key: number]: number } = {
    9: 30,
    8: 50,
    7: 65,
    6: 80,
    5: 100,
    4: 150,
    3: 200,
    2: 300,
    1: 500,
};

export const initialCharacterState: Character = {
    name: '[Sem nome]', pathway: '', sequence: 9, player: '', avatarUrl: '', anotacoes: '',
    aparencia: '', personalidade: '', historico: '', objetivo: '', ancoras: '', nomeHonorifico: '',
    pathwayColor: '#9c27b0',
    dtRituais: 15, vitality: 0, maxVitality: 0, spirituality: 0, maxSpirituality: 0,
    willpower: 0, maxWillpower: 0, sanity: 7, maxSanity: 7, 
    pa: 0, maxPa: 100,
    paDisponivel: 0, paTotalGasto: 0,
    purifiedDiceThisSequence: 0,
    assimilationDice: 0,
    maxAssimilationDice: 0,
    defense: 0, absorption: 0,
    initiative: 0,
    claimedFreeAbilitiesForSequences: [],
    controlStage: 0,
    anchors: [
        { conviction: '', symbol: '' },
        { conviction: '', symbol: '' },
        { conviction: '', symbol: '' },
    ],
    tempHpBonus: 0,
    bestialityPoints: 0,
    currentCurse: '',
    infernalAspects: [],
    furyPoints: 0,
    luckPoints: 0,
    maxLuckPoints: 0,
};
export const initialAttributesState: Attributes = {
    forca: 1, destreza: 1, vigor: 1, carisma: 1, manipulacao: 1, autocontrole: 1,
    percepcao: 1, inteligencia: 1, raciocinio: 1, espiritualidade: 1
};
export const initialHabilidadesState: Habilidades = {
    gerais: [
        { name: 'Briga', attr: 'Força', points: 0 }, { name: 'Empatia', attr: 'Percepção', points: 0 },
        { name: 'Esportes', attr: 'Destreza', points: 0 }, { name: 'Expressão', attr: 'Carisma', points: 0 },
        { name: 'Intimidação', attr: 'Autocontrole', points: 0 }, { name: 'Lábia', attr: 'Manipulação', points: 0 },
        { name: 'Liderança', attr: 'Carisma', points: 0 }, { name: 'Manha', attr: 'Manipulação', points: 0 },
        { name: 'Prontidão', attr: 'Raciocínio', points: 0 }, { name: 'Armas Brancas', attr: 'Força/Destreza', points: 0 },
        { name: 'Armas de Fogo', attr: 'Destreza', points: 0 }, { name: 'Condução', attr: 'Destreza', points: 0 },
        { name: 'Furtividade', attr: 'Destreza', points: 0 }, { name: 'Performance', attr: 'Carisma', points: 0 },
        { name: 'Sobrevivência', attr: 'Raciocínio', points: 0 },
    ],
    investigativas: [
        { name: 'Acadêmicos', points: 0, attr: 'Inteligência' }, { name: 'Ciência', points: 0, attr: 'Inteligência' }, { name: 'Direito', points: 0, attr: 'Inteligência' },
        { name: 'Empatia c/ Animais', points: 0, attr: 'Manipulação' }, { name: 'Etiqueta', points: 0, attr: 'Carisma' }, { name: 'Finanças', points: 0, attr: 'Inteligência' },
        { name: 'Investigação', points: 0, attr: 'Percepção' }, { name: 'Maquinaria', points: 0, attr: 'Inteligência' },
        { name: 'Medicina', points: 0, attr: 'Inteligência' }, { name: 'Ofícios', points: 0, attr: 'Inteligência' },
        { name: 'Política', points: 0, attr: 'Manipulação' }, { name: 'Ocultismo (Híbrida)', points: 0, attr: 'Inteligência' },
    ]
};
export const initialAttacksState: Attack[] = [];
export const initialProtectionsState: ProtectionItem[] = [];
export const initialHabilidadesBeyonderState: BeyonderAbility[] = [];
export const initialRituaisState: Ritual[] = [];
export const initialInventoryState: InventoryItem[] = [];
export const initialArtifactsState: Artifact[] = [];
export const initialMoneyState: Money = { libras: 0, soli: 0, pennies: 0 };
export const initialAntecedentesState: Antecedente[] = [];
export const initialAfiliacoesState: Afiliacao[] = [];
export const initialLearnedParticlesState: LearnedParticle[] = [];
export const initialCustomizationState: CustomizationSettings = {
    useOpenDyslexicFont: false,
    avatarHealthy: '',
    avatarHurt: '',
    avatarDisturbed: '',
    avatarInsane: '',
};


export const initialAgentData: Omit<AgentData, 'id' | 'lastModified'> = {
    agent_id: '',
    character: initialCharacterState,
    attributes: initialAttributesState,
    habilidades: initialHabilidadesState,
    attacks: initialAttacksState,
    protections: initialProtectionsState,
    habilidadesBeyonder: initialHabilidadesBeyonderState,
    rituais: initialRituaisState,
    inventory: initialInventoryState,
    artifacts: initialArtifactsState,
    money: initialMoneyState,
    antecedentes: initialAntecedentesState,
    afiliacoes: initialAfiliacoesState,
    learnedParticles: initialLearnedParticlesState,
    customization: initialCustomizationState,
};