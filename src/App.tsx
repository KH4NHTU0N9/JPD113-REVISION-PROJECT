import { useEffect, useState } from 'react';
import { HeaderBar, type ActiveRoute } from './components/HeaderBar';
import { Phase1Container } from './components/Phase1Container';
import { Phase2QuizRunner } from './components/Phase2QuizRunner';
import { ScoreboardView } from './components/ScoreboardView';
import {
  loadReviewProgress,
  saveReviewProgress,
  type ReviewProgressState,
} from './lib/storage';
import { isSupabaseConfigured } from './lib/supabaseClient';
import type { DisplayMode } from './types/lesson';

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
    const saved = loadReviewProgress();
    if (!saved.timerStartedAtMs) return SEVEN_MINUTES_SECONDS;
    const elapsed = Math.floor((Date.now() - saved.timerStartedAtMs) / 1000);
    return Math.max(0, SEVEN_MINUTES_SECONDS - elapsed);
  });
  const [timerRunning, setTimerRunning] = useState<boolean>(() => {
    const saved = loadReviewProgress();
    if (!saved.timerStartedAtMs) return false;
    const elapsed = Math.floor((Date.now() - saved.timerStartedAtMs) / 1000);
    return SEVEN_MINUTES_SECONDS - elapsed > 0;
  });
  const [scoreboardRefreshSignal, setScoreboardRefreshSignal] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(routeFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const updateProgress = (
    updater: (prev: ReviewProgressState) => ReviewProgressState
  ) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveReviewProgress(next);
      return next;
    });
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
    setTimerRunning((prev) => {
      const nextRunning = !prev;
      updateProgress((p) => ({
        ...p,
        timerStartedAtMs: nextRunning
          ? Date.now() - (SEVEN_MINUTES_SECONDS - remainingSeconds) * 1000
          : null,
      }));
      return nextRunning;
    });
  };

  const handleResetTimer = () => {
    setTimerRunning(true);
    setRemainingSeconds(SEVEN_MINUTES_SECONDS);
    updateProgress((p) => ({ ...p, timerStartedAtMs: Date.now() }));
  };

  const handleCompletePart = (part: 'part1' | 'part2' | 'part3') => {
    updateProgress((prev) => ({
      ...prev,
      part1Completed: part === 'part1' ? true : prev.part1Completed,
      part2Completed: part === 'part2' ? true : prev.part2Completed,
      part3Completed: part === 'part3' ? true : prev.part3Completed,
    }));
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
        isLiveBackend={isSupabaseConfigured}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {activeRoute === 'phase1' && (
          <Phase1Container
            progress={progress}
            displayMode={progress.displayMode}
            onCompletePart={handleCompletePart}
            onRecordWeakNote={handleRecordWeakNote}
            onGoToPhase2={() => handleRouteChange('phase2')}
          />
        )}

        {activeRoute === 'phase2' && (
          <Phase2QuizRunner
            onGoToScoreboard={() => handleRouteChange('scoreboard')}
            onScoreboardMutated={() =>
              setScoreboardRefreshSignal((prev) => prev + 1)
            }
          />
        )}

        {activeRoute === 'scoreboard' && (
          <ScoreboardView refreshSignal={scoreboardRefreshSignal} />
        )}
      </main>
    </div>
  );
}
