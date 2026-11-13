import { useState } from 'react';
import { ArrowRight, Filter } from 'lucide-react';
import {
  AGE_READINGS,
  AGE_RULES,
  DATE_QUESTION_PATTERNS,
  DAY_READINGS,
  MONTH_READINGS,
} from '../data/part2Data';
import type { DisplayMode } from '../types/lesson';

interface Part2ReviewTabProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onComplete: () => void;
}

export function Part2ReviewTab({
  displayMode,
  isCompleted,
  onComplete,
}: Part2ReviewTabProps) {
  const [trapOnly, setTrapOnly] = useState(true);

  const visibleAges = trapOnly ? AGE_READINGS.filter((a) => a.isTrap) : AGE_READINGS;
  const visibleDays = trapOnly
    ? DAY_READINGS.filter((d) => d.category !== 'regular')
    : DAY_READINGS;
  const visibleMonths = trapOnly
    ? MONTH_READINGS.filter((m) => m.isTrap)
    : MONTH_READINGS;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setTrapOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
            trapOnly
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          {trapOnly ? 'Đang lọc: Bẫy biến âm' : 'Chỉ xem Bẫy biến âm'}
        </button>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs sm:p-4">
        <h3 className="mb-2 text-sm font-extrabold text-stone-900">
          1. Đếm tuổi (年齢)
        </h3>
        <ul className="mb-3 list-disc space-y-1 pl-4 text-xs text-stone-600">
          {AGE_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleAges.map((item) => (
            <div
              key={item.age}
              className={`rounded-xl border p-2.5 text-xs ${
                item.age === 20
                  ? 'border-red-200 bg-red-50/40'
                  : 'border-stone-200/80 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-stone-800">
                  {item.age} tuổi ({item.kanji})
                </span>
                {item.isTrap && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Bẫy
                  </span>
                )}
              </div>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">
                {item.kana}
              </p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-400">{item.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-500">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs sm:p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-stone-900">
            2. Đếm ngày (日付)
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className="rounded bg-stone-100 px-2 py-0.5 text-red-700">
              4日 よっか
            </span>
            <span className="rounded bg-stone-100 px-2 py-0.5 text-sky-700">
              8日 ようか
            </span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDays.map((d) => (
            <div
              key={d.day}
              className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-2.5 text-xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-stone-800">
                  Ngày {d.day} ({d.kanji})
                </span>
                {d.missingFromPdfTable ? (
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                    Bổ sung PDF
                  </span>
                ) : d.category === 'special' ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Đặc biệt
                  </span>
                ) : null}
              </div>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">{d.kana}</p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-400">{d.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-500">{d.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs sm:p-4">
        <h3 className="mb-2.5 text-sm font-extrabold text-stone-900">
          3. 12 Tháng & Mẫu hỏi Ngày
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleMonths.map((m) => (
            <div
              key={m.month}
              className={`rounded-xl border p-2.5 text-xs ${
                m.isTrap
                  ? 'border-red-200 bg-red-50/35'
                  : 'border-stone-200/80 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">
                  Tháng {m.month} ({m.kanji})
                </span>
                {m.isTrap && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                    Bẫy
                  </span>
                )}
              </div>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">{m.kana}</p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-400">{m.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-500">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DATE_QUESTION_PATTERNS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-xs"
            >
              <p className="font-bold text-stone-800">{p.label}</p>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">
                {p.questionJp}
              </p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-400">{p.questionRomaji}</p>
              )}
              <p className="font-jp mt-1 text-stone-700">→ {p.answerPattern}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onComplete}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-red-700 text-white hover:bg-red-800'
          }`}
        >
          <span>{isCompleted ? 'Sang Part 3' : 'Tiếp tục: Part 3'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
