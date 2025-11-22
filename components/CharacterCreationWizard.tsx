import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { initialAgentData } from '../constants';
import { getUserProfile } from '../api/users';
import { getSignedAvatarUrl } from '../utils/avatarUtils';
import { usePermissions } from '../src/hooks/usePermissions';
import { BLOODLINES } from '../data/bloodlines-data';
import { AFFILIATIONS } from '../data/affiliations-data';
import '../styles/components/_character-creation-wizard.css';

interface AttributeScores {
    forca: number;
    destreza: number;
    vigor: number;
    carisma: number;
    manipulacao: number;
    autocontrole: number;
    percepcao: number;
    inteligencia: number;
    raciocinio: number;
}

type AttributeCategory = 'fisicos' | 'sociais' | 'mentais';

interface CategoryPriority {
    category: AttributeCategory;
    points: number;
    label: string;
}

interface SkillScores {
    [key: string]: number;
}

type SkillPriority = 'investigative' | 'general' | null;

interface Origin {
    id: string;
    name: string;
    description: string;
    bonuses: {
        skills?: Record<string, number>;
        attribute?: { name: keyof AttributeScores; value: number };
    };
}

interface DomainParticle {
    pathway: string;
    particle: string;
    word: string;
}

const DOMAIN_PARTICLES: Record<string, DomainParticle> = {
    'CAMINHO DO TOLO': { pathway: 'CAMINHO DO TOLO', particle: 'Apatē', word: 'Falha' },
    'CAMINHO DA PORTA': { pathway: 'CAMINHO DA PORTA', particle: 'Pylē', word: 'Porta' },
    'CAMINHO DO VISIONÁRIO': { pathway: 'CAMINHO DO VISIONÁRIO', particle: 'Placidus', word: 'Placidez' },
    'CAMINHO DO SOL': { pathway: 'CAMINHO DO SOL', particle: 'Helios', word: 'Sol' },
    'CAMINHO DO TIRANO': { pathway: 'CAMINHO DO TIRANO', particle: 'Keraunos', word: 'Tempestade' },
    'CAMINHO DA TORRE BRANCA': { pathway: 'CAMINHO DA TORRE BRANCA', particle: 'Logos', word: 'Lógica/Razão' },
    'CAMINHO DO ENFORCADO': { pathway: 'CAMINHO DO ENFORCADO', particle: 'Anker', word: 'Ancorar' },
    'CAMINHO DAS TREVAS': { pathway: 'CAMINHO DAS TREVAS', particle: 'Nyx', word: 'Noite' },
    'CAMINHO DA MORTE': { pathway: 'CAMINHO DA MORTE', particle: 'Thanatos', word: 'Morte' },
    'CAMINHO DO GIGANTE DO CREPÚSCULO': { pathway: 'CAMINHO DO GIGANTE DO CREPÚSCULO', particle: 'Machē', word: 'Combate' },
    'CAMINHO DO DEMÔNIO': { pathway: 'CAMINHO DO DEMÔNIO', particle: 'Pathos', word: 'Desejo' },
    'CAMINHO DO PADRE VERMELHO': { pathway: 'CAMINHO DO PADRE VERMELHO', particle: 'Pyrrhos', word: 'Fogo do Ardíl' },
    'CAMINHO DO EREMITA': { pathway: 'CAMINHO DO EREMITA', particle: 'Mysterion', word: 'Segredo' },
    'CAMINHO DO PARAGON': { pathway: 'CAMINHO DO PARAGON', particle: 'Schema', word: 'Diagrama' },
    'CAMINHO DA MÃE': { pathway: 'CAMINHO DA MÃE', particle: 'Zoe', word: 'Vida' },
    'CAMINHO DA LUA': { pathway: 'CAMINHO DA LUA', particle: 'Selene', word: 'Lua' },
    'CAMINHO DO ABISMO': { pathway: 'CAMINHO DO ABISMO', particle: 'Miasma', word: 'Corrupção' },
    'CAMINHO DO ACORRENTADO': { pathway: 'CAMINHO DO ACORRENTADO', particle: 'Allax', word: 'Mutação' },
    'CAMINHO DO JUSTICEIRO': { pathway: 'CAMINHO DO JUSTICEIRO', particle: 'Lex', word: 'Lei' },
    'CAMINHO DO IMPERADOR NEGRO': { pathway: 'CAMINHO DO IMPERADOR NEGRO', particle: 'Lacuna', word: 'Brecha' },
    'CAMINHO DA RODA DA FORTUNA': { pathway: 'CAMINHO DA RODA DA FORTUNA', particle: 'Fatum', word: 'Destino' },
    'CAMINHO DO ERRO': { pathway: 'CAMINHO DO ERRO', particle: 'Nihil', word: 'Vazio/Lacuna' },
    'CAMINHO DO ÉON ETERNO': { pathway: 'CAMINHO DO ÉON ETERNO', particle: 'Fatum', word: 'Fado/Sentença' },
    'CAMINHO DO VÉU': { pathway: 'CAMINHO DO VÉU', particle: 'Caligo', word: 'Névoa' }
};

interface UniversalParticle {
    name: string;
    word: string;
    category: string;
}

interface Bloodline {
    id: string;
    name: string;
    cost: number;
    description: string;
    privileges: string[];
    curses: string[];
    bonuses?: {
        status?: number;
        resources?: number;
        sanityMax?: number;
        mentalAttributes?: number;
    };
}

interface Affiliation {
    id: string;
    name: string;
    type: 'orthodox' | 'secret';
    description: string;
    duties: string[];
    restrictions: string[];
    benefits: Record<number, string[]>; // Benefits per status level 1-5
}

interface Backgrounds {
    aliados: number;
    recursos: number;
    contatos: number;
    mentor: number;
    status: number;
}

const UNIVERSAL_PARTICLES: Record<string, UniversalParticle[]> = {
    'Ocultismo': [
        { name: 'Revelar', word: 'Il', category: 'Ocultismo' },
        { name: 'Espírito', word: 'Pneuma', category: 'Ocultismo' },
        { name: 'Invocar/Criar', word: 'Ev', category: 'Ocultismo' },
        { name: 'Abstrato', word: 'Ala', category: 'Ocultismo' }
    ],
    'Acadêmicos': [
        { name: 'Informação', word: 'Azi', category: 'Acadêmicos' },
        { name: 'Alterar', word: 'Al', category: 'Acadêmicos' },
        { name: 'Construção', word: 'Omu', category: 'Acadêmicos' }
    ],
    'Ciência': [
        { name: 'Fogo', word: 'Ig', category: 'Ciência' },
        { name: 'Água', word: 'Quan', category: 'Ciência' },
        { name: 'Ar', word: 'Aer', category: 'Ciência' },
        { name: 'Terra', word: 'Mun', category: 'Ciência' },
        { name: 'Inanimado', word: 'Exa', category: 'Ciência' }
    ],
    'Medicina': [
        { name: 'Pessoa', word: 'Ivi', category: 'Medicina' },
        { name: 'Vegetação', word: 'Ora', category: 'Medicina' },
        { name: 'Restaurar', word: 'An', category: 'Medicina' },
        { name: 'Enfraquecer', word: 'In', category: 'Medicina' }
    ],
    'Crime/Manha': [
        { name: 'Aprisionar', word: 'Ar', category: 'Crime/Manha' },
        { name: 'Enfraquecer', word: 'In', category: 'Crime/Manha' },
        { name: 'Lugar/Terreno', word: 'Locus', category: 'Crime/Manha' }
    ]
};

const GENERAL_SKILLS = [
    'Prontidão', 'Esportes', 'Briga', 'Empatia', 'Expressão', 'Intimidação',
    'Liderança', 'Manha', 'Lábia', 'Condução', 'Armas de Fogo', 'Armas Brancas',
    'Performance', 'Furtividade', 'Sobrevivência'
];

const INVESTIGATIVE_SKILLS = [
    'Empatia com Animais', 'Ofícios', 'Etiqueta', 'Acadêmicos', 'Maquinaria',
    'Finanças', 'Investigação', 'Direito', 'Medicina', 'Ciência', 'Política', 'Ocultismo'
];

const ORIGINS: Origin[] = [
    {
        id: 'academico',
        name: 'Acadêmico',
        description: 'Você dedicou sua vida ao estudo e à pesquisa. Sua mente aguçada e conhecimento vasto são suas maiores armas.',
        bonuses: {
            skills: { 'Acadêmicos': 1, 'Investigação': 1 }
        }
    },
    {
        id: 'aristocrata',
        name: 'Aristocrata',
        description: 'Nascido em berço de ouro, você domina a arte da etiqueta e da persuasão nas altas rodas sociais.',
        bonuses: {
            skills: { 'Etiqueta': 1, 'Lábia': 1 }
        }
    },
    {
        id: 'criminoso',
        name: 'Criminoso',
        description: 'As ruas foram sua escola. Você aprendeu a sobreviver nas sombras, usando astúcia e furtividade.',
        bonuses: {
            skills: { 'Manha': 1, 'Furtividade': 1 }
        }
    },
    {
        id: 'guarda',
        name: 'Guarda',
        description: 'Treinado para proteger e servir, você possui reflexos aguçados e está sempre alerta ao perigo.',
        bonuses: {
            skills: { 'Briga': 1, 'Prontidão': 1 }
        }
    },
    {
        id: 'operario',
        name: 'Operário',
        description: 'O trabalho duro moldou seu corpo e mente. Você sabe como construir, consertar e resistir.',
        bonuses: {
            skills: { 'Ofícios': 1 },
            attribute: { name: 'vigor', value: 1 }
        }
    },
    {
        id: 'ocultista',
        name: 'Ocultista',
        description: 'Você sempre soube que havia mais no mundo do que os olhos podiam ver. Estudou as artes místicas em segredo.',
        bonuses: {
            skills: { 'Oculto': 1, 'Investigação': 1 }
        }
    },
    {
        id: 'artista',
        name: 'Artista',
        description: 'Sua arte toca as almas. Seja através da música, pintura ou palavras, você possui uma presença magnética.',
        bonuses: {
            skills: { 'Performance': 1, 'Empatia': 1 }
        }
    },
    {
        id: 'soldado',
        name: 'Soldado',
        description: 'Veterano de conflitos, você conhece a disciplina militar e o manejo de armas como ninguém.',
        bonuses: {
            skills: { 'Armas de Fogo': 1, 'Intimidação': 1 }
        }
    }
];

const BASE_PATHWAYS = [
    'CAMINHO DO TOLO', 'CAMINHO DA PORTA', 'CAMINHO DO ERRO', 'CAMINHO DO VISIONÁRIO', 
    'CAMINHO DO SOL', 'CAMINHO DO TIRANO', 'CAMINHO DA TORRE BRANCA',
    'CAMINHO DO ENFORCADO', 'CAMINHO DAS TREVAS', 'CAMINHO DA MORTE', 
    'CAMINHO DO GIGANTE DO CREPÚSCULO', 'CAMINHO DO DEMÔNIO',
    'CAMINHO DO PADRE VERMELHO', 'CAMINHO DO EREMITA', 'CAMINHO DO PARAGON', 
    'CAMINHO DA MÃE', 'CAMINHO DA LUA', 'CAMINHO DO ABISMO',
    'CAMINHO DO ACORRENTADO', 'CAMINHO DO JUSTICEIRO', 'CAMINHO DO IMPERADOR NEGRO', 
    'CAMINHO DA RODA DA FORTUNA'
];

const SECRET_PATHWAYS = [
    'CAMINHO DO ÉON ETERNO',
    'CAMINHO DO VÉU'
];

// Mapeamento para exibição amigável
const PATHWAY_DISPLAY_NAMES: Record<string, string> = {
    'CAMINHO DO TOLO': 'Tolo',
    'CAMINHO DA PORTA': 'Porta',
    'CAMINHO DO ERRO': 'Erro',
    'CAMINHO DO VISIONÁRIO': 'Visionário',
    'CAMINHO DO SOL': 'Sol',
    'CAMINHO DO TIRANO': 'Tirano',
    'CAMINHO DA TORRE BRANCA': 'Torre Branca',
    'CAMINHO DO ENFORCADO': 'Enforcado',
    'CAMINHO DAS TREVAS': 'Trevas',
    'CAMINHO DA MORTE': 'Morte',
    'CAMINHO DO GIGANTE DO CREPÚSCULO': 'Gigante do Crepúsculo',
    'CAMINHO DO DEMÔNIO': 'Demônio',
    'CAMINHO DO PADRE VERMELHO': 'Padre Vermelho',
    'CAMINHO DO EREMITA': 'Eremita',
    'CAMINHO DO PARAGON': 'Paragon',
    'CAMINHO DA MÃE': 'Mãe',
    'CAMINHO DA LUA': 'Lua',
    'CAMINHO DO ABISMO': 'Abismo',
    'CAMINHO DO ACORRENTADO': 'Acorrentado',
    'CAMINHO DO JUSTICEIRO': 'Justiceiro',
    'CAMINHO DO IMPERADOR NEGRO': 'Imperador Negro',
    'CAMINHO DA RODA DA FORTUNA': 'Roda da Fortuna',
    'CAMINHO DO ÉON ETERNO': 'Éon Eterno',
    'CAMINHO DO VÉU': 'Véu'
};

