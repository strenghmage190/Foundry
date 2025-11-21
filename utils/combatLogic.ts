import { AgentData } from '../types';
import { rollDice, rollDamage } from './diceRoller';
import { getInitiativePool, getDefense, getAbsorptionPool } from './calculations';

// Helper to collect a skill value (Perícia) from agent.habilidades
function getSkillPoints(agent: AgentData, skillName: string): number {
  const h = agent.habilidades;
  if (!h) return 0;
  const all = [...(h.gerais || []), ...(h.investigativas || [])];
  const found = all.find(s => s.name === skillName);
  return found ? found.points : 0;
}

// Generic dice pool builder for attack: attributeName + skillName (+ optional secondaryAttribute)
export function buildAttackPool(agent: AgentData, attributeName: string, skillName: string, secondaryAttribute?: string, extraBonus: number = 0): number {
  const attr = (agent.attributes as any)?.[attributeName?.toLowerCase()] || 0;
  const skill = getSkillPoints(agent, skillName);
  const sec = secondaryAttribute ? ((agent.attributes as any)?.[secondaryAttribute.toLowerCase()] || 0) : 0;
  return attr + skill + sec + extraBonus;
}

export interface InitiativeResult {
  agentId: string;
  name: string;
  pool: number;
  rolls: number[];
  successes: number;
}

export function rollInitiative(agent: AgentData): InitiativeResult {
  const pool = getInitiativePool(agent);
  const { rolls, successes } = rollDice(pool);
  const name = agent.character?.name || 'Sem Nome';
  return { agentId: agent.agent_id || name, name, pool, rolls, successes };
}

export interface AttackResolution {
  attackPool: number;
  attackRolls: number[];
  attackSuccesses: number;
  defensePool: number;
  defenseRolls: number[];
  defenseSuccesses: number;
  netSuccesses: number;
  damageFormula: string;
  weaponDamage: number; // base dice total before successes if formula doesn't embed 'sucessos'
  damageBreakdown: string;
  absorptionPool: number;
  absorptionRolls: number[];
  absorptionSuccesses: number;
  finalDamage: number;
}

export interface ResolveAttackOptions {
  attributeName: string; // ex: 'forca'
  skillName: string;     // ex: 'Armas Brancas'
  secondaryAttribute?: string; // ex: 'destreza'
  extraBonus?: number;
  damageFormula: string; // ex: '1d8 + sucessos'
  difficulty?: number;   // default 6
}

export function resolveAttack(attacker: AgentData, defender: AgentData, opts: ResolveAttackOptions): AttackResolution {
  const attackPool = buildAttackPool(attacker, opts.attributeName, opts.skillName, opts.secondaryAttribute, opts.extraBonus || 0);
  const { rolls: attackRolls, successes: attackSuccesses } = rollDice(attackPool, opts.difficulty || 6);

  const defensePool = getDefense(defender);
  const { rolls: defenseRolls, successes: defenseSuccesses } = rollDice(defensePool, opts.difficulty || 6);

  const netSuccesses = Math.max(0, attackSuccesses - defenseSuccesses);
  const damageFormula = opts.damageFormula || '1d6 + sucessos';
  // Replace 'sucessos' with netSuccesses for weapon damage calculation
  const weaponDamageResult = rollDamage(damageFormula, netSuccesses);
  const weaponDamage = weaponDamageResult?.total || 0;
  const damageBreakdown = weaponDamageResult?.breakdown || '';

  const absorptionPool = getAbsorptionPool(defender);
  const { rolls: absorptionRolls, successes: absorptionSuccesses } = rollDice(absorptionPool, opts.difficulty || 6);

  const finalDamage = Math.max(0, weaponDamage - absorptionSuccesses);

  return {
    attackPool,
    attackRolls,
    attackSuccesses,
    defensePool,
    defenseRolls,
    defenseSuccesses,
    netSuccesses,
    damageFormula,
    weaponDamage,
    damageBreakdown,
    absorptionPool,
    absorptionRolls,
    absorptionSuccesses,
    finalDamage,
  };
}
