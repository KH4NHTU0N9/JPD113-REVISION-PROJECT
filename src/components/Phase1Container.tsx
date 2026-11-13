import { Suspense, lazy, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Flame,
  Puzzle,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { ReviewProgressState } from '../lib/storage';
import type { DisplayMode, Phase1GameId } from '../types/lesson';
import { BugHunterGame } from './games/BugHunterGame';
import { SentenceTilesGame } from './games/SentenceTilesGame';
import { SpeedMatchGame } from './games/SpeedMatchGame';
import { TrapSwipeGame } from './games/TrapSwipeGame';

const CheatSheetModal = lazy(() =>
  import('./CheatSheetModal').then((m) => ({ default: m.CheatSheetModal }))
);

interface Phase1ContainerProps {
  progress: ReviewProgressState;
  displayMode: DisplayMode;
  onAwardGameProgress: (
    deltaXp: number,
    combo: number,
    completedGame?: Phase1GameId
  ) => void;
  onRecordWeakNote: (note: string) => void;
  onGoToPhase2: () => void;
}

const GAME_STAGES: {
  id: Phase1GameId;
  shortLabel: string;
  title: string;
  icon: typeof Zap;
}[] = [
  { id: 'tinder', shortLabel: '1. Chuẩn / Bẫy', title: 'Săn bẫy tốc độ', icon: ShieldAlert },
  { id: 'match', shortLabel: '2. Ghép Biến Mất', title: 'Đua giây ghép cặp', icon: Zap },
  { id: 'tiles', shortLabel: '3. Xếp Mảnh Câu', title: 'Ghép câu né bẫy', icon: Puzzle },
  { id: 'bug', shortLabel: '4. Soi Bug', title: 'Thám tử bắt lỗi', icon: Bug },
];

export function Phase1Container({
  progress,
  displayMode,
  onAwardGameProgress,
  onRecordWeakNote,
  onGoToPhase2,
}: Phase1ContainerProps) {
  const [activeStage, setActiveStage] = useState<Phase1GameId>('tinder');
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  const clearedCount = progress.completedGames.length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              {progress.phase1Xp} XP
            </span>
            {progress.phase1BestCombo >= 2 && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-extrabold text-red-800">
                <Flame className="h-3.5 w-3.5 text-red-600" />
                Max x{progress.phase1BestCombo}
              </span>
            )}
            <span className="text-xs font-bold text-stone-500">
              {clearedCount}/4 chặng
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCheatSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-extrabold text-stone-800 transition hover:bg-stone-100"
            >
              <BookOpen className="h-3.5 w-3.5 text-red-700" />
              <span>Tra bảng nhanh</span>
            </button>
            <button
              type="button"
              onClick={onGoToPhase2}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-extrabold text-white transition hover:bg-stone-800"
            >
              <span>Vào Quiz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GAME_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            const isDone = progress.completedGames.includes(stage.id);

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-extrabold transition ${
                  isActive
                    ? 'border-red-600 bg-red-50 text-red-800 shadow-xs'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-50'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{stage.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Keep mini-games mounted so students preserve combo/round/tile state when peeking at other stages */}
      <div className={activeStage === 'tinder' ? 'block' : 'hidden'}>
        <TrapSwipeGame
          displayMode={displayMode}
          isCompleted={progress.completedGames.includes('tinder')}
          keyboardEnabled={activeStage === 'tinder' && !cheatSheetOpen}
          onAwardProgress={onAwardGameProgress}
          onRecordWeakNote={onRecordWeakNote}
          onNextStage={() => setActiveStage('match')}
        />
      </div>

      <div className={activeStage === 'match' ? 'block' : 'hidden'}>
        <SpeedMatchGame
          displayMode={displayMode}
          isCompleted={progress.completedGames.includes('match')}
          onAwardProgress={onAwardGameProgress}
          onRecordWeakNote={onRecordWeakNote}
          onNextStage={() => setActiveStage('tiles')}
        />
      </div>

      <div className={activeStage === 'tiles' ? 'block' : 'hidden'}>
        <SentenceTilesGame
          displayMode={displayMode}
          isCompleted={progress.completedGames.includes('tiles')}
          onAwardProgress={onAwardGameProgress}
          onRecordWeakNote={onRecordWeakNote}
          onNextStage={() => setActiveStage('bug')}
        />
      </div>

      <div className={activeStage === 'bug' ? 'block' : 'hidden'}>
        <BugHunterGame
          isCompleted={progress.completedGames.includes('bug')}
          onAwardProgress={onAwardGameProgress}
          onRecordWeakNote={onRecordWeakNote}
          onGoToPhase2={onGoToPhase2}
        />
      </div>

      {progress.weakNotes.length > 0 && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-amber-950">
              Nhắc riêng trước khi vào Quiz (bẫy bạn vừa chạm nhầm):
            </p>
            <button
              type="button"
              onClick={() => setCheatSheetOpen(true)}
              className="text-xs font-bold text-red-700 underline hover:text-red-800"
            >
              Mở Bảng Tra xem kỹ hơn
            </button>
          </div>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-amber-900">
            {progress.weakNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {cheatSheetOpen && (
        <Suspense fallback={null}>
          <CheatSheetModal
            open={cheatSheetOpen}
            onClose={() => setCheatSheetOpen(false)}
            displayMode={displayMode}
            weakNotes={progress.weakNotes}
          />
        </Suspense>
      )}
    </div>
  );
}
