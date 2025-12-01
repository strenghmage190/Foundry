import React from 'react';
import { Character } from '../../types';

interface NotesTabProps {
    character: Character;
    onFieldChange: (field: keyof Character, value: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ character, onFieldChange }) => {
    return (
        <div className="notes-tab-grid">
            <div>
                <label>Aparência</label>
                <textarea 
                    value={character.aparencia}
                    onChange={e => onFieldChange('aparencia', e.target.value)}
                />
            </div>
            <div>
                <label>Personalidade</label>
                <textarea 
                    value={character.personalidade}
                    onChange={e => onFieldChange('personalidade', e.target.value)}
                />
            </div>
            <div>
                <label>Histórico</label>
                <textarea 
                    value={character.historico}
                    onChange={e => onFieldChange('historico', e.target.value)}
                />
            </div>
             <div>
                <label>Objetivo</label>
                <textarea 
                    value={character.objetivo}
                    onChange={e => onFieldChange('objetivo', e.target.value)}
                />
            </div>
            <div>
                <label>Âncoras</label>
                <textarea 
                    value={character.ancoras}
                    onChange={e => onFieldChange('ancoras', e.target.value)}
                />
            </div>
             <div>
                <label>Anotações Gerais</label>
                <textarea 
                    value={character.anotacoes}
                    onChange={e => onFieldChange('anotacoes', e.target.value)}
                />
            </div>
        </div>
    );
};
