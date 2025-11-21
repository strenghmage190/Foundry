import React, { useState, useRef, useEffect } from 'react';

interface ImageCropModalProps {
  imageFile: File;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 para quadrado, undefined para livre
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageFile,
  onConfirm,
  onCancel,
  aspectRatio = 1
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      // Calcula zoom inicial para cobrir o container
      if (containerRef.current) {
        const containerWidth = 300;
        const containerHeight = 300;
        const imageAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;
        
        let initialZoom;
        if (imageAspect > containerAspect) {
          // Imagem mais larga - fit pela altura
          initialZoom = containerHeight / img.height;
        } else {
          // Imagem mais alta - fit pela largura
          initialZoom = containerWidth / img.width;
        }
        
        setZoom(initialZoom);
        
        // Centraliza a imagem
        const scaledWidth = img.width * initialZoom;
        const scaledHeight = img.height * initialZoom;
        setPosition({
          x: (containerWidth - scaledWidth) / 2,
          y: (containerHeight - scaledHeight) / 2
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    
    if (!imageRef.current || !containerRef.current) {
      setZoom(newZoom);
      return;
    }

    // Mantém o centro da imagem no mesmo lugar ao fazer zoom
    const containerWidth = 300;
    const containerHeight = 300;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    const oldScaledWidth = imageRef.current.width * zoom;
    const oldScaledHeight = imageRef.current.height * zoom;
    const newScaledWidth = imageRef.current.width * newZoom;
    const newScaledHeight = imageRef.current.height * newZoom;
    
    const oldCenterOffsetX = centerX - position.x - oldScaledWidth / 2;
    const oldCenterOffsetY = centerY - position.y - oldScaledHeight / 2;
    
    const newX = centerX - newScaledWidth / 2 - (oldCenterOffsetX * newZoom / zoom);
    const newY = centerY - newScaledHeight / 2 - (oldCenterOffsetY * newZoom / zoom);
    
    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  const handleConfirm = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define o tamanho do canvas para 300x300 (ou o tamanho desejado)
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Limpa o canvas
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Desenha a imagem com o zoom e posição atuais
    ctx.drawImage(
      imageRef.current,
      position.x,
      position.y,
      imageRef.current.width * zoom,
      imageRef.current.height * zoom
    );

    // Converte para blob
    canvas.toBlob((blob) => {
      if (blob) {
        onConfirm(blob);
      }
    }, 'image/png', 0.95);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#2b2d31',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '460px',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: '20px',
            fontWeight: 600
          }}>
            Editar imagem
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#b5bac1',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Preview Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '300px',
            height: '300px',
            margin: '0 auto 20px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: aspectRatio === 1 ? '50%' : '8px',
            cursor: isDragging ? 'grabbing' : 'grab',
            border: '3px solid #fff',
            backgroundColor: '#1e1f22'
          }}
        >
          {imageUrl && imageRef.current && (
            <img
              src={imageUrl}
              alt="Preview"
              draggable={false}
              style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${imageRef.current.width * zoom}px`,
                height: `${imageRef.current.height * zoom}px`,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Zoom Slider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          padding: '0 24px'
        }}>
          <span style={{ color: '#b5bac1', fontSize: '20px' }}>🔍</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={handleZoomChange}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: '#4e5058',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ color: '#b5bac1', fontSize: '20px' }}>🖼️</span>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3c3f45'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#5865f2',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4752c4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5865f2'}
          >
            Aplicar
          </button>
        </div>

        {/* Hidden Canvas for Export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
