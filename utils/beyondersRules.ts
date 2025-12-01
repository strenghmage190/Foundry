/**
 * Beyonders Dice Rules System
 * Implementa o sistema de Ações Gerais, Dados da Alma vs Assimilação, e Ações Investigativas
 */

export interface DicePoolBreakdown {
    soulDice: number;
    assimilationDice: number;
    totalDice: number;
}

export interface DiceRoll {
    soulRolls: number[];
    assimilationRolls: number[];
    totalRolls: number[];
    soulSuccesses: number;
    assimilationSuccesses: number;
    totalSuccesses: number;
    madnessTriggers: number; // Quantidade de '1' em dados pretos
    isBotch: boolean;
    madnessMessage: string;
}

/**
 * Calcula sucessos de um dado individual baseado no tipo e valor
 * @param roll - O valor do d10 (1-10)
 * @param diceType - 'soul' (branco) ou 'assimilation' (preto)
 * @param difficulty - Dificuldade (padrão 6)
 * @returns Número de sucessos
 */
const calculateDiceSuccess = (
    roll: number,
    diceType: 'soul' | 'assimilation',
    difficulty: number = 6
): number => {
    if (roll < difficulty && roll !== 10) return 0;
    
    if (diceType === 'soul') {
        // Dados da Alma: 6-9 = 1 sucesso, 10 = 2 sucessos
        if (roll === 10) return 2;
        if (roll >= difficulty) return 1;
        return 0;
    } else {
        // Dados de Assimilação: 6-9 = 2 sucessos, 10 = 3 sucessos
        if (roll === 10) return 3;
        if (roll >= difficulty) return 2;
        return 0;
    }
};

/**
 * Realiza uma rolagem de Ação Geral com dados da Alma e Assimilação
 * @param soulDiceCount - Quantos dados da Alma usar
 * @param assimilationDiceCount - Quantos dados de Assimilação usar
 * @param difficulty - Dificuldade (padrão 6)
 * @returns Resultado detalhado da rolagem
 */
