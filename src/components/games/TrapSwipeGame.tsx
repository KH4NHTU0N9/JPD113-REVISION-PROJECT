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
      <section className="rounded-xl border border-stone-200 bg-white p-5 text-center shadow-2xs">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-2.5 text-base font-extrabold text-stone-900">
          Đúng {correctCount}/{deck.length} thẻ
        </h3>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {missedCards.length > 0 && (
            <button
              type="button"
              onClick={() => startDeck(missedCards)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Làm lại {missedCards.length} câu nhầm
            </button>
          )}
          <button
            type="button"
            onClick={() => startDeck(TRAP_SWIPE_CARDS)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Làm lại hết
          </button>
          <button
            type="button"
            onClick={onNextStage}
            className="flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-800"
          >
            <span>Chặng 2: Ghép Biến Mất</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  if (!currentCard) return null;

  const progressPct = Math.round(((index + (hasJudged ? 1 : 0)) / deck.length) * 100);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-stone-700">
            Thẻ {index + 1} / {deck.length}
          </span>
          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Đã xong
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

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-red-700 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        className={`mt-4 rounded-xl border p-5 text-center transition ${
          !hasJudged
            ? 'border-stone-200 bg-stone-50/50'
            : wasCorrect
              ? 'border-emerald-300 bg-emerald-50/60'
              : 'border-red-300 bg-red-50/60'
        }`}
      >
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
          {currentCard.category}
        </span>

        {currentCard.contextVi && (
          <p className="mt-1.5 text-xs font-semibold text-stone-500">
            {currentCard.contextVi}
          </p>
        )}

        <p className="font-jp mt-2.5 text-xl font-extrabold leading-relaxed text-stone-900 sm:text-2xl">
          {currentCard.statementJp}
        </p>

        {displayMode === 'full' && currentCard.romaji && (
          <p className="mt-1 text-xs font-medium text-stone-400">{currentCard.romaji}</p>
        )}

        {hasJudged && (
          <div className="mt-4 rounded-xl border border-stone-200/70 bg-white p-3 text-left text-xs">
            <div className="flex items-center gap-1.5 font-extrabold">
              {wasCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-800">Chuẩn xác</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">Dính bẫy rồi</span>
                </>
              )}
            </div>
            {!currentCard.isCorrectStatement && (
              <p className="font-jp mt-1.5 font-bold text-stone-900">
                Sửa chuẩn:{' '}
                <span className="text-emerald-700">{currentCard.fixText}</span>
              </p>
            )}
            <p className="mt-1 text-stone-600">{currentCard.explanation}</p>
          </div>
        )}
      </div>

      {!hasJudged ? (
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleJudge(false)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-800 transition hover:border-red-400 hover:bg-red-100 active:scale-[0.98]"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>BẪY / SAI</span>
          </button>

          <button
            type="button"
            onClick={() => handleJudge(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.98]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>CHUẨN</span>
          </button>
        </div>
      ) : (
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-stone-800 sm:w-auto"
          >
            <span>{index + 1 >= deck.length ? 'Xem kết quả' : 'Tiếp theo'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
