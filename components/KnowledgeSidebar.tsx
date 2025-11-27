import React, { useState } from 'react';

interface KnowledgeSidebarProps {
    onShowGrimoire?: () => void;
    onShowArcaneMastery?: () => void;
    onShowPathways?: () => void;
    onShowDeities?: () => void;
    onShowFamilies?: () => void;
}

export const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({ onShowGrimoire, onShowArcaneMastery, onShowPathways, onShowDeities, onShowFamilies }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#d4af37',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    zIndex: 100,
                    transform: isOpen ? 'scale(1.1)' : 'scale(1)',
                }}
                title="Menu de Conhecimento"
            >
                📚
            </button>

            {/* Sidebar */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '5.5rem',
                        right: '2rem',
                        backgroundColor: 'rgba(30, 35, 45, 0.98)',
                        border: '2px solid #d4af37',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        minWidth: '200px',
                        zIndex: 99,
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <h3 style={{ margin: '0 0 1rem 0', color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold' }}>
                        📚 CONHECIMENTO
                    </h3>

                    <button
                        onClick={() => {
                            onShowGrimoire?.();
                            setIsOpen(false);
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(96, 165, 250, 0.1)',
                            color: '#60a5fa',
                            border: '1px solid #60a5fa',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)';
                        }}
                    >
                        📖 Grimório
                    </button>

                    <button
                        onClick={() => {
                            onShowPathways?.();
                            setIsOpen(false);
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            border: '1px solid #fbbf24',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
                        }}
                    >
                        🌟 Caminhos
                    </button>

                    <button
                        onClick={() => {
                            onShowArcaneMastery?.();
                            setIsOpen(false);
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                            color: '#a78bfa',
                            border: '1px solid #a78bfa',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(167, 139, 250, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(167, 139, 250, 0.1)';
                        }}
                    >
                        ⚔️ Maestria
                    </button>

                    <button
                        onClick={() => {
                            onShowDeities?.();
                            setIsOpen(false);
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            color: '#ec4899',
                            border: '1px solid #ec4899',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
                        }}
                    >
                        🙏 Deuses
                    </button>

                    <button
                        onClick={() => {
                            onShowFamilies?.();
                            setIsOpen(false);
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            border: '1px solid #22c55e',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                        }}
                    >
                        👑 Famílias
                    </button>
                </div>
            )}

            {/* Overlay para fechar */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 98,
                    }}
                />
            )}
        </>
    );
};
