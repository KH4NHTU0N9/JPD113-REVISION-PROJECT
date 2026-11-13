import type { ScoreboardEntry } from '../types/lesson';

export type RankingFilter = 'first-only' | 'all';

/**
 * Deterministic scoreboard comparator:
 * 1. Higher score wins.
 * 2. Faster completion duration (ms) breaks ties.
 * 3. Earlier submission timestamp breaks identical durations.
 */
export function compareScoreboardEntries(
  a: ScoreboardEntry,
  b: ScoreboardEntry
): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  if (a.duration_ms !== b.duration_ms) {
    return a.duration_ms - b.duration_ms;
  }
  const timeDiff =
    new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
  if (timeDiff !== 0) {
    return timeDiff;
  }
  return a.attempt_id.localeCompare(b.attempt_id);
}

export function rankScoreboardEntries(
  entries: ScoreboardEntry[],
  filter: RankingFilter
): ScoreboardEntry[] {
  const filtered =
    filter === 'first-only'
      ? entries.filter((entry) => entry.attempt_number === 1)
      : entries;

  return [...filtered].sort(compareScoreboardEntries);
}

export function formatDurationMs(durationMs: number): string {
  const safeMs = Math.max(0, Math.floor(durationMs));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safeMs % 1000) / 10);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

/**
 * Neutralizes spreadsheet formula injection (=, +, -, @, tab, CR, full-width variants)
 * and quotes CSV cells safely per RFC 4180.
 */
export function escapeCsvCell(rawValue: string | number): string {
  const str = String(rawValue);
  const formulaSafe = /^[=+\-@\t\r＝＋－＠]/.test(str) ? `'${str}` : str;
  const escaped = formulaSafe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildScoreboardCsv(entries: ScoreboardEntry[]): string {
  const headers = [
    'Hang',
    'HoTen',
    'MSSV',
    'LuotThi',
    'Diem',
    'TongCau',
    'ThoiGian_ms',
    'ThoiGian',
    'NopLuc',
  ];

  const rows = entries.map((entry, idx) =>
    [
      idx + 1,
      entry.student_name,
      entry.student_code,
      entry.attempt_number,
      entry.score,
      entry.total_questions,
      entry.duration_ms,
      formatDurationMs(entry.duration_ms),
      entry.submitted_at,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  // Prefix UTF-8 BOM and use CRLF so Vietnamese & Japanese render properly in Excel
  return `\uFEFF${[headers.map(escapeCsvCell).join(','), ...rows].join('\r\n')}`;
}
