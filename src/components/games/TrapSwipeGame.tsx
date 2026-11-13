import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';
import { TRAP_SWIPE_CARDS } from '../../data/phase1Games';
import { shuffleItems } from '../../lib/phase1GameUtils';
import type { DisplayMode, TrapSwipeCard } from '../../types/lesson';

interface TrapSwipeGameProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  keyboardEnabled: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
  onNextStage: () => void;
}

export function TrapSwipeGame({
  displayMode,
  isCompleted,
  keyboardEnabled,
  onComplete,
  onRecordWeakNote,
  onNextStage,
}: TrapSwipeGameProps) {
  const [deck, setDeck] = useState<TrapSwipeCard[]>(() => shuffleItems(TRAP_SWIPE_CARDS));
  const [index, setIndex] = useState(0);
  const [chosenValid, setChosenValid] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const currentCard = deck[index];
  const hasJudged = chosenValid !== null;
  const wasCorrect =
    hasJudged && currentCard ? chosenValid === currentCard.isCorrectStatement : false;

  const startDeck = useCallback((cards: readonly TrapSwipeCard[]) => {
    setDeck(shuffleItems(cards));
    setIndex(0);
    setChosenValid(null);
    setCorrectCount(0);
    setMissedIds([]);
    setFinished(false);
  }, []);

  const handleJudge = useCallback(
    (userThinksValid: boolean) => {
      if (finished || !currentCard || chosenValid !== null) return;
      setChosenValid(userThinksValid);

      const isRight = userThinksValid === currentCard.isCorrectStatement;
      if (isRight) {
        setCorrectCount((prev) => prev + 1);
        return;
      }

      setMissedIds((prev) =>
        prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]
      );
      onRecordWeakNote(`${currentCard.category}: ${currentCard.fixText}`);
    },
    [chosenValid, currentCard, finished, onRecordWeakNote]
  );

  const handleNext = useCallback(() => {
    if (index + 1 >= deck.length) {
      setFinished(true);
      onComplete();
      return;
    }
    setIndex((prev) => prev + 1);
    setChosenValid(null);
  }, [deck.length, index, onComplete]);

  useEffect(() => {
    if (!keyboardEnabled || finished) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (chosenValid === null) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleJudge(false);
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleJudge(true);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chosenValid, finished, handleJudge, handleNext, keyboardEnabled]);

  if (finished) {
    const missedCards = TRAP_SWIPE_CARDS.filter((c) => missedIds.includes(c.id));
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-extrabold text-stone-900">
          Xong Chặng 1 · Đúng {correctCount}/{deck.length} thẻ
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          {missedCards.length === 0
            ? 'Không dính bẫy nào — rất chắc kiến thức!'
            : `Còn ${missedCards.length} câu bẫy bạn nên xem lại trước khi vào Quiz.`}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {missedCards.length > 0 && (
            <button
              type="button"
              onClick={() => startDeck(missedCards)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-extrabold text-amber-900 hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Luyện lại {missedCards.length} câu vừa nhầm
            </button>
          )}
          <button
            type="button"
            onClick={() => startDeck(TRAP_SWIPE_CARDS)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Làm lại 12 thẻ
          </button>
          <button
            type="button"
            onClick={onNextStage}
            className="flex items-center gap-1.5 rounded-xl bg-red-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-red-800"
          >
            <span>Sang Chặng 2: Ghép Biến Mất</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  if (!currentCard) return null;

  const progressPct = Math.round(((index + (hasJudged ? 1 : 0)) / deck.length) * 100);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-extrabold text-stone-700">
            Thẻ {index + 1} / {deck.length}
          </span>
          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              Đã hoàn thành
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => startDeck(TRAP_SWIPE_CARDS)}
          className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Xáo lại
        </button>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-red-700 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        className={`mt-5 rounded-2xl border-2 p-5 text-center transition sm:p-7 ${
          !hasJudged
            ? 'border-stone-200 bg-stone-50/70'
            : wasCorrect
              ? 'border-emerald-400 bg-emerald-50/70'
              : 'border-red-400 bg-red-50/70'
        }`}
      >
        <span className="inline-block rounded-full bg-stone-900 px-3 py-0.5 text-[11px] font-extrabold text-white">
          {currentCard.category}
        </span>

        {currentCard.contextVi && (
          <p className="mt-2.5 text-xs font-semibold text-stone-500">
            {currentCard.contextVi}
          </p>
        )}

        <p className="font-jp mt-3 text-xl font-extrabold leading-relaxed text-stone-900 sm:text-2xl">
          {currentCard.statementJp}
        </p>

        {displayMode === 'full' && currentCard.romaji && (
          <p className="mt-1 text-xs font-medium text-stone-400">{currentCard.romaji}</p>
        )}

        {hasJudged && (
          <div className="mt-4 rounded-xl border border-white/80 bg-white/95 p-3.5 text-left text-xs shadow-xs">
            <div className="flex items-center gap-1.5 font-extrabold">
              {wasCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-800">Chuẩn xác!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">Dính bẫy rồi!</span>
                </>
              )}
            </div>
            {!currentCard.isCorrectStatement && (
              <p className="font-jp mt-1.5 font-bold text-stone-900">
                Cách sửa chuẩn:{' '}
                <span className="text-emerald-700">{currentCard.fixText}</span>
              </p>
            )}
            <p className="mt-1 text-stone-600">{currentCard.explanation}</p>
          </div>
        )}
      </div>

      {!hasJudged ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleJudge(false)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3.5 text-red-800 transition hover:border-red-400 hover:bg-red-100 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <ShieldAlert className="h-4 w-4" />
              <span>BẪY / SAI</span>
            </div>
            <span className="hidden text-[11px] font-medium text-red-600 sm:inline">
              Phím 1 hoặc ←
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleJudge(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <CheckCircle2 className="h-4 w-4" />
              <span>CHUẨN</span>
            </div>
            <span className="hidden text-[11px] font-medium text-emerald-700 sm:inline">
              Phím 2 hoặc →
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-stone-800 sm:w-auto"
          >
            <span>{index + 1 >= deck.length ? 'Xem kết quả Chặng 1' : 'Thẻ tiếp theo'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
