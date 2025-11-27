/**
 * Index para Lazy Loading de Partículas Mágicas
 * Arquivo central para importações - permite code splitting
 */

import { MagicParticle, PathwayDescription } from '../complete-magic-particles';

// Lazy load particle types
export async function loadObjetos(): Promise<MagicParticle[]> {
  const { OBJETOS } = await import('./objetos');
  return OBJETOS;
}

export async function loadFuncoes(): Promise<MagicParticle[]> {
  const { FUNCOES } = await import('./funcoes');
  return FUNCOES;
}

export async function loadCaracteristicas(): Promise<MagicParticle[]> {
  const { CARACTERISTICAS } = await import('./caracteristicas');
  return CARACTERISTICAS;
}

export async function loadComplementos(): Promise<MagicParticle[]> {
  const { COMPLEMENTOS } = await import('./complementos');
  return COMPLEMENTOS;
}

export async function loadCriadores(): Promise<MagicParticle[]> {
  const { CRIADORES } = await import('./criadores');
  return CRIADORES;
}

export async function loadPathways(): Promise<Record<string, PathwayDescription>> {
  const { PATHWAY_DESCRIPTIONS } = await import('./pathways');
  return PATHWAY_DESCRIPTIONS;
}

// Simultaneous loading of all particles
export async function loadAllParticles(): Promise<{
  objetos: MagicParticle[];
  funcoes: MagicParticle[];
  caracteristicas: MagicParticle[];
  complementos: MagicParticle[];
  criadores: MagicParticle[];
}> {
  const [objetos, funcoes, caracteristicas, complementos, criadores] = await Promise.all([
    loadObjetos(),
    loadFuncoes(),
    loadCaracteristicas(),
    loadComplementos(),
    loadCriadores()
  ]);

  return { objetos, funcoes, caracteristicas, complementos, criadores };
}
