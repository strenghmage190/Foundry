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
  pathway?: string | string[]; // DEPRECATED: mantido para compatibilidade com dados antigos
  pathways?: {
    primary: string; // Caminho principal
    secondary: string[]; // Caminhos secundários
  };
  pathwayDisplayName?: string; // Nome alternativo para exibição pública (ex: "Roda da Fortuna" para "Éon Eterno")
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
  pa: number;
  maxPa: number;
  paDisponivel: number;
  paTotalGasto: number;
  purifiedDiceThisSequence: number;
  assimilationDice: number; // Infinito por padrão (loucura - o padrão)
  maxAssimilationDice: number;
  soulDice: number; // Brancos: ganhos apenas por purificação
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
  // Pontos de Estase (Caminho do Éon Eterno)
  estasePoints?: number;
  maxEstasePoints?: number;
  // Correntes de Fado ativas (IDs das correntes)
  activeCorrentesIds?: number[];
  // Linhagem e Afiliação (novo sistema)
  bloodline?: string; // Nome da linhagem escolhida
  bloodlineCost?: number; // Custo em PB da linhagem
  affiliation?: string; // Nome da organização/afiliação
  affiliationStatus?: number; // Nível de status na organização (1-5)
  origin?: string; // Origem do personagem
  concept?: string; // Conceito do personagem
    // Companheiro Beyonder (opcional)
    companion?: {
        type: 'humano' | 'animal';
        origin?: 'Despertado' | 'Herdeiro' | 'Antigo';
        biologicalMold?: 'Predador Ápice' | 'Predador Astuto' | 'Sobrevivente Adaptável';
        pathway?: string;
        attributes?: Attributes;
        skills?: Record<string, number>;
        habilidadesBeyonder?: BeyonderAbility[];
        learnedParticles?: LearnedParticle[];
        basePE?: number;
        mechanics?: {
            naturalAttack: string; // e.g., '1d6 + Força (Letal)'
            naturalArmor: number; // Bônus de armadura
            sixthSense: boolean; // Re-roll 1s/2s on Perception
            socialPenalty: number; // -2 dice on social tests
            intimidationBonus: number; // +1 dice on Intimidation vs lower INT
            cannotUseTools: boolean; // Cannot use tools/weapons without hands
            stealthAdvantage: boolean; // Perfect Disguise
            moldAptitude?: {
                type: 'briga' | 'furtividade' | 'pressentir';
                bonus: string;
                description: string;
            };
            moldWeakness?: {
                type: 'prontidao' | 'vigor' | 'combat';
                penalty: number;
                description: string;
            };
            originBonus?: {
                type: 'vinculo' | 'conhecimento';
                bonus: number | string;
                description: string;
            };
        };
        primalPath?: {
            seq7: { name: string; unlocked: boolean; description: string };
            seq5: { name: string; unlocked: boolean; description: string };
            seq4: { name: string; unlocked: boolean; description: string };
            seq2: { name: string; unlocked: boolean; description: string };
        };
    };
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
    na?: number; // Nível de Acesso (opcional, para compatibilidade com itens antigos)
    peso?: number; // Peso em espaços (opcional, para compatibilidade com itens antigos)
    origem?: string; // Origem do item (equipamento externo ou item customizado)
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

export interface BackgroundValues {
    aliados: number;
    recursos: number;
    contatos: number;
    mentor: number;
    status: number;
}

export interface LearnedParticle {
    id: number;
    type: string; // "Universal" ou "Domínio"
    palavra?: string;
    name: string;
    description: string;
    isDomain?: boolean;
    isCorrupted?: boolean; // Para partículas corrompidas (falha crítica ao estudar)
    acquisitionMethod?: 'innate' | 'study' | 'revelation' | 'universal'; // Inclui método universal
    associatedSkill?: string; // Habilidade investigativa associada (para partículas universais)
    arcanaName?: string; // Nome do Arcano Pessoal (para partículas de revelação)
}

export interface AgentData {
    agent_id: string;
    id: number;
    lastModified: string;
    // Optional privacy flag mirrored from DB column `agents.is_private`
    isPrivate?: boolean;
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
    backgrounds?: BackgroundValues; // Novo sistema de antecedentes
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
    // Campos opcionais para caminhos secretos
    isSecret?: boolean; // se true, não aparece para todos
    allowedAgentIds?: number[]; // agentes específicos que podem ver
    allowedUserIds?: string[]; // usuários (supabase auth user id) que podem ver
    // Correntes de Fado / Correntes específicas de caminhos
    correntes?: {
        id: number; // ordem
        sequence: string; // ex 'Seq. 8'
        titulo: string; // nome da corrente
        beneficio: string; // efeito positivo
        risco: string; // efeito negativo / custo
    }[];
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

// Simple user profile persisted in `user_profiles`
export interface UserProfile {
    displayName: string;
    pronouns: string;
    useOpenDyslexicFont: boolean;
    avatarPath: string | null;
    highlightColor: string;
}

// Inimigo/NPC simplificado para combates
export interface EnemyAbility {
    name: string;
    actionType: 'Ação Principal' | 'Ação Livre' | 'Reação' | 'Passivo';
    description: string;
    effects?: string;
}

export interface CreatureSkill {
    name: string;
    attr: string; // e.g., "Vigor", "Inteligência"
    points: number;
}

export interface EnemyAttack {
    name: string;
    dicePool: number;
    damage: string;
    qualities?: string;
    notes?: string;
}

export interface Enemy {
    id: string;
    name: string;
    description: string;
    threatLevel: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
    recommendedSequence: string;
    
    // Atributos
    attributes: Attributes;
    espiritualidade: number;
    
    // Perícias e Testes
    skills?: {
        vontade: number;
        vigor: number;
        percepcao: number;
        inteligencia: number;
        raciocinio: number;
        [key: string]: number;
    };
    creatureSkills?: CreatureSkill[];
    
    // Estatísticas de Combate
    healthPoints: number;
    initiative: number;
    initiativeBreakdown?: string;
    defense: number;
    defenseBreakdown?: string;
    absorption: number;
    absorptionBreakdown?: string;
    movement: number;
    
    // Ações de Combate
    attacks: EnemyAttack[];
    
    // Poderes e Habilidades
    abilities: EnemyAbility[];
    
    // Vulnerabilidades e Fraquezas
    vulnerabilities?: string[];
    weaknesses?: string[];
    
    // Anotações
    notes?: string;
}

export interface CombatSession {
    id: string;
    name: string;
    location?: string;
    participantIds: string[]; // IDs dos personagens/agentes envolvidos
    createdAt: Date;
    status: 'active' | 'paused' | 'finished';
    notes?: string;
}

export interface CombatManager {
    combatSessions: CombatSession[];
    activeCombatSessionId?: string;
}
