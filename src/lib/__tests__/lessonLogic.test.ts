import { describe, expect, it } from 'vitest';
import {
  buildJikoshoukaiLines,
  formatAgeJp,
  formatBirthdayJp,
} from '../japaneseFormatters';
import {
  buildRankedScoreboardView,
  buildScoreboardCsv,
  escapeCsvCell,
  formatDurationMs,
  rankScoreboardEntries,
} from '../scoreboardUtils';
import type { ScoreboardEntry } from '../../types/lesson';

describe('Japanese Formatters & PDF Trap Fixes', () => {
  it('formats special ages accurately without attaching sai to age 20', () => {
    expect(formatAgeJp(1).kana).toBe('いっさい');
    expect(formatAgeJp(8).kana).toBe('はっさい');
    expect(formatAgeJp(10).kana).toBe('じゅっさい');
    expect(formatAgeJp(18).kana).toBe('じゅうはっさい');
    expect(formatAgeJp(20).kana).toBe('はたち');
    expect(formatAgeJp(21).kana).toBe('にじゅういっさい');
    expect(formatAgeJp(28).kana).toBe('にじゅうはっさい');
    expect(formatAgeJp(30).kana).toBe('さんじゅっさい');
  });

  it('formats birthdays in Month-first Day-second order without adding nichi to special days', () => {
    const dec8 = formatBirthdayJp(12, 8);
    expect(dec8.kana).toBe('じゅうにがつ ようか');
    expect(dec8.isSpecialDay).toBe(true);

    const jul31 = formatBirthdayJp(7, 31);
    expect(jul31.kana).toBe('しちがつ さんじゅういちにち');
    expect(jul31.isSpecialDay).toBe(false);
  });

  it('builds a grammatically correct Jikoshoukai for a 20-year-old born on Dec 8', () => {
    const lines = buildJikoshoukaiLines({
      name: 'アン',
      countryNationalityKana: 'ベトナムじん',
      countryNationalityRomaji: 'betonamujin',
      countryVi: 'Việt Nam',
      schoolKana: 'FPTだいがく',
      schoolRomaji: 'FPT daigaku',
      schoolVi: 'Đại học FPT',
      age: 20,
      birthMonth: 12,
      birthDay: 8,
      hobby1Kana: 'りょこう',
      hobby1Romaji: 'ryokou',
      hobby1Vi: 'Du lịch',
      hobby2Kana: 'えいが',
      hobby2Romaji: 'eiga',
      hobby2Vi: 'Phim ảnh',
    });

    const jps = lines.map((l) => l.jp);
    expect(jps).toContain('はたちです。');
    expect(jps).not.toContain('はたちさいです。');
    expect(jps).toContain('わたしの たんじょうびは じゅうにがつ ようかです。');
    expect(jps).toContain('しゅみは りょこうと えいがです。');
    expect(lines[1].romaji).toBe('Watashi wa An desu.');
  });

  it('safely clamps NaN and out-of-bounds ages consistently across Kana and Vietnamese', () => {
    expect(formatAgeJp(Number.NaN).kana).toBe('はたち');
    expect(formatAgeJp(0).kana).toBe('いっさい');
    expect(formatAgeJp(150).kana).toBe('きゅうじゅうきゅうさい');

    const lines = buildJikoshoukaiLines({
      name: 'Minh',
      countryNationalityKana: 'ベトナムじん',
      countryNationalityRomaji: 'betonamujin',
      countryVi: 'Việt Nam',
      schoolKana: 'FPTだいがく',
      schoolRomaji: 'FPT daigaku',
      schoolVi: 'Đại học FPT',
      age: 150,
      birthMonth: 4,
      birthDay: 4,
      hobby1Kana: 'りょこう',
      hobby1Romaji: 'ryokou',
      hobby1Vi: 'Du lịch',
    });

    const ageLine = lines.find((l) => l.vi.includes('tuổi'));
    expect(ageLine?.vi).toBe('Tôi 99 tuổi.');
  });
});

describe('Scoreboard Tie-Breaker & CSV Export', () => {
  const sampleEntries: ScoreboardEntry[] = [
    {
      id: '1',
      attempt_id: 'a1',
      student_name: 'Trần A',
      student_code: 'SE01',
      attempt_number: 1,
      score: 18,
      total_questions: 20,
      duration_ms: 95000,
      submitted_at: '2026-11-13T10:05:00Z',
    },
    {
      id: '2',
      attempt_id: 'a2',
      student_name: 'Lê B',
      student_code: 'SE02',
      attempt_number: 1,
      score: 18,
      total_questions: 20,
      duration_ms: 82000,
      submitted_at: '2026-11-13T10:06:00Z',
    },
    {
      id: '3',
      attempt_id: 'a3',
      student_name: 'Trần A (Retry)',
      student_code: 'SE01',
      attempt_number: 2,
      score: 20,
      total_questions: 20,
      duration_ms: 40000,
      submitted_at: '2026-11-13T10:07:00Z',
    },
  ];

  it('filters first-only attempts and breaks ties by fastest duration_ms', () => {
    const firstOnly = rankScoreboardEntries(sampleEntries, 'first-only');
    expect(firstOnly).toHaveLength(2);
    expect(firstOnly[0].student_code).toBe('SE02');
    expect(firstOnly[1].student_code).toBe('SE01');

    const allAttempts = rankScoreboardEntries(sampleEntries, 'all');
    expect(allAttempts).toHaveLength(3);
    expect(allAttempts[0].attempt_id).toBe('a3');
  });

  it('formats duration in mm:ss.cc', () => {
    expect(formatDurationMs(134567)).toBe('02:14.56');
    expect(formatDurationMs(0)).toBe('00:00.00');
  });

  it('neutralizes CSV formula injection (ASCII & full-width) and prefixes UTF-8 BOM with CRLF', () => {
    expect(escapeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(escapeCsvCell('+CMD')).toBe(`"'+CMD"`);
    expect(escapeCsvCell('-10')).toBe(`"'-10"`);
    expect(escapeCsvCell('@SUM')).toBe(`"'@SUM"`);
    expect(escapeCsvCell('＝1+1')).toBe(`"'＝1+1"`);
    expect(escapeCsvCell('＋CMD')).toBe(`"'＋CMD"`);
    expect(escapeCsvCell('－10')).toBe(`"'－10"`);
    expect(escapeCsvCell('＠SUM')).toBe(`"'＠SUM"`);

    const csv = buildScoreboardCsv([sampleEntries[1]]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('"Lê B"');
  });

  it('preserves true full-class rank when filtering scoreboard with searchQuery', () => {
    const view = buildRankedScoreboardView(sampleEntries, 'first-only', 'SE01');
    expect(view.allRanked.map((item) => item.student_code)).toEqual(['SE02', 'SE01']);
    expect(view.filteredEntries).toHaveLength(1);
    expect(view.filteredEntries[0].attempt_id).toBe('a1');
    expect(view.rankByAttemptId.get('a1')).toBe(2);
    expect(view.rankByAttemptId.get('a2')).toBe(1);
  });

  it('handles invalid submitted_at timestamps deterministically without breaking strict weak ordering', () => {
    const badDateEntry: ScoreboardEntry = {
      id: 'bad',
      attempt_id: 'bad',
      student_code: 'SE03',
      student_name: 'Phạm C',
      attempt_number: 1,
      score: 18,
      total_questions: 20,
      duration_ms: 82000,
      submitted_at: 'invalid-iso-date',
    };
    const ranked = rankScoreboardEntries([badDateEntry, sampleEntries[1]], 'all');
    expect(ranked).toHaveLength(2);
    expect(ranked[0].attempt_id).toBe('a2');
    expect(ranked[1].attempt_id).toBe('bad');
  });
});
