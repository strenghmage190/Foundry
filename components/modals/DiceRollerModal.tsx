import React, { useState, useEffect, useRef } from 'react';
import { ToastData, AgentData } from '../../types';
import { DiceIcon } from '../icons';

interface DiceRollerModalProps {
    isOpen: boolean;
    onClose: () => void;
    addLiveToast: (toast: Omit<ToastData, 'id'>) => void;
    addLogEntry: (log: Omit<ToastData, 'id'>) => void;
    agentData: AgentData;
    onUpdate: (updatedAgent: AgentData) => void;
}

interface RollResultDisplay {
    soulRolls: number[];
    assimilationRolls: number[];
    finalSuccesses: number;
    madnessMessage: string;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({ isOpen, onClose, addLiveToast, addLogEntry, agentData, onUpdate }) => {
    const [soulDice, setSoulDice] = useState(1);
    const [assimilationDice, setAssimilationDice] = useState(0);
    const [rollName, setRollName] = useState("Rolagem de Vontade");
    const [lastResult, setLastResult] = useState<RollResultDisplay | null>(null);
    
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSoulDice(1);
            setAssimilationDice(0);
            setRollName("Rolagem de Vontade");
            setLastResult(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleRoll = () => {
        const availableAssimilation = agentData?.character?.assimilationDice ?? 0;
        if (assimilationDice > availableAssimilation) {
            addLiveToast({
                type: 'failure',
                title: 'Dados de Assimilação Insuficientes',
                message: `Você tentou usar ${assimilationDice}, mas só tem ${availableAssimilation}.`,
            });
            return;
        }

        const soulRolls = Array.from({ length: soulDice }, () => Math.floor(Math.random() * 10) + 1);
        const assimilationRolls = Array.from({ length: assimilationDice }, () => Math.floor(Math.random() * 10) + 1);

        let madnessTriggers = 0;
        const soulSuccessContributions: number[] = [];
        const assimilationSuccessContributions: number[] = [];

        soulRolls.forEach(roll => {
            if (roll >= 6 && roll <= 9) soulSuccessContributions.push(1);
            else if (roll === 10) soulSuccessContributions.push(2);
        });

        assimilationRolls.forEach(roll => {
            if (roll === 1) {
                madnessTriggers++;
            } else if (roll >= 6 && roll <= 9) {
                assimilationSuccessContributions.push(2);
            } else if (roll === 10) {
                assimilationSuccessContributions.push(3);
            }
        });
        
        const soulSuccesses = soulSuccessContributions.reduce((a, b) => a + b, 0);
        const assimilationSuccesses = assimilationSuccessContributions.reduce((a, b) => a + b, 0);

        const allSuccessContributions = [...soulSuccessContributions, ...assimilationSuccessContributions];
        let totalSuccesses = allSuccessContributions.reduce((acc, val) => acc + val, 0);
        
        let madnessMessage = '';
        let successesCancelled = 0;
        const cancelledValues: number[] = [];

        if (madnessTriggers > 0) {
            allSuccessContributions.sort((a, b) => b - a); 
            for (let i = 0; i < madnessTriggers; i++) {
                if (i < allSuccessContributions.length) {
                    const cancelled = allSuccessContributions[i];
                    totalSuccesses -= cancelled;
                    successesCancelled += cancelled;
                    cancelledValues.push(cancelled);
                }
            }
            madnessMessage = `⚠️ Intrusão de Loucura! (${madnessTriggers}) O poder se rebelou.`;
        }
        
        const finalSuccesses = Math.max(0, totalSuccesses);
        
        // --- Build the detailed log message ---
        const breakdownLines = [];
        if (soulRolls.length > 0) {
            breakdownLines.push(`Alma [${soulRolls.join(', ')}] = ${soulSuccesses} Sucesso(s)`);
        }
        if (assimilationRolls.length > 0) {
            breakdownLines.push(`Assimilação [${assimilationRolls.join(', ')}] = ${assimilationSuccesses} Sucesso(s)`);
        }

        if (madnessTriggers > 0) {
            breakdownLines.push(`---`);
            breakdownLines.push(`Intrusão de Loucura (${madnessTriggers}x '1') cancela ${successesCancelled} do(s) maior(es) sucesso(s): [${cancelledValues.join(', ')}].`);
        }
        breakdownLines.push(`Total Final: ${finalSuccesses} sucesso(s).`);
        const details = breakdownLines.join('\n');

        const resultType: ToastData['type'] = madnessTriggers > 0 ? 'failure' : (finalSuccesses > 0 ? 'success' : 'failure');
        const title = madnessTriggers > 0 ? `⚠️ INTRUSÃO DE LOUCURA!` : rollName;
        const toastMessage = madnessTriggers > 0 
            ? `O poder se rebelou! Resultado: ${finalSuccesses} sucesso(s).`
            : `${finalSuccesses} sucesso(s).`;
        const logMessage = `${finalSuccesses} sucesso(s). ${madnessMessage}`;
        
        addLiveToast({ type: resultType, title, message: toastMessage });
        addLogEntry({ type: resultType, title: title, message: logMessage, details });

        setLastResult({ soulRolls, assimilationRolls, finalSuccesses, madnessMessage });

        if (assimilationDice > 0) {
            const currentAssim = agentData?.character?.assimilationDice ?? 0;
            const updatedAgent = {
                ...agentData,
                character: {
                    ...agentData.character,
                    assimilationDice: Math.max(0, currentAssim - assimilationDice),
                }
            };
            onUpdate(updatedAgent);
        }
    };
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content dice-roller-modal" ref={modalContentRef}>
                <div className="modal-header">
                    <h3 className="title-font">Rolagem de Vontade</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>

                <div className="form-group">
                    <input type="text" value={rollName} onChange={e => setRollName(e.target.value || "Rolagem de Vontade")} placeholder="Nome da Rolagem"/>
                </div>
                <div className="will-roll-form">
                    <div className="form-group">
                        <label htmlFor="soul-dice-input">Dados da Alma (Brancos)</label>
                        <input id="soul-dice-input" type="number" min="0" value={soulDice} onChange={e => setSoulDice(Math.max(0, parseInt(e.target.value) || 0))} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="assimilation-dice-input">Dados de Assimilação (Pretos)</label>
                        <input id="assimilation-dice-input" type="number" min="0" value={assimilationDice} onChange={e => setAssimilationDice(Math.max(0, parseInt(e.target.value) || 0))} />
                        <span className="assimilation-available">Disponível: {agentData?.character?.assimilationDice ?? 0}</span>
                    </div>
                    <button onClick={handleRoll} className="roll-btn">
                        <DiceIcon /> Rolar!
                    </button>
                </div>

                {lastResult && (
                    <div className="results-display">
                        <h4>Resultados</h4>
                        
                        {lastResult.soulRolls.length > 0 && (
                            <div className="dice-pool">
                                <span className="dice-pool-label">Dados da Alma</span>
                                <div className="dice-container">
                                    {lastResult.soulRolls.map((roll, index) => (
                                        <div key={`soul-${index}`} className={`die-result soul ${roll >= 6 ? 'success-soul' : ''}`}>
                                            {roll}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {lastResult.assimilationRolls.length > 0 && (
                            <div className="dice-pool">
                                <span className="dice-pool-label">Dados de Assimilação</span>
                                <div className="dice-container">
                                    {lastResult.assimilationRolls.map((roll, index) => (
                                        <div key={`assim-${index}`} className={`die-result assimilation ${roll >= 6 ? 'success-assimilation' : ''} ${roll === 1 ? 'madness-trigger' : ''}`}>
                                            {roll}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="roll-summary">
                            <div className="success-count">{lastResult.finalSuccesses} Sucesso(s)</div>
                            {lastResult.madnessMessage && (
                                <div className="madness-message">{lastResult.madnessMessage}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