export const rollGeneralAction = (
    soulDiceCount: number,
    assimilationDiceCount: number,
    difficulty: number = 6
): DiceRoll => {
    // Validação
    if (soulDiceCount < 0) soulDiceCount = 0;
    if (assimilationDiceCount < 0) assimilationDiceCount = 0;
    if (soulDiceCount + assimilationDiceCount === 0) {
        return {
            soulRolls: [],
            assimilationRolls: [],
            totalRolls: [],
            soulSuccesses: 0,
            assimilationSuccesses: 0,
            totalSuccesses: 0,
            madnessTriggers: 0,
            isBotch: false,
            madnessMessage: '',
        };
    }

    // Rolar dados da alma
    const soulRolls = Array.from(
        { length: soulDiceCount },
        () => Math.floor(Math.random() * 10) + 1
    );

    // Rolar dados de assimilação
    const assimilationRolls = Array.from(
        { length: assimilationDiceCount },
        () => Math.floor(Math.random() * 10) + 1
    );

    // Calcular sucessos
    const soulSuccesses = soulRolls.reduce(
        (acc, roll) => acc + calculateDiceSuccess(roll, 'soul', difficulty),
        0
    );

    const assimilationSuccesses = assimilationRolls.reduce(
        (acc, roll) => acc + calculateDiceSuccess(roll, 'assimilation', difficulty),
        0
    );

    // Contar intrusões de loucura (1s em dados pretos)
    const madnessTriggers = assimilationRolls.filter(roll => roll === 1).length;

    // Calcular sucessos totais ANTES da intrusão
    let totalSuccesses = soulSuccesses + assimilationSuccesses;

    // Aplicar intrusão de loucura: cada '1' em preto cancela 1 sucesso
    // (aplicado ao maior(s) sucesso(s) primeiro). Esta lógica subtrai
    // 1 sucesso por intrusão, em vez de zerar o dado inteiro.
    let cancelledSuccesses = 0;
    if (madnessTriggers > 0 && totalSuccesses > 0) {
        // Montar lista de sucessos com seus valores para encontrar os maiores
        const allSuccesses = [
            ...soulRolls.map(r => ({ type: 'soul' as const, value: calculateDiceSuccess(r, 'soul', difficulty) })),
            ...assimilationRolls.map(r => ({ type: 'assimilation' as const, value: calculateDiceSuccess(r, 'assimilation', difficulty) })),
        ];

        // Para cada intrusão, remover 1 sucesso do maior dado que ainda tenha sucessos
        for (let m = 0; m < madnessTriggers; m++) {
            // Encontrar índice do maior valor atual
            let maxIndex = -1;
            let maxValue = 0;
            for (let i = 0; i < allSuccesses.length; i++) {
                if (allSuccesses[i].value > maxValue) {
                    maxValue = allSuccesses[i].value;
                    maxIndex = i;
                }
            }
            if (maxIndex === -1 || maxValue <= 0) break; // nada mais para cancelar

            // Cancelar apenas 1 sucesso desse dado
            allSuccesses[maxIndex].value -= 1;
            cancelledSuccesses += 1;
        }

        totalSuccesses = Math.max(0, totalSuccesses - cancelledSuccesses);
    }

    // Verificar Botch: 0 sucessos E pelo menos um '1' em qualquer dado
    const allRolls = [...soulRolls, ...assimilationRolls];
    const isBotch = totalSuccesses === 0 && allRolls.includes(1);

    let madnessMessage = '';
    if (madnessTriggers > 0) {
        madnessMessage = `⚠️ Intrusão de Loucura! (${madnessTriggers}x '1' em Dados Pretos) ${cancelledSuccesses} sucesso(s) cancelado(s).`;
    }
    if (isBotch) {
        madnessMessage += madnessMessage ? ` BOTCH!` : `❌ BOTCH! O poder se rebela!`;
    }

    return {
        soulRolls,
        assimilationRolls,
        totalRolls: allRolls,
        soulSuccesses,
        assimilationSuccesses,
        totalSuccesses,
        madnessTriggers,
        isBotch,
        madnessMessage,
    };
};

/**
 * Interface para resultado de investigação
 */
export interface InvestigationResult {
    isAutomatic: boolean; // Pista fundamental foi encontrada automaticamente
    pointsSpent: number; // Pontos da Habilidade Investigativa gastos (0 para automático)
    benefit: string; // Descrição do benefício obtido
}

/**
 * Verifica se uma pista fundamental é encontrada
 * Em Ações Investigativas, pistas fundamentais são AUTOMÁTICAS se o personagem
 * possui a Habilidade Investigativa relevante
 *
 * @param hasRelevantInvestigativeSkill - Se o personagem tem a habilidade relevante
 * @returns Resultado indicando sucesso automático
 */
export const findFundamentalClue = (hasRelevantInvestigativeSkill: boolean): InvestigationResult => {
    if (hasRelevantInvestigativeSkill) {
        return {
            isAutomatic: true,
            pointsSpent: 0,
            benefit: 'Você descobre a pista fundamental automaticamente.',
        };
    }

    return {
        isAutomatic: false,
        pointsSpent: 0,
        benefit: 'Você não possui a Habilidade Investigativa necessária.',
    };
};

/**
 * Gasta pontos de Habilidade Investigativa para benefícios especiais
 * @param pointsToSpend - Quantos pontos gastar (mínimo 1)
 * @param investigativeSkillPoints - Total de pontos disponíveis
 * @returns Resultado do gasto e benefício obtido
 */
