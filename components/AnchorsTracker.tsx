import React from 'react';
import { Anchor } from '../types';
import { countActiveAnchors } from '../utils/anchorUtils';

interface AnchorsTrackerProps {
    anchors: Anchor[];
    onAnchorsChange: (newAnchors: Anchor[]) => void;
    onInvokeAnchor: (index: number) => void;
}

export const AnchorsTracker: React.FC<AnchorsTrackerProps> = ({ anchors = [], onAnchorsChange, onInvokeAnchor }) => {
    
    const handleAnchorChange = (index: number, field: keyof Anchor, value: string) => {
        const newAnchorsData = [...displayAnchors];
        newAnchorsData[index] = { ...newAnchorsData[index], [field]: value };
        onAnchorsChange(newAnchorsData);
    };

    const displayAnchors = [
        ...anchors,
        ...Array(Math.max(0, 3 - anchors.length)).fill({ conviction: '', symbol: '' })
    ].slice(0, 3);
    
    const activeAnchorsCount = countActiveAnchors(anchors);

    return (
        <div className="anchors-tracker">
            <div className="anchors-header">
                <h3 className="section-title">Âncoras</h3>
                {activeAnchorsCount > 0 && (
                    <div className="anchor-bonus-badge">
                        +{activeAnchorsCount} dado{activeAnchorsCount > 1 ? 's' : ''} vs Sanidade
                    </div>
                )}
            </div>
            <div className="anchors-description">
                <p className="anchor-help-text">
                    Você pode ter até 3 âncoras. Cada âncora pode ter um <strong>Pilar (Convicção)</strong> e/ou um <strong>Símbolo</strong>. 
                    Você precisa ter pelo menos um dos dois preenchido para poder invocar a âncora.
                </p>
                <p className="anchor-help-text" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <strong>Resiliência Mental:</strong> +{activeAnchorsCount} dado{activeAnchorsCount > 1 ? 's' : ''} em testes de Sanidade graduais
                </p>
            </div>
            <div className="anchors-list">
                {displayAnchors.map((anchor, index) => {
                    const hasConviction = anchor.conviction.trim() !== '';
                    const hasSymbol = anchor.symbol.trim() !== '';
                    const canInvoke = hasConviction || hasSymbol;
                    
                    return (
                        <div key={index} className={`anchor-slot ${canInvoke ? 'active' : ''}`}>
                            <div className="anchor-slot-header">
                                <span className="anchor-number">Âncora {index + 1}</span>
                                {canInvoke && <span className="anchor-status">✓ Ativa</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor={`conviction-${index}`}>O Pilar do Eu (A Convicção):</label>
                                <input
                                    id={`conviction-${index}`}
                                    type="text"
                                    value={anchor.conviction}
                                    onChange={(e) => handleAnchorChange(index, 'conviction', e.target.value)}
                                    placeholder="Ex: Devo proteger os inocentes"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`symbol-${index}`}>A Âncora (O Símbolo):</label>
                                <input
                                    id={`symbol-${index}`}
                                    type="text"
                                    value={anchor.symbol}
                                    onChange={(e) => handleAnchorChange(index, 'symbol', e.target.value)}
                                    placeholder="Ex: Minha irmã, Melissa"
                                />
                            </div>
                            <button
                                id={`invoke-anchor-btn-${index + 1}`}
                                className="invoke-anchor-btn"
                                onClick={() => onInvokeAnchor(index)}
                                disabled={!canInvoke}
                                title={canInvoke ? 'Invocar esta âncora (1 Ponto de Vontade)' : 'Preencha pelo menos o Pilar ou o Símbolo para invocar'}
                            >
                                Invocar Âncora
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};