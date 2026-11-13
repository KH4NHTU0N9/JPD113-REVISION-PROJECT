import { Suspense, lazy, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Flame,
  Gamepad2,
  Lightbulb,
  Puzzle,
  ShieldAlert,
  Sparkles,
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
  onAwardGameProgress,
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
      <section className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <button
            type="button"
            onClick={() => setActiveStep('theory')}
            className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left transition ${
              activeStep === 'theory'
                ? 'border-red-600 bg-red-50 text-red-900'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-red-700" />
              <div>
                <p className="text-xs font-extrabold">Bước 1 · Lý thuyết (Part 1·2·3)</p>
                <p className="text-[11px] opacity-80">Đọc lướt 2–3p trước khi chơi</p>
              </div>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-stone-700 shadow-2xs">
              {theoryDoneCount}/3
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('games')}
            className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3.5 py-2.5 text-left transition ${
              activeStep === 'games'
                ? 'border-red-600 bg-red-50 text-red-900'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 shrink-0 text-red-700" />
              <div>
                <p className="text-xs font-extrabold">Bước 2 · 4 Chặng Mini-Game</p>
                <p className="text-[11px] opacity-80">
                  {progress.phase1Xp > 0
                    ? `${progress.phase1Xp} XP · Combo x${progress.phase1BestCombo}`
                    : 'Gỡ bẫy · Ghép · Xếp · Soi Bug'}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-stone-700 shadow-2xs">
              {gamesDoneCount}/4
            </span>
          </button>

          <button
            type="button"
            onClick={onGoToPhase2}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-stone-800"
          >
            <span>Bước 3 · Quiz 20 câu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeStep === 'theory' ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              {
                id: 'part1' as const,
                label: 'Part 1 · Từ vựng & 5 Mẫu câu',
                done: progress.part1Completed,
              },
              {
                id: 'part2' as const,
                label: 'Part 2 · Tuổi, Ngày & Tháng',
                done: progress.part2Completed,
              },
              {
                id: 'part3' as const,
                label: 'Part 3 · Sở thích & Jikoshoukai',
                done: progress.part3Completed,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTheoryTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  theoryTab === tab.id
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  {progress.phase1Xp} XP
                </span>
                {progress.phase1BestCombo >= 2 && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-extrabold text-red-800">
                    <Flame className="h-3.5 w-3.5 text-red-600" />
                    Max x{progress.phase1BestCombo}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openQuickSheet(currentStageMeta.hintTab)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-900 transition hover:bg-amber-100"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>Quên luật? Xem nhanh lý thuyết</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : isDone
                          ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-50'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{stage.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Step 1: Full Theory View (kept mounted to preserve filter & Jikoshoukai state) */}
      <div className={activeStep === 'theory' ? 'space-y-5' : 'hidden'}>
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
              Bảng tổng hợp 6 lưu ý vàng trước khi sang Chơi Mini-Game & Quiz
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
              <span>Đã xem Lý thuyết → Chơi 4 Chặng Mini-Game</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Step 2: 4 Mini-Games Arena (kept mounted so players retain combo/round/tile progress) */}
      <div className={activeStep === 'games' ? 'space-y-4' : 'hidden'}>
        <div className={activeStage === 'tinder' ? 'block' : 'hidden'}>
          <TrapSwipeGame
            displayMode={displayMode}
            isCompleted={progress.completedGames.includes('tinder')}
            keyboardEnabled={activeStep === 'games' && activeStage === 'tinder' && !cheatSheetOpen}
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
