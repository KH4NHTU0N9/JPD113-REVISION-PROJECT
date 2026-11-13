import { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { DisplayMode } from '../types/lesson';
import type { ReviewProgressState } from '../lib/storage';
import { Part1ReviewTab } from './Part1ReviewTab';
import { Part2ReviewTab } from './Part2ReviewTab';
import { Part3ReviewTab } from './Part3ReviewTab';

type SubTab = 'part1' | 'part2' | 'part3';

interface Phase1ContainerProps {
  progress: ReviewProgressState;
  displayMode: DisplayMode;
  onCompletePart: (part: 'part1' | 'part2' | 'part3') => void;
  onRecordWeakNote: (note: string) => void;
  onGoToPhase2: () => void;
}

const SIX_GOLDEN_TRAPS = [
  '1. Tiền tố お: おなまえ, おくに, おしごと; hỏi quê dùng どちらですか.',
  '2. きょうし (tự xưng nghề GV) ≠ せんせい (gọi người khác); [Công ty] の しゃいん ≠ かいしゃいん.',
  '3. Bốn trợ từ cốt lõi: は (đọc wa), も (cũng – thay は), の (sở hữu), か (hỏi). Quốc tịch KHÔNG có の.',
  '4. Tuổi biến âm: 1 (いっさい), 8 (はっさい), 10 (じゅっさい/じっさい), 20 (はたち – bỏ さい).',
  '5. Ngày đặc biệt (1–10, 14, 20, 24) KHÔNG ghép にち; phân biệt 4日 よっか vs 8日 ようか; 17/27 đọc しち, 19/29 đọc く.',
  '6. Tháng đặc biệt: 4 (しがつ), 7 (しちがつ), 9 (くがつ); thứ tự luôn là Tháng trước – Ngày sau.',
];

export function Phase1Container({
  progress,
  displayMode,
  onCompletePart,
  onRecordWeakNote,
  onGoToPhase2,
}: Phase1ContainerProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('part1');

  const completedCount =
    Number(progress.part1Completed) +
    Number(progress.part2Completed) +
    Number(progress.part3Completed);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700">
              Phase 1 · Tự ôn tập kiến thức (7 phút)
            </span>
            <h2 className="text-base font-extrabold text-stone-900">
              Ôn đủ 3 Part & Gỡ bẫy trước khi vào Quiz lấy thưởng
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              Tiến độ: {completedCount} / 3 Part
            </span>
            <button
              type="button"
              onClick={onGoToPhase2}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-stone-800"
            >
              <span>Vào Phase 2: Quiz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              id: 'part1' as const,
              label: 'Part 1 · Từ vựng & Ngữ pháp',
              done: progress.part1Completed,
            },
            {
              id: 'part2' as const,
              label: 'Part 2 · Tuổi, Ngày & Tháng',
              done: progress.part2Completed,
            },
            {
              id: 'part3' as const,
              label: 'Part 3 · Sở thích & Soi Bug',
              done: progress.part3Completed,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'border-red-600 bg-red-50 text-red-800'
                  : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keep tabs mounted so students retain drill selections & Jikoshoukai builder state when switching */}
      <div className={activeTab === 'part1' ? 'block' : 'hidden'}>
        <Part1ReviewTab
          displayMode={displayMode}
          isCompleted={progress.part1Completed}
          onComplete={() => {
            onCompletePart('part1');
            setActiveTab('part2');
          }}
          onRecordWeakNote={onRecordWeakNote}
        />
      </div>

      <div className={activeTab === 'part2' ? 'block' : 'hidden'}>
        <Part2ReviewTab
          displayMode={displayMode}
          isCompleted={progress.part2Completed}
          onComplete={() => {
            onCompletePart('part2');
            setActiveTab('part3');
          }}
          onRecordWeakNote={onRecordWeakNote}
        />
      </div>

      <div className={activeTab === 'part3' ? 'block' : 'hidden'}>
        <Part3ReviewTab
          displayMode={displayMode}
          isCompleted={progress.part3Completed}
          onComplete={() => onCompletePart('part3')}
          onRecordWeakNote={onRecordWeakNote}
        />
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="mb-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-700" />
          <h3 className="text-sm font-extrabold text-stone-900">
            Bảng tổng hợp 6 lưu ý vàng trước khi bấm làm Quiz (Bổ sung cuối tài liệu)
          </h3>
        </div>
        <ul className="grid gap-1.5 text-xs text-stone-700 sm:grid-cols-2">
          {SIX_GOLDEN_TRAPS.map((item) => (
            <li key={item} className="rounded-lg bg-stone-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>

        {progress.weakNotes.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-extrabold text-amber-900">
              Nhắc nhanh riêng cho bạn (các điểm vừa bấm nhầm ở Phase 1):
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-800">
              {progress.weakNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onGoToPhase2}
            className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-red-800"
          >
            <span>Sẵn sàng! Chuyển sang Phase 2 (Quiz 20 câu)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
