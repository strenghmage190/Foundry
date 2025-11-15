import React, { useState } from 'react';
import { ToastData } from '../types';

interface LiveToastProps {
    toast: ToastData;
    onRemove: (id: number) => void;
}

const truncate = (text: string, max = 80) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trimEnd() + '…';
};

const LiveToast: React.FC<LiveToastProps> = ({ toast, onRemove }) => {
    const getIcon = (type: ToastData['type']) => {
        switch (type) {
            case 'success': return '✅';
            case 'failure': return '💀';
            case 'info': default: return 'ℹ️';
        }
    };
    const hasExtra = Boolean(toast.details || (toast.message && toast.message.length > 120));
    const [isExpanded, setIsExpanded] = useState<boolean>(hasExtra);

    const rollInfo = (toast as any).rollInfo as {
        soulRolls?: number[];
        assimilationRolls?: number[];
        absorptionRolls?: number[];
        rolls?: number[];
        successes?: number;
        damage?: { total: number; breakdown: string } | null;
    } | undefined;

    return (
        <div className={`live-toast ${toast.type} ${isExpanded ? 'expanded' : 'collapsed'}`} role="status" aria-live="polite">
            <span className="live-toast-icon" aria-hidden>{getIcon(toast.type)}</span>
            <div className="live-toast-content">
                {rollInfo ? (
                    <div className="toast-body roll-result-body">
                        <div className="result-main">
                            <span className="result-value">{rollInfo.successes ?? (toast.message.match(/\d+/)?.[0] ?? '0')}</span>
                            <span className="result-label">SUCESSO(S)</span>
                        </div>
                        <div className="result-details">
                            {rollInfo.damage ? (
                                <div className="damage-box">
                                    <span className="damage-value">{rollInfo.damage.total}</span>
                                    <span className="damage-label">DANO</span>
                                </div>
                            ) : (
                                <div className="roll-submessage">{truncate(toast.message, 80)}</div>
                            )}

                            <div className="dice-roll-display">
                                {(() => {
                                    const items: { value: number; kind: 'soul' | 'assim' | 'abs' | 'generic' }[] = [];
                                    if (rollInfo.soulRolls && rollInfo.soulRolls.length) {
                                        rollInfo.soulRolls.forEach(v => items.push({ value: v, kind: 'soul' }));
                                    }
                                    if (rollInfo.assimilationRolls && rollInfo.assimilationRolls.length) {
                                        rollInfo.assimilationRolls.forEach(v => items.push({ value: v, kind: 'assim' }));
                                    }
                                    if (rollInfo.absorptionRolls && rollInfo.absorptionRolls.length) {
                                        rollInfo.absorptionRolls.forEach(v => items.push({ value: v, kind: 'abs' }));
                                    }
                                    if (items.length === 0 && rollInfo.rolls && rollInfo.rolls.length) {
                                        rollInfo.rolls.forEach(v => items.push({ value: v, kind: 'generic' }));
                                    }

                                    return items.map((it, i) => {
                                        const classes = ['dice'];
                                        if (it.value >= 6) classes.push('success');
                                        if (it.value === 10) classes.push('crit');
                                        if (it.value === 1) classes.push('fail');
                                        if (it.kind === 'assim') classes.push('assim');
                                        if (it.kind === 'abs') classes.push('abs');
                                        const label = it.kind === 'soul' ? 'Alma' : it.kind === 'assim' ? 'Assimilação' : it.kind === 'abs' ? 'Absorção' : 'Dado';
                                        return (
                                            <span key={i} className={classes.join(' ')} title={`${label}: ${it.value}`}>{it.value}</span>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="live-toast-main">
                            <strong className="live-toast-title">{toast.title}</strong>
                            <p className="live-toast-message">{isExpanded ? (toast.details ?? toast.message) : truncate(toast.message, 80)}</p>
                        </div>
                        {isExpanded && (toast.details ?? toast.message) && (
                            <pre className="live-toast-details">{toast.details ?? toast.message}</pre>
                        )}
                    </div>
                )}
            </div>

            <div className="live-toast-actions">
                {hasExtra && (
                    <button
                        className="live-toast-toggle"
                        aria-expanded={isExpanded}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                    >
                        {isExpanded ? '▲' : '…'}
                    </button>
                )}
                <button onClick={() => onRemove(toast.id)} className="live-toast-close" aria-label="Fechar">&times;</button>
            </div>
        </div>
    );
};

interface LiveToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: number) => void;
}

export const LiveToastContainer: React.FC<LiveToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="live-toast-container">
            {toasts.map(toast => (
                <LiveToast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};