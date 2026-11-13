import type { SentenceTilePuzzle } from '../types/lesson';

/**
 * Return a new array shuffled via Fisher-Yates without mutating the source array.
 */
export function shuffleItems<T>(
  items: readonly T[],
  rng: () => number = Math.random
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Compute XP reward scaled modestly by streak combo (capped at 4x multiplier).
 */
export function calculateSwipeXp(combo: number): number {
  const multiplier = Math.max(1, Math.min(4, combo));
  return 10 * multiplier;
}

export interface TileEvaluationResult {
  isCorrect: boolean;
  reason: string;
  pickedTrapReason?: string;
}

/**
 * Verify whether selected sentence tile IDs exactly match the puzzle sequence
 * and surface targeted feedback when decoy trap tokens were included.
 */
export function evaluateSentenceTiles(
  puzzle: SentenceTilePuzzle,
  selectedIds: readonly string[]
): TileEvaluationResult {
  const tokenMap = new Map(puzzle.tokens.map((t) => [t.id, t]));

  for (const id of selectedIds) {
    const token = tokenMap.get(id);
    if (token?.isTrap) {
      return {
        isCorrect: false,
        reason: token.trapReason ?? `Mảnh "${token.text}" là bẫy thừa — hãy bấm bỏ ra!`,
        pickedTrapReason: token.trapReason,
      };
    }
  }

  if (selectedIds.length < puzzle.correctIds.length) {
    return {
      isCorrect: false,
      reason: `Còn thiếu ${puzzle.correctIds.length - selectedIds.length} mảnh nữa mới đủ câu!`,
    };
  }

  const exactMatch =
    selectedIds.length === puzzle.correctIds.length &&
    puzzle.correctIds.every((expectedId, index) => selectedIds[index] === expectedId);

  if (!exactMatch) {
    return {
      isCorrect: false,
      reason: 'Đúng mảnh rồi nhưng sai thứ tự! Nhớ: Chủ ngữ は/も trước, です ở cuối; Tháng trước – Ngày sau.',
    };
  }

  return {
    isCorrect: true,
    reason: puzzle.explanation,
  };
}

/**
 * Format elapsed milliseconds as compact seconds with tenths (e.g. "08.4s").
 */
export function formatElapsedTenths(ms: number): string {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  return `${(safeMs / 1000).toFixed(1)}s`;
}
