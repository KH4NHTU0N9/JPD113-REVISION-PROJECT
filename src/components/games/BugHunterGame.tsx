import { useState } from 'react';
import { ArrowRight, Bug } from 'lucide-react';
import { BUG_HUNT_CASES } from '../../data/phase1Games';
import type { BugHuntCase } from '../../types/lesson';

interface BugHunterGameProps {
  isCompleted: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
  onGoToPhase2: () => void;
}

function getAllBugKeys(cases: readonly BugHuntCase[]): string[] {
  return cases.flatMap((c) =>
    c.segments.filter((seg) => seg.isBug).map((seg) => `${c.id}:${seg.id}`)
  );
}

export function BugHunterGame({
  isCompleted,
  onComplete,
  onRecordWeakNote,
  onGoToPhase2,
}: BugHunterGameProps) {
  const [fixedKeys, setFixedKeys] = useState<Record<string, boolean>>({});
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);

  const allBugKeys = getAllBugKeys(BUG_HUNT_CASES);
  const fixedTotal = allBugKeys.filter((k) => fixedKeys[k]).length;
  const allCleared = fixedTotal === allBugKeys.length;

  const handleSegmentClick = (caseId: string, segId: string, isBug: boolean) => {
    const key = `${caseId}:${segId}`;
    if (!isBug) {
      setWrongMsg('Cụm này chuẩn ngữ pháp rồi — hãy soi kỹ xưng hô, quốc tịch, tuổi & ngày!');
      onRecordWeakNote('Soi Bug: Nhầm cụm đúng ngữ pháp thành lỗi sai.');
      return;
    }

    setWrongMsg(null);
    if (fixedKeys[key]) return;

    const nextFixed = { ...fixedKeys, [key]: true };
    setFixedKeys(nextFixed);

    if (allBugKeys.every((k) => Boolean(nextFixed[k]))) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-red-700" />
          <span className="text-sm font-extrabold text-stone-900">Soi lỗi sai</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
            allCleared || isCompleted
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {fixedTotal} / {allBugKeys.length} lỗi
        </span>
      </div>

      {wrongMsg && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900">
          {wrongMsg}
        </p>
      )}

      {BUG_HUNT_CASES.map((huntCase) => {
        const caseBugs = huntCase.segments.filter((s) => s.isBug);
        const caseFixedCount = caseBugs.filter(
          (s) => fixedKeys[`${huntCase.id}:${s.id}`]
        ).length;

        return (
          <section
            key={huntCase.id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-stone-900">{huntCase.title}</h3>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-600">
                {caseFixedCount}/{caseBugs.length}
              </span>
            </div>

            <div className="font-jp mt-3 flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-sm leading-relaxed">
              {huntCase.segments.map((seg) => {
                const isFixed = Boolean(fixedKeys[`${huntCase.id}:${seg.id}`]);
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => handleSegmentClick(huntCase.id, seg.id, seg.isBug)}
                    className={`rounded-xl border px-3 py-1.5 text-left font-bold transition ${
                      isFixed
                        ? 'border-emerald-400 bg-emerald-100 text-emerald-950'
                        : 'border-stone-300 bg-white text-stone-900 hover:border-red-400 hover:bg-red-50'
                    }`}
                  >
                    {isFixed && seg.fixedText ? seg.fixedText : seg.text}
                  </button>
                );
              })}
            </div>

            {caseFixedCount > 0 && (
              <div className="mt-3 space-y-1.5">
                {caseBugs
                  .filter((s) => fixedKeys[`${huntCase.id}:${s.id}`])
                  .map((seg) => (
                    <div
                      key={seg.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
                    >
                      <span className="font-jp font-bold line-through opacity-60">
                        {seg.text}
                      </span>{' '}
                      → <span className="font-jp font-extrabold">{seg.fixedText}</span>:{' '}
                      {seg.explanation}
                    </div>
                  ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGoToPhase2}
          className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-red-800"
        >
          <span>Bước 3 · Quiz 20 câu</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
