import { useState } from 'react';
import { AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import {
  AGE_READINGS,
  AGE_RULES,
  DATE_QUESTION_PATTERNS,
  DAY_READINGS,
  MONTH_READINGS,
} from '../data/part2Data';
import { TRAP_CHOICE_DRILLS } from '../data/phase1Drills';
import type { DisplayMode } from '../types/lesson';

interface Part2ReviewTabProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
}

export function Part2ReviewTab({
  displayMode,
  isCompleted,
  onComplete,
  onRecordWeakNote,
}: Part2ReviewTabProps) {
  const [trapOnly, setTrapOnly] = useState(true);
  const [trapAnswers, setTrapAnswers] = useState<Record<string, 'A' | 'B'>>({});

  const visibleAges = trapOnly ? AGE_READINGS.filter((a) => a.isTrap) : AGE_READINGS;
  const visibleDays = trapOnly
    ? DAY_READINGS.filter((d) => d.category !== 'regular')
    : DAY_READINGS;
  const visibleMonths = trapOnly
    ? MONTH_READINGS.filter((m) => m.isTrap)
    : MONTH_READINGS;

  const trapCorrectCount = TRAP_CHOICE_DRILLS.filter(
    (d) => trapAnswers[d.id] === d.correct
  ).length;

  const handleTrapChoice = (
    id: string,
    choice: 'A' | 'B',
    correct: 'A' | 'B',
    explanation: string
  ) => {
    setTrapAnswers((prev) => ({ ...prev, [id]: choice }));
    if (choice !== correct) {
      onRecordWeakNote(`Part 2 – Biến âm: ${explanation}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">
            Part 2 · Quy tắc đếm Tuổi, Ngày (1–31) & 12 Tháng
          </h2>
          <p className="text-xs text-stone-600">
            Đã bổ sung đủ ngày 17, 19, 27, 29 (bị sót ở bảng PDF Trang 9) và sửa công thức ngày đặc biệt không gắn にち.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTrapOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
            trapOnly
              ? 'border-red-400 bg-red-700 text-white'
              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          {trapOnly ? 'Đang lọc: Chỉ Bẫy biến âm' : 'Đang hiện: Đầy đủ 100%'}
        </button>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <h3 className="mb-2 text-sm font-extrabold text-stone-900">
          1. Đếm tuổi (年齢 – Nenrei)
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
                  ? 'border-red-300 bg-red-50'
                  : item.isTrap
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-stone-100 bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900">
                  {item.age} tuổi ({item.kanji})
                </span>
                {item.isTrap && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                    Bẫy
                  </span>
                )}
              </div>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">
                {item.kana}
              </p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-500">{item.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-600">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-stone-900">
            2. Đếm ngày trong tháng (日付 – Hizuke)
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="rounded bg-red-100 px-2 py-0.5 text-red-800">
              4日 よっか (Âm ngắt)
            </span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">
              8日 ようか (Trường âm)
            </span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDays.map((d) => (
            <div
              key={d.day}
              className={`rounded-xl border p-2.5 text-xs ${
                d.missingFromPdfTable
                  ? 'border-indigo-300 bg-indigo-50/70'
                  : d.category === 'special'
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-stone-100 bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-stone-900">
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
                <p className="text-[11px] text-stone-500">{d.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-600">{d.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-sm font-extrabold text-stone-900">
          3. 12 Tháng trong năm & Mẫu hỏi Ngày – Sinh nhật
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleMonths.map((m) => (
            <div
              key={m.month}
              className={`rounded-xl border p-2.5 text-xs ${
                m.isTrap
                  ? 'border-red-300 bg-red-50'
                  : 'border-stone-100 bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900">
                  Tháng {m.month} ({m.kanji})
                </span>
                {m.isTrap && (
                  <span className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold text-red-900">
                    Bẫy
                  </span>
                )}
              </div>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">{m.kana}</p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-500">{m.romaji}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-600">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DATE_QUESTION_PATTERNS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs"
            >
              <p className="font-bold text-stone-800">{p.label}</p>
              <p className="font-jp mt-1 text-sm font-bold text-red-700">
                {p.questionJp}
              </p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-500">{p.questionRomaji}</p>
              )}
              <p className="font-jp mt-1 text-stone-700">→ {p.answerPattern}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-stone-900 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-700" />
            <h3 className="text-sm font-extrabold text-stone-900">
              Thử tay Part 2: Phản xạ 50/50 Bẫy Biến Âm
            </h3>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {trapCorrectCount} / {TRAP_CHOICE_DRILLS.length} đúng
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {TRAP_CHOICE_DRILLS.map((drill) => {
            const chosen = trapAnswers[drill.id];
            const isCorrect = chosen === drill.correct;
            return (
              <div
                key={drill.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <p className="font-jp text-sm font-extrabold text-stone-900">
                  {drill.label}
                </p>
                <p className="text-[11px] text-stone-500">{drill.questionHint}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['A', 'B'] as const).map((optKey) => {
                    const text = optKey === 'A' ? drill.optionA : drill.optionB;
                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() =>
                          handleTrapChoice(
                            drill.id,
                            optKey,
                            drill.correct,
                            drill.explanation
                          )
                        }
                        className={`font-jp rounded-lg border px-2.5 py-2 text-xs font-bold transition ${
                          chosen === optKey
                            ? optKey === drill.correct
                              ? 'border-emerald-500 bg-emerald-600 text-white'
                              : 'border-red-500 bg-red-600 text-white'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
                {chosen && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Chuẩn! ' : 'Dính bẫy rồi: '}
                    {drill.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
          <p className="text-xs text-stone-600">
            Mẹo: Nhớ kỹ 3 tháng (4/7/9), tuổi 20 (はたち) và ngày 4 (よっか) vs 8 (ようか).
          </p>
          <button
            type="button"
            onClick={onComplete}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-700 text-white hover:bg-red-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Đã xong Part 2 · Sang Part 3' : 'Đánh dấu xong Part 2 → Part 3'}
          </button>
        </div>
      </section>
    </div>
  );
}
