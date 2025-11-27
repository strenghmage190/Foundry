import { rollGeneralAction, DiceRoll } from './beyondersRules';

export interface RollResult {
    rolls: number[];
    successes: number;
    isBotch: boolean;
}

/**
 * NOVO: Usa o sistema de Beyonders com Dados da Alma vs Assimilação
 * @param soulDiceCount - Quantos dados da Alma (brancos) usar
 * @param assimilationDiceCount - Quantos dados de Assimilação (pretos) usar
 * @param difficulty - Dificuldade (padrão 6)
 * @returns Resultado detalhado da rolagem
 */
export const rollDiceWithTypes = (
    soulDiceCount: number,
    assimilationDiceCount: number,
    difficulty: number = 6
): DiceRoll => {
    return rollGeneralAction(soulDiceCount, assimilationDiceCount, difficulty);
};

/**
 * LEGADO: Mantido para compatibilidade com código antigo
 * Rola dados simples sem diferenciação entre tipo
 */
export const rollDice = (pool: number, difficulty: number = 6): RollResult => {
    if (pool <= 0) {
        return { rolls: [], successes: 0, isBotch: false };
    }
    const rolls = Array.from({ length: pool }, () => Math.floor(Math.random() * 10) + 1);
    
    const successes = rolls.reduce((acc, roll) => {
        if (roll >= difficulty) {
            acc += 1;
        }
        if (roll === 10) { // Um 10 conta como um sucesso adicional
            acc += 1;
        }
        return acc;
    }, 0);

    const isBotch = successes === 0 && rolls.includes(1);

    return { rolls, successes, isBotch };
};

export interface DamageResult {
    total: number;
    breakdown: string;
}

// Analisa fórmulas de dano como "1d8 + Sucessos" ou "1d3"
export const rollDamage = (damageFormula: string, successes: number): DamageResult | null => {
    if (!damageFormula || damageFormula.trim() === '') {
        return null;
    }

    let finalFormula = damageFormula.replace(/sucessos/i, successes > 0 ? successes.toString() : '0');

    const diceRegex = /(\d+)d(\d+)/ig;
    let diceRolls: {dice: string, results: number[]}[] = [];
    
    let match;
    while ((match = diceRegex.exec(damageFormula)) !== null) {
        const numDice = parseInt(match[1], 10);
        const diceSize = parseInt(match[2], 10);
        let rollSum = 0;
        let currentRolls = [];
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * diceSize) + 1;
            rollSum += roll;
            currentRolls.push(roll);
        }
        finalFormula = finalFormula.replace(match[0], rollSum.toString());
        diceRolls.push({dice: match[0], results: currentRolls });
    }

    try {
        // Usar eval é razoavelmente seguro aqui, pois a fórmula vem de nossos próprios dados.
        const totalDamage = Math.floor(eval(finalFormula.replace(/[^0-9+\-*/().]/g, '')));

        let breakdown = `Fórmula: ${damageFormula}`;
        if (diceRolls.length > 0) {
            breakdown += diceRolls.map(d => ` | Rolagem(${d.dice}): ${d.results.join(', ')}`).join('');
        }
        if (damageFormula.toLowerCase().includes('sucessos') && successes > 0) {
           breakdown += ` | Sucessos: ${successes}`;
        }
        breakdown += ` | Total: ${totalDamage}`;

        return {
            total: totalDamage,
            breakdown: breakdown
        };
    } catch (e) {
        console.error("Erro ao calcular dano:", e);
        return { total: 0, breakdown: "Erro na fórmula de dano" };
    }
};

export const rollSimpleDice = (diceString: string): number => {
    if (!diceString) return 0;
    const match = diceString.toLowerCase().match(/(\d+)d(\d+)/);
    if (!match) return 0;
    
    const numDice = parseInt(match[1], 10);
    const diceSize = parseInt(match[2], 10);
    
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSize) + 1;
    }
    return total;
};