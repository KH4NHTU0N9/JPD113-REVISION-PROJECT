import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Filter } from 'lucide-react';
import {
  CONFUSING_PAIRS,
  COUNTRIES,
  GRAMMAR_PATTERNS,
  LANGUAGE_EXCEPTIONS,
  OCCUPATIONS,
  POLITE_COMMUNICATION,
  PRONOUNS_AND_TITLES,
  SCHOOLS,
} from '../data/part1Data';
import {
  DIALOGUE_MATCH_ITEMS,
  DIALOGUE_REPLY_OPTIONS,
  PARTICLE_DRILLS,
} from '../data/phase1Drills';
import type { DisplayMode, VocabItem } from '../types/lesson';

interface Part1ReviewTabProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
}

function VocabListCard({
  title,
  items,
  displayMode,
  trapOnly,
  hideReading,
}: {
  title: string;
  items: VocabItem[];
  displayMode: DisplayMode;
  trapOnly: boolean;
  hideReading: boolean;
}) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const visibleItems = trapOnly ? items.filter((item) => item.isTrap) : items;

  if (visibleItems.length === 0) return null;

  const shouldMaskByDefault = hideReading || displayMode === 'challenge';
  const maskScope = `${displayMode}:${String(hideReading)}`;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
      <h3 className="mb-3 text-sm font-extrabold text-stone-900">{title}</h3>
      <div className="divide-y divide-stone-100">
        {visibleItems.map((item) => {
          const revealKey = `${maskScope}:${item.id}`;
          const hasSeparateReading = item.kanji !== item.kana;
          const canToggleMask = shouldMaskByDefault && (hasSeparateReading || displayMode === 'full');
          const isMasked = shouldMaskByDefault && !revealedIds[revealKey];

          return (
            <div
              key={item.id}
              onClick={
                canToggleMask
                  ? () =>
                      setRevealedIds((prev) => ({
                        ...prev,
                        [revealKey]: !prev[revealKey],
                      }))
                  : undefined
              }
              className={`flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between ${
                canToggleMask ? 'cursor-pointer hover:bg-stone-50/70' : ''
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-jp text-base font-bold text-stone-900">
                  {item.kanji}
                </span>
                {hasSeparateReading && (
                  <span
                    className={`font-jp text-sm text-red-700 transition ${
                      isMasked ? 'rounded bg-stone-200 px-1.5 text-transparent select-none' : ''
                    }`}
                  >
                    ({item.kana})
                  </span>
                )}
                {displayMode === 'full' && !isMasked && (
                  <span className="text-xs font-medium text-stone-500">
                    [{item.romaji}]
                  </span>
                )}
                {canToggleMask && isMasked && !hasSeparateReading && (
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-400">
                    Chạm xem romaji
                  </span>
                )}
                {item.isTrap && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Bẫy thi
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-600 sm:text-right">
                <span className="font-semibold text-stone-800">{item.meaning}</span>
                {item.note && (
                  <p className="mt-0.5 text-[11px] text-amber-700">{item.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Part1ReviewTab({
  displayMode,
  isCompleted,
  onComplete,
  onRecordWeakNote,
}: Part1ReviewTabProps) {
  const [trapOnly, setTrapOnly] = useState(false);
  const [hideReading, setHideReading] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  const [particleAnswers, setParticleAnswers] = useState<Record<string, string>>({});
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<string, string>>({});

  const visibleCountries = showAllCountries ? COUNTRIES : COUNTRIES.slice(0, 6);

  const particleCorrectCount = PARTICLE_DRILLS.filter(
    (q) => particleAnswers[q.id] === q.correct
  ).length;
  const dialogueCorrectCount = DIALOGUE_MATCH_ITEMS.filter(
    (q) => dialogueAnswers[q.id] === q.correctReplyId
  ).length;

  const allDrillsCorrect =
    particleCorrectCount === PARTICLE_DRILLS.length &&
    dialogueCorrectCount === DIALOGUE_MATCH_ITEMS.length;

  const handleSelectParticle = (qId: string, option: string, correct: string, note: string) => {
    setParticleAnswers((prev) => ({ ...prev, [qId]: option }));
    if (option !== correct) {
      onRecordWeakNote(`Part 1 – Trợ từ: ${note}`);
    }
  };

  const handleSelectDialogue = (
    qId: string,
    replyId: string,
    correctId: string,
    note: string
  ) => {
    setDialogueAnswers((prev) => ({ ...prev, [qId]: replyId }));
    if (replyId !== correctId) {
      onRecordWeakNote(`Part 1 – Giao tiếp: ${note}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">
            Part 1 · Từ vựng, Xưng hô & 5 Mẫu câu cơ bản
          </h2>
          <p className="text-xs text-stone-600">
            Chạm vào dòng chữ khi bật “Che cách đọc” để tự nhẩm trước khi lướt xuống bài kiểm tra nhanh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTrapOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
              trapOnly
                ? 'border-amber-400 bg-amber-200 text-amber-950'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {trapOnly ? 'Đang lọc: Chỉ Bẫy' : 'Lọc: Chỉ xem Bẫy'}
          </button>
          <button
            type="button"
            onClick={() => setHideReading((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
              hideReading
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {hideReading ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {hideReading ? 'Hiện cách đọc' : 'Che cách đọc'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VocabListCard
          title="Đại từ xưng hô & Hậu tố"
          items={PRONOUNS_AND_TITLES}
          displayMode={displayMode}
          trapOnly={trapOnly}
          hideReading={hideReading}
        />
        <VocabListCard
          title="Ngoại lệ Ngôn ngữ ([Quốc gia khai sinh] + 語)"
          items={LANGUAGE_EXCEPTIONS}
          displayMode={displayMode}
          trapOnly={trapOnly}
          hideReading={hideReading}
        />
        <VocabListCard
          title="Nghề nghiệp (Occupations)"
          items={OCCUPATIONS}
          displayMode={displayMode}
          trapOnly={trapOnly}
          hideReading={hideReading}
        />
        <VocabListCard
          title="Trường học & Giao tiếp lịch sự (kèm Câu 10)"
          items={[...SCHOOLS, ...POLITE_COMMUNICATION]}
          displayMode={displayMode}
          trapOnly={trapOnly}
          hideReading={hideReading}
        />
      </div>

      {!trapOnly && (
        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-stone-900">
              18 Quốc gia & Quốc tịch ([Tên nước] + 人 じん)
            </h3>
            <button
              type="button"
              onClick={() => setShowAllCountries((prev) => !prev)}
              className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200"
            >
              {showAllCountries ? 'Thu gọn (6 nước)' : `Xem đủ cả ${COUNTRIES.length} nước`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2 pr-3 font-semibold">Quốc gia</th>
                  <th className="py-2 pr-3 font-semibold">Tiếng Nhật</th>
                  <th className="py-2 font-semibold">Quốc tịch (+ じん)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visibleCountries.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-3 font-semibold text-stone-800">{c.viName}</td>
                    <td className="font-jp py-2 pr-3">
                      <span className="font-bold text-stone-900">{c.countryJp}</span>{' '}
                      {!hideReading && displayMode !== 'challenge' && (
                        <span className="text-stone-500">({c.countryKana})</span>
                      )}
                    </td>
                    <td className="font-jp py-2">
                      <span className="font-bold text-red-700">{c.nationalityJp}</span>{' '}
                      {!hideReading && displayMode !== 'challenge' && (
                        <span className="text-stone-500">({c.nationalityKana})</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-700" />
          <h3 className="text-sm font-extrabold text-red-900">
            2 Cặp từ dễ nhầm bắt buộc nhớ trước khi vào Quiz
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CONFUSING_PAIRS.map((pair) => (
            <div
              key={pair.id}
              className="rounded-xl border border-red-100 bg-white p-3.5 shadow-xs"
            >
              <h4 className="font-jp text-xs font-extrabold text-red-800">{pair.title}</h4>
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-lg bg-stone-50 p-2">
                  <p className="font-jp font-bold text-stone-900">{pair.leftLabel}</p>
                  <p className="text-stone-600">{pair.leftUsage}</p>
                  <p className="font-jp mt-1 text-red-700">{pair.leftExample}</p>
                </div>
                <div className="rounded-lg bg-stone-50 p-2">
                  <p className="font-jp font-bold text-stone-900">{pair.rightLabel}</p>
                  <p className="text-stone-600">{pair.rightUsage}</p>
                  <p className="font-jp mt-1 text-red-700">{pair.rightExample}</p>
                </div>
                <p className="text-[11px] font-medium text-amber-800">
                  Lưu ý: {pair.warning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-sm font-extrabold text-stone-900">
          5 Mẫu câu ngữ pháp cơ bản
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {GRAMMAR_PATTERNS.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-stone-100 bg-stone-50 p-3"
            >
              <p className="text-xs font-extrabold text-red-800">{g.title}</p>
              <p className="font-jp mt-1 text-sm font-bold text-stone-900">{g.structure}</p>
              <p className="font-jp mt-1 text-xs font-semibold text-stone-800">
                {g.exampleJp}
              </p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-500">{g.exampleRomaji}</p>
              )}
              <p className="text-xs text-stone-600">{g.exampleVi}</p>
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-stone-600">
                {g.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-stone-900 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">
              Thử tay Part 1: Khóa trợ từ & Phản xạ (Không tính điểm)
            </h3>
            <p className="text-xs text-stone-500">
              Hoàn thành đúng toàn bộ để xác nhận bạn đã nắm chắc Part 1.
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {particleCorrectCount + dialogueCorrectCount} /{' '}
            {PARTICLE_DRILLS.length + DIALOGUE_MATCH_ITEMS.length} đúng
          </span>
        </div>

        <div className="space-y-3">
          {PARTICLE_DRILLS.map((drill, idx) => {
            const chosen = particleAnswers[drill.id];
            const isCorrect = chosen === drill.correct;
            return (
              <div
                key={drill.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <p className="font-jp text-sm font-bold text-stone-900">
                  {idx + 1}. {drill.before}
                  <span className="mx-1.5 inline-block min-w-9 rounded-md border border-dashed border-red-400 bg-white px-2 py-0.5 text-center text-red-700">
                    {chosen ?? '___'}
                  </span>
                  {drill.after}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">{drill.meaning}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {drill.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        handleSelectParticle(drill.id, opt, drill.correct, drill.explanation)
                      }
                      className={`font-jp rounded-lg border px-3 py-1 text-xs font-bold transition ${
                        chosen === opt
                          ? opt === drill.correct
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : 'border-red-500 bg-red-600 text-white'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {chosen && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Chuẩn! ' : 'Chưa đúng: '}
                    {drill.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wide text-stone-600">
            Nối cặp Giao tiếp nhanh
          </h4>
          {DIALOGUE_MATCH_ITEMS.map((item) => {
            const chosen = dialogueAnswers[item.id];
            const isCorrect = chosen === item.correctReplyId;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <p className="font-jp text-sm font-bold text-stone-900">
                  {item.promptJp}
                </p>
                <p className="text-xs text-stone-500">{item.promptVi}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {DIALOGUE_REPLY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        handleSelectDialogue(
                          item.id,
                          opt.id,
                          item.correctReplyId,
                          item.explanation
                        )
                      }
                      className={`rounded-lg border p-2 text-left text-xs transition ${
                        chosen === opt.id
                          ? opt.id === item.correctReplyId
                            ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900'
                            : 'border-red-400 bg-red-50 font-bold text-red-900'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span className="font-jp block font-bold">{opt.replyJp}</span>
                      {displayMode === 'full' && (
                        <span className="text-[11px] text-stone-500">{opt.replyVi}</span>
                      )}
                    </button>
                  ))}
                </div>
                {chosen && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Chính xác! ' : 'Xem lại: '}
                    {item.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
          <div className="text-xs text-stone-600">
            {allDrillsCorrect
              ? 'Bạn đã hoàn thành toàn bộ bài thử Part 1!'
              : 'Hãy chọn đáp án ở các câu trên hoặc bấm đánh dấu đã ôn để sang Part 2.'}
          </div>
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
            {isCompleted ? 'Đã xong Part 1 · Sang Part 2' : 'Đánh dấu xong Part 1 → Part 2'}
          </button>
        </div>
      </section>
    </div>
  );
}
