import React from 'react';
import { EnemySheet } from '../components/EnemySheet.tsx';
import { lobisomemExample } from '../data/enemies.ts';

export const EnemyExamplePage: React.FC = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: '#a978f8', marginBottom: '1rem' }}>Exemplo: Ficha de Inimigo</h1>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
                    Esta é uma ficha simplificada para uso em combates de mestres. 
                    Pode ser expandida com mais informações conforme necessário.
                </p>
            </div>
            <EnemySheet enemy={lobisomemExample} />
        </div>
    );
};
