import { Suspense, lazy, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Gamepad2,
  Lightbulb,
  Puzzle,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { SIX_GOLDEN_TRAPS } from '../data/phase1Games';
import type { ReviewProgressState } from '../lib/storage';
import type { DisplayMode, Phase1GameId } from '../types/lesson';
import type { SheetTab } from './CheatSheetModal';
import { Part1ReviewTab } from './Part1ReviewTab';
import { Part2ReviewTab } from './Part2ReviewTab';
import { Part3ReviewTab } from './Part3ReviewTab';
import { BugHunterGame } from './games/BugHunterGame';
import { SentenceTilesGame } from './games/SentenceTilesGame';
import { SpeedMatchGame } from './games/SpeedMatchGame';
import { TrapSwipeGame } from './games/TrapSwipeGame';

const CheatSheetModal = lazy(() =>
  import('./CheatSheetModal').then((m) => ({ default: m.CheatSheetModal }))
);

type Phase1Step = 'theory' | 'games';
type TheorySubTab = 'part1' | 'part2' | 'part3';

interface Phase1ContainerProps {
  progress: ReviewProgressState;
  displayMode: DisplayMode;
  onCompletePart: (part: 'part1' | 'part2' | 'part3') => void;
  onCompleteGame: (completedGame: Phase1GameId) => void;
  onRecordWeakNote: (note: string) => void;
  onGoToPhase2: () => void;
}

const GAME_STAGES: {
  id: Phase1GameId;
  shortLabel: string;
  hintTab: SheetTab;
  icon: typeof Zap;
}[] = [
  { id: 'tinder', shortLabel: '1. Chuẩn / Bẫy', hintTab: 'traps', icon: ShieldAlert },
  { id: 'match', shortLabel: '2. Ghép Biến Mất', hintTab: 'part2', icon: Zap },
  { id: 'tiles', shortLabel: '3. Xếp Mảnh Câu', hintTab: 'part1', icon: Puzzle },
  { id: 'bug', shortLabel: '4. Soi Bug', hintTab: 'part3', icon: Bug },
];

export function Phase1Container({
  progress,
  displayMode,
  onCompletePart,
  onCompleteGame,
  onRecordWeakNote,
  onGoToPhase2,
}: Phase1ContainerProps) {
  const [activeStep, setActiveStep] = useState<Phase1Step>('theory');
  const [theoryTab, setTheoryTab] = useState<TheorySubTab>('part1');
  const [activeStage, setActiveStage] = useState<Phase1GameId>('tinder');
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [cheatSheetTab, setCheatSheetTab] = useState<SheetTab>('part1');

  const theoryDoneCount =
    Number(progress.part1Completed) +
    Number(progress.part2Completed) +
    Number(progress.part3Completed);
  const gamesDoneCount = progress.completedGames.length;

  const currentStageMeta =
    GAME_STAGES.find((stage) => stage.id === activeStage) ?? GAME_STAGES[0];

  const openQuickSheet = (tab: SheetTab) => {
    setCheatSheetTab(tab);
    setCheatSheetOpen(true);
  };

  const jumpToGames = () => {
    setActiveStep('games');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-2xs sm:px-3.5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setActiveStep('theory')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
                activeStep === 'theory'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>Bước 1 · Lý thuyết</span>
              <span className="text-[11px] font-bold opacity-65">{theoryDoneCount}/3</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('games')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
                activeStep === 'games'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5 shrink-0" />
              <span>Bước 2 · Luyện tập</span>
              <span className="text-[11px] font-bold opacity-65">{gamesDoneCount}/4</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToPhase2}
            className="flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-red-800"
          >
            <span>Bước 3 · Quiz 20 câu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeStep === 'theory' ? (
          <div className="mt-2.5 grid grid-cols-1 gap-1.5 border-t border-stone-100 pt-2.5 sm:grid-cols-3">
            {[
              {
                id: 'part1' as const,
                label: 'Part 1 · Từ vựng & Mẫu câu',
                done: progress.part1Completed,
              },
              {
                id: 'part2' as const,
                label: 'Part 2 · Tuổi, Ngày & Tháng',
                done: progress.part2Completed,
              },
              {
                id: 'part3' as const,
                label: 'Part 3 · Sở thích & Giới thiệu',
                done: progress.part3Completed,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTheoryTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  theoryTab === tab.id
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2.5 flex flex-col gap-2 border-t border-stone-100 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
              {GAME_STAGES.map((stage) => {
                const Icon = stage.icon;
                const isActive = activeStage === stage.id;
                const isDone = progress.completedGames.includes(stage.id);

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'border-red-200 bg-red-50 text-red-800'
                        : isDone
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-50'
                          : 'border-transparent bg-stone-50 text-stone-600 hover:bg-stone-100'
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

            <button
              type="button"
              onClick={() => openQuickSheet(currentStageMeta.hintTab)}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span>Lý thuyết nhanh</span>
            </button>
          </div>
        )}
      </section>

      {/* Step 1: Full Theory View (kept mounted to preserve filter & Jikoshoukai state) */}
      <div className={activeStep === 'theory' ? 'space-y-4' : 'hidden'}>
        <div className={theoryTab === 'part1' ? 'block' : 'hidden'}>
          <Part1ReviewTab
            displayMode={displayMode}
            isCompleted={progress.part1Completed}
            onComplete={() => {
              onCompletePart('part1');
              setTheoryTab('part2');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        <div className={theoryTab === 'part2' ? 'block' : 'hidden'}>
          <Part2ReviewTab
            displayMode={displayMode}
            isCompleted={progress.part2Completed}
            onComplete={() => {
              onCompletePart('part2');
              setTheoryTab('part3');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        <div className={theoryTab === 'part3' ? 'block' : 'hidden'}>
          <Part3ReviewTab
            displayMode={displayMode}
            isCompleted={progress.part3Completed}
            onComplete={() => {
              onCompletePart('part3');
              jumpToGames();
            }}
          />
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-700" />
            <h3 className="text-sm font-extrabold text-stone-900">
              Bảng tổng hợp 6 lưu ý vàng trước khi sang Luyện tập & Quiz
            </h3>
          </div>
          <ul className="grid gap-1.5 text-xs text-stone-700 sm:grid-cols-2">
            {SIX_GOLDEN_TRAPS.map((item) => (
              <li key={item} className="rounded-lg bg-stone-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={jumpToGames}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-red-800"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Đã xem Lý thuyết → Luyện tập 4 chặng</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Step 2: 4 Practice Stages (kept mounted so players retain progress when re-checking Theory) */}
      <div className={activeStep === 'games' ? 'space-y-4' : 'hidden'}>
        <div className={activeStage === 'tinder' ? 'block' : 'hidden'}>
          <TrapSwipeGame
            displayMode={displayMode}
            isCompleted={progress.completedGames.includes('tinder')}
            keyboardEnabled={activeStep === 'games' && activeStage === 'tinder' && !cheatSheetOpen}
            onComplete={() => onCompleteGame('tinder')}
            onRecordWeakNote={onRecordWeakNote}
            onNextStage={() => setActiveStage('match')}
          />
        </div>

        <div className={activeStage === 'match' ? 'block' : 'hidden'}>
          <SpeedMatchGame
            displayMode={displayMode}
            isCompleted={progress.completedGames.includes('match')}
            onComplete={() => onCompleteGame('match')}
            onRecordWeakNote={onRecordWeakNote}
            onNextStage={() => setActiveStage('tiles')}
          />
        </div>

        <div className={activeStage === 'tiles' ? 'block' : 'hidden'}>
          <SentenceTilesGame
            displayMode={displayMode}
            isCompleted={progress.completedGames.includes('tiles')}
            onComplete={() => onCompleteGame('tiles')}
            onRecordWeakNote={onRecordWeakNote}
            onNextStage={() => setActiveStage('bug')}
          />
        </div>

        <div className={activeStage === 'bug' ? 'block' : 'hidden'}>
          <BugHunterGame
            isCompleted={progress.completedGames.includes('bug')}
            onComplete={() => onCompleteGame('bug')}
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
                onClick={() => openQuickSheet('traps')}
                className="text-xs font-bold text-red-700 underline hover:text-red-800"
              >
                Mở 6 lưu ý vàng
              </button>
            </div>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-amber-900">
              {progress.weakNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {cheatSheetOpen && (
        <Suspense fallback={null}>
          <CheatSheetModal
            open={cheatSheetOpen}
            initialTab={cheatSheetTab}
            onClose={() => setCheatSheetOpen(false)}
            displayMode={displayMode}
            weakNotes={progress.weakNotes}
          />
        </Suspense>
      )}
    </div>
  );
}
