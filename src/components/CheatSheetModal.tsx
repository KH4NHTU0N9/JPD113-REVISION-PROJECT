import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Filter, ShieldAlert, Sparkles, X } from 'lucide-react';
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
  AGE_READINGS,
  DATE_QUESTION_PATTERNS,
  DAY_READINGS,
  MONTH_READINGS,
} from '../data/part2Data';
import {
  HOBBIES,
  HOBBY_STRUCTURES,
  JIKOSHOUKAI_SUMMARY_ROWS,
  PAKKU_SAMPLE,
} from '../data/part3Data';
import { SIX_GOLDEN_TRAPS } from '../data/phase1Games';
import { buildJikoshoukaiLines } from '../lib/japaneseFormatters';
import type { DisplayMode, VocabItem } from '../types/lesson';

export type SheetTab = 'part1' | 'part2' | 'part3' | 'traps';

interface CheatSheetModalProps {
  open: boolean;
  initialTab?: SheetTab;
  onClose: () => void;
  displayMode: DisplayMode;
  weakNotes: string[];
}

const HOBBY_CHOICES = HOBBIES.filter((h) => h.id !== 'h1');

function VocabSection({
  title,
  items,
  displayMode,
  trapOnly,
}: {
  title: string;
  items: VocabItem[];
  displayMode: DisplayMode;
  trapOnly: boolean;
}) {
  const filtered = trapOnly ? items.filter((i) => i.isTrap) : items;
  if (filtered.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <h4 className="mb-2 text-xs font-extrabold text-stone-900">{title}</h4>
      <div className="divide-y divide-stone-100">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-0.5 py-1.5 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-jp font-bold text-stone-900">{item.kanji}</span>
              {item.kanji !== item.kana && (
                <span className="font-jp text-red-700">({item.kana})</span>
              )}
              {displayMode === 'full' && (
                <span className="text-[11px] text-stone-400">[{item.romaji}]</span>
              )}
              {item.isTrap && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  Bẫy
                </span>
              )}
            </div>
            <div className="text-stone-600 sm:text-right">
              <span className="font-semibold text-stone-800">{item.meaning}</span>
              {item.note && (
                <p className="text-[10px] text-amber-700">{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheatSheetModal({
  open,
  initialTab = 'part1',
  onClose,
  displayMode,
  weakNotes,
}: CheatSheetModalProps) {
  const [tab, setTab] = useState<SheetTab>(initialTab);
  const [trapOnly, setTrapOnly] = useState(false);

  // Jikoshoukai sandbox inside Part 3 lookup tab
  const [name, setName] = useState('アン');
  const [countryId, setCountryId] = useState('c2');
  const [ageInput, setAgeInput] = useState('20');
  const [birthMonth, setBirthMonth] = useState(12);
  const [birthDay, setBirthDay] = useState(8);
  const [hobby1Id, setHobby1Id] = useState('h3');

  const parsedAge = Number.parseInt(ageInput, 10);
  const age = Number.isNaN(parsedAge) ? 20 : Math.min(99, Math.max(1, parsedAge));
  const selectedCountry = COUNTRIES.find((c) => c.id === countryId) ?? COUNTRIES[1];
  const selectedHobby = HOBBY_CHOICES.find((h) => h.id === hobby1Id) ?? HOBBY_CHOICES[1];

  const generatedLines = useMemo(
    () =>
      buildJikoshoukaiLines({
        name,
        countryNationalityKana: selectedCountry.nationalityKana,
        countryNationalityRomaji: selectedCountry.nationalityRomaji,
        countryVi: selectedCountry.viName,
        schoolKana: 'FPTだいがく',
        schoolRomaji: 'FPT daigaku',
        schoolVi: 'Đại học FPT',
        age,
        birthMonth,
        birthDay,
        hobby1Kana: selectedHobby.kana,
        hobby1Romaji: selectedHobby.romaji,
        hobby1Vi: selectedHobby.meaning,
      }),
    [age, birthDay, birthMonth, name, selectedCountry, selectedHobby]
  );

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [initialTab, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bảng tra nhanh JPD113 Bài 1"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-stone-50 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-red-700" />
            <h3 className="text-sm font-extrabold text-stone-900">
              Bảng Tra Nhanh Toàn Bộ Bài 1 (100% kiến thức PDF)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {(tab === 'part1' || tab === 'part2') && (
              <button
                type="button"
                onClick={() => setTrapOnly((prev) => !prev)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  trapOnly
                    ? 'border-red-600 bg-red-700 text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Filter className="h-3 w-3" />
                {trapOnly ? 'Chỉ xem Bẫy' : 'Lọc Bẫy'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng tra"
              className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2">
          {[
            { id: 'part1' as const, label: 'Part 1 · Từ & Mẫu câu' },
            { id: 'part2' as const, label: 'Part 2 · Tuổi, Ngày, Tháng' },
            { id: 'part3' as const, label: 'Part 3 · Sở thích & Mẫu' },
            { id: 'traps' as const, label: '6 Lưu ý vàng' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === item.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {tab === 'part1' && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <VocabSection
                  title="Đại từ & Xưng hô"
                  items={PRONOUNS_AND_TITLES}
                  displayMode={displayMode}
                  trapOnly={trapOnly}
                />
                <VocabSection
                  title="Ngoại lệ Ngôn ngữ"
                  items={LANGUAGE_EXCEPTIONS}
                  displayMode={displayMode}
                  trapOnly={trapOnly}
                />
                <VocabSection
                  title="Nghề nghiệp"
                  items={OCCUPATIONS}
                  displayMode={displayMode}
                  trapOnly={trapOnly}
                />
                <VocabSection
                  title="Trường học & Giao tiếp"
                  items={[...SCHOOLS, ...POLITE_COMMUNICATION]}
                  displayMode={displayMode}
                  trapOnly={trapOnly}
                />
              </div>

              {!trapOnly && (
                <div className="rounded-xl border border-stone-200 bg-white p-3">
                  <h4 className="mb-2 text-xs font-extrabold text-stone-900">
                    18 Quốc gia & Quốc tịch ([Tên nước] + 人 じん)
                  </h4>
                  <div className="grid gap-1.5 text-xs sm:grid-cols-2 md:grid-cols-3">
                    {COUNTRIES.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg bg-stone-50 px-2.5 py-1.5"
                      >
                        <span className="font-bold text-stone-800">{c.viName}: </span>
                        <span className="font-jp font-bold text-red-700">
                          {c.nationalityJp}
                        </span>
                        {displayMode === 'full' && (
                          <span className="font-jp ml-1 text-[11px] text-stone-500">
                            ({c.nationalityKana})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {CONFUSING_PAIRS.map((pair) => (
                  <div
                    key={pair.id}
                    className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs"
                  >
                    <p className="font-jp font-extrabold text-red-900">{pair.title}</p>
                    <p className="font-jp mt-1 text-stone-800">• {pair.leftExample}</p>
                    <p className="font-jp text-stone-800">• {pair.rightExample}</p>
                    <p className="mt-1 font-medium text-amber-800">{pair.warning}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {GRAMMAR_PATTERNS.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-stone-200 bg-white p-3 text-xs"
                  >
                    <p className="font-extrabold text-red-800">{g.title}</p>
                    <p className="font-jp mt-0.5 font-bold text-stone-900">{g.structure}</p>
                    <p className="font-jp text-stone-700">{g.exampleJp}</p>
                    <p className="text-stone-500">{g.exampleVi}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'part2' && (
            <>
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <h4 className="mb-2 text-xs font-extrabold text-stone-900">
                  1. Đếm tuổi (年齢)
                </h4>
                <div className="grid gap-1.5 text-xs sm:grid-cols-3 md:grid-cols-4">
                  {(trapOnly ? AGE_READINGS.filter((a) => a.isTrap) : AGE_READINGS).map(
                    (a) => (
                      <div
                        key={a.age}
                        className={`rounded-lg border p-2 ${
                          a.age === 20
                            ? 'border-red-300 bg-red-50'
                            : a.isTrap
                              ? 'border-amber-200 bg-amber-50/60'
                              : 'border-stone-100 bg-stone-50'
                        }`}
                      >
                        <p className="font-bold text-stone-900">
                          {a.age} tuổi ({a.kanji})
                        </p>
                        <p className="font-jp font-bold text-red-700">{a.kana}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <h4 className="mb-2 text-xs font-extrabold text-stone-900">
                  2. Đủ 31 Ngày trong tháng (bổ sung 17, 19, 27, 29)
                </h4>
                <div className="grid gap-1.5 text-xs sm:grid-cols-3 md:grid-cols-4">
                  {(trapOnly
                    ? DAY_READINGS.filter((d) => d.category !== 'regular')
                    : DAY_READINGS
                  ).map((d) => (
                    <div
                      key={d.day}
                      className={`rounded-lg border p-2 ${
                        d.missingFromPdfTable
                          ? 'border-indigo-300 bg-indigo-50/70'
                          : d.category === 'special'
                            ? 'border-amber-200 bg-amber-50/60'
                            : 'border-stone-100 bg-stone-50'
                      }`}
                    >
                      <p className="font-bold text-stone-900">
                        Ngày {d.day} ({d.kanji})
                      </p>
                      <p className="font-jp font-bold text-red-700">{d.kana}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <h4 className="mb-2 text-xs font-extrabold text-stone-900">
                  3. 12 Tháng & Mẫu hỏi
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
                  {(trapOnly ? MONTH_READINGS.filter((m) => m.isTrap) : MONTH_READINGS).map(
                    (m) => (
                      <div
                        key={m.month}
                        className={`rounded-lg border p-2 ${
                          m.isTrap
                            ? 'border-red-300 bg-red-50'
                            : 'border-stone-100 bg-stone-50'
                        }`}
                      >
                        <p className="font-bold text-stone-900">Tháng {m.month}</p>
                        <p className="font-jp font-bold text-red-700">{m.kana}</p>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {DATE_QUESTION_PATTERNS.map((p) => (
                    <div key={p.label} className="rounded-lg bg-stone-50 p-2 text-xs">
                      <p className="font-bold text-stone-800">{p.label}</p>
                      <p className="font-jp font-bold text-red-700">{p.questionJp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'part3' && (
            <>
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <h4 className="mb-2 text-xs font-extrabold text-stone-900">
                  14 Từ Sở thích & Cấu trúc nối と
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
                  {HOBBIES.map((h) => (
                    <div key={h.id} className="rounded-lg bg-stone-50 p-2">
                      <p className="font-jp font-bold text-stone-900">{h.kana}</p>
                      <p className="font-semibold text-red-700">{h.meaning}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {HOBBY_STRUCTURES.map((s) => (
                    <div key={s.title} className="rounded-lg bg-stone-50 p-2 text-xs">
                      <p className="font-bold text-stone-700">{s.title}</p>
                      <p className="font-jp font-bold text-stone-900">{s.jp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs">
                  <h4 className="mb-2 font-extrabold text-stone-900">
                    Khung Jikoshoukai chuẩn
                  </h4>
                  <div className="divide-y divide-stone-100">
                    {JIKOSHOUKAI_SUMMARY_ROWS.map((row) => (
                      <div key={row.label} className="py-1">
                        <span className="font-semibold text-stone-600">{row.label}: </span>
                        <span className="font-jp font-bold text-red-700">{row.pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs">
                  <h4 className="mb-2 font-extrabold text-stone-900">
                    {PAKKU_SAMPLE.title}
                  </h4>
                  <div className="space-y-1 rounded-lg bg-stone-50 p-2.5">
                    {PAKKU_SAMPLE.lines.map((line) => (
                      <p key={line.jp} className="font-jp font-bold text-stone-900">
                        {line.jp}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <h4 className="font-extrabold text-stone-900">
                    Thử nhanh công thức Tuổi & Sinh nhật Jikoshoukai
                  </h4>
                </div>
                <div className="grid gap-2 sm:grid-cols-5">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Tên"
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  />
                  <select
                    value={countryId}
                    onChange={(e) => setCountryId(e.target.value)}
                    aria-label="Quốc tịch"
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.viName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    onBlur={() => setAgeInput(String(age))}
                    aria-label="Tuổi"
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  />
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(Number(e.target.value))}
                    aria-label="Tháng sinh"
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(Number(e.target.value))}
                    aria-label="Ngày sinh"
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Ngày {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-stone-600">Sở thích:</span>
                  <select
                    value={hobby1Id}
                    onChange={(e) => setHobby1Id(e.target.value)}
                    className="rounded-lg border border-stone-300 px-2 py-1 font-semibold"
                  >
                    {HOBBY_CHOICES.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.meaning} ({h.kana})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="font-jp mt-2 space-y-1 rounded-lg bg-stone-50 p-2.5 font-bold text-stone-900">
                  {generatedLines.map((line, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between gap-2">
                      <span>{line.jp}</span>
                      {line.badge && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                          {line.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'traps' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-700" />
                  <h4 className="text-xs font-extrabold text-stone-900">
                    6 Lưu ý vàng trước khi bấm làm Quiz
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {SIX_GOLDEN_TRAPS.map((item) => (
                    <li key={item} className="rounded-lg bg-stone-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {weakNotes.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs">
                  <p className="font-extrabold text-amber-900">
                    Các bẫy bạn vừa bấm nhầm khi chơi:
                  </p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-amber-800">
                    {weakNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
