import React, { useState, useEffect } from 'react';
import { AgentData, ToastData } from '../types';
import { paRequirementsBySequence } from '../constants';
import { PlusIcon, MinusIcon } from './icons';
import { autoPurifyAllSoulDice } from '../utils/beyondersRules';

interface PaTrackerProps {
    agent: AgentData;
    onUpdate: (updatedAgent: Partial<AgentData>) => void;
    onOpenImprovements: () => void;
    addLiveToast: (toast: Omit<ToastData, 'id'>) => void;
}

export const PaTracker: React.FC<PaTrackerProps> = ({ agent, onUpdate, onOpenImprovements, addLiveToast }) => {
    if (!agent || !agent.character) return null;
    const { character } = agent;
    const { paDisponivel, paTotalGasto, sequence, purifiedDiceThisSequence, assimilationDice, soulDice } = character;

    // State for local editing of available PA
    const [currentPa, setCurrentPa] = useState(paDisponivel || 0);

    // Auto-purify soul dice whenever it changes
    useEffect(() => {
        if ((soulDice || 0) > 0) {
            const { newSoulDice, newAssimilationDice, message } = autoPurifyAllSoulDice(
                soulDice || 0,
                assimilationDice || 0
            );

            if (newSoulDice === 0 && newAssimilationDice !== assimilationDice) {
                onUpdate({
                    character: {
                        ...character,
                        soulDice: newSoulDice,
                        assimilationDice: newAssimilationDice
                    }
                });

                if (message) {
                    addLiveToast({
                        type: 'success',
                        title: 'Purificação Automática! ✨',
                        message
                    });
                }
            }
        }
    }, [soulDice, assimilationDice, character, onUpdate, addLiveToast]); // Monitor soulDice changes

    // Sync local state with parent prop
    useEffect(() => {
        setCurrentPa(paDisponivel || 0);
    }, [paDisponivel]);

    // Update parent state
    const updateParentPa = (newValue: number) => {
        if (newValue !== paDisponivel) {
            onUpdate({
                character: {
                    ...character,
                    paDisponivel: newValue
                }
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPa(Number(e.target.value));
    };

    const handleInputBlur = () => {
        updateParentPa(currentPa);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateParentPa(currentPa);
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setCurrentPa(paDisponivel || 0);
            e.currentTarget.blur();
        }
    };

    const handleIncrement = () => {
        const newValue = (paDisponivel || 0) + 1;
        setCurrentPa(newValue);
        updateParentPa(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.max(0, (paDisponivel || 0) - 1);
        setCurrentPa(newValue);
        updateParentPa(newValue);
    };

    // --- NEW Digestion & Purification Logic ---
    const targetPa = paRequirementsBySequence[sequence] || 999;
    // The total progress is the sum of PA available and PA spent in the sequence
    const digestaoProgressoAtual = (paTotalGasto || 0) + (paDisponivel || 0);
    const progressPercent = targetPa > 0 ? Math.min(100, (digestaoProgressoAtual / targetPa) * 100) : 0;
    
    return (
        <div className="pa-tracker-section">
            <h3 className="section-title">Pontos de Atuação (PA)</h3>
            <div className="pa-display">
                <div className="pa-box">
                    <div className="pa-box-value adjustable-pa">
                        <button onClick={handleDecrement} aria-label="Diminuir PA"><MinusIcon /></button>
                        <input
                            type="number"
                            className="pa-input"
                            value={currentPa}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            min="0"
                        />
                        <button onClick={handleIncrement} aria-label="Aumentar PA"><PlusIcon /></button>
                    </div>
                    <div className="pa-box-label">Disponível</div>
                </div>
                <div className="pa-box">
                    <div className="pa-box-value">{paTotalGasto || 0}</div>
                    <div className="pa-box-label">Gasto (Seq.)</div>
                </div>
                 <div className="pa-box">
                    <div className="pa-box-value">{targetPa}</div>
                    <div className="pa-box-label">Meta (Seq.)</div>
                </div>
            </div>

            <div className="digestion-tracker">
                <h4 className="digestion-title">Digestão da Poção (Seq. {sequence})</h4>
                <div className="status-bar-track digestion-bar">
                    <div className="status-bar-fill" style={{ width: `${progressPercent}%` }} role="progressbar"></div>
                </div>
                <div className="digestion-info">
                    <span>{digestaoProgressoAtual} / {targetPa} PA</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                </div>
            </div>

            <button id="spend-pa-btn" onClick={onOpenImprovements}>
                Gastar PA & Melhorias
            </button>
        </div>
    );
};