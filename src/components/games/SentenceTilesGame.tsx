import { useState } from 'react';
import { ArrowRight, CheckCircle2, Puzzle, RotateCcw, XCircle } from 'lucide-react';
import { SENTENCE_TILE_PUZZLES } from '../../data/phase1Games';
import {
  evaluateSentenceTiles,
  shuffleItems,
  type TileEvaluationResult,
} from '../../lib/phase1GameUtils';
import type { DisplayMode, Phase1GameId, SentenceTileToken } from '../../types/lesson';

interface SentenceTilesGameProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onAwardProgress: (deltaXp: number, combo: number, completedGame?: Phase1GameId) => void;
  onRecordWeakNote: (note: string) => void;
  onNextStage: () => void;
}

export function SentenceTilesGame({
  displayMode,
  isCompleted,
  onAwardProgress,
  onRecordWeakNote,
  onNextStage,
}: SentenceTilesGameProps) {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pools] = useState<SentenceTileToken[][]>(() =>
    SENTENCE_TILE_PUZZLES.map((p) => shuffleItems(p.tokens))
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<TileEvaluationResult | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const currentPuzzle = SENTENCE_TILE_PUZZLES[puzzleIdx];
  const currentPool = pools[puzzleIdx];
  const tokenById = new Map(currentPuzzle.tokens.map((t) => [t.id, t]));

  const isCurrentSolved = solvedIds.includes(currentPuzzle.id);
  const allSolved = solvedIds.length === SENTENCE_TILE_PUZZLES.length;

  const switchPuzzle = (nextIdx: number) => {
    setPuzzleIdx(nextIdx);
    setSelectedIds([]);
    setEvaluation(null);
  };

  const handleAddTile = (id: string) => {
    if (selectedIds.includes(id) || (evaluation?.isCorrect ?? false)) return;
    setSelectedIds((prev) => [...prev, id]);
    setEvaluation(null);
  };

  const handleRemoveTile = (id: string) => {
    if (evaluation?.isCorrect) return;
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setEvaluation(null);
  };

  const handleCheck = () => {
    const result = evaluateSentenceTiles(currentPuzzle, selectedIds);
    setEvaluation(result);

    if (result.isCorrect) {
      if (!isCurrentSolved) {
        const nextSolved = [...solvedIds, currentPuzzle.id];
        setSolvedIds(nextSolved);
        const stageCleared = nextSolved.length === SENTENCE_TILE_PUZZLES.length;
        onAwardProgress(45, nextSolved.length, stageCleared ? 'tiles' : undefined);
      }
      return;
    }

    onRecordWeakNote(`Xếp câu (${currentPuzzle.viPrompt}): ${result.reason}`);
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {SENTENCE_TILE_PUZZLES.map((p, idx) => {
            const done = solvedIds.includes(p.id);
            const active = idx === puzzleIdx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => switchPuzzle(idx)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  active
                    ? 'border-red-600 bg-red-50 text-red-800'
                    : done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {done ? `✓ ${idx + 1}` : `Câu ${idx + 1}`}
              </button>
            );
          })}
          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Đã xong 6/6 câu
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-stone-500">
          Hoàn thành: {solvedIds.length}/{SENTENCE_TILE_PUZZLES.length}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700">
          <Puzzle className="h-3.5 w-3.5" />
          <span>{currentPuzzle.title}</span>
        </div>
        <p className="mt-1 text-base font-extrabold text-stone-900">
          “{currentPuzzle.viPrompt}”
        </p>

        <div
          className={`mt-4 flex min-h-[68px] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3 transition ${
            evaluation
              ? evaluation.isCorrect
                ? 'border-emerald-400 bg-emerald-50/70'
                : 'border-red-300 bg-red-50/60'
              : 'border-stone-300 bg-white'
          }`}
        >
          {selectedIds.length === 0 ? (
            <span className="text-xs font-medium text-stone-400">
              Chạm lần lượt các mảnh từ bên dưới để ghép câu (đừng chọn mảnh bẫy!)...
            </span>
          ) : (
            selectedIds.map((id) => {
              const token = tokenById.get(id);
              if (!token) return null;
              const highlightAsTrap = Boolean(evaluation && !evaluation.isCorrect && token.isTrap);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleRemoveTile(id)}
                  className={`font-jp rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition ${
                    highlightAsTrap
                      ? 'border-red-500 bg-red-100 text-red-900'
                      : evaluation?.isCorrect
                        ? 'border-emerald-500 bg-emerald-600 text-white'
                        : 'border-stone-800 bg-stone-900 text-white hover:bg-stone-700'
                  }`}
                >
                  {token.text}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {currentPool.map((token) => {
            const isUsed = selectedIds.includes(token.id);
            return (
              <button
                key={token.id}
                type="button"
                disabled={isUsed || Boolean(evaluation?.isCorrect)}
                onClick={() => handleAddTile(token.id)}
                className={`rounded-xl border px-3.5 py-2 text-left transition ${
                  isUsed
                    ? 'border-dashed border-stone-200 bg-stone-100 text-transparent select-none'
                    : 'border-stone-300 bg-white text-stone-900 shadow-xs hover:border-red-500 hover:bg-red-50/40 active:scale-95'
                }`}
              >
                <span className="font-jp block text-sm font-extrabold">{token.text}</span>
                {displayMode === 'full' && token.romaji && !isUsed && (
                  <span className="block text-[10px] text-stone-400">{token.romaji}</span>
                )}
              </button>
            );
          })}
        </div>

        {evaluation && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${
              evaluation.isCorrect
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {evaluation.isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{evaluation.reason}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedIds([]);
            setEvaluation(null);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Xếp lại câu này
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!evaluation?.isCorrect ? (
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleCheck}
              className="rounded-xl bg-red-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Kiểm tra câu
            </button>
          ) : puzzleIdx + 1 < SENTENCE_TILE_PUZZLES.length ? (
            <button
              type="button"
              onClick={() => switchPuzzle(puzzleIdx + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-stone-800"
            >
              <span>Qua Câu {puzzleIdx + 2}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextStage}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"
            >
              <span>{allSolved ? 'Tuyệt! Sang Chặng 4: Soi Bug' : 'Sang Chặng 4: Soi Bug'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
