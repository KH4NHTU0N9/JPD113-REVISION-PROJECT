import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../part1Data';
import { DAY_READINGS, MONTH_READINGS } from '../part2Data';
import { HOBBIES } from '../part3Data';
import { LOCAL_DEMO_ANSWER_KEY } from '../localDemoAnswerKey';
import { WORKBOOK_QUESTIONS } from '../quizQuestions';

describe('PDF Content Integrity', () => {
  it('contains all 18 countries, 31 days (including 17/19/27/29), 12 months, and 14 hobbies', () => {
    expect(COUNTRIES).toHaveLength(18);
    expect(DAY_READINGS).toHaveLength(31);
    expect(MONTH_READINGS).toHaveLength(12);
    expect(HOBBIES).toHaveLength(14);

    const day17 = DAY_READINGS.find((d) => d.day === 17);
    const day19 = DAY_READINGS.find((d) => d.day === 19);
    const day27 = DAY_READINGS.find((d) => d.day === 27);
    const day29 = DAY_READINGS.find((d) => d.day === 29);

    expect(day17?.kana).toBe('じゅうしちにち');
    expect(day19?.kana).toBe('じゅうくにち');
    expect(day27?.kana).toBe('にじゅうしちにち');
    expect(day29?.kana).toBe('にじゅうくにち');
  });

  it('contains all 20 workbook questions with complete A-D options', () => {
    expect(WORKBOOK_QUESTIONS).toHaveLength(20);
    WORKBOOK_QUESTIONS.forEach((q, idx) => {
      expect(q.id).toBe(idx + 1);
      expect(q.options.A.trim().length).toBeGreaterThan(0);
      expect(q.options.B.trim().length).toBeGreaterThan(0);
      expect(q.options.C.trim().length).toBeGreaterThan(0);
      expect(q.options.D.trim().length).toBeGreaterThan(0);
    });
  });

  it('keeps local demo answer key 100% synchronized with supabase/schema.sql', () => {
    const schemaPath = resolve(process.cwd(), 'supabase/schema.sql');
    const sqlText = readFileSync(schemaPath, 'utf-8');

    expect(LOCAL_DEMO_ANSWER_KEY).toHaveLength(20);

    for (const entry of LOCAL_DEMO_ANSWER_KEY) {
      const tuplePattern = new RegExp(
        `\\(${entry.questionId},\\s*'${entry.correctChoice}'`
      );
      expect(sqlText).toMatch(tuplePattern);
    }
  });
});
