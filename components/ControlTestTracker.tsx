import React from 'react';

interface ControlTestTrackerProps {
    currentStage: number;
    onStageChange: (stage: number) => void;
    onPerformTest: () => void;
    anchorBonus?: number;
}

const stages = [
    { label: "Estágio 0: Estável", value: 0 },
    { label: "Estágio 1: Os Sussurros", value: 1 },
    { label: "Estágio 2: A Intrusão", value: 2 },
    { label: "Estágio 3: A Metamorfose", value: 3 },
];

export const ControlTestTracker: React.FC<ControlTestTrackerProps> = ({ 
    currentStage, 
    onStageChange, 
    onPerformTest,
    anchorBonus = 0 
}) => {
    return (
        <div className="control-test-tracker">
            <div className="control-test-header">
                <h3 className="section-title">Teste de Controle</h3>
                {anchorBonus > 0 && (
                    <div className="control-anchor-bonus">
                        +{anchorBonus} dado{anchorBonus > 1 ? 's' : ''} (Âncoras)
                    </div>
                )}
            </div>
            <div className="control-stage-selector">
                {stages.map(stage => (
                    <div key={stage.value} className="stage-option">
                        <input
                            type="radio"
                            id={`stage-${stage.value}`}
                            name="control-stage"
                            value={stage.value}
                            checked={currentStage === stage.value}
                            onChange={() => onStageChange(stage.value)}
                        />
                        <label htmlFor={`stage-${stage.value}`}>{stage.label}</label>
                    </div>
                ))}
            </div>
            <button id="control-test-btn" onClick={onPerformTest}>
                Realizar Teste de Controle
            </button>
        </div>
    );
};
