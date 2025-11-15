import React, { useState } from 'react';
import { ToastData } from '../types';

interface NotificationLogItemProps {
    toast: ToastData;
    onRemove: (id: number) => void;
}

const ToastIcon: React.FC<{ type: ToastData['type'] }> = ({ type }) => {
    switch (type) {
        case 'success': return <span className="log-item-icon">✅</span>;
        case 'failure': return <span className="log-item-icon">💀</span>;
        case 'info': default: return <span className="log-item-icon">ℹ️</span>;
    }
};

const truncate = (text?: string, max = 90) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trimEnd() + '…';
};

export const NotificationLogItem: React.FC<NotificationLogItemProps> = ({ toast, onRemove }) => {
    const { type, title, message, details } = toast;
    const [isExpanded, setIsExpanded] = useState<boolean>(Boolean(details && details.length > 0));

    const displaySummary = details ? truncate(message || details, 100) : truncate(message, 100);

    return (
        <div className={`log-item ${type}`}>
            <div className="log-item-header">
                <ToastIcon type={type} />
                <div className="log-item-meta">
                    <strong className="log-item-title">{title}</strong>
                    <p className="log-item-message">{isExpanded ? (details ?? message) : displaySummary}</p>
                </div>
                <div className="log-item-controls">
                    {details && (
                        <button className="log-item-toggle" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded}>
                            {isExpanded ? '▲' : '…'}
                        </button>
                    )}
                    <button onClick={() => onRemove(toast.id)} className="log-item-close-btn" aria-label="Remover">&times;</button>
                </div>
            </div>
            {details && isExpanded && (
                <div className={`log-item-details expanded`}>
                    {(details).split('\n').map((line, i) => <div key={i} className="log-item-detail-line">{line}</div>)}
                </div>
            )}
        </div>
    );
};