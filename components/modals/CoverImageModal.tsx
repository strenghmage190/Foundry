import React, { useState } from 'react';
import { uploadAndSetCampaignCover } from '../../api/campaigns';
import { Campaign } from '../../types';
import { ImageCropModal } from './ImageCropModal';

interface CoverImageModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSaved: (updatedCampaign: Campaign) => void;
}

const CoverImageModal: React.FC<CoverImageModalProps> = ({ campaign, onClose, onSaved }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estado para controlar o modal de crop
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentCropFile(file);
      setCropModalOpen(true);
    }
  };

  const handleCropConfirm = (croppedBlob: Blob) => {
    // Converte o blob em File
    const croppedFile = new File([croppedBlob], 'campaign-cover.png', { type: 'image/png' });
    
    setSelectedFile(croppedFile);
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);
    
    // Fecha o modal de crop
    setCropModalOpen(false);
    setCurrentCropFile(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCurrentCropFile(null);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      const updatedCampaign = await uploadAndSetCampaignCover(campaign.id, selectedFile);
      onSaved(updatedCampaign);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar imagem de capa:', error);
      alert('Erro ao salvar a imagem. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <>
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title-font">Alterar Imagem de Capa</h2>
          <button onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: '1rem' }}
          />
          {previewUrl && (
            <div className="image-preview-container">
              <img src={previewUrl} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleClose} disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!selectedFile || saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
    
    {/* Modal de Crop de Imagem */}
    {cropModalOpen && currentCropFile && (
      <ImageCropModal
        imageFile={currentCropFile}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        aspectRatio={16 / 9}
      />
    )}
    </>
  );
};

export default CoverImageModal;
