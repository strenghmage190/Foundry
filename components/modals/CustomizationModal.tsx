import React, { useState, useEffect, useRef } from 'react';
import { AgentData, CustomizationSettings } from '../../types.ts';
import { supabase } from '../../supabaseClient';
import { initialAgentData } from '../../constants';

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentData;
    // A função de atualização agora pode receber um arquivo
    onUpdateAgent: (updatedData: Partial<AgentData> | { field: string; file: File }) => void;
}

type AvatarField = 'avatarHealthy' | 'avatarHurt' | 'avatarDisturbed' | 'avatarInsane';

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, agent, onUpdateAgent }) => {
    const [settings, setSettings] = useState<CustomizationSettings>(agent?.customization || initialAgentData.customization);
    const [color, setColor] = useState(agent?.character?.pathwayColor || initialAgentData.character.pathwayColor);
    const [isPrivate, setIsPrivate] = useState<boolean>(!!agent?.isPrivate);
    const [previewUrls, setPreviewUrls] = useState<Record<AvatarField, string>>({
        avatarHealthy: '',
        avatarHurt: '',
        avatarDisturbed: '',
        avatarInsane: '',
    });

    // Criamos uma referência para cada input de arquivo
    const fileInputRefs = {
        avatarHealthy: useRef<HTMLInputElement>(null),
        avatarHurt: useRef<HTMLInputElement>(null),
        avatarDisturbed: useRef<HTMLInputElement>(null),
        avatarInsane: useRef<HTMLInputElement>(null),
    };

    const getSignedUrl = async (url: string): Promise<string> => {
        if (!url) return '';
        try {
            const { data } = await supabase.storage.from('agent-avatars').createSignedUrl(url, 3600); // 1 hour
            return data?.signedUrl || '';
        } catch (error) {
            console.error('Error generating signed URL:', error);
            return '';
        }
    };

    useEffect(() => {
        if (isOpen) {
            setSettings(agent?.customization || initialAgentData.customization);
            setColor(agent?.character?.pathwayColor || initialAgentData.character.pathwayColor);
            setIsPrivate(!!agent?.isPrivate);

            // Generate signed URLs for existing avatars
            const generatePreviews = async () => {
                const newPreviews: Record<AvatarField, string> = {
                    avatarHealthy: '',
                    avatarHurt: '',
                    avatarDisturbed: '',
                    avatarInsane: '',
                };
                const fields: AvatarField[] = ['avatarHealthy', 'avatarHurt', 'avatarDisturbed', 'avatarInsane'];
                for (const field of fields) {
                    const url = agent.customization?.[field] || '';
                    newPreviews[field] = await getSignedUrl(url);
                }
                setPreviewUrls(newPreviews);
            };
            generatePreviews();
        }
    }, [isOpen, agent]);

    const handleSettingChange = (field: keyof CustomizationSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // Esta função agora lida com o upload de arquivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: AvatarField) => {
        const file = e.target.files?.[0];
        if (file) {
            // Set preview URL for immediate feedback
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrls(prev => ({ ...prev, [field]: objectUrl }));

            // Passa o arquivo para a CharacterSheetPage, que sabe como fazer o upload.
            // A CharacterSheetPage vai lidar com o upload e depois atualizar a URL.
            onUpdateAgent({ field, file });
            // Keep modal open for user to save changes
        }
    };

    const handleSave = () => {
        // Clean up object URLs to prevent memory leaks
        Object.values(previewUrls).forEach(url => {
            if (url && typeof url === 'string' && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        onUpdateAgent({ customization: settings, character: { ...(agent?.character || {}), pathwayColor: color }, isPrivate });
        onClose();
    };

    if (!isOpen) return null;

    // Função para renderizar a seção de upload de avatar
    const renderAvatarInput = (field: AvatarField, label: string) => (
        <div className="avatar-upload-section">
            <label>{label}</label>
            <div className="avatar-preview-container">
                <div
                    className="avatar-preview"
                    style={{ backgroundImage: `url(${previewUrls[field] || ''})` }}
                    onClick={() => fileInputRefs[field].current?.click()}
                    title="Clique para alterar"
                >
                    {!previewUrls[field] && <span>Sem Imagem</span>}
                </div>
                <div className="avatar-input-controls">
                    <input
                        type="file"
                        ref={fileInputRefs[field]}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field)}
                    />
                    <button type="button" className="upload-btn" onClick={() => fileInputRefs[field].current?.click()}>Carregar Arquivo</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-font">Personalização da Ficha</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>
                <div className="customization-modal-body">
                    
                    <div className="customization-section">
                        <h4>Aparência</h4>
                        <div className="form-group">
                            <label>Cor de Destaque</label>
                            <input type="color" className="pathway-color-picker" value={color} onChange={e => setColor(e.target.value)} style={{padding: '2px', height: '40px'}}/>
                        </div>
                        {renderAvatarInput('avatarHealthy', 'Avatar (Saudável)')}
                        {renderAvatarInput('avatarHurt', 'Avatar (Ferido)')}
                        {renderAvatarInput('avatarDisturbed', 'Avatar (Perturbado)')}
                        {renderAvatarInput('avatarInsane', 'Avatar (Insano)')}
                    </div>

                    <div className="customization-section">
                            <h4>Privacidade</h4>
                            <div className="toggle-row">
                                <label>Ficha Privada</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="customization-section">
                        <h4>Acessibilidade</h4>
                        <div className="toggle-row">
                            <label>Fonte para Dislexia</label>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={settings.useOpenDyslexicFont} onChange={e => handleSettingChange('useOpenDyslexicFont', e.target.checked)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                </div>
                <div className="modal-footer">
                    <button onClick={handleSave}>Salvar e Fechar</button>
                </div>
            </div>
        </div>
    );
};