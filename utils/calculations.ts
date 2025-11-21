import { AgentData, PathwayData } from "../types";
import { paRequirementsBySequence } from "../constants";

const getSkillPoints = (agent: AgentData, skillName: string): number => {
  const h = agent.habilidades;
  if (!h) return 0;
  const all = [...(h.gerais || []), ...(h.investigativas || [])];
  const found = all.find((s) => s.name === skillName);
  return found ? found.points : 0;
};

const getEquippedArmorBonus = (agent: AgentData): number => {
  const p = agent.protections || [];
  // Soma o bônus de todas as armaduras equipadas
  return p.filter(x => x.isEquipped).reduce((total, armor) => total + (armor.armorBonus || 0), 0);
};

export const getDefense = (agent: AgentData): number => {
  const rac = agent.attributes?.raciocinio || 0;
  const esquiva = getSkillPoints(agent, "Esquiva");
  return rac + esquiva;
};

export const getAbsorptionPool = (agent: AgentData): number => {
  const vigor = agent.attributes?.vigor || 0;
  return vigor + getEquippedArmorBonus(agent);
};

export const getInitiativePool = (agent: AgentData): number => {
  const per = agent.attributes?.percepcao || 0;
  const prontidao = getSkillPoints(agent, "Prontidão");
  return per + prontidao;
};

export const getPaRequirement = (sequence: number): number => {
  return paRequirementsBySequence[sequence] ?? 999;
};

export const getSanityLossOnAdvance = (currentSequence: number): number => {
  if (currentSequence === 9) return 0;
  if (currentSequence === 3 || currentSequence === 2) return 2;
  return 1;
};

// Calculates derived pools using primary PathwayData fields.
export const computeDerivedFromPrimary = (
  agent: AgentData,
  pathway: PathwayData
) => {
  const { attributes, character, protections } = agent;
  const sequence = character.sequence;
  const vigor = attributes?.vigor || 0;
  const espiritualidade = attributes?.espiritualidade || 0;
  const raciocinio = attributes?.raciocinio || 0;
  const autocontrole = attributes?.autocontrole || 0;

  const levelsAdvanced = Math.max(0, 9 - sequence);

  const maxVitality =
    (pathway.pvBase || 0) +
    vigor * 3 +
    levelsAdvanced * (pathway.pvPorAvanço || 0) +
    (character.tempHpBonus || 0);

  const maxSpirituality =
    (pathway.peBase || 0) +
    espiritualidade * 5 +
    levelsAdvanced * (pathway.pePorAvanço || 0);

  const maxWillpower =
    raciocinio + autocontrole + (pathway.vontadeBonus || 0);

  const maxSanity = pathway.sanidade ?? character.maxSanity ?? 7;

  const equippedProtection = protections?.find((p) => p.isEquipped);
  const absorption = vigor + (equippedProtection?.armorBonus || 0);

  return {
    maxVitality,
    maxSpirituality,
    maxWillpower,
    maxSanity,
    absorption,
  } as const;
};

// Rating de Sorte evolui nas Sequências 9, 7, 5, 3 e 1
export const getMaxLuckPointsBySequence = (sequence: number): number => {
  if (sequence <= 1) return 5;
  if (sequence <= 3) return 4;
  if (sequence <= 5) return 3;
  if (sequence <= 7) return 2;
  if (sequence <= 9) return 1;
  return 0;
};

const parseSeqRequirement = (seq: string | number): number | null => {
  if (typeof seq === "number") return seq;
  const m = /^(\d+)/.exec(seq);
  return m ? parseInt(m[1], 10) : null;
};

// Checks if the agent has unlocked the innate "Maestria Arcana" in any selected pathway
export const hasArcaneMastery = (
  agent: AgentData,
  allPathways: { [key: string]: PathwayData }
): boolean => {
  const seq = agent.character.sequence;
  let selected: string[] = [];
  const c = agent.character;
  if (c.pathways?.primary) {
    selected = [c.pathways.primary, ...(c.pathways.secondary || [])].filter(Boolean);
  } else if (c.pathway) {
    selected = Array.isArray(c.pathway) ? c.pathway : [c.pathway];
  }
  for (const name of selected) {
    const pd = allPathways[name];
    const innates = pd?.poderesInatos || [];
    for (const p of innates as any[]) {
      if (typeof p.nome === "string" && p.nome.toLowerCase().includes("maestria arcana")) {
        const req = parseSeqRequirement((p as any).seq ?? 2) ?? 2;
        if (seq <= req) return true;
      }
    }
  }
  return false;
};

export const getEffectivePeCost = (
  baseCost: number,
  agent: AgentData,
  allPathways: { [key: string]: PathwayData }
): number => {
  if (hasArcaneMastery(agent, allPathways)) {
    return Math.ceil(baseCost / 2);
  }
  return baseCost;
};

export const Calculations = {
  getDefense,
  getAbsorptionPool,
  getInitiativePool,
  getPaRequirement,
  getSanityLossOnAdvance,
  computeDerivedFromPrimary,
  getMaxLuckPointsBySequence,
  hasArcaneMastery,
  getEffectivePeCost,
};
