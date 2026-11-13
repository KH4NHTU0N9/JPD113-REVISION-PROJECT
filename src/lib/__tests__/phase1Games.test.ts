import { describe, expect, it } from 'vitest';
import {
  BUG_HUNT_CASES,
  MATCH_ROUNDS,
  SENTENCE_TILE_PUZZLES,
  TRAP_SWIPE_CARDS,
} from '../../data/phase1Games';
import {
  evaluateSentenceTiles,
  formatElapsedTenths,
  shuffleItems,
} from '../phase1GameUtils';

describe('Phase 1 Mini-Game Data & Evaluators', () => {
  it('validates all TrapSwipeCards have unique IDs and fix explanations', () => {
    const ids = new Set(TRAP_SWIPE_CARDS.map((c) => c.id));
    expect(ids.size).toBe(TRAP_SWIPE_CARDS.length);
    for (const card of TRAP_SWIPE_CARDS) {
      expect(card.statementJp.trim().length).toBeGreaterThan(0);
      expect(card.fixText.trim().length).toBeGreaterThan(0);
      expect(card.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it('ensures every SpeedMatch round has unambiguous left and right labels', () => {
    for (const round of MATCH_ROUNDS) {
      const leftSet = new Set(round.pairs.map((p) => p.leftText));
      const rightSet = new Set(round.pairs.map((p) => p.rightText));
      expect(leftSet.size).toBe(round.pairs.length);
      expect(rightSet.size).toBe(round.pairs.length);
    }
  });

  it('ensures every SentenceTilePuzzle validates cleanly and traps have reasons', () => {
    for (const puzzle of SENTENCE_TILE_PUZZLES) {
      const tokenMap = new Map(puzzle.tokens.map((t) => [t.id, t]));
      expect(tokenMap.size).toBe(puzzle.tokens.length);

      for (const expectedId of puzzle.correctIds) {
        const token = tokenMap.get(expectedId);
        expect(token).toBeDefined();
        expect(token?.isTrap).not.toBe(true);
      }

      for (const token of puzzle.tokens) {
        if (token.isTrap) {
          expect(token.trapReason?.trim().length).toBeGreaterThan(0);
        }
      }

      expect(evaluateSentenceTiles(puzzle, puzzle.correctIds).isCorrect).toBe(true);
    }
  });

  it('detects trap tokens, incomplete selections, and wrong tile order', () => {
    const puzzle1 = SENTENCE_TILE_PUZZLES[0];
    const withTrap = evaluateSentenceTiles(puzzle1, ['t1', 't2', 'trap-no', 't3', 't4']);
    expect(withTrap.isCorrect).toBe(false);
    expect(withTrap.pickedTrapReason).toContain('ベトナム');

    const incomplete = evaluateSentenceTiles(puzzle1, ['t1', 't2']);
    expect(incomplete.isCorrect).toBe(false);
    expect(incomplete.reason).toContain('Còn thiếu');

    const wrongOrder = evaluateSentenceTiles(puzzle1, ['t4', 't3', 't2', 't1']);
    expect(wrongOrder.isCorrect).toBe(false);
  });

  it('validates all BugHuntCases have actionable fixes and explanations', () => {
    for (const c of BUG_HUNT_CASES) {
      const bugs = c.segments.filter((s) => s.isBug);
      expect(bugs.length).toBeGreaterThan(0);
      for (const b of bugs) {
        expect(b.fixedText?.trim().length).toBeGreaterThan(0);
        expect(b.explanation?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('shuffles without mutating and safely formats elapsed seconds', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffleItems(src, () => 0.25);
    expect(src).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);

    expect(formatElapsedTenths(8450)).toBe('8.4s');
    expect(formatElapsedTenths(-500)).toBe('0.0s');
    expect(formatElapsedTenths(Number.NaN)).toBe('0.0s');
  });
});
