import { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, RotateCcw, Timer } from 'lucide-react';
import { MATCH_ROUNDS } from '../../data/phase1Games';
import { formatElapsedTenths, shuffleItems } from '../../lib/phase1GameUtils';
import type { DisplayMode, MatchPairItem } from '../../types/lesson';

interface SpeedMatchGameProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
  onNextStage: () => void;
}

export function SpeedMatchGame({
  displayMode,
  isCompleted,
  onComplete,
  onRecordWeakNote,
  onNextStage,
}: SpeedMatchGameProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const currentRound = MATCH_ROUNDS[roundIdx];

  const [leftItems, setLeftItems] = useState<MatchPairItem[]>(() =>
    shuffleItems(MATCH_ROUNDS[0].pairs)
  );
  const [rightItems, setRightItems] = useState<MatchPairItem[]>(() =>
    shuffleItems(MATCH_ROUNDS[0].pairs)
  );

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [clearedRoundTimes, setClearedRoundTimes] = useState<Record<string, number>>({});

  const isRoundCleared = matchedIds.length === currentRound.pairs.length;

  const initRound = (targetIdx: number) => {
    const round = MATCH_ROUNDS[targetIdx];
    setRoundIdx(targetIdx);
    setLeftItems(shuffleItems(round.pairs));
    setRightItems(shuffleItems(round.pairs));
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedIds([]);
    setWrongPair(null);
    setErrorHint(null);
    setErrors(0);
    setStartedAtMs(null);
    setElapsedMs(0);
  };

  useEffect(() => {
    if (startedAtMs === null || isRoundCleared) return;
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAtMs);
    }, 100);
    return () => window.clearInterval(timer);
  }, [startedAtMs, isRoundCleared]);

  useEffect(() => {
    if (!wrongPair) return;
    const id = window.setTimeout(() => setWrongPair(null), 500);
    return () => window.clearTimeout(id);
  }, [wrongPair]);

  const tryMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      const nextMatched = [...matchedIds, leftId];
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongPair(null);
      setErrorHint(null);

      if (nextMatched.length === currentRound.pairs.length) {
        const finalDuration = startedAtMs ? Date.now() - startedAtMs : elapsedMs;
        setElapsedMs(finalDuration);
        const nextTimes = { ...clearedRoundTimes, [currentRound.id]: finalDuration };
        setClearedRoundTimes(nextTimes);
        if (Object.keys(nextTimes).length === MATCH_ROUNDS.length) {
          onComplete();
        }
      }
      return;
    }

    setWrongPair({ left: leftId, right: rightId });
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setErrors((prev) => prev + 1);

    const expectedPair = currentRound.pairs.find((p) => p.id === leftId);
    if (expectedPair) {
      setErrorHint(expectedPair.hintOnError);
      onRecordWeakNote(`Ghép cặp: ${expectedPair.hintOnError}`);
    }
  };

  const handleSelectLeft = (id: string) => {
    if (matchedIds.includes(id) || isRoundCleared) return;
    setWrongPair(null);
    if (startedAtMs === null) {
      setStartedAtMs(Date.now());
    }
    if (selectedRightId) {
      tryMatch(id, selectedRightId);
      return;
    }
    setSelectedLeftId((prev) => (prev === id ? null : id));
  };

  const handleSelectRight = (id: string) => {
    if (matchedIds.includes(id) || isRoundCleared) return;
    setWrongPair(null);
    if (startedAtMs === null) {
      setStartedAtMs(Date.now());
    }
    if (selectedLeftId) {
      tryMatch(selectedLeftId, id);
      return;
    }
    setSelectedRightId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {MATCH_ROUNDS.map((r, idx) => {
            const done = clearedRoundTimes[r.id] !== undefined;
            const active = idx === roundIdx;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => initRound(idx)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  active
                    ? 'border-red-600 bg-red-50 text-red-800'
                    : done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {done && <Check className="h-3 w-3" />}
                <span>Vòng {idx + 1}</span>
              </button>
            );
          })}
          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              Đã xong 3 vòng
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="tabular-nums flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-stone-800">
            <Timer className="h-3.5 w-3.5 text-red-700" />
            {formatElapsedTenths(elapsedMs)}
          </span>
          <span className="text-stone-500">Nhầm: {errors}</span>
          <button
            type="button"
            onClick={() => initRound(roundIdx)}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Làm lại
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-extrabold text-stone-900">{currentRound.title}</h3>
        <p className="text-xs text-stone-500">{currentRound.subtitle}</p>
      </div>

      {errorHint && (
        <p className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {errorHint}
        </p>
      )}

      {isRoundCleared ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
          <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
          <p className="mt-2 text-base font-extrabold text-emerald-900">
            Hoàn thành Vòng {roundIdx + 1} trong {formatElapsedTenths(elapsedMs)}
          </p>
          <p className="mt-0.5 text-xs text-emerald-800">
            {errors === 0 ? 'Không ghép nhầm cặp nào!' : `Số lần ghép nhầm: ${errors}`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => initRound(roundIdx)}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Làm lại vòng này
            </button>
            {roundIdx + 1 < MATCH_ROUNDS.length ? (
              <button
                type="button"
                onClick={() => initRound(roundIdx + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-red-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-red-800"
              >
                <span>Qua Vòng {roundIdx + 2}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onNextStage}
                className="flex items-center gap-1.5 rounded-xl bg-red-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-red-800"
              >
                <span>Sang Chặng 3: Xếp Mảnh Câu</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="space-y-2">
            {leftItems.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedLeftId === item.id;
              const isWrong = wrongPair?.left === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  onClick={() => handleSelectLeft(item.id)}
                  className={`flex min-h-[60px] w-full flex-col justify-center rounded-xl border-2 px-3 py-2 text-left transition ${
                    matched
                      ? 'pointer-events-none border-emerald-200 bg-emerald-50/40 opacity-20'
                      : isWrong
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : selected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-400 hover:bg-white'
                  }`}
                >
                  <span className="font-jp text-xs font-extrabold sm:text-sm">
                    {item.leftText}
                  </span>
                  {displayMode === 'full' && item.leftSub && (
                    <span
                      className={`mt-0.5 text-[10px] ${
                        selected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {item.leftSub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {rightItems.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedRightId === item.id;
              const isWrong = wrongPair?.right === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  onClick={() => handleSelectRight(item.id)}
                  className={`flex min-h-[60px] w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left transition ${
                    matched
                      ? 'pointer-events-none border-emerald-200 bg-emerald-50/40 opacity-20'
                      : isWrong
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : selected
                          ? 'border-red-700 bg-red-700 text-white shadow-sm'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-red-300'
                  }`}
                >
                  <span className="text-xs font-bold sm:text-sm">{item.rightText}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
