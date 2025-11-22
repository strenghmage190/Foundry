import { Anchor } from '../types';

/**
 * Conta quantas âncoras estão ativas (têm pelo menos convicção OU símbolo preenchido)
 */
export function countActiveAnchors(anchors: Anchor[]): number {
    if (!anchors || !Array.isArray(anchors)) return 0;
    
    return anchors.filter(anchor => {
        const hasConviction = anchor.conviction && anchor.conviction.trim() !== '';
        const hasSymbol = anchor.symbol && anchor.symbol.trim() !== '';
        return hasConviction || hasSymbol;
    }).length;
}

/**
 * Verifica se uma âncora específica está ativa
 */
export function isAnchorActive(anchor: Anchor): boolean {
    if (!anchor) return false;
    
    const hasConviction = anchor.conviction && anchor.conviction.trim() !== '';
    const hasSymbol = anchor.symbol && anchor.symbol.trim() !== '';
    return hasConviction || hasSymbol;
}

/**
 * Calcula o bônus de Resiliência Mental baseado nas âncoras ativas
 * +1 dado por âncora ativa em testes de Sanidade
 */
export function getAnchorSanityBonus(anchors: Anchor[]): number {
    return countActiveAnchors(anchors);
}
