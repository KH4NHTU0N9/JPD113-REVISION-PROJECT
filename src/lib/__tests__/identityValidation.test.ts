import { describe, expect, it } from 'vitest';
import { normalizeStudentCode, normalizeStudentName } from '../supabaseClient';

describe('Student Identity Normalization', () => {
  it('normalizes student code by removing spaces and uppercasing', () => {
    expect(normalizeStudentCode('  se 181 234  ')).toBe('SE181234');
    expect(normalizeStudentCode('he190001')).toBe('HE190001');
  });

  it('normalizes student name by trimming and collapsing whitespace', () => {
    expect(normalizeStudentName('  Trần   Khánh   Tường  ')).toBe(
      'Trần Khánh Tường'
    );
  });
});