export const spendInvestigationPoints = (
    pointsToSpend: number,
    investigativeSkillPoints: number
): InvestigationResult => {
    if (pointsToSpend < 1) {
        return {
            isAutomatic: false,
            pointsSpent: 0,
            benefit: 'Você deve gastar pelo menos 1 ponto.',
        };
    }

    if (pointsToSpend > investigativeSkillPoints) {
        return {
            isAutomatic: false,
            pointsSpent: 0,
            benefit: `Você só possui ${investigativeSkillPoints} ponto(s) disponível(is).`,
        };
    }

    // Sucesso! Pontos foram gastos para benefício narrativo
    return {
        isAutomatic: false,
        pointsSpent: pointsToSpend,
        benefit: 'Você gasta ' + pointsToSpend + ' ponto(s) para obter um benefício dedicado, flashback revelador ou detalhe crucial.',
    };
};

/**
 * Calcula a parada de dados para uma Ação Geral
 * Parada = Atributo + Habilidade Geral
 * @param attributeValue - Valor do atributo (ex: Força)
 * @param skillValue - Valor da habilidade (ex: Briga)
 * @returns Total de dados disponíveis
 */
export const calculateDicePool = (attributeValue: number, skillValue: number): number => {
    return Math.max(0, attributeValue + skillValue);
};

/**
 * Interface para purificação de dados
 */
export interface PurificationResult {
    success: boolean;
    previousAssimilationDice: number;
    newAssimilationDice: number;
    newSoulDice: number;
    message: string;
}

/**
 * Purifica um dado de Assimilação (Preto) em Dado da Alma (Branco)
 * Isto acontece quando você atinge 25% dos PAs necessários
 * @param assimilationDice - Dados pretos atuais
 * @param soulDice - Dados brancos atuais
 * @returns Resultado da purificação
 */
export const purifyAssimilationDice = (
    assimilationDice: number,
    soulDice: number
): PurificationResult => {
    if (assimilationDice <= 0) {
        return {
            success: false,
            previousAssimilationDice: 0,
            newAssimilationDice: 0,
            newSoulDice: soulDice,
            message: 'Você não possui dados de Assimilação para purificar.',
        };
    }

    return {
        success: true,
        previousAssimilationDice: assimilationDice,
        newAssimilationDice: assimilationDice - 1,
        newSoulDice: soulDice + 1,
        message: `✨ Um Dado de Assimilação (Preto) foi purificado em Dado da Alma (Branco)! Agora você possui ${assimilationDice - 1} Dados de Assimilação e ${soulDice + 1} Dados da Alma.`,
    };
};

/**
 * Calcula o ganho de dados ao avançar de sequência
 * @param currentSequence - Sequência atual
 * @param previousSequence - Sequência anterior
 * @returns Quantos dados de Assimilação foram ganhados
 */
export const calculateSequenceAdvancementBonus = (
    currentSequence: number,
    previousSequence: number
): number => {
    // A cada avanço de sequência, ganhe 4 Dados de Assimilação
    const sequenceJumps = Math.max(0, currentSequence - previousSequence);
    return sequenceJumps * 4;
};

/**
 * Purifica automaticamente todos os Dados Brancos (Alma) em Dados Pretos (Assimilação)
 * Usa a lógica inversa: Brancos → Pretos em vez de Pretos → Brancos
 * @param soulDice - Dados brancos atuais
 * @param assimilationDice - Dados pretos atuais
 * @returns Dados atualizados e mensagem
 */
export const autoPurifyAllSoulDice = (
    soulDice: number,
    assimilationDice: number
): { newSoulDice: number; newAssimilationDice: number; message: string } => {
    if (soulDice <= 0) {
        return {
            newSoulDice: soulDice,
            newAssimilationDice: assimilationDice,
            message: ''
        };
    }

    const newSoulDice = 0;
    const newAssimilationDice = assimilationDice + soulDice;

    return {
        newSoulDice,
        newAssimilationDice,
        message: `✨ ${soulDice} Dado(s) da Alma (Branco) foi/foram automaticamente purificado(s) em Assimilação (Preto)! Agora você possui ${newAssimilationDice} Dados de Assimilação.`
    };
};

