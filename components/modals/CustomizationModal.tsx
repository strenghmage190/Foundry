import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentData, CustomizationSettings } from '../../types.ts';
import { supabase } from '../../supabaseClient';
import { initialAgentData } from '../../constants';
import { ImageCropModal } from './ImageCropModal';
import { uploadAgentAvatar, updateAgentCustomization } from '../../api/agents';
import { isFoundry } from '../../src/foundryAdapter';
import { generateSmartButtonColor, getContrastColor } from '../../utils/colorUtils';

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: AgentData;
    onUpdateAgent: (updatedData: Partial<AgentData> | { field: string; file: File }) => void;
}

type AvatarField = 'avatarHealthy' | 'avatarHurt' | 'avatarDisturbed' | 'avatarInsane';

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
    isOpen,
    onClose,
    agent,
    onUpdateAgent,
}) => {
    // State for customization settings
    const [settings, setSettings] = useState<CustomizationSettings>(
        agent?.customization || initialAgentData.customization
    );
    const [color, setColor] = useState(agent?.character?.pathwayColor || initialAgentData.character.pathwayColor);
    const [isPrivate, setIsPrivate] = useState<boolean>(!!agent?.isPrivate);

    // State for avatar uploads
    const [previewUrls, setPreviewUrls] = useState<Record<AvatarField, string>>({
        avatarHealthy: '',
        avatarHurt: '',
        avatarDisturbed: '',
        avatarInsane: '',
    });

    // State for crop modal
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
    const [currentCropField, setCurrentCropField] = useState<AvatarField | null>(null);

    // Upload progress tracking
    const [uploadingField, setUploadingField] = useState<AvatarField | null>(null);
    const [error, setError] = useState<string | null>(null);

    // File input references
    const fileInputRefs = {
        avatarHealthy: useRef<HTMLInputElement>(null),
        avatarHurt: useRef<HTMLInputElement>(null),
        avatarDisturbed: useRef<HTMLInputElement>(null),
        avatarInsane: useRef<HTMLInputElement>(null),
    };

    /**
     * Generates a preview URL for an avatar path (handles both local and remote)
     */
    const getPreviewUrl = useCallback(async (url: string): Promise<string> => {
        if (!url) return '';

        // If it's already an HTTP URL, return as-is
        if (url.startsWith('http')) return url;

        try {
            // Use getPublicUrl to generate a permanent public URL (no expiration)
            const { data } = supabase.storage.from('agent-avatars').getPublicUrl(url);
            if (data?.publicUrl) {
                console.log('[CustomizationModal] Generated public URL for:', url);
                return data.publicUrl;
            }
            console.warn('[CustomizationModal] getPublicUrl returned empty URL');
            return url;
        } catch (e) {
            console.warn('[CustomizationModal] Error generating public URL:', e);
            return url;
        }
    }, []);

    /**
     * Load preview URLs when modal opens
     */
    useEffect(() => {
        if (!isOpen) return;

        console.log('[CustomizationModal] Modal opened, generating preview URLs');
        setSettings(agent?.customization || initialAgentData.customization);
        setColor(agent?.character?.pathwayColor || initialAgentData.character.pathwayColor);
        setIsPrivate(!!agent?.isPrivate);
        setError(null);

        const generatePreviews = async () => {
            const fields: AvatarField[] = ['avatarHealthy', 'avatarHurt', 'avatarDisturbed', 'avatarInsane'];
            const newPreviews: Record<AvatarField, string> = {
                avatarHealthy: '',
                avatarHurt: '',
                avatarDisturbed: '',
                avatarInsane: '',
            };

            for (const field of fields) {
                const url = agent?.customization?.[field] || '';
                if (url) {
                    newPreviews[field] = await getPreviewUrl(url);
                }
            }

            setPreviewUrls(newPreviews);
        };

        generatePreviews();
    }, [isOpen, agent, getPreviewUrl]);

    /**
     * Handle file selection - opens crop modal
     */
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, field: AvatarField) => {
            try {
                const file = e.target.files?.[0];
                if (!file) return;

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    setError('Por favor, selecione um arquivo de imagem válido');
                    return;
                }

                // Validate file size (10MB max for avatars)
                if (file.size > 10 * 1024 * 1024) {
                    setError('A imagem deve ter menos de 10MB');
                    return;
                }

                console.log(`[CustomizationModal] File selected for ${field}:`, file.name);
                setCurrentCropFile(file);
                setCurrentCropField(field);
                setCropModalOpen(true);
                setError(null);
            } catch (e) {
                console.error('[CustomizationModal] Error selecting file:', e);
                setError(`Erro ao selecionar arquivo: ${String(e)}`);
            }
        },
        []
    );

    /**
     * Handle crop confirmation - upload cropped image
     */
    const handleCropConfirm = useCallback(
        async (croppedBlob: Blob) => {
            if (!currentCropField || !agent?.id) {
                setError('Erro interno: campo ou agente inválido');
                return;
            }

            try {
                setUploadingField(currentCropField);
                setError(null);

                // Convert blob to File
                const croppedFile = new File(
                    [croppedBlob],
                    `cropped-${currentCropField}.png`,
                    { type: 'image/png' }
                );

                console.log(`[CustomizationModal] Uploading ${currentCropField}`);

                let filePath: string;
                if (isFoundry()) {
                  // Use Foundry's FilePicker to upload to world assets
                  const { uploadAvatarToFoundry } = await import('../../src/foundryAdapter');
                  filePath = await uploadAvatarToFoundry(croppedFile, agent.id, currentCropField);
                } else {
                  // Use Supabase storage
                  filePath = await uploadAgentAvatar(
                    agent.id,
                    currentCropField,
                    croppedFile
                  );
                }

                console.log(`[CustomizationModal] Upload successful: ${filePath}`);

                // Update settings with new path
                setSettings(prev => ({
                    ...prev,
                    [currentCropField]: filePath,
                }));

                // Generate public URL for preview
                const publicUrl = await getPreviewUrl(filePath);
                console.log(`[CustomizationModal] Generated preview URL: ${publicUrl}`);
                
                setPreviewUrls(prev => ({
                    ...prev,
                    [currentCropField]: publicUrl,
                }));

                // Close crop modal
                setCropModalOpen(false);
                setCurrentCropFile(null);
                setCurrentCropField(null);
            } catch (e) {
                console.error('[CustomizationModal] Upload error:', e);
                setError(`Erro ao enviar imagem: ${String(e)}`);
            } finally {
                setUploadingField(null);
            }
        },
        [agent?.id, currentCropField]
    );

    /**
     * Handle crop cancellation
     */
    const handleCropCancel = useCallback(() => {
        console.log('[CustomizationModal] Crop cancelled');
        setCropModalOpen(false);
        setCurrentCropFile(null);
        setCurrentCropField(null);
    }, []);

    /**
     * Update a customization setting
     */
    const handleSettingChange = useCallback(
        (field: keyof CustomizationSettings, value: any) => {
            setSettings(prev => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    /**
     * Save all changes and close modal
     */
    const handleSave = useCallback(async () => {
        try {
            console.log('[CustomizationModal] Saving customization');
            console.log('[CustomizationModal] Settings to save:', settings);
            console.log('[CustomizationModal] Color to save:', color);

            // Clean up blob URLs to prevent memory leaks
            Object.values(previewUrls).forEach(url => {
                if (url && typeof url === 'string' && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });

            // IMPORTANT: Force immediate save to database WITHOUT triggering debounced save
            // This is critical because the parent uses debounce which might overwrite our immediate save
            // We'll update local state AFTER the DB save succeeds, which prevents the debounce from running
            if (agent?.id) {
                console.log('[CustomizationModal] Forcing immediate database save...');
                try {
                    // Create a temporary agent object with updated data for immediate save
                    // CRITICAL: Must include ALL agent fields, not just customization
                    const tempAgent: AgentData = {
                        ...agent,  // Copy all existing fields
                        customization: settings,  // Update customization
                        character: { 
                            ...agent.character,  // Keep existing character data
                            pathwayColor: color,  // Update only the color
                        },
                        isPrivate,
                    };
                    
                    console.log('[CustomizationModal] Temp agent to save:', tempAgent);
                    console.log('[CustomizationModal] === CRITICAL DEBUG ===');
                    console.log('[CustomizationModal] settings object:', settings);
                    console.log('[CustomizationModal] tempAgent.customization:', tempAgent.customization);
                    console.log('[CustomizationModal] Are they the same?', tempAgent.customization === settings);
                    console.log('[CustomizationModal] avatarHealthy value:', tempAgent.customization?.avatarHealthy);
                    console.log('[CustomizationModal] =====================');
                    
                    const ok = await updateAgentCustomization(tempAgent);
                    if (ok) {
                        console.log('[CustomizationModal] ✓ Customization saved immediately to database');
                        
                        // NOW update the local state AFTER DB save succeeds
                        // This triggers parent's handleUpdate which marks as dirty, BUT since agent already has the new data,
                        // the debounce won't change anything when it runs
                        onUpdateAgent({
                            customization: settings,
                            character: { pathwayColor: color },
                            isPrivate,
                        });
                    } else {
                        console.error('[CustomizationModal] ❌ Immediate save FAILED');
                        setError('Erro ao salvar customização no banco de dados');
                        return; // Don't update local state if DB save failed
                    }
                } catch (saveError) {
                    console.error('[CustomizationModal] Immediate save error:', saveError);
                    setError(`Erro ao salvar: ${String(saveError)}`);
                }
            }

            onClose();
        } catch (e) {
            console.error('[CustomizationModal] Error saving:', e);
            setError(`Erro ao salvar: ${String(e)}`);
        }
    }, [settings, color, isPrivate, previewUrls, onUpdateAgent, onClose, agent]);

    /**
     * Render avatar upload section
     */
    const renderAvatarInput = (field: AvatarField, label: string) => (
        <div className="avatar-upload-section" key={field}>
            <label className="avatar-label">{label}</label>
            <div className="avatar-preview-container">
                <div
                    className="avatar-preview"
                    style={{
                        backgroundImage: previewUrls[field] ? `url(${previewUrls[field]})` : undefined,
                    }}
                    onClick={() => !uploadingField && fileInputRefs[field].current?.click()}
                    title={uploadingField === field ? 'Enviando...' : 'Clique para alterar'}
                    role="button"
                    tabIndex={0}
                >
                    {uploadingField === field ? (
                        <span className="upload-loading">Enviando...</span>
                    ) : !previewUrls[field] ? (
                        <span className="no-image">Sem Imagem</span>
                    ) : null}
                </div>
                <div className="avatar-input-controls">
                    <input
                        type="file"
                        ref={fileInputRefs[field]}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field)}
                        disabled={uploadingField !== null}
                    />
                    <button
                        type="button"
                        className="upload-btn"
                        onClick={() => fileInputRefs[field].current?.click()}
                        disabled={uploadingField !== null}
                    >
                        {uploadingField === field ? 'Enviando...' : 'Carregar Arquivo'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <style>{`
                        .modal-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.7);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                            padding: 16px;
                        }

                        .modal-content {
                            background: var(--card, #111113);
                            border: 1px solid var(--border, #2f2f2f);
                            border-radius: 12px;
                            max-width: 600px;
                            max-height: 90vh;
                            overflow-y: auto;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                        }

                        .modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 20px;
                            border-bottom: 1px solid var(--border, #2f2f2f);
                        }

                        .modal-header h3 {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: var(--text, #e5e7eb);
                        }

                        .close-modal-btn {
                            background: none;
                            border: none;
                            color: var(--muted, #a1a1aa);
                            font-size: 24px;
                            cursor: pointer;
                            padding: 0;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: color 0.2s;
                        }

                        .close-modal-btn:hover {
                            color: var(--text, #e5e7eb);
                        }

                        .customization-modal-body {
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                        }

                        .customization-section {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                        }

                        .customization-section h4 {
                            margin: 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: var(--text, #e5e7eb);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }

                        .form-group {
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                        }

                        .form-group label {
                            font-size: 14px;
                            color: #c9c9ce;
                        }

                        .pathway-color-picker {
                            width: 100%;
                            height: 40px;
                            border: 1px solid var(--field-border, #4a4a4a);
                            border-radius: 8px;
                            cursor: pointer;
                        }

                        .avatar-upload-section {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            padding: 12px;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                        }

                        .avatar-label {
                            font-size: 13px;
                            color: #c9c9ce;
                            font-weight: 500;
                        }

                        .avatar-preview-container {
                            display: flex;
                            gap: 10px;
                            align-items: flex-start;
                        }

                        .avatar-preview {
                            width: 80px;
                            height: 80px;
                            border: 2px dashed var(--field-border, #4a4a4a);
                            border-radius: 6px;
                            background: #1a1a1a;
                            background-size: cover;
                            background-position: center;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            flex-shrink: 0;
                            transition: border-color 0.2s, background-color 0.2s;
                        }

                        .avatar-preview:hover {
                            border-color: var(--focus, #8b5cf6);
                            background-color: rgba(139, 92, 246, 0.1);
                        }

                        .avatar-preview.uploading {
                            opacity: 0.6;
                            cursor: not-allowed;
                        }

                        .no-image,
                        .upload-loading {
                            font-size: 11px;
                            color: var(--muted, #a1a1aa);
                            text-align: center;
                        }

                        .avatar-input-controls {
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                            flex: 1;
                        }

                        .upload-btn {
                            background: var(--save, #8b5cf6);
                            color: #fff;
                            border: none;
                            padding: 8px 12px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 600;
                            transition: background-color 0.2s, opacity 0.2s;
                        }

                        .upload-btn:hover:not(:disabled) {
                            background: var(--save-hover, #9b6df9);
                        }

                        .upload-btn:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                        }

                        .toggle-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 8px 0;
                        }

                        .toggle-row label {
                            font-size: 14px;
                            color: var(--text, #e5e7eb);
                        }

                        .toggle-switch {
                            position: relative;
                            display: inline-flex;
                            width: 44px;
                            height: 24px;
                            cursor: pointer;
                        }

                        .toggle-switch input {
                            opacity: 0;
                            width: 0;
                            height: 0;
                        }

                        .slider {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: #4a4a4a;
                            border-radius: 12px;
                            transition: background-color 0.2s;
                        }

                        .slider:before {
                            content: '';
                            position: absolute;
                            width: 20px;
                            height: 20px;
                            left: 2px;
                            bottom: 2px;
                            background-color: white;
                            border-radius: 50%;
                            transition: transform 0.2s;
                        }

                        .toggle-switch input:checked + .slider {
                            background-color: var(--focus, #8b5cf6);
                        }

                        .toggle-switch input:checked + .slider:before {
                            transform: translateX(20px);
                        }

                        .modal-footer {
                            padding: 16px 20px;
                            border-top: 1px solid var(--border, #2f2f2f);
                            display: flex;
                            gap: 10px;
                            justify-content: flex-end;
                        }

                        .modal-footer button {
                            padding: 10px 16px;
                            border-radius: 6px;
                            border: none;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background-color 0.2s;
                            font-size: 14px;
                        }

                        .modal-footer button:nth-child(1) {
                            background: var(--save, #8b5cf6);
                            color: #fff;
                        }

                        .modal-footer button:nth-child(1):hover {
                            background: var(--save-hover, #9b6df9);
                        }

                        .error-message {
                            background: rgba(239, 68, 68, 0.1);
                            border: 1px solid #ef4444;
                            border-radius: 6px;
                            padding: 10px 12px;
                            color: #fca5a5;
                            font-size: 13px;
                        }

                        @media (max-width: 640px) {
                            .modal-content {
                                max-width: calc(100vw - 32px);
                            }

                            .avatar-preview-container {
                                flex-direction: column;
                            }
                        }
                    `}</style>

                    <div className="modal-header">
                        <h3>Personalização da Ficha</h3>
                        <button onClick={onClose} className="close-modal-btn" aria-label="Fechar">
                            &times;
                        </button>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <div className="customization-modal-body">
                        {/* Appearance Section */}
                        <div className="customization-section">
                            <h4>Aparência</h4>
                            <div className="form-group">
                                <label htmlFor="pathway-color">Cor de Destaque</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        id="pathway-color"
                                        type="color"
                                        className="pathway-color-picker"
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            background: generateSmartButtonColor(color),
                                            color: getContrastColor(generateSmartButtonColor(color)),
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s ease',
                                        }}
                                        title="Preview de como os botões aparecerão com a cor selecionada"
                                    >
                                        Preview Botão
                                    </button>
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                    A cor dos botões será ajustada automaticamente para melhor legibilidade
                                </div>
                            </div>
                            {renderAvatarInput('avatarHealthy', 'Avatar (Saudável)')}
                            {renderAvatarInput('avatarHurt', 'Avatar (Ferido)')}
                            {renderAvatarInput('avatarDisturbed', 'Avatar (Perturbado)')}
                            {renderAvatarInput('avatarInsane', 'Avatar (Insano)')}
                        </div>

                        {/* Privacy Section */}
                        <div className="customization-section">
                            <h4>Privacidade</h4>
                            <div className="toggle-row">
                                <label>Ficha Privada</label>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={isPrivate}
                                        onChange={e => setIsPrivate(e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Accessibility Section */}
                        <div className="customization-section">
                            <h4>Acessibilidade</h4>
                            <div className="toggle-row">
                                <label>Fonte para Dislexia</label>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.useOpenDyslexicFont}
                                        onChange={e =>
                                            handleSettingChange('useOpenDyslexicFont', e.target.checked)
                                        }
                                    />
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

            {/* Crop Modal */}
            {cropModalOpen && currentCropFile && (
                <ImageCropModal
                    imageFile={currentCropFile}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                    aspectRatio={1}
                />
            )}
        </>
    );
};
