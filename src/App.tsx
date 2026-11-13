import { Suspense, lazy, useEffect, useState } from 'react';
import { HeaderBar, type ActiveRoute } from './components/HeaderBar';
import { Phase1Container } from './components/Phase1Container';

const Phase2QuizRunner = lazy(() =>
  import('./components/Phase2QuizRunner').then((m) => ({
    default: m.Phase2QuizRunner,
  }))
);
const ScoreboardView = lazy(() =>
  import('./components/ScoreboardView').then((m) => ({
    default: m.ScoreboardView,
  }))
);
import {
  loadReviewProgress,
  saveReviewProgress,
  type ReviewProgressState,
} from './lib/storage';
import type { DisplayMode, Phase1GameId } from './types/lesson';

const SEVEN_MINUTES_SECONDS = 7 * 60;

function routeFromPathname(pathname: string): ActiveRoute {
  const clean = pathname.toLowerCase();
  if (clean.startsWith('/scoreboard')) return 'scoreboard';
  if (clean.startsWith('/quiz')) return 'phase2';
  return 'phase1';
}

function pathnameForRoute(route: ActiveRoute): string {
  if (route === 'scoreboard') return '/scoreboard';
  if (route === 'phase2') return '/quiz';
  return '/';
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(() =>
    routeFromPathname(window.location.pathname)
  );
  const [progress, setProgress] = useState<ReviewProgressState>(() =>
    loadReviewProgress()
  );

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (progress.timerStartedAtMs !== null) {
      const elapsed = Math.floor((Date.now() - progress.timerStartedAtMs) / 1000);
      return Math.max(0, SEVEN_MINUTES_SECONDS - elapsed);
    }
    if (progress.pausedRemainingSeconds !== null) {
      return Math.max(0, Math.min(SEVEN_MINUTES_SECONDS, progress.pausedRemainingSeconds));
    }
    return SEVEN_MINUTES_SECONDS;
  });
  const [timerRunning, setTimerRunning] = useState<boolean>(() => {
    if (progress.timerStartedAtMs === null) return false;
    const elapsed = Math.floor((Date.now() - progress.timerStartedAtMs) / 1000);
    return SEVEN_MINUTES_SECONDS - elapsed > 0;
  });
  const [scoreboardRefreshSignal, setScoreboardRefreshSignal] = useState(0);

  useEffect(() => {
    saveReviewProgress(progress);
  }, [progress]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(routeFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!timerRunning || progress.timerStartedAtMs === null) return;
    const startedAtMs = progress.timerStartedAtMs;

    const syncCountdown = () => {
      const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
      const nextRemaining = Math.max(0, SEVEN_MINUTES_SECONDS - elapsed);
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0) {
        setTimerRunning(false);
        setProgress((prev) => ({
          ...prev,
          timerStartedAtMs: null,
          pausedRemainingSeconds: 0,
        }));
      }
    };

    syncCountdown();
    const id = window.setInterval(syncCountdown, 500);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncCountdown();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncCountdown);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncCountdown);
    };
  }, [timerRunning, progress.timerStartedAtMs]);

  const updateProgress = (
    updater: (prev: ReviewProgressState) => ReviewProgressState
  ) => {
    setProgress(updater);
  };

  const handleRouteChange = (route: ActiveRoute) => {
    setActiveRoute(route);
    const targetPath = pathnameForRoute(route);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    updateProgress((prev) => ({ ...prev, displayMode: mode }));
  };

  const handleToggleTimer = () => {
    if (remainingSeconds === 0) {
      handleResetTimer();
      return;
    }
    if (timerRunning) {
      const currentRemaining =
        progress.timerStartedAtMs !== null
          ? Math.max(
              0,
              SEVEN_MINUTES_SECONDS -
                Math.floor((Date.now() - progress.timerStartedAtMs) / 1000)
            )
          : remainingSeconds;
      setTimerRunning(false);
      setRemainingSeconds(currentRemaining);
      setProgress((p) => ({
        ...p,
        timerStartedAtMs: null,
        pausedRemainingSeconds: currentRemaining,
      }));
      return;
    }

    const resumeRemaining =
      progress.pausedRemainingSeconds ?? remainingSeconds;
    const resumedStartAt =
      Date.now() - (SEVEN_MINUTES_SECONDS - resumeRemaining) * 1000;
    setTimerRunning(true);
    setProgress((p) => ({
      ...p,
      timerStartedAtMs: resumedStartAt,
      pausedRemainingSeconds: null,
    }));
  };

  const handleResetTimer = () => {
    const now = Date.now();
    setTimerRunning(true);
    setRemainingSeconds(SEVEN_MINUTES_SECONDS);
    setProgress((p) => ({
      ...p,
      timerStartedAtMs: now,
      pausedRemainingSeconds: null,
    }));
  };

  const handleCompletePart = (part: 'part1' | 'part2' | 'part3') => {
    updateProgress((prev) => ({
      ...prev,
      part1Completed: part === 'part1' ? true : prev.part1Completed,
      part2Completed: part === 'part2' ? true : prev.part2Completed,
      part3Completed: part === 'part3' ? true : prev.part3Completed,
    }));
  };

  const handleCompleteGame = (completedGame: Phase1GameId) => {
    updateProgress((prev) => {
      if (prev.completedGames.includes(completedGame)) return prev;
      return {
        ...prev,
        completedGames: [...prev.completedGames, completedGame],
      };
    });
  };

  const handleRecordWeakNote = (note: string) => {
    updateProgress((prev) => {
      if (prev.weakNotes.includes(note)) return prev;
      return {
        ...prev,
        weakNotes: [...prev.weakNotes.slice(-7), note],
      };
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <HeaderBar
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        displayMode={progress.displayMode}
        onDisplayModeChange={handleDisplayModeChange}
        remainingSeconds={remainingSeconds}
        timerRunning={timerRunning}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
      />

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-5">
        {activeRoute === 'phase1' && (
          <Phase1Container
            progress={progress}
            displayMode={progress.displayMode}
            onCompletePart={handleCompletePart}
            onCompleteGame={handleCompleteGame}
            onRecordWeakNote={handleRecordWeakNote}
            onGoToPhase2={() => handleRouteChange('phase2')}
          />
        )}

        {activeRoute === 'phase2' && (
          <Suspense
            fallback={
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs font-semibold text-stone-500">
                Đang tải Phase 2 Quiz...
              </div>
            }
          >
            <Phase2QuizRunner
              onGoToScoreboard={() => handleRouteChange('scoreboard')}
              onScoreboardMutated={() =>
                setScoreboardRefreshSignal((prev) => prev + 1)
              }
            />
          </Suspense>
        )}

        {activeRoute === 'scoreboard' && (
          <Suspense
            fallback={
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs font-semibold text-stone-500">
                Đang tải Scoreboard...
              </div>
            }
          >
            <ScoreboardView refreshSignal={scoreboardRefreshSignal} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
