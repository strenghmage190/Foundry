export interface Habilidade {
  name: string;
  attr: string;
  points: number;
}

export interface Habilidades {
  gerais: Habilidade[];
  investigativas: Habilidade[];
}

export interface Attributes {
  forca: number;
  destreza: number;
  vigor: number;
  carisma: number;
  manipulacao: number;
  autocontrole: number;
  percepcao: number;
  inteligencia: number;
  raciocinio: number;
  espiritualidade: number;
}

export interface CustomizationSettings {
    useOpenDyslexicFont: boolean;
    avatarHealthy: string;
    avatarHurt: string;
    avatarDisturbed: string;
    avatarInsane: string;
}



export interface Anchor {
    conviction: string;
    symbol: string;
}

export interface InfernalAspect {
    id: number;
    name: string;
    description: string;
    isLiberated: boolean;
}

export interface Character {
  name: string;
  pathway: string;
  sequence: number;
  player: string;
  avatarUrl: string;
  anotacoes: string;
  aparencia: string;
  personalidade: string;
  historico: string;
  objetivo: string;
  ancoras: string;
  nomeHonorifico: string;
  pathwayColor: string;
  dtRituais: number;
  vitality: number;
  maxVitality: number;
  spirituality: number;
  maxSpirituality: number;
  willpower: number;
  maxWillpower: number;
  sanity: number;
  maxSanity: number;
  paDisponivel: number;
  paTotalGasto: number;
  purifiedDiceThisSequence: number;
  assimilationDice: number;
  maxAssimilationDice: number;
  defense: number;
  absorption: number;
  initiative: number;
  claimedFreeAbilitiesForSequences?: number[];
  controlStage: number; // 0 a 3
  anchors: Anchor[];
  tempHpBonus?: number;
  bestialityPoints?: number;
  currentCurse?: string;
  infernalAspects?: InfernalAspect[];
  furyPoints?: number;
  luckPoints?: number;
  maxLuckPoints?: number;
}

export interface Attack {
    id: string;
    name: string;
    damageFormula: string;
    quality: 'Comum' | 'Superior' | 'Obra-Prima';
    specialQualities: string;
    enhancements: string;
    skill: string;
    attribute: string;
    secondaryAttribute?: string;
    bonusAttack: number;
    range: string;
    ammo: number;
    maxAmmo: number;
}

export interface ProtectionItem {
    id: number;
    name: string;
    armorBonus: number;
    qualities: string;
    isEquipped: boolean;
}


export interface BeyonderAbility {
    id: number;
    name: string;
    description: string;
    cost?: number | null;
    seqName?: string | null;
    acquisitionMethod?: 'free' | 'purchased';
    isDomain?: boolean;
}

export interface Ritual {
    id: number;
    name: string;
    description: string;
}

export interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    category: string;
    description: string;
    imageUrl: string;
}

export interface Artifact {
    id: number;
    name: string;
    grau: number;
    poderContido: string;
    maldicao: string;
    afinidade: string;
    ritualSelamento: string;
    imageUrl: string;
}

export interface Money {
    libras: number;
    soli: number;
    pennies: number;
}

export interface Afiliacao {
  id: string;
  name: string;
  description: string;
}

export interface Antecedente {
    id: string;
    name: string;
    description: string;
    points: number;
    details?: string;
}

export interface LearnedParticle {
    id: number;
    type: string;
    palavra?: string;
    name: string;
    description: string;

    isDomain?: boolean;
}

export interface AgentData {
    id: number;
    lastModified: string;
    character: Character;
    attributes: Attributes;
    habilidades: Habilidades;
    attacks: Attack[];
    protections: ProtectionItem[];
    habilidadesBeyonder: BeyonderAbility[];
    rituais: Ritual[];
    inventory: InventoryItem[];
    artifacts: Artifact[];
    money: Money;
    antecedentes: Antecedente[];
    afiliacoes: Afiliacao[];
    learnedParticles: LearnedParticle[];
    customization: CustomizationSettings;
}

export interface RollResult {
    rolls: number[];
    successes: number;
}

export interface DamageResult {
    total: number;
    breakdown: string;
}

export interface ToastData {
    id: number;
    type: 'success' | 'failure' | 'info';
    title: string;
    message: string; // Mensagem principal e concisa
    details?: string; // Detalhes técnicos, ocultos por padrão
    // Optional top-level damage value for logs (convenience)
    damage?: number | null;
    // Optional structured data for dice/roll displays
    rollInfo?: {
        // Separa os pools para permitir diferenciação visual
        soulRolls?: number[]; // dados "Alma"
        assimilationRolls?: number[]; // dados de Assimilação
        absorptionRolls?: number[]; // dados de Absorção (quando aplicável)
        // Fallback genérico (mantido por compatibilidade)
        rolls?: number[];
        successes?: number;
        damage?: {
            total: number;
            breakdown: string;
        } | null;
    };
}


// --- NOVOS TIPOS PARA MODULARIZAÇÃO DE DADOS ---
export interface MecanicaUnicaItem {
    nome: string;
    desc: string;
}

export interface MecanicaUnica {
    titulo: string;
    items: MecanicaUnicaItem[];
}

export interface PoderInato {
    seq: string;
    nome: string;
    desc: string;
}

export interface PoderFormaMitica {
    tipo: string;
    nome: string;
    desc: string;
}

export interface FormaMitica {
    nome: string;
    disponivel: string;
    ativacao: string;
    descricao: string;
    bonus: string;
    poderes: PoderFormaMitica[];
}

export interface MythicalFormAbility {
    name: string;
    desc: string;
}

export interface MythicalFormStage {
    tempHpBonus: number;
    attributeBoosts: { [key: string]: number };
    sanityCostPerTurn?: string; // Optional, only for 'incomplete'
    abilities: MythicalFormAbility[];
}

export interface MythicalFormData {
    incomplete: MythicalFormStage;
    complete: MythicalFormStage;
}

export interface DomainParticle {
    name: string;
    translation: string;
    type: string;
    conceito: string;
    exemplo: string;
    uso?: string;
}

export interface SequenceAbility {
    name: string;
    desc: string;
}

export interface PathwayData {
    category: string;
    pathway: string;
    pvBase: number;
    pvPorAvanço: number;
    peBase: number;
    pePorAvanço: number;
    vontadeBonus: number;
    sanidade: number;
    mecanicaUnica?: MecanicaUnica;
    poderesInatos?: PoderInato[];
    formaMitica?: FormaMitica;
    mythicalForm?: MythicalFormData;
    domain: {
        description: string;
        particulas: DomainParticle[];
    };
    sequences: Record<string, SequenceAbility[]>;
}

// Campaign type for campaigns / parties
export interface CampaignPlayer {
    userId: string;
    agentId: string;
}
export interface Background {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

export const backgrounds: Background[] = [
    {
        id: 'bg1',
        name: 'Background 1',
        description: 'Description of Background 1',
        imageUrl: 'https://example.com/bg1.jpg',
    },
    {
        id: 'bg2',
        name: 'Background 2',
        description: 'Description of Background 2',
        imageUrl: 'https://example.com/bg2.jpg',
    },
    // Adicione mais backgrounds conforme necessário
];
export interface Campaign {
    id: string;
    name: string;
    description?: string;
    gm_id: string;
    invite_code?: string;
    cover_image_url?: string | null;
}
