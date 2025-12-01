import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rollGeneralAction, calculateDicePool, purifyAssimilationDice } from '../utils/beyondersRules';

// Helper to stub Math.random to produce predictable d10 rolls
const stubMathRandomSequence = (values: number[]) => {
  let i = 0;
  const original = Math.random;
  (Math as any).random = () => {
    const v = values[i++] ?? values[values.length - 1];
    // Map desired face value (1-10) to Math.random return in [0,1)
    return (v - 1) / 10;
  };
  return original;
};

describe('beyondersRules - dice logic', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    (Math as any).random = originalRandom;
  });

  it('calculates dice pool as attribute + skill', () => {
    expect(calculateDicePool(3, 2)).toBe(5);
    expect(calculateDicePool(0, 0)).toBe(0);
  });

  it('counts soul successes correctly (6->1, 10->2)', () => {
    // 2 soul dice: 6 and 10
    const orig = stubMathRandomSequence([6, 10]);
    const res = rollGeneralAction(2, 0, 6);
    (Math as any).random = orig;

    expect(res.soulRolls).toEqual([6, 10]);
    expect(res.soulSuccesses).toBe(3); // 6 =>1, 10=>2
    expect(res.assimilationSuccesses).toBe(0);
    expect(res.totalSuccesses).toBe(3);
    expect(res.isBotch).toBe(false);
  });

  it('counts assimilation successes correctly (6->2, 10->3) and registers madness triggers', () => {
    const orig = stubMathRandomSequence([6, 10]);
    const res = rollGeneralAction(0, 2, 6);
    (Math as any).random = orig;

    expect(res.assimilationRolls).toEqual([6, 10]);
    expect(res.assimilationSuccesses).toBe(5); // 6=>2, 10=>3
    expect(res.soulSuccesses).toBe(0);
    expect(res.totalSuccesses).toBe(5);
    expect(res.madnessTriggers).toBe(0);
  });

  it('applies madness cancellation: cancels biggest successes when black 1 occurs', () => {
    // soul: 10 (2 successes)
    // assimilation: 8 (2 successes), 1 (madness trigger)
    // order of random calls: soul rolls first, then assimilation
    const orig = stubMathRandomSequence([10, 8, 1]);
    const res = rollGeneralAction(1, 2, 6);
    (Math as any).random = orig;

    expect(res.soulRolls).toEqual([10]);
    expect(res.assimilationRolls).toEqual([8, 1]);
    // before cancellation: soul 2 + assimilation 2 = 4
    // madnessTriggers = 1 -> cancels largest success (2)
    expect(res.madnessTriggers).toBe(1);
    // before cancellation: soul 2 + assimilation 2 = 4
    // madnessTriggers = 1 -> cancels 1 sucesso => total 3
    expect(res.totalSuccesses).toBe(3);
    expect(res.isBotch).toBe(false);
  });

  it('detects botch when zero successes and at least one 1 present', () => {
    // soul: 2 (no success), assimilation: 1 (a 1 present) => botch
    const orig = stubMathRandomSequence([2, 1]);
    const res = rollGeneralAction(1, 1, 6);
    (Math as any).random = orig;

    expect(res.soulRolls).toEqual([2]);
    expect(res.assimilationRolls).toEqual([1]);
    expect(res.totalSuccesses).toBe(0);
    expect(res.isBotch).toBe(true);
  });

  it('purifyAssimilationDice reduces assimilation and increases soul dice', () => {
    const result = purifyAssimilationDice(3, 2);
    expect(result.success).toBe(true);
    expect(result.previousAssimilationDice).toBe(3);
    expect(result.newAssimilationDice).toBe(2);
    expect(result.newSoulDice).toBe(3);
  });
});
