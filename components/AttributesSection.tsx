import React from 'react';
import { Attributes } from '../types';

interface AttributesSectionProps {
    attributes?: Attributes;
    onAttributeChange?: (attribute: keyof Attributes, value: number) => void;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({ attributes, onAttributeChange }) => {
    // provide a safe default attributes object to avoid runtime errors
    const safeAttributes: Attributes = {
        forca: 1,
        destreza: 1,
        vigor: 1,
        carisma: 1,
        manipulacao: 1,
        autocontrole: 1,
        inteligencia: 1,
        raciocinio: 1,
        percepcao: 1,
        espiritualidade: 1,
        ...(attributes || {} as Attributes),
    };

    const handleChange = (attribute: keyof Attributes, value: number) => {
        if (onAttributeChange) onAttributeChange(attribute, value);
    };
    const attributeGroups = {
        Físicos: ['forca', 'destreza', 'vigor'],
        Sociais: ['carisma', 'manipulacao', 'autocontrole'],
        Mentais: ['inteligencia', 'raciocinio', 'percepcao', 'espiritualidade']
    };

    const attributeLabels: Record<string, string> = {
        forca: 'Força',
        destreza: 'Destreza',
        vigor: 'Vigor',
        carisma: 'Carisma',
        manipulacao: 'Manipulação',
        autocontrole: 'Autocontrole',
        inteligencia: 'Inteligência',
        raciocinio: 'Raciocínio',
        percepcao: 'Percepção',
        espiritualidade: 'Espiritualidade'
    };


    return (
        <div className="attributes-section">
            <h3 className="section-title">Atributos</h3>
            <div className="attributes-grid">
                {Object.entries(attributeGroups).map(([groupName, attrs]) => (
                    <div key={groupName} className="attribute-category">
                        <h4>{groupName}</h4>
                        {attrs.map(attr => (
                            <div key={attr} className="attribute-row">
                                <label>{attributeLabels[attr]}</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={safeAttributes[attr as keyof Attributes]}
                                    onChange={(e) => handleChange(attr as keyof Attributes, parseInt(e.target.value, 10) || 1)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};