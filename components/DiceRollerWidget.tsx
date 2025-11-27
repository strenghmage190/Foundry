import React, { useState, useRef, useEffect } from 'react';
import { ToastData } from '../types';
import { rollDice } from '../utils/diceRoller';
import { DiceIcon } from './icons';

interface DiceRollerWidgetProps {
    addToast: (toast: Omit<ToastData, 'id'>) => void;
}

interface RollResult {
    rolls: number[];
    successes: number;
}

export const DiceRollerWidget: React.FC<DiceRollerWidgetProps> = ({ addToast }) => {
    const [numDice, setNumDice] = useState(1);
    const [difficulty, setDifficulty] = useState(6);
    const [modifier, setModifier] = useState(0);
    const [rollName, setRollName] = useState("Rolagem Manual");
    const [numBlackDice, setNumBlackDice] = useState(0);
    
    const [lastResult, setLastResult] = useState<RollResult | null>(null);

    const numDiceRef = useRef<HTMLInputElement>(null);
    const numBlackDiceRef = useRef<HTMLInputElement>(null);
    const modifierRef = useRef<HTMLInputElement>(null);
    const difficultyRef = useRef<HTMLInputElement>(null);

    // Previne scroll wheel de alterar valores dos inputs de números
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
        };

        const inputs = [numDiceRef.current, numBlackDiceRef.current, modifierRef.current, difficultyRef.current];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('wheel', handleWheel, { passive: false });
            }
        });

        return () => {
            inputs.forEach(input => {
                if (input) {
                    input.removeEventListener('wheel', handleWheel);
                }
            });
        };
    }, []);

    const handleRoll = () => {
        const totalPool = numDice + modifier;
        const whiteDice = Math.max(0, totalPool - numBlackDice);
        const blackDice = Math.min(numBlackDice, totalPool);
        
        if (totalPool <= 0) {
            setLastResult({ rolls: [], successes: 0 });
            return;
        }
        
        // Roll white dice (soul dice) - normal rules
        const whiteRolls: number[] = [];
        let whiteSuccesses = 0;
        for (let i = 0; i < whiteDice; i++) {
            const roll = Math.floor(Math.random() * 10) + 1;
            whiteRolls.push(roll);
            if (roll >= difficulty) {
                whiteSuccesses += (roll === 10 ? 2 : 1);
            }
        }
        
        // Roll black dice (assimilation dice) - enhanced rules
        const blackRolls: number[] = [];
        let blackSuccesses = 0;
        let hasBlackOne = false;
        for (let i = 0; i < blackDice; i++) {
            const roll = Math.floor(Math.random() * 10) + 1;
            blackRolls.push(roll);
            if (roll === 1) {
                hasBlackOne = true;
            } else if (roll >= difficulty) {
                blackSuccesses += (roll === 10 ? 3 : 2);
            }
        }
        
        // Black 1 cancels highest success
        let totalSuccesses = whiteSuccesses + blackSuccesses;
        if (hasBlackOne && totalSuccesses > 0) {
            totalSuccesses -= 1;
        }
        
        const allRolls = [...whiteRolls, ...blackRolls];
        const hasOne = allRolls.includes(1);
        const isBotch = totalSuccesses === 0 && hasOne;
        
        const result: RollResult = { rolls: allRolls, successes: Math.max(0, totalSuccesses) };
        
        setLastResult(result);
        
        // Create toast notification
        let message = `${result.successes} sucesso(s).`;
        if (isBotch) {
            message = `BOTCH! Falha crítica!`;
            if (hasBlackOne) {
                message += ` (Intrusão de Loucura!)`;
            }
        }
        
        const whiteDetails = whiteDice > 0 ? `Brancos: [${whiteRolls.join(', ')}] = ${whiteSuccesses} sucessos` : '';
        const blackDetails = blackDice > 0 ? `Pretos: [${blackRolls.join(', ')}] = ${blackSuccesses} sucessos` : '';
        const cancelNote = hasBlackOne && (whiteSuccesses + blackSuccesses) > 0 ? `\n⚠️ Dado preto '1' cancelou 1 sucesso` : '';
        
        const details = `Parada: ${totalPool} dados (${whiteDice} brancos + ${blackDice} pretos)\nDificuldade: ${difficulty}\n${whiteDetails}${blackDetails ? '\n' + blackDetails : ''}${cancelNote}`;
        
        addToast({
            type: isBotch ? 'failure' : (result.successes > 0 ? 'success' : 'failure'),
            title: rollName,
            message: message,
            details: details,
        });
    };

    return (
        <div className="dice-roller-widget">
            <h3 className="section-title">Rolador de Dados</h3>
            <div className="form-group">
                <input type="text" value={rollName} onChange={e => setRollName(e.target.value || "Rolagem Manual")} placeholder="Nome da Rolagem"/>
            </div>
            <div className="dice-roller-form">
                <div className="form-group">
                    <label>Parada Total</label>
                    <input ref={numDiceRef} type="number" value={numDice} onChange={e => setNumDice(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label>🎲 Dados Pretos (Assimilação)</label>
                    <input 
                        ref={numBlackDiceRef}
                        type="number" 
                        value={numBlackDice} 
                        onChange={e => setNumBlackDice(Math.max(0, parseInt(e.target.value) || 0))} 
                        max={numDice}
                        title="Dados de Assimilação: 6-9 = 2 sucessos, 10 = 3 sucessos, mas 1 cancela seu melhor sucesso!"
                    />
                </div>
                <div className="form-group">
                    <label>Bônus/Penalidade</label>
                    <input ref={modifierRef} type="number" value={modifier} onChange={e => setModifier(parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label>Dificuldade</label>
                    <input ref={difficultyRef} type="number" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value) || 1)} min="1" max="10" />
                </div>
                 <button onClick={handleRoll} className="roll-btn">
                    <DiceIcon /> Rolar!
                </button>
            </div>
            
            <div className="dice-legend">
                <p><strong>🤍 Dados Brancos (Alma):</strong> 6-9 = 1 sucesso | 10 = 2 sucessos</p>
                <p><strong>🖤 Dados Pretos (Assimilação):</strong> 6-9 = 2 sucessos | 10 = 3 sucessos | ⚠️ 1 = cancela 1 sucesso</p>
            </div>
            
            {lastResult && (
                <div className="dice-results-section">
                    <h4>Última Rolagem:</h4>
                    <div className="dice-display">
                        {lastResult.rolls.map((roll, index) => (
                            <div key={index} className={`die-result ${roll >= difficulty ? 'success' : ''} ${roll === 1 ? 'botch' : ''}`}>
                                {roll}
                            </div>
                        ))}
                    </div>
                    <div className="results-summary">
                        Total de Sucessos: <span>{lastResult.successes}</span>
                    </div>
                </div>
            )}
        </div>
    );
};