import { useMemo, useState } from 'react';
import { Bug, CheckCircle2, Sparkles } from 'lucide-react';
import { COUNTRIES } from '../data/part1Data';
import {
  HOBBIES,
  HOBBY_STRUCTURES,
  JIKOSHOUKAI_SUMMARY_ROWS,
  PAKKU_SAMPLE,
} from '../data/part3Data';
import { JIKOSHOUKAI_BUG_SEGMENTS } from '../data/phase1Drills';
import { buildJikoshoukaiLines } from '../lib/japaneseFormatters';
import type { DisplayMode } from '../types/lesson';

interface Part3ReviewTabProps {
  displayMode: DisplayMode;
  isCompleted: boolean;
  onComplete: () => void;
  onRecordWeakNote: (note: string) => void;
}

const HOBBY_CHOICES = HOBBIES.filter((h) => h.id !== 'h1');

export function Part3ReviewTab({
  displayMode,
  isCompleted,
  onComplete,
  onRecordWeakNote,
}: Part3ReviewTabProps) {
  const [fixedBugIds, setFixedBugIds] = useState<Record<string, boolean>>({});
  const [wrongClicks, setWrongClicks] = useState<string | null>(null);

  // Jikoshoukai smart builder defaults (intentionally set to 20 age & day 8 to demonstrate fixes!)
  const [name, setName] = useState('アン');
  const [countryId, setCountryId] = useState('c2');
  const [schoolKana, setSchoolKana] = useState('FPTだいがく');
  const [schoolVi, setSchoolVi] = useState('Đại học FPT');
  const [ageInput, setAgeInput] = useState('20');
  const age = Math.min(99, Math.max(1, Number.parseInt(ageInput, 10) || 20));
  const [birthMonth, setBirthMonth] = useState(12);
  const [birthDay, setBirthDay] = useState(8);
  const [hobby1Id, setHobby1Id] = useState('h3');
  const [hobby2Id, setHobby2Id] = useState('h4');

  const totalBugs = JIKOSHOUKAI_BUG_SEGMENTS.filter((s) => s.isBug).length;
  const foundBugsCount = JIKOSHOUKAI_BUG_SEGMENTS.filter(
    (s) => s.isBug && fixedBugIds[s.id]
  ).length;

  const handleSegmentClick = (id: string, isBug: boolean, explanation?: string) => {
    if (!isBug) {
      setWrongClicks('Đoạn này đúng rồi — hãy soi kỹ quốc tịch, nghề nghiệp, tuổi và ngày sinh!');
      onRecordWeakNote('Part 3 – Soi Bug: Nhầm lẫn đoạn đúng thành lỗi sai.');
      return;
    }
    setWrongClicks(null);
    setFixedBugIds((prev) => ({ ...prev, [id]: true }));
    if (explanation) {
      // Keep positive reinforcement subtle; no error note needed unless wrong
    }
  };

  const selectedCountry =
    COUNTRIES.find((c) => c.id === countryId) ?? COUNTRIES[1];
  const selectedHobby1 =
    HOBBY_CHOICES.find((h) => h.id === hobby1Id) ?? HOBBY_CHOICES[1];
  const selectedHobby2 =
    HOBBY_CHOICES.find((h) => h.id === hobby2Id) ?? HOBBY_CHOICES[2];

  const generatedLines = useMemo(
    () =>
      buildJikoshoukaiLines({
        name,
        countryNationalityKana: selectedCountry.nationalityKana,
        countryNationalityRomaji: selectedCountry.nationalityRomaji,
        countryVi: selectedCountry.viName,
        schoolKana,
        schoolRomaji: schoolKana,
        schoolVi,
        age,
        birthMonth,
        birthDay,
        hobby1Kana: selectedHobby1.kana,
        hobby1Romaji: selectedHobby1.romaji,
        hobby1Vi: selectedHobby1.meaning,
        hobby2Kana: selectedHobby2.kana,
        hobby2Romaji: selectedHobby2.romaji,
        hobby2Vi: selectedHobby2.meaning,
      }),
    [
      name,
      selectedCountry,
      schoolKana,
      schoolVi,
      age,
      birthMonth,
      birthDay,
      selectedHobby1,
      selectedHobby2,
    ]
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
        <h2 className="text-sm font-extrabold text-stone-900">
          Part 3 · Sở thích (しゅみ) & Tự giới thiệu (自己紹介)
        </h2>
        <p className="text-xs text-stone-600">
          Ôn đủ 14 từ sở thích, cấu trúc nối と, câu đáp こちらこそ và luyện kỹ năng soi lỗi trước khi vào Quiz.
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-sm font-extrabold text-stone-900">
          1. Từ vựng Sở thích (14 từ) & Mẫu câu với trợ từ と
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {HOBBIES.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-xs"
            >
              <p className="font-jp font-bold text-stone-900">{h.kana}</p>
              {h.kanji !== h.kana && (
                <p className="font-jp text-[11px] text-stone-500">{h.kanji}</p>
              )}
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-400">{h.romaji}</p>
              )}
              <p className="mt-1 font-semibold text-red-700">{h.meaning}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {HOBBY_STRUCTURES.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs"
            >
              <p className="font-bold text-stone-700">{s.title}</p>
              <p className="font-jp mt-1 font-bold text-stone-900">{s.jp}</p>
              {displayMode === 'full' && (
                <p className="text-[11px] text-stone-500">{s.romaji}</p>
              )}
              <p className="mt-0.5 text-stone-600">{s.vi}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <h3 className="mb-3 text-sm font-extrabold text-stone-900">
            2. Tổng kết cấu trúc Jikoshoukai
          </h3>
          <div className="divide-y divide-stone-100 text-xs">
            {JIKOSHOUKAI_SUMMARY_ROWS.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between">
                <span className="font-semibold text-stone-700">{row.label}</span>
                <span className="font-jp font-bold text-red-700">{row.pattern}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <h3 className="mb-3 text-sm font-extrabold text-stone-900">
            3. {PAKKU_SAMPLE.title}
          </h3>
          <div className="space-y-1.5 rounded-xl bg-stone-50 p-3 text-xs">
            {PAKKU_SAMPLE.lines.map((line) => (
              <div key={line.jp} className="border-b border-stone-200/60 pb-1.5 last:border-none last:pb-0">
                <p className="font-jp font-bold text-stone-900">{line.jp}</p>
                {displayMode === 'full' && (
                  <p className="text-[11px] text-stone-500">{line.romaji}</p>
                )}
                <p className="text-stone-600">{line.vi}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border-2 border-stone-900 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-red-700" />
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">
                Thử tay Part 3: “Soi Bug” bài Jikoshoukai (Chạm vào 4 chỗ sai)
              </h3>
              <p className="text-xs text-stone-500">
                Đoạn văn dưới gài sẵn 4 lỗi bẫy hay gặp nhất. Chạm vào chỗ sai để sửa trực tiếp.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-800">
            Đã sửa {foundBugsCount} / {totalBugs} lỗi
          </span>
        </div>

        <div className="font-jp flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed">
          {JIKOSHOUKAI_BUG_SEGMENTS.map((seg) => {
            const isFixed = Boolean(fixedBugIds[seg.id]);
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() =>
                  handleSegmentClick(seg.id, seg.isBug, seg.explanation)
                }
                className={`rounded-lg px-2.5 py-1 text-left font-bold transition ${
                  isFixed
                    ? 'border border-emerald-400 bg-emerald-100 text-emerald-900'
                    : 'border border-stone-300 bg-white text-stone-900 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                {isFixed && seg.fixedText ? seg.fixedText : seg.text}
              </button>
            );
          })}
        </div>

        {wrongClicks && (
          <p className="mt-2 text-xs font-medium text-amber-700">{wrongClicks}</p>
        )}

        <div className="mt-3 space-y-1.5">
          {JIKOSHOUKAI_BUG_SEGMENTS.filter((s) => s.isBug && fixedBugIds[s.id]).map(
            (seg) => (
              <div
                key={seg.id}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
              >
                <span className="font-jp font-bold line-through opacity-60">
                  {seg.text}
                </span>{' '}
                → <span className="font-jp font-extrabold">{seg.fixedText}</span>:{' '}
                {seg.explanation}
              </div>
            )
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">
              Xưởng ghép Jikoshoukai chuẩn ngữ pháp (Tự vá ngoại lệ)
            </h3>
            <p className="text-xs text-stone-500">
              Thử đổi tuổi = 20 hoặc ngày sinh đặc biệt (1–10, 14, 20, 24) để kiểm tra cách đọc chuẩn.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Tên (Katakana/Kana)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
              placeholder="アン"
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Quốc tịch</span>
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.viName} ({c.nationalityKana})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Trường học</span>
            <input
              type="text"
              value={schoolKana}
              onChange={(e) => {
                setSchoolKana(e.target.value);
                setSchoolVi(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Tuổi (1–99)</span>
            <input
              type="number"
              min={1}
              max={99}
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              onBlur={() => setAgeInput(String(age))}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Tháng sinh</span>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Ngày sinh</span>
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Ngày {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Sở thích 1</span>
            <select
              value={hobby1Id}
              onChange={(e) => setHobby1Id(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            >
              {HOBBY_CHOICES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.meaning} ({h.kana})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold text-stone-700">Sở thích 2</span>
            <select
              value={hobby2Id}
              onChange={(e) => setHobby2Id(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold"
            >
              {HOBBY_CHOICES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.meaning} ({h.kana})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
          {generatedLines.map((line, index) => (
            <div key={index} className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-jp text-sm font-bold text-stone-900">
                  {line.jp}
                </span>
                {displayMode === 'full' && (
                  <span className="ml-2 text-[11px] text-stone-500">
                    ({line.romaji})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {line.badge && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {line.badge}
                  </span>
                )}
                <span className="text-stone-500">{line.vi}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
          <span className="text-xs text-stone-600">
            Xong 3 Part là bạn đã quét sạch 100% kiến thức phục vụ Quiz 20 câu!
          </span>
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
            {isCompleted ? 'Đã xong Part 3!' : 'Hoàn thành Part 3 → Chuẩn bị Quiz'}
          </button>
        </div>
      </section>
    </div>
  );
}