export const CharacterCreationWizard: React.FC = () => {
    const navigate = useNavigate();
    const { permissions } = usePermissions();
    const [currentStep, setCurrentStep] = useState(1);
    
    // Compute available pathways based on permissions
    const PATHWAYS = useMemo(() => {
        const available = [...BASE_PATHWAYS];
        console.log('🔐 Permissões de caminhos:', {
            aeon: permissions.can_see_pathway_aeon,
            veu: permissions.can_see_pathway_veu,
            allPermissions: permissions
        });
        if (permissions.can_see_pathway_aeon) {
            available.push('CAMINHO DO ÉON ETERNO');
        }
        if (permissions.can_see_pathway_veu) {
            available.push('CAMINHO DO VÉU');
        }
        console.log('📜 Caminhos disponíveis:', available);
        return available;
    }, [permissions]);
    
    // Step 1: Concept and Identity
    const [characterName, setCharacterName] = useState('');
    const [characterConcept, setCharacterConcept] = useState('');
    
    // Step 2: Attribute Prioritization and Distribution
    const [attributePriorities, setAttributePriorities] = useState<CategoryPriority[]>([
        { category: 'fisicos', points: 0, label: 'Físicos' },
        { category: 'sociais', points: 0, label: 'Sociais' },
        { category: 'mentais', points: 0, label: 'Mentais' }
    ]);
    const [attributes, setAttributes] = useState<AttributeScores>({
        forca: 1,
        destreza: 1,
        vigor: 1,
        carisma: 1,
        manipulacao: 1,
        autocontrole: 1,
        percepcao: 1,
        inteligencia: 1,
        raciocinio: 1
    });
    
    // Step 3: Skill Priority and Distribution
    const [skillPriority, setSkillPriority] = useState<SkillPriority>(null);
    const [skills, setSkills] = useState<SkillScores>({});
    
    // Step 4: Pathway and Particles
    const [selectedPathway, setSelectedPathway] = useState<string>('');
    const [selectedUniversalParticles, setSelectedUniversalParticles] = useState<UniversalParticle[]>([]);
    
    // Step 5: Origin (Background)

    
    // Step 6: Bloodline
    const [selectedBloodline, setSelectedBloodline] = useState<string>('none');
    
    // Step 7: Affiliation
    const [selectedAffiliation, setSelectedAffiliation] = useState<string>('none');
    const [affiliationStatus, setAffiliationStatus] = useState<number>(0);
    
    // Step 8: Backgrounds (Antecedentes)
    const [backgrounds, setBackgrounds] = useState<Backgrounds>({
        aliados: 0,
        recursos: 0,
        contatos: 0,
        mentor: 0,
        status: 0
    });
    
    // Custom backgrounds
    interface CustomBackground {
        id: string;
        name: string;
        description: string;
        points: number;
    }
    const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>([]);
    const [isCreatingCustomBg, setIsCreatingCustomBg] = useState(false);
    const [newBgName, setNewBgName] = useState('');
    const [newBgDesc, setNewBgDesc] = useState('');
    const [newBgPoints, setNewBgPoints] = useState(1);
    
    // Category-based attribute point calculation
    const ATTRIBUTE_CATEGORIES: Record<AttributeCategory, (keyof AttributeScores)[]> = {
        fisicos: ['forca', 'destreza', 'vigor'],
        sociais: ['carisma', 'manipulacao', 'autocontrole'],
        mentais: ['percepcao', 'inteligencia', 'raciocinio']
    };

    const getCategoryPoints = (category: AttributeCategory): { used: number; available: number } => {
        const categoryAttrs = ATTRIBUTE_CATEGORIES[category];
        const used = categoryAttrs.reduce((sum, attr) => sum + (attributes[attr] - 1), 0);
        const priority = attributePriorities.find(p => p.category === category);
        return { used, available: priority?.points || 0 };
    };
    
    // Skill points calculation
    const primaryPoints = 11;
    const secondaryPoints = 7;
    
    const investigativeSkillsUsed = useMemo(() => {
        return INVESTIGATIVE_SKILLS.reduce((sum, skill) => sum + (skills[skill] || 0), 0);
    }, [skills]);
    
    const generalSkillsUsed = useMemo(() => {
        return GENERAL_SKILLS.reduce((sum, skill) => sum + (skills[skill] || 0), 0);
    }, [skills]);
    
    const investigativePointsAvailable = skillPriority === 'investigative' 
        ? primaryPoints - investigativeSkillsUsed 
        : secondaryPoints - investigativeSkillsUsed;
    const generalPointsAvailable = skillPriority === 'general' 
        ? primaryPoints - generalSkillsUsed 
        : secondaryPoints - generalSkillsUsed;
    
    // Universal particles allowed
    const maxUniversalParticles = skillPriority === 'investigative' ? 5 : 3;
    
    // Priority setting for attributes
    const setPriority = (category: AttributeCategory, level: 'primary' | 'secondary' | 'tertiary') => {
        const pointsMap = { primary: 6, secondary: 4, tertiary: 3 };
        const targetPoints = pointsMap[level];
        
        setAttributePriorities(prev => {
            // Check if another category already has this priority
            const existingWithSamePriority = prev.find(p => p.points === targetPoints && p.category !== category);
            
            let newPriorities = prev.map(p => {
                if (p.category === category) {
                    return { ...p, points: targetPoints };
                }
                return p;
            });
            
            // If there's a conflict, reset the conflicting category
            if (existingWithSamePriority) {
                newPriorities = newPriorities.map(p => {
                    if (p.category === existingWithSamePriority.category) {
                        return { ...p, points: 0 };
                    }
                    return p;
                });
            }
            
            return newPriorities;
        });
    };
    
    // Attribute adjustment
    const adjustAttribute = (attr: keyof AttributeScores, delta: number) => {
        setAttributes(prev => {
            const newValue = prev[attr] + delta;
            
            // Validate new value
            if (newValue < 1 || newValue > 5) return prev;
            
            // Find which category this attribute belongs to
            const category = (Object.keys(ATTRIBUTE_CATEGORIES) as AttributeCategory[]).find(cat =>
                ATTRIBUTE_CATEGORIES[cat].includes(attr)
            );
            
            if (!category) return prev;
            
            const { used, available } = getCategoryPoints(category);
            
            // Check if we have points available for increase
            if (delta > 0 && used >= available) return prev;
            
            return { ...prev, [attr]: newValue };
        });
    };
    
    // Skill adjustment
    const adjustSkill = (skill: string, delta: number) => {
        setSkills(prev => {
            const currentValue = prev[skill] || 0;
            const newValue = currentValue + delta;
            
            // Validate new value
            if (newValue < 0 || newValue > 3) return prev;
            
            // Check if we have points available for increase
            const isInvestigative = INVESTIGATIVE_SKILLS.includes(skill);
            const isGeneral = GENERAL_SKILLS.includes(skill);
            
            if (delta > 0) {
                if (isInvestigative && investigativePointsAvailable <= 0) return prev;
                if (isGeneral && generalPointsAvailable <= 0) return prev;
            }
            
            return { ...prev, [skill]: newValue };
        });
    };
    
    // Toggle universal particle selection
    const toggleUniversalParticle = (particle: UniversalParticle) => {
        setSelectedUniversalParticles(prev => {
            const exists = prev.find(p => p.name === particle.name && p.word === particle.word);
            if (exists) {
                return prev.filter(p => !(p.name === particle.name && p.word === particle.word));
            } else {
                if (prev.length >= maxUniversalParticles) return prev;
                return [...prev, particle];
            }
        });
    };
    
    // Validation for each step
    const canProceedStep1 = characterName.trim() !== '' && characterConcept.trim() !== '';
    
    const canProceedStep2 = useMemo(() => {
        const allAssigned = attributePriorities.every(p => p.points > 0);
        const uniqueAssignments = new Set(attributePriorities.map(p => p.points)).size === 3;
        const allPointsUsed = (Object.keys(ATTRIBUTE_CATEGORIES) as AttributeCategory[]).every(cat => {
            const { used, available } = getCategoryPoints(cat);
            return used === available;
        });
        return allAssigned && uniqueAssignments && allPointsUsed;
    }, [attributePriorities, attributes]);
    
    const canProceedStep3 = skillPriority !== null && investigativePointsAvailable === 0 && generalPointsAvailable === 0;
    const canProceedStep4 = selectedPathway !== '' && selectedUniversalParticles.length === maxUniversalParticles;
    const canProceedStep5 = true; // Bloodline is optional
    const canProceedStep6 = true; // Affiliation is optional
    
    // Calculate available background points
    const getAvailableBackgroundPoints = useMemo(() => {
        let basePoints = 5;
        const bloodline = BLOODLINES.find(b => b.id === selectedBloodline);
        
        // Calculate custom backgrounds points
        const customBgPoints = customBackgrounds.reduce((sum, bg) => sum + bg.points, 0);
        
        let freeStatus = 0;
        let freeResources = 0;
        
        // Augustus gives 3 free Status and 3 free Resources
        if (selectedBloodline === 'augustus') {
            freeStatus = 3;
            freeResources = 3;
        }
        
        // Affiliation gives 1 free status point (stacks with Augustus if applicable)
        if (selectedAffiliation !== 'none') {
            freeStatus = Math.max(freeStatus, 1); // At least 1 free, or keep Augustus' 3
        }
        
        // Only count points ABOVE the free ones
        const usedStatus = Math.max(0, backgrounds.status - freeStatus);
        const usedResources = Math.max(0, backgrounds.recursos - freeResources);
        
        const used = backgrounds.aliados + usedResources + backgrounds.contatos + backgrounds.mentor + usedStatus + customBgPoints;
        
        return {
            total: basePoints,
            used,
            freeStatus,
            freeResources
        };
    }, [selectedBloodline, selectedAffiliation, backgrounds, customBackgrounds]);
    
    const canProceedStep7 = getAvailableBackgroundPoints.used === getAvailableBackgroundPoints.total;
    
    // Adjust background values
    const adjustBackground = (bg: keyof Backgrounds, delta: number) => {
        setBackgrounds(prev => {
            const currentValue = prev[bg];
            const newValue = currentValue + delta;
            
            if (newValue < 0 || newValue > 5) return prev;
            
            const { used, total, freeStatus, freeResources } = getAvailableBackgroundPoints;
            
            // Check if this background has free points
            let minValue = 0;
            let isFree = false;
            
            if (bg === 'status' && freeStatus > 0) {
                minValue = 0; // Can go to 0, but first points are free
                isFree = currentValue < freeStatus; // Currently using free points
            } else if (bg === 'recursos' && freeResources > 0) {
                minValue = 0; // Can go to 0, but first points are free
                isFree = currentValue < freeResources; // Currently using free points
            }
            
            // Calculate if this change would consume paid points
            if (delta > 0) {
                // Increasing: check if we need to spend points
                const currentPaidPoints = Math.max(0, currentValue - (bg === 'status' ? freeStatus : bg === 'recursos' ? freeResources : 0));
                const newPaidPoints = Math.max(0, newValue - (bg === 'status' ? freeStatus : bg === 'recursos' ? freeResources : 0));
                const paidPointsNeeded = newPaidPoints - currentPaidPoints;
                
                if (paidPointsNeeded > 0 && used + paidPointsNeeded > total) {
                    return prev; // Not enough points
                }
            }
            // Decreasing is always allowed (frees up points or reduces free allocation)
            
            return { ...prev, [bg]: newValue };
        });
    };
    
    const handleCreateCustomBackground = () => {
        if (!newBgName.trim() || newBgPoints < 1) return;
        
        const { used, total } = getAvailableBackgroundPoints;
        if (used + newBgPoints > total) return;
        
        const newBg: CustomBackground = {
            id: `custom-${Date.now()}`,
            name: newBgName.trim(),
            description: newBgDesc.trim(),
            points: newBgPoints
        };
        
        setCustomBackgrounds(prev => [...prev, newBg]);
        setNewBgName('');
        setNewBgDesc('');
        setNewBgPoints(1);
        setIsCreatingCustomBg(false);
    };
    
    const handleRemoveCustomBackground = (id: string) => {
        setCustomBackgrounds(prev => prev.filter(bg => bg.id !== id));
    };
    
    const adjustCustomBackground = (id: string, delta: number) => {
        setCustomBackgrounds(prev => prev.map(bg => {
            if (bg.id !== id) return bg;
            
            const newPoints = bg.points + delta;
            if (newPoints < 1 || newPoints > 5) return bg;
            
            const { used, total } = getAvailableBackgroundPoints;
            const pointsAfterChange = used - bg.points + newPoints;
            if (pointsAfterChange > total) return bg;
            
            return { ...bg, points: newPoints };
        }));
    };
    
    const [isCreating, setIsCreating] = useState(false);
    
    const createCharacter = async () => {
        setIsCreating(true);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Você precisa estar logado para criar um personagem!");
                setIsCreating(false);
                return;
            }
            
            // Get user avatar as default
            let defaultAvatar = '';
            try {
                const dbProfile = await getUserProfile(user.id);
                if (dbProfile?.avatarPath) {
                    const signed = await getSignedAvatarUrl(dbProfile.avatarPath, 'user-avatars');
                    defaultAvatar = signed || '';
                }
            } catch (e) {
                console.warn('Could not resolve user profile avatar', e);
            }
            
            // Start with base skills and attributes
            const finalSkills = { ...skills };
            let finalAttributes = { ...attributes };
            
            // Apply bloodline bonuses/penalties
            const bloodline = BLOODLINES.find(b => b.id === selectedBloodline);
            
            // Apply starting skills from bloodline
            if (bloodline?.mechanics?.startingSkills) {
                bloodline.mechanics.startingSkills.forEach(skillData => {
                    const skillKey = skillData.skill.toLowerCase();
                    finalSkills[skillKey] = (finalSkills[skillKey] || 0) + skillData.dots;
                });
            }
            let finalSanityMax = finalAttributes.carisma * 5;
            
            if (bloodline?.mechanics) {
                // Apply attribute bonuses from mechanics
                if (bloodline.mechanics.attributeBonus) {
                    bloodline.mechanics.attributeBonus.forEach(bonus => {
                        const attr = bonus.attribute as keyof AttributeScores;
                        if (finalAttributes[attr]) {
                            finalAttributes = {
                                ...finalAttributes,
                                [attr]: Math.max(1, Math.min(5, finalAttributes[attr] + bonus.bonus))
                            };
                        }
                    });
                }
                
                // Apply penalty difficulty for mental attributes (Einhorn)
                const mentalPenalty = bloodline.mechanics.penaltyDifficulty?.find(
                    p => p.situation === 'atributos_mentais'
                );
                if (mentalPenalty && bloodline.id === 'einhorn') {
                    finalAttributes = {
                        ...finalAttributes,
                        percepcao: Math.max(1, finalAttributes.percepcao + mentalPenalty.penalty),
                        inteligencia: Math.max(1, finalAttributes.inteligencia + mentalPenalty.penalty),
                        raciocinio: Math.max(1, finalAttributes.raciocinio + mentalPenalty.penalty)
                    };
                }
            }
            
            // Get affiliation data
            const affiliation = AFFILIATIONS.find(a => a.id === selectedAffiliation);
            
            // Create learned particles array
            const domainParticle = DOMAIN_PARTICLES[selectedPathway];
            const learnedParticles = [
                {
                    name: domainParticle.particle,
                    word: domainParticle.word,
                    domain: selectedPathway,
                    type: 'domain',
                    acquisitionMethod: 'innate'
                },
                ...selectedUniversalParticles.map(p => ({
                    name: p.name,
                    word: p.word,
                    domain: 'Universal',
                    type: 'universal',
                    category: p.category,
                    acquisitionMethod: 'universal'
                }))
            ];
            
            // Calculate derived stats based on 9-attribute system
            const HP = 10 + finalAttributes.vigor * 2;
            const Sanity = finalSanityMax;
            const Willpower = finalAttributes.carisma;
            const PE = finalAttributes.inteligencia + finalAttributes.carisma;
            
            // Build habilidades in the correct format {gerais: [], investigativas: []}
            const habilidadesGerais = GENERAL_SKILLS.map(skillName => {
                // Map skill names to attributes
                const attrMap: Record<string, string> = {
                    'Briga': 'Força',
                    'Empatia': 'Percepção',
                    'Esportes': 'Destreza',
                    'Expressão': 'Carisma',
                    'Intimidação': 'Autocontrole',
                    'Lábia': 'Manipulação',
                    'Liderança': 'Carisma',
                    'Manha': 'Manipulação',
                    'Prontidão': 'Raciocínio',
                    'Armas Brancas': 'Força/Destreza',
                    'Armas de Fogo': 'Destreza',
                    'Condução': 'Destreza',
                    'Furtividade': 'Destreza',
                    'Performance': 'Carisma',
                    'Sobrevivência': 'Raciocínio'
                };
                
                // Busca case-insensitive nos finalSkills
                const skillKey = Object.keys(finalSkills).find(k => k.toLowerCase() === skillName.toLowerCase());
                const skillPoints = skillKey ? finalSkills[skillKey] : (finalSkills[skillName] || 0);
                
                return {
                    name: skillName,
                    attr: attrMap[skillName] || 'Destreza',
                    points: skillPoints
                };
            });
            
            const habilidadesInvestigativas = INVESTIGATIVE_SKILLS.map(skillName => {
                const attrMap: Record<string, string> = {
                    'Acadêmicos': 'Inteligência',
                    'Ciência': 'Inteligência',
                    'Direito': 'Inteligência',
                    'Empatia c/ Animais': 'Manipulação',
                    'Etiqueta': 'Carisma',
                    'Finanças': 'Inteligência',
                    'Investigação': 'Percepção',
                    'Maquinaria': 'Inteligência',
                    'Medicina': 'Inteligência',
                    'Ofícios': 'Inteligência',
                    'Política': 'Manipulação',
                    'Ocultismo (Híbrida)': 'Inteligência'
                };
                
                // Busca case-insensitive nos finalSkills
                const skillKey = Object.keys(finalSkills).find(k => k.toLowerCase() === skillName.toLowerCase());
                const skillPoints = skillKey ? finalSkills[skillKey] : (finalSkills[skillName] || 0);
                
                return {
                    name: skillName,
                    attr: attrMap[skillName] || 'Inteligência',
                    points: skillPoints
                };
            });
            
            const habilidades = {
                gerais: habilidadesGerais,
                investigativas: habilidadesInvestigativas
            };
            
            // Build automatic extra backgrounds from bloodline and affiliation
            const extraBackgrounds: any[] = [];
            
            // Add enemies from bloodline
            if (bloodline?.enemies && bloodline.enemies.length > 0) {
                bloodline.enemies.forEach(enemy => {
                    extraBackgrounds.push({
                        name: `Inimigos (${enemy.name})`,
                        description: `Você é alvo de ${enemy.name}`,
                        type: 'negative',
                        level: enemy.level,
                        source: 'bloodline'
                    });
                });
            }
            
            // Add free backgrounds from bloodline mechanics
            if (bloodline?.mechanics?.freeBackgrounds) {
                const fb = bloodline.mechanics.freeBackgrounds;
                if (fb.status && fb.status > 0) {
                    extraBackgrounds.push({
                        name: 'Status (Linhagem)',
                        description: `${fb.status} pontos gratuitos em Status por herança`,
                        type: 'bonus',
                        level: fb.status,
                        source: 'bloodline'
                    });
                }
                if (fb.recursos && fb.recursos > 0) {
                    extraBackgrounds.push({
                        name: 'Recursos (Linhagem)',
                        description: `${fb.recursos} pontos gratuitos em Recursos por herança`,
                        type: 'bonus',
                        level: fb.recursos,
                        source: 'bloodline'
                    });
                }
            }
            
            // Add free status from affiliation
            if (affiliation && selectedAffiliation !== 'none' && affiliation.mechanics?.freeStatus) {
                extraBackgrounds.push({
                    name: 'Status (Afiliação)',
                    description: `${affiliation.mechanics.freeStatus} ponto gratuito em Status por afiliação`,
                    type: 'bonus',
                    level: affiliation.mechanics.freeStatus,
                    source: 'affiliation'
                });
            }
            
            // Build complete agent data
            const newAgentData = {
                ...JSON.parse(JSON.stringify(initialAgentData)),
                lastModified: new Date().toISOString(),
                character: {
                    ...(initialAgentData.character || {}),
                    name: characterName,
                    concept: characterConcept,
                    avatarUrl: defaultAvatar,
                    sequence: 9,
                    pathway: selectedPathway, // Formato antigo para compatibilidade
                    pathways: {
                        primary: selectedPathway,
                        secondary: []
                    },
                    bloodline: bloodline?.name || 'Nenhuma',
                    bloodlineCost: bloodline?.cost || 0,
                    affiliation: affiliation?.name || 'Nenhum',
                    affiliationStatus: selectedAffiliation !== 'none' ? affiliationStatus : 0,
                    vitality: HP,
                    maxVitality: HP,
                    spirituality: PE,
                    maxSpirituality: PE,
                    willpower: Willpower,
                    maxWillpower: Willpower,
                    sanity: Sanity,
                    maxSanity: Sanity,
                    pa: 0,
                    maxPa: 100,
                    paDisponivel: 0,
                    paTotalGasto: 0,
                    purifiedDiceThisSequence: 0,
                    assimilationDice: 5, // Começa com 5 dados ao tomar a primeira poção (Seq. 9)
                    maxAssimilationDice: 5,
                    defense: 0,
                    absorption: 0,
                    initiative: finalAttributes.raciocinio,
                    controlStage: 0,
                    anchors: [
                        { conviction: '', symbol: '' },
                        { conviction: '', symbol: '' },
                        { conviction: '', symbol: '' }
                    ]
                },
                backgrounds: {
                    aliados: backgrounds.aliados,
                    recursos: backgrounds.recursos,
                    contatos: backgrounds.contatos,
                    mentor: backgrounds.mentor,
                    status: backgrounds.status,
                    custom: customBackgrounds.map(bg => ({
                        name: bg.name,
                        description: bg.description,
                        points: bg.points
                    })),
                    extra: extraBackgrounds
                },
                attributes: finalAttributes,
                habilidades,
                attacks: [],
                protections: [],
                habilidadesBeyonder: [],
                rituais: [],
                inventory: [],
                artifacts: [],
                money: { libras: 0, soli: 0, pennies: 0 },
                antecedentes: [],
                afiliacoes: selectedAffiliation !== 'none' ? [{
                    id: selectedAffiliation,
                    name: affiliation?.name || '',
                    description: affiliation?.description || '',
                    status: affiliationStatus
                }] : [],
                learnedParticles,
                customization: {
                    useOpenDyslexicFont: false,
                    avatarHealthy: '',
                    avatarHurt: '',
                    avatarDisturbed: '',
                    avatarInsane: ''
                }
            };
            
            // Insert into database
            const { data: insertedData, error } = await supabase
                .from("agents")
                .insert({
                    data: newAgentData,
                    user_id: user.id,
                })
                .select("data, id")
                .single();
            
            if (error) {
                console.error("Erro ao criar personagem:", error.message);
                alert("Erro ao criar personagem. Tente novamente.");
                setIsCreating(false);
            } else if (insertedData) {
                navigate(`/agent/${insertedData.id}`);
            }
        } catch (error) {
            console.error("Erro ao criar personagem:", error);
            alert("Erro ao criar personagem. Tente novamente.");
            setIsCreating(false);
        }
    };
    
    const handleNext = () => {
        if (currentStep === 1 && !canProceedStep1) return;
        if (currentStep === 2 && !canProceedStep2) return;
        if (currentStep === 3 && !canProceedStep3) return;
        if (currentStep === 4 && !canProceedStep4) return;
        if (currentStep === 5 && !canProceedStep5) return;
        if (currentStep === 6 && !canProceedStep6) return;
        if (currentStep === 7 && !canProceedStep7) return;
        
        if (currentStep === 8) {
            // Final step - create character
            createCharacter();
            return;
        }
        
        setCurrentStep(prev => Math.min(prev + 1, 8));
    };
    
    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };
    
    const getAttributeLabel = (attr: keyof AttributeScores): string => {
        const labels: Record<keyof AttributeScores, string> = {
            forca: 'FOR',
            destreza: 'DES',
            vigor: 'VIG',
            carisma: 'CAR',
            manipulacao: 'MAN',
            autocontrole: 'AUT',
            percepcao: 'PER',
            inteligencia: 'INT',
            raciocinio: 'RAC'
        };
        return labels[attr];
    };
    
    const getAttributeFullName = (attr: keyof AttributeScores): string => {
        const names: Record<keyof AttributeScores, string> = {
            forca: 'Força',
            destreza: 'Destreza',
            vigor: 'Vigor',
            carisma: 'Carisma',
            manipulacao: 'Manipulação',
            autocontrole: 'Autocontrole',
            percepcao: 'Percepção',
            inteligencia: 'Inteligência',
            raciocinio: 'Raciocínio'
        };
        return names[attr];
    };
    
    return (
        <div className="character-creation-wizard">
            <div className="wizard-background">
                <div className="stars"></div>
                <div className="stars-2"></div>
                <div className="stars-3"></div>
            </div>
            
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1 className="wizard-title">Criação de Personagem</h1>
                    <div className="wizard-steps">
                        <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Conceito</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Atributos</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Habilidades</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                            <div className="step-number">4</div>
                            <div className="step-label">Caminho</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
                            <div className="step-number">5</div>
                            <div className="step-label">Linhagem</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 6 ? 'active' : ''} ${currentStep > 6 ? 'completed' : ''}`}>
                            <div className="step-number">6</div>
                            <div className="step-label">Afiliação</div>
                        </div>
                        <div className="wizard-step-connector"></div>
                        <div className={`wizard-step ${currentStep >= 7 ? 'active' : ''}`}>
                            <div className="step-number">7</div>
                            <div className="step-label">Antecedentes</div>
                        </div>
                    </div>
                </div>
                
                <div className="wizard-content">
                    {/* Step 1: Concept and Identity */}
                    {currentStep === 1 && (
                        <div className="wizard-step-content concept-step">
                            <h2 className="step-title">Conceito e Identidade</h2>
                            <p className="step-description">
                                Defina o conceito básico do seu personagem. Quem ele é? Qual sua história?
                            </p>
                            
                            <div className="form-group">
                                <label htmlFor="character-name">Nome do Personagem</label>
                                <input
                                    id="character-name"
                                    type="text"
                                    className="form-input"
                                    placeholder="Digite o nome do personagem"
                                    value={characterName}
                                    onChange={(e) => setCharacterName(e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="character-concept">Conceito de Personagem</label>
                                <textarea
                                    id="character-concept"
                                    className="form-textarea"
                                    placeholder="Uma breve descrição da identidade e foco do personagem (ex: 'Detetive particular obcecado por mistérios ocultos', 'Médico que busca a imortalidade')"
                                    value={characterConcept}
                                    onChange={(e) => setCharacterConcept(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Step 2: Attribute Prioritization and Distribution */}
                    {currentStep === 2 && (
                        <div className="wizard-step-content attributes-step">
                            <h2 className="step-title">Priorização e Distribuição de Atributos</h2>
                            <p className="step-description">
                                Priorize as três categorias de atributos (Físicos, Sociais, Mentais) para receber seus pontos adicionais.
                                <br />
                                <strong>Primária:</strong> 6 pontos | <strong>Secundária:</strong> 4 pontos | <strong>Terciária:</strong> 3 pontos
                                <br />
                                Todos os atributos começam em <strong>1</strong> (●). O limite é <strong>5</strong> (●●●●●).
                            </p>
                            
                            {/* Priority Selection */}
                            <div className="priority-selection">
                                <h3>Escolha as Prioridades</h3>
                                <div className="priority-cards">
                                    {(['fisicos', 'sociais', 'mentais'] as AttributeCategory[]).map(category => {
                                        const priority = attributePriorities.find(p => p.category === category);
                                        return (
                                            <div key={category} className="priority-card">
                                                <h4>{priority?.label}</h4>
                                                <p className="category-description">
                                                    {category === 'fisicos' && '(Força, Destreza, Vigor)'}
                                                    {category === 'sociais' && '(Carisma, Manipulação, Autocontrole)'}
                                                    {category === 'mentais' && '(Percepção, Inteligência, Raciocínio)'}
                                                </p>
                                                <div className="priority-buttons">
                                                    <button 
                                                        className={`priority-btn ${priority?.points === 6 ? 'selected' : ''}`}
                                                        onClick={() => setPriority(category, 'primary')}
                                                    >
                                                        Primária (6)
                                                    </button>
                                                    <button 
                                                        className={`priority-btn ${priority?.points === 4 ? 'selected' : ''}`}
                                                        onClick={() => setPriority(category, 'secondary')}
                                                    >
                                                        Secundária (4)
                                                    </button>
                                                    <button 
                                                        className={`priority-btn ${priority?.points === 3 ? 'selected' : ''}`}
                                                        onClick={() => setPriority(category, 'tertiary')}
                                                    >
                                                        Terciária (3)
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Attribute Distribution */}
                            {attributePriorities.every(p => p.points > 0) && (
                                <div className="attribute-distribution">
                                    <h3>Distribua os Pontos</h3>
                                    
                                    {(['fisicos', 'sociais', 'mentais'] as AttributeCategory[]).map(category => {
                                        const categoryAttrs = ATTRIBUTE_CATEGORIES[category];
                                        const { used, available } = getCategoryPoints(category);
                                        const priority = attributePriorities.find(p => p.category === category);
                                        
                                        return (
                                            <div key={category} className="attribute-category">
                                                <div className="category-header">
                                                    <h4>{priority?.label}</h4>
                                                    <span className="points-counter">
                                                        {used} / {available} pontos usados
                                                    </span>
                                                </div>
                                                <div className="attribute-grid">
                                                    {categoryAttrs.map(attr => (
                                                        <div key={attr} className="attribute-item">
                                                            <label>{getAttributeFullName(attr)}</label>
                                                            <div className="attribute-controls">
                                                                <button 
                                                                    className="attr-btn minus"
                                                                    onClick={() => adjustAttribute(attr, -1)}
                                                                    disabled={attributes[attr] <= 1}
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="attribute-value">
                                                                    {'●'.repeat(attributes[attr])}{'○'.repeat(5 - attributes[attr])}
                                                                </span>
                                                                <button 
                                                                    className="attr-btn plus"
                                                                    onClick={() => adjustAttribute(attr, 1)}
                                                                    disabled={attributes[attr] >= 5 || used >= available}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    <div className="attribute-special">
                                        <p><strong>Atributo Especial:</strong> Espiritualidade sempre começa em <strong>1</strong> para Sequência 9.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Step 3: Skills (keeping existing implementation) */}
                    {currentStep === 3 && (
                        <div className="wizard-step-content skills-step">
                            <h2 className="step-title">Priorização de Habilidades</h2>
                            <p className="step-description">
                                Escolha o foco do seu personagem: <strong>Investigador</strong> (foco em Conhecimento) ou <strong>Homem de Ação</strong> (foco em Físico e Combate).
                                <br />
                                Você terá <strong>18 pontos totais</strong> para distribuir entre as <strong>27 habilidades</strong> disponíveis (15 Gerais + 12 Investigativas).
                            </p>
                            
                            {skillPriority === null ? (
                                <div className="priority-selection">
                                    <div className="priority-card" onClick={() => setSkillPriority('investigative')}>
                                        <h3>Investigador</h3>
                                        <p>Foco em habilidades de conhecimento e investigação</p>
                                        <div className="priority-details">
                                            <span>11 pontos em Habilidades Investigativas</span>
                                            <span>7 pontos em Habilidades Gerais</span>
                                            <span>5 Partículas Universais</span>
                                        </div>
                                    </div>
                                    
                                    <div className="priority-card" onClick={() => setSkillPriority('general')}>
                                        <h3>Homem de Ação</h3>
                                        <p>Foco em habilidades físicas e de combate</p>
                                        <div className="priority-details">
                                            <span>11 pontos em Habilidades Gerais</span>
                                            <span>7 pontos em Habilidades Investigativas</span>
                                            <span>3 Partículas Universais</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="skills-distribution">
                                    <button 
                                        className="change-priority-btn"
                                        onClick={() => {
                                            setSkillPriority(null);
                                            setSkills({});
                                        }}
                                    >
                                        ← Mudar Prioridade
                                    </button>
                                    <div className="skills-category">
                                        <div className="skills-category-header">
                                            <h3>Habilidades Investigativas</h3>
                                            <span className="points-remaining">
                                                {investigativePointsAvailable} pontos restantes
                                            </span>
                                        </div>
                                        <div className="skills-grid">
                                            {INVESTIGATIVE_SKILLS.map(skill => (
                                                <div key={skill} className="skill-item">
                                                    <label>{skill}</label>
                                                    <div className="skill-controls">
                                                        <button
                                                            className="skill-btn minus"
                                                            onClick={() => adjustSkill(skill, -1)}
                                                            disabled={!skills[skill] || skills[skill] === 0}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="skill-value">{skills[skill] || 0}</span>
                                                        <button
                                                            className="skill-btn plus"
                                                            onClick={() => adjustSkill(skill, 1)}
                                                            disabled={
                                                                (skills[skill] || 0) >= 3 ||
                                                                investigativePointsAvailable <= 0
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="skills-category">
                                        <div className="skills-category-header">
                                            <h3>Habilidades Gerais</h3>
                                            <span className="points-remaining">
                                                {generalPointsAvailable} pontos restantes
                                            </span>
                                        </div>
                                        <div className="skills-grid">
                                            {GENERAL_SKILLS.map(skill => (
                                                <div key={skill} className="skill-item">
                                                    <label>{skill}</label>
                                                    <div className="skill-controls">
                                                        <button
                                                            className="skill-btn minus"
                                                            onClick={() => adjustSkill(skill, -1)}
                                                            disabled={!skills[skill] || skills[skill] === 0}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="skill-value">{skills[skill] || 0}</span>
                                                        <button
                                                            className="skill-btn plus"
                                                            onClick={() => adjustSkill(skill, 1)}
                                                            disabled={
                                                                (skills[skill] || 0) >= 3 ||
                                                                generalPointsAvailable <= 0
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Step 4: Pathway and Particles (keeping existing implementation) */}
                    {currentStep === 4 && (
                        <div className="wizard-step-content pathway-step">
                            <h2 className="step-title">Caminho e Partículas</h2>
                            <p className="step-description">
                                Escolha seu Caminho Beyonder. Você receberá a Partícula de Domínio do caminho e poderá escolher 
                                {maxUniversalParticles} Partículas Universais.
                            </p>
                            
                            <div className="pathway-selection">
                                <label htmlFor="pathway">Escolha seu Caminho:</label>
                                <select 
                                    id="pathway"
                                    value={selectedPathway} 
                                    onChange={(e) => setSelectedPathway(e.target.value)}
                                    className="pathway-dropdown"
                                >
                                    <option value="">Selecione um caminho...</option>
                                    {PATHWAYS.map(pathway => (
                                        <option key={pathway} value={pathway}>
                                            {PATHWAY_DISPLAY_NAMES[pathway] || pathway}
                                        </option>
                                    ))}
                                </select>
                                
                                {selectedPathway && DOMAIN_PARTICLES[selectedPathway] && (
                                    <div className="domain-particle-display">
                                        <h4>Partícula de Domínio:</h4>
                                        <div className="particle-card domain">
                                            <span className="particle-name">{DOMAIN_PARTICLES[selectedPathway].particle}</span>
                                            <span className="particle-word">"{DOMAIN_PARTICLES[selectedPathway].word}"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {selectedPathway && (
                                <div className="universal-particles-selection">
                                    <h3>Selecione {maxUniversalParticles} Partículas Universais:</h3>
                                    <p className="selection-counter">
                                        {selectedUniversalParticles.length} / {maxUniversalParticles} selecionadas
                                    </p>
                                    
                                    {Object.entries(UNIVERSAL_PARTICLES).map(([category, particles]) => (
                                        <div key={category} className="particle-category">
                                            <h4>{category}</h4>
                                            <div className="particle-grid">
                                                {particles.map(particle => {
                                                    const isSelected = selectedUniversalParticles.some(
                                                        p => p.name === particle.name && p.word === particle.word
                                                    );
                                                    return (
                                                        <div
                                                            key={`${particle.name}-${particle.word}`}
                                                            className={`particle-card universal ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => toggleUniversalParticle(particle)}
                                                        >
                                                            <span className="particle-name">{particle.name}</span>
                                                            <span className="particle-word">"{particle.word}"</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Step 5: Bloodline */}
                    {currentStep === 5 && (
                        <div className="wizard-step-content bloodline-step">
                            <h2 className="step-title">Linhagem do Personagem</h2>
                            <p className="step-description">
                                Você herdou seu poder ou tropeçou nele? Escolher uma Linhagem concede privilégios poderosos, 
                                mas impõe Maldições permanentes. Linhagens são adquiridas com Pontos de Bônus (PB) na criação.
                            </p>
                            
                            <div className="bloodlines-grid">
                                {BLOODLINES.map(bloodline => (
                                    <div
                                        key={bloodline.id}
                                        className={`bloodline-card ${selectedBloodline === bloodline.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedBloodline(bloodline.id)}
                                    >
                                        <div className="bloodline-header">
                                            <h3>{bloodline.name}</h3>
                                            {bloodline.cost > 0 && (
                                                <span className="bloodline-cost">{bloodline.cost} PB</span>
                                            )}
                                        </div>
                                        <p className="bloodline-description">{bloodline.description}</p>
                                        
                                        {bloodline.privileges.length > 0 && (
                                            <div className="bloodline-privileges">
                                                <strong>Privilégios de Sangue:</strong>
                                                <ul>
                                                    {bloodline.privileges.map((priv, idx) => (
                                                        <li key={idx}>{priv}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {bloodline.curses.length > 0 && (
                                            <div className="bloodline-curses">
                                                <strong>Maldições da Linhagem:</strong>
                                                <ul>
                                                    {bloodline.curses.map((curse, idx) => (
                                                        <li key={idx}>{curse}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Step 6: Affiliation */}
                    {currentStep === 6 && (
                        <div className="wizard-step-content affiliation-step">
                            <h2 className="step-title">Afiliações</h2>
                            <p className="step-description">
                                Escolha sua afiliação para receber deveres, restrições e, crucialmente, definir a progressão de 
                                seu Status dentro dela. Sua hierarquia depende da organização. 
                                {selectedAffiliation !== 'none' && ' Você recebe 1 ponto gratuito de Status.'}
                            </p>
                            
                            <div className="affiliation-selection">
                                <h3>Escolha uma Organização</h3>
                                <div className="affiliations-grid">
                                    {AFFILIATIONS.map(affiliation => (
                                        <div
                                            key={affiliation.id}
                                            className={`affiliation-card ${selectedAffiliation === affiliation.id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAffiliation(affiliation.id);
                                                if (affiliation.id !== 'none') {
                                                    setAffiliationStatus(1);
                                                } else {
                                                    setAffiliationStatus(0);
                                                }
                                            }}
                                        >
                                            <div className="affiliation-header">
                                                <h4>{affiliation.name}</h4>
                                                {affiliation.type !== 'orthodox' && (
                                                    <span className="affiliation-badge secret">Secreta</span>
                                                )}
                                            </div>
                                            <p>{affiliation.description}</p>
                                            
                                            {affiliation.duties.length > 0 && (
                                                <div className="affiliation-duties">
                                                    <strong>Deveres:</strong>
                                                    <ul>
                                                        {affiliation.duties.map((duty, idx) => (
                                                            <li key={idx}>{duty}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {selectedAffiliation !== 'none' && (
                                <div className="status-selection">
                                    <h3>Nível de Status na Organização</h3>
                                    <p className="status-info">
                                        Você tem 1 ponto gratuito. Use pontos de Antecedentes para aumentar até o nível 5.
                                    </p>
                                    
                                    <div className="status-controls">
                                        <button 
                                            className="status-btn minus"
                                            onClick={() => {
                                                if (affiliationStatus > 1) {
                                                    setAffiliationStatus(affiliationStatus - 1);
                                                    setBackgrounds(prev => ({ ...prev, status: affiliationStatus - 1 }));
                                                }
                                            }}
                                            disabled={affiliationStatus <= 1}
                                        >
                                            −
                                        </button>
                                        <div className="status-display">
                                            <span className="status-value">{affiliationStatus}</span>
                                            <span className="status-dots">{'●'.repeat(affiliationStatus)}{'○'.repeat(5 - affiliationStatus)}</span>
                                        </div>
                                        <button 
                                            className="status-btn plus"
                                            onClick={() => {
                                                if (affiliationStatus < 5) {
                                                    setAffiliationStatus(affiliationStatus + 1);
                                                    setBackgrounds(prev => ({ ...prev, status: affiliationStatus + 1 }));
                                                }
                                            }}
                                            disabled={affiliationStatus >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    {AFFILIATIONS.find(a => a.id === selectedAffiliation)?.statusBenefits.find(sb => sb.status === affiliationStatus) && (
                                        <div className="status-benefits">
                                            <h4>Nível {affiliationStatus}: {AFFILIATIONS.find(a => a.id === selectedAffiliation)!.statusBenefits.find(sb => sb.status === affiliationStatus)!.title}</h4>
                                            <p className="status-desc">{AFFILIATIONS.find(a => a.id === selectedAffiliation)!.statusBenefits.find(sb => sb.status === affiliationStatus)!.description}</p>
                                            <ul>
                                                {AFFILIATIONS.find(a => a.id === selectedAffiliation)!.statusBenefits.find(sb => sb.status === affiliationStatus)!.benefits.map((benefit, idx) => (
                                                    <li key={idx}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Step 7: Backgrounds */}
                    {currentStep === 7 && (
                        <div className="wizard-step-content backgrounds-step">
                            <h2 className="step-title">Antecedentes</h2>
                            <p className="step-description">
                                Você tem {getAvailableBackgroundPoints.total} pontos para distribuir nos seus Antecedentes.
                                {selectedBloodline === 'augustus' && ' (Linhagem Augustus concede Status 3 e Recursos 3 gratuitamente)'}
                                {selectedAffiliation !== 'none' && ' (Afiliação concede 1 ponto gratuito de Status)'}
                            </p>
                            
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(212, 175, 55, 0.1)',
                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '12px'
                            }}>
                                <h3 style={{ 
                                    color: '#d4af37', 
                                    marginBottom: '0.5rem',
                                    fontSize: '1.3rem'
                                }}>
                                    Pontos de Antecedentes
                                </h3>
                                <p style={{ 
                                    fontSize: '2.5rem', 
                                    fontWeight: 'bold',
                                    margin: '0.5rem 0',
                                    color: getAvailableBackgroundPoints.used === getAvailableBackgroundPoints.total ? '#4a9bff' : '#ff6b6b'
                                }}>
                                    {getAvailableBackgroundPoints.used} / {getAvailableBackgroundPoints.total}
                                </p>
                                <p style={{ 
                                    color: '#8896a8', 
                                    fontSize: '1rem',
                                    margin: 0
                                }}>
                                    {getAvailableBackgroundPoints.used < getAvailableBackgroundPoints.total 
                                        ? `Faltam ${getAvailableBackgroundPoints.total - getAvailableBackgroundPoints.used} pontos para alocar` 
                                        : '✓ Todos os pontos alocados!'}
                                </p>
                            </div>
                            
                            <div className="backgrounds-grid">
                                <div className="background-item">
                                    <label>Aliados</label>
                                    <p className="background-desc">Amigos e contatos que o ajudarão quando precisar</p>
                                    <div className="background-controls">
                                        <button 
                                            className="bg-btn minus"
                                            onClick={() => adjustBackground('aliados', -1)}
                                            disabled={backgrounds.aliados <= 0}
                                        >
                                            −
                                        </button>
                                        <span className="background-value">
                                            {'●'.repeat(backgrounds.aliados)}{'○'.repeat(5 - backgrounds.aliados)}
                                        </span>
                                        <button 
                                            className="bg-btn plus"
                                            onClick={() => adjustBackground('aliados', 1)}
                                            disabled={backgrounds.aliados >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="background-item">
                                    <label>Recursos</label>
                                    <p className="background-desc">Riqueza, propriedades e bens materiais</p>
                                    <div className="background-controls">
                                        <button 
                                            className="bg-btn minus"
                                            onClick={() => adjustBackground('recursos', -1)}
                                            disabled={backgrounds.recursos <= 0}
                                        >
                                            −
                                        </button>
                                        <span className="background-value">
                                            {(() => {
                                                const freePoints = getAvailableBackgroundPoints.freeResources;
                                                const totalPoints = backgrounds.recursos;
                                                const paidPoints = Math.max(0, totalPoints - freePoints);
                                                const freeDots = Math.min(totalPoints, freePoints);
                                                return (
                                                    <>
                                                        {freeDots > 0 && <span style={{color: '#4a9bff'}}>{'●'.repeat(freeDots)}</span>}
                                                        {paidPoints > 0 && <span>{'●'.repeat(paidPoints)}</span>}
                                                        {'○'.repeat(5 - totalPoints)}
                                                    </>
                                                );
                                            })()}
                                        </span>
                                        <button 
                                            className="bg-btn plus"
                                            onClick={() => adjustBackground('recursos', 1)}
                                            disabled={backgrounds.recursos >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {getAvailableBackgroundPoints.freeResources > 0 && (
                                        <span className="background-note">
                                            ✓ Primeiros {getAvailableBackgroundPoints.freeResources} pontos gratuitos (Augustus)
                                        </span>
                                    )}
                                </div>
                                
                                <div className="background-item">
                                    <label>Contatos</label>
                                    <p className="background-desc">Fontes de informação e conhecimento</p>
                                    <div className="background-controls">
                                        <button 
                                            className="bg-btn minus"
                                            onClick={() => adjustBackground('contatos', -1)}
                                            disabled={backgrounds.contatos <= 0}
                                        >
                                            −
                                        </button>
                                        <span className="background-value">
                                            {'●'.repeat(backgrounds.contatos)}{'○'.repeat(5 - backgrounds.contatos)}
                                        </span>
                                        <button 
                                            className="bg-btn plus"
                                            onClick={() => adjustBackground('contatos', 1)}
                                            disabled={backgrounds.contatos >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="background-item">
                                    <label>Mentor</label>
                                    <p className="background-desc">Um professor ou guia poderoso</p>
                                    <div className="background-controls">
                                        <button 
                                            className="bg-btn minus"
                                            onClick={() => adjustBackground('mentor', -1)}
                                            disabled={backgrounds.mentor <= 0}
                                        >
                                            −
                                        </button>
                                        <span className="background-value">
                                            {'●'.repeat(backgrounds.mentor)}{'○'.repeat(5 - backgrounds.mentor)}
                                        </span>
                                        <button 
                                            className="bg-btn plus"
                                            onClick={() => adjustBackground('mentor', 1)}
                                            disabled={backgrounds.mentor >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="background-item">
                                    <label>Status (Hierarquia)</label>
                                    <p className="background-desc">Posição social e influência</p>
                                    <div className="background-controls">
                                        <button 
                                            className="bg-btn minus"
                                            onClick={() => adjustBackground('status', -1)}
                                            disabled={backgrounds.status <= 0}
                                        >
                                            −
                                        </button>
                                        <span className="background-value">
                                            {(() => {
                                                const freePoints = getAvailableBackgroundPoints.freeStatus;
                                                const totalPoints = backgrounds.status;
                                                const paidPoints = Math.max(0, totalPoints - freePoints);
                                                const freeDots = Math.min(totalPoints, freePoints);
                                                return (
                                                    <>
                                                        {freeDots > 0 && <span style={{color: '#4a9bff'}}>{'●'.repeat(freeDots)}</span>}
                                                        {paidPoints > 0 && <span>{'●'.repeat(paidPoints)}</span>}
                                                        {'○'.repeat(5 - totalPoints)}
                                                    </>
                                                );
                                            })()}
                                        </span>
                                        <button 
                                            className="bg-btn plus"
                                            onClick={() => adjustBackground('status', 1)}
                                            disabled={backgrounds.status >= 5}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {getAvailableBackgroundPoints.freeStatus > 0 && (
                                        <span className="background-note">
                                            {getAvailableBackgroundPoints.freeStatus === 1 
                                                ? '✓ Primeiro ponto gratuito (Afiliação)'
                                                : `✓ Primeiros ${getAvailableBackgroundPoints.freeStatus} pontos gratuitos (${selectedBloodline === 'augustus' ? 'Augustus' : 'Bônus'})`
                                            }
                                        </span>
                                    )}
                                </div>
                                
                                {/* Automatic Extra Backgrounds Preview */}
                                {(selectedBloodline !== 'none' || selectedAffiliation !== 'none') && (
                                    <>
                                        {(() => {
                                            const bloodline = BLOODLINES.find(b => b.id === selectedBloodline);
                                            const affiliation = AFFILIATIONS.find(a => a.id === selectedAffiliation);
                                            const extras: any[] = [];
                                            
                                            // Add enemies from bloodline
                                            if (bloodline?.enemies) {
                                                bloodline.enemies.forEach(enemy => {
                                                    extras.push({
                                                        name: `Inimigos (${enemy.name})`,
                                                        description: `Você é alvo de ${enemy.name}`,
                                                        level: enemy.level,
                                                        type: 'negative'
                                                    });
                                                });
                                            }
                                            
                                            // Show starting skills as backgrounds
                                            if (bloodline?.mechanics?.startingSkills) {
                                                bloodline.mechanics.startingSkills.forEach(skill => {
                                                    extras.push({
                                                        name: `Perícia Inicial (${skill.skill})`,
                                                        description: `Você começa com ${skill.dots} ponto(s) em ${skill.skill}`,
                                                        level: skill.dots,
                                                        type: 'bonus'
                                                    });
                                                });
                                            }
                                            
                                            return extras.length > 0 ? (
                                                <div style={{gridColumn: '1 / -1', marginBottom: '1rem'}}>
                                                    <h3 style={{color: '#d4af37', marginBottom: '1rem'}}>Antecedentes Automáticos</h3>
                                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                                                        {extras.map((extra, idx) => (
                                                            <div key={idx} className={`background-item ${extra.type === 'negative' ? 'negative' : 'bonus'}`} style={{
                                                                border: extra.type === 'negative' ? '2px solid rgba(255, 107, 107, 0.3)' : '2px solid rgba(74, 155, 255, 0.3)',
                                                                background: extra.type === 'negative' ? 'rgba(255, 107, 107, 0.05)' : 'rgba(74, 155, 255, 0.05)'
                                                            }}>
                                                                <label style={{color: extra.type === 'negative' ? '#ff6b6b' : '#4a9bff'}}>
                                                                    {extra.name}
                                                                </label>
                                                                <p className="background-desc">{extra.description}</p>
                                                                <div className="background-controls">
                                                                    <span className="background-value" style={{color: extra.type === 'negative' ? '#ff6b6b' : '#4a9bff'}}>
                                                                        {'●'.repeat(extra.level)}{'○'.repeat(5 - extra.level)}
                                                                    </span>
                                                                </div>
                                                                <span className="background-note" style={{color: extra.type === 'negative' ? '#ff6b6b' : '#4a9bff'}}>
                                                                    {extra.type === 'negative' ? '⚠ Desvantagem' : '✓ Bônus'} da Linhagem/Afiliação
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
                                    </>
                                )}
                                
                                {/* Custom Backgrounds */}
                                {customBackgrounds.map(bg => (
                                    <div key={bg.id} className="background-item custom">
                                        <div className="custom-bg-header">
                                            <label>{bg.name}</label>
                                            <button 
                                                className="remove-custom-bg"
                                                onClick={() => handleRemoveCustomBackground(bg.id)}
                                                title="Remover"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {bg.description && <p className="background-desc">{bg.description}</p>}
                                        <div className="background-controls">
                                            <button 
                                                className="bg-btn minus"
                                                onClick={() => adjustCustomBackground(bg.id, -1)}
                                                disabled={bg.points <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="background-value">
                                                {'●'.repeat(bg.points)}{'○'.repeat(5 - bg.points)}
                                            </span>
                                            <button 
                                                className="bg-btn plus"
                                                onClick={() => adjustCustomBackground(bg.id, 1)}
                                                disabled={bg.points >= 5}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Add Custom Background Button/Form */}
                                {!isCreatingCustomBg && (
                                    <div className="background-item add-custom">
                                        <button 
                                            className="add-custom-bg-btn"
                                            onClick={() => setIsCreatingCustomBg(true)}
                                            disabled={getAvailableBackgroundPoints.used >= getAvailableBackgroundPoints.total}
                                        >
                                            + Criar Antecedente Personalizado
                                        </button>
                                    </div>
                                )}
                                
                                {isCreatingCustomBg && (
                                    <div className="background-item custom-form">
                                        <h4>Novo Antecedente</h4>
                                        <input
                                            type="text"
                                            placeholder="Nome do antecedente"
                                            value={newBgName}
                                            onChange={(e) => setNewBgName(e.target.value)}
                                            className="custom-bg-input"
                                        />
                                        <textarea
                                            placeholder="Descrição (opcional)"
                                            value={newBgDesc}
                                            onChange={(e) => setNewBgDesc(e.target.value)}
                                            className="custom-bg-textarea"
                                            rows={2}
                                        />
                                        <div className="custom-bg-points">
                                            <label>Pontos iniciais:</label>
                                            <div className="points-selector">
                                                {[1, 2, 3, 4, 5].map(p => (
                                                    <button
                                                        key={p}
                                                        className={`point-btn ${newBgPoints === p ? 'selected' : ''}`}
                                                        onClick={() => setNewBgPoints(p)}
                                                        disabled={getAvailableBackgroundPoints.used + p > getAvailableBackgroundPoints.total}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="custom-bg-actions">
                                            <button 
                                                className="wizard-btn secondary small"
                                                onClick={() => {
                                                    setIsCreatingCustomBg(false);
                                                    setNewBgName('');
                                                    setNewBgDesc('');
                                                    setNewBgPoints(1);
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                className="wizard-btn primary small"
                                                onClick={handleCreateCustomBackground}
                                                disabled={!newBgName.trim() || newBgPoints < 1}
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="wizard-footer">
                    <button 
                        className="wizard-btn secondary" 
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        Voltar
                    </button>
                    
                    <button 
                        className="wizard-btn primary" 
                        onClick={handleNext}
                        disabled={
                            (currentStep === 1 && !canProceedStep1) ||
                            (currentStep === 2 && !canProceedStep2) ||
                            (currentStep === 3 && !canProceedStep3) ||
                            (currentStep === 4 && !canProceedStep4) ||
                            (currentStep === 5 && !canProceedStep5) ||
                            (currentStep === 6 && !canProceedStep6) ||
                            (currentStep === 7 && !canProceedStep7) ||
                            isCreating
                        }
                    >
                        {currentStep === 8 
                            ? (isCreating ? 'Criando Personagem...' : 'Criar Personagem')
                            : 'Próximo'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};
