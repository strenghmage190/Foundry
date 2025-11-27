import React, { useRef, useEffect } from 'react';
import { Character } from '../../types.ts';
import './ResourcesTab.css';

interface ResourcesTabProps {
    character: Character;
    onCharacterChange?: (field: keyof Character, value: any) => void;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ 
    character,
    onCharacterChange 
}) => {
    const soulDiceRef = useRef<HTMLInputElement>(null);

    // Previne scroll wheel de alterar valores dos inputs
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
        };

        if (soulDiceRef.current) {
            soulDiceRef.current.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (soulDiceRef.current) {
                soulDiceRef.current.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const soulDice = character.soulDice || 0;
    const assimilationDice = character.assimilationDice || 0;

    const handleSoulDiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(0, Number(e.target.value));
        onCharacterChange?.('soulDice', value);
    };

    return (
        <div className="resources-tab">
            <div className="resources-container">
                
                {/* Dados de Assimilação (Pretos) - INFINITO */}
                <div className="resource-section">
                    <h3 className="resource-title">🖤 Dados de Assimilação (Pretos)</h3>
                    
                    <div className="resource-display">
                        <div className="resource-main-value">
                            <span className="resource-infinite">∞</span>
                        </div>
                    </div>

                    <div className="resource-info">
                        <p className="infinite-note">Infinitos - O poder bruto e instável</p>
                        <p>Ganhos ao chegar numa nova Sequência</p>
                        <p>Representam a loucura e o perigo</p>
                    </div>
                </div>

                {/* Dados da Alma (Brancos) - GANHOS POR PURIFICAÇÃO */}
                <div className="resource-section">
                    <h3 className="resource-title">🤍 Dados da Alma (Brancos)</h3>
                    
                    <div className="resource-display">
                        <div className="resource-main-value">
                            <input 
                                ref={soulDiceRef}
                                type="number" 
                                className="resource-input resource-soul-input"
                                value={soulDice}
                                onChange={handleSoulDiceChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="resource-bar">
                        <div 
                            className="resource-bar-fill"
                            style={{
                                width: `${Math.min(100, (soulDice / 20) * 100)}%`,
                                backgroundColor: '#4CAF50'
                            }}
                        />
                    </div>

                    <div className="resource-info">
                        <p><strong>Ganhos por Purificação</strong></p>
                        <p>A cada 25% de PA, converta 1 Preto em 1 Branco</p>
                        <p>Poder dominado e seguro</p>
                    </div>
                </div>

                {/* Informações Adicionais */}
                <div className="resource-section info-section">
                    <h3 className="resource-title">📖 Sobre os Dados</h3>
                    
                    <div className="info-box">
                        <p><strong>Dados de Assimilação (Pretos) 🖤:</strong> Infinitos. Seu poder bruto e instável. Cada '1' causa Intrusão de Loucura.</p>
                        <p><strong>Dados da Alma (Brancos) 🤍:</strong> Ganhos apenas purificando dados pretos através da Atuação e rituais. Representam seu domínio sobre o poder.</p>
                        <p className="mechanic-note">💡 A dualidade: quanto mais você purifica (ganha Brancos), menos loucura tem (menos Pretos). Mas você COMEÇA com infinitos Pretos!</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
