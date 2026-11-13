import { DAY_READINGS, MONTH_READINGS } from '../data/part2Data';

export interface JikoshoukaiInput {
  name: string;
  countryNationalityKana: string;
  countryNationalityRomaji: string;
  countryVi: string;
  schoolKana: string;
  schoolRomaji: string;
  schoolVi: string;
  age: number;
  birthMonth: number;
  birthDay: number;
  hobby1Kana: string;
  hobby1Romaji: string;
  hobby1Vi: string;
  hobby2Kana: string;
  hobby2Romaji: string;
  hobby2Vi: string;
}

export interface JikoshoukaiLine {
  jp: string;
  romaji: string;
  vi: string;
  badge?: string;
}

const ONES_KANA: Record<number, string> = {
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'よん',
  5: 'ご',
  6: 'ろく',
  7: 'なな',
  8: 'はち',
  9: 'きゅう',
};

const ONES_ROMAJI: Record<number, string> = {
  1: 'ichi',
  2: 'ni',
  3: 'san',
  4: 'yon',
  5: 'go',
  6: 'roku',
  7: 'nana',
  8: 'hachi',
  9: 'kyuu',
};

/**
 * Formats an integer age (1..99) into accurate Japanese reading without rigid "sai" errors.
 */
export function formatAgeJp(age: number): {
  kanji: string;
  kana: string;
  romaji: string;
  isSpecial: boolean;
} {
  const safeAge = Math.max(1, Math.min(99, Math.floor(age)));
  if (safeAge === 20) {
    return {
      kanji: '二十歳',
      kana: 'はたち',
      romaji: 'hatachi',
      isSpecial: true,
    };
  }

  const tens = Math.floor(safeAge / 10);
  const ones = safeAge % 10;

  const tensKana =
    tens === 0 ? '' : tens === 1 ? 'じゅう' : `${ONES_KANA[tens]}じゅう`;
  const tensRomaji =
    tens === 0 ? '' : tens === 1 ? 'juu' : `${ONES_ROMAJI[tens]}juu`;

  if (ones === 0) {
    // 10, 30, 40...
    const prefixKana = tens === 1 ? '' : ONES_KANA[tens];
    const prefixRomaji = tens === 1 ? '' : ONES_ROMAJI[tens];
    return {
      kanji: `${safeAge}歳`,
      kana: `${prefixKana}じゅっさい`,
      romaji: `${prefixRomaji}jussai`,
      isSpecial: true,
    };
  }

  if (ones === 1) {
    return {
      kanji: `${safeAge}歳`,
      kana: `${tensKana}いっさい`,
      romaji: `${tensRomaji}issai`,
      isSpecial: true,
    };
  }

  if (ones === 8) {
    return {
      kanji: `${safeAge}歳`,
      kana: `${tensKana}はっさい`,
      romaji: `${tensRomaji}hassai`,
      isSpecial: true,
    };
  }

  return {
    kanji: `${safeAge}歳`,
    kana: `${tensKana}${ONES_KANA[ones]}さい`,
    romaji: `${tensRomaji}${ONES_ROMAJI[ones]}sai`,
    isSpecial: false,
  };
}

export function formatBirthdayJp(month: number, day: number): {
  kana: string;
  romaji: string;
  vi: string;
  isSpecialDay: boolean;
} {
  const m = MONTH_READINGS.find((item) => item.month === month) ?? MONTH_READINGS[0];
  const d = DAY_READINGS.find((item) => item.day === day) ?? DAY_READINGS[0];
  return {
    kana: `${m.kana} ${d.kana}`,
    romaji: `${m.romaji} ${d.romaji}`,
    vi: `ngày ${d.day} tháng ${m.month}`,
    isSpecialDay: d.category === 'special',
  };
}

export function buildJikoshoukaiLines(input: JikoshoukaiInput): JikoshoukaiLine[] {
  const safeName = input.name.trim() || 'アン';
  const ageFormatted = formatAgeJp(input.age);
  const birthday = formatBirthdayJp(input.birthMonth, input.birthDay);

  const hobbyLine =
    input.hobby2Kana && input.hobby2Kana !== input.hobby1Kana
      ? {
          jp: `しゅみは ${input.hobby1Kana}と ${input.hobby2Kana}です。`,
          romaji: `Shumi wa ${input.hobby1Romaji} to ${input.hobby2Romaji} desu.`,
          vi: `Sở thích của tôi là ${input.hobby1Vi.toLowerCase()} và ${input.hobby2Vi.toLowerCase()}.`,
        }
      : {
          jp: `しゅみは ${input.hobby1Kana}です。`,
          romaji: `Shumi wa ${input.hobby1Romaji} desu.`,
          vi: `Sở thích của tôi là ${input.hobby1Vi.toLowerCase()}.`,
        };

  return [
    {
      jp: 'はじめまして。',
      romaji: 'Hajimemashite.',
      vi: 'Rất vui được gặp bạn lần đầu.',
    },
    {
      jp: `わたしは ${safeName}です。`,
      romaji: `Watashi wa ${safeName} desu.`,
      vi: `Tôi là ${safeName}.`,
    },
    {
      jp: `${input.countryNationalityKana}です。`,
      romaji: `${input.countryNationalityRomaji} desu.`,
      vi: `Tôi là người ${input.countryVi}.`,
    },
    {
      jp: `${input.schoolKana}の がくせいです。`,
      romaji: `${input.schoolRomaji} no gakusei desu.`,
      vi: `Tôi là sinh viên ${input.schoolVi}.`,
    },
    {
      jp: `${ageFormatted.kana}です。`,
      romaji: `${ageFormatted.romaji} desu.`,
      vi: `Tôi ${input.age} tuổi.`,
      badge: input.age === 20 ? 'Đã tự bỏ さい → はたち' : undefined,
    },
    {
      jp: `わたしの たんじょうびは ${birthday.kana}です。`,
      romaji: `Watashi no tanjoubi wa ${birthday.romaji} desu.`,
      vi: `Sinh nhật của tôi là ${birthday.vi}.`,
      badge: birthday.isSpecialDay ? 'Ngày đặc biệt: không thêm にち' : undefined,
    },
    hobbyLine,
    {
      jp: 'どうぞ よろしく おねがいします。',
      romaji: 'Douzo yoroshiku onegaishimasu.',
      vi: 'Rất mong được làm quen với bạn.',
    },
  ];
}
