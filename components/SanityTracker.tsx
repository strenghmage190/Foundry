import React, { useRef, useEffect } from 'react';
import { generateSmartButtonColor } from '../utils/colorUtils';

interface SanityTrackerProps {
    sanity: number;
    maxSanity: number;
    onSanityChange: (value: number) => void;
    onMaxSanityChange: (value: number) => void;
    pathwayColor: string;
}

export const SanityTracker: React.FC<SanityTrackerProps> = ({ sanity, maxSanity, onSanityChange, onMaxSanityChange, pathwayColor }) => {
    const sanityInputRef = useRef<HTMLInputElement>(null);
    const maxSanityInputRef = useRef<HTMLInputElement>(null);

    // Previne scroll wheel de alterar valores dos inputs
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
        };

        const inputs = [sanityInputRef.current, maxSanityInputRef.current];
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
    
    const handlePointClick = (index: number) => {
        // Clicar em uma caixa define a sanidade para aquele valor
        // Não permite clicar em caixas degradadas
        if (index + 1 > maxSanity) return;
        onSanityChange(index + 1);
    };

    return (
        <div className="sanity-tracker">
            <div className="status-bar-header">
                <span className="status-bar-label">Sanidade</span>
                <div className="status-bar-values">
                    <input
                        ref={sanityInputRef}
                        type="number"
                        value={sanity}
                        onChange={e => onSanityChange(Number(e.target.value))}
                        className="status-input"
                        max={maxSanity}
                        min={0}
                    />
                    <span>/</span>
                     <input
                        ref={maxSanityInputRef}
                        type="number"
                        value={maxSanity}
                        onChange={e => onMaxSanityChange(Number(e.target.value))}
                        className="status-input"
                        max={10}
                        min={0}
                    />
                </div>
            </div>
            <div className="sanity-track">
                {Array.from({ length: 10 }).map((_, index) => {
                    const pointValue = index + 1;
                    let status = '';
                    if (pointValue > maxSanity) {
                        status = 'degraded';
                    } else if (pointValue <= sanity) {
                        status = 'full';
                    } else {
                        status = 'empty';
                    }

                    return (
                        <div 
                            key={index}
                            className={`sanity-point ${status}`}
                            style={status === 'full' ? { backgroundColor: generateSmartButtonColor(pathwayColor) } : {}}
                            onClick={() => handlePointClick(index)}
                            title={`Sanidade ${pointValue}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};