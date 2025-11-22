import React from 'react';
import { paRequirementsBySequence } from '../constants';

interface SimplePaTrackerProps {
    pa: number;
    paGasto: number;
    sequence: number;
    onPaChange: (value: number) => void;
    onOpenImprovements?: () => void;
}

export const SimplePaTracker: React.FC<SimplePaTrackerProps> = ({ 
    pa, 
    paGasto,
    sequence,
    onPaChange,
    onOpenImprovements
}) => {
    const targetPa = paRequirementsBySequence[sequence] || 999;
    const totalProgress = pa + paGasto;
    const progressPercent = targetPa > 0 ? Math.min(100, (totalProgress / targetPa) * 100) : 0;

    return (
        <div className="pa-tracker">
            <h3 className="section-title">Pontos de Atuação (PA)</h3>
            <div className="pa-display">
                <div className="pa-box">
                    <div className="pa-box-value">
                        <input
                            type="number"
                            value={pa}
                            onChange={(e) => onPaChange(Number(e.target.value))}
                            min="0"
                        />
                    </div>
                    <div className="pa-box-label">Disponíveis</div>
                </div>
                <div className="pa-box">
                    <div className="pa-box-value">{paGasto}</div>
                    <div className="pa-box-label">Gastos (Seq.)</div>
                </div>
            </div>
            <div className="pa-digestion-section">
                <h4 className="digestion-subtitle">Digestão da Poção - Sequência {sequence} (Meta: {targetPa} PA)</h4>
                <div className="pa-progress-bar">
                    <div className="pa-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    <span className="pa-progress-text">{totalProgress} / {targetPa} ({progressPercent.toFixed(0)}%)</span>
                </div>
                <div className="digestion-info-text">
                    {progressPercent >= 100 ? (
                        <span className="ready-to-advance">✓ Pronto para avançar de sequência!</span>
                    ) : (
                        <span>Faltam {targetPa - totalProgress} PA para completar a digestão</span>
                    )}
                </div>
            </div>
            {onOpenImprovements && (
                <button 
                    className="spend-pa-btn" 
                    onClick={onOpenImprovements}
                >
                    💎 Gastar PA & Melhorias
                </button>
            )}
        </div>
    );
};
