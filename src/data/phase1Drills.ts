import type {
  BugSegment,
  DialogueMatchItem,
  DialogueReplyOption,
  ParticleDrillItem,
  TrapChoiceItem,
} from '../types/lesson';

export const PARTICLE_DRILLS: ParticleDrillItem[] = [
  {
    id: 'pd1',
    before: 'わたし',
    after: 'ベトナムじんです。',
    meaning: 'Tôi là người Việt Nam.',
    options: ['の', 'は', 'も', 'か'],
    correct: 'は',
    explanation: 'Trợ từ chủ đề は (đọc là wa) đứng sau わたし để đánh dấu chủ ngữ.',
  },
  {
    id: 'pd2',
    before: 'わたし',
    after: 'なまえは アンです。',
    meaning: 'Tên của tôi là An.',
    options: ['は', 'と', 'の', 'も'],
    correct: 'の',
    explanation: 'の dùng để nối sở hữu: わたしの なまえ (Tên của tôi).',
  },
  {
    id: 'pd3',
    before: 'わたしは FPTだいがくの がくせいです。ともだち',
    after: 'FPTだいがくの がくせいです。',
    meaning: 'Tôi là sinh viên ĐH FPT. Bạn tôi cũng là sinh viên ĐH FPT.',
    options: ['は', 'の', 'も', 'と'],
    correct: 'も',
    explanation: 'も (cũng) thay thế hoàn toàn trợ từ は khi đối tượng thứ hai có cùng thông tin.',
  },
  {
    id: 'pd4',
    before: 'キムさんは トヨタ',
    after: 'しゃいんです。',
    meaning: 'Anh Kim là nhân viên của công ty Toyota.',
    options: ['の', 'は', 'と', 'も'],
    correct: 'の',
    explanation: 'Khi nêu tên công ty cụ thể đứng trước, bắt buộc dùng [Công ty] の しゃいん (không dùng かいしゃいん).',
  },
];

export const DIALOGUE_REPLY_OPTIONS: DialogueReplyOption[] = [
  {
    id: 'r-kochirakoso',
    replyJp: 'こちらこそ よろしく おねがいします。',
    replyRomaji: 'Kochira koso yoroshiku onegaishimasu.',
    replyVi: 'Chính tôi cũng rất mong được làm quen với bạn.',
  },
  {
    id: 'r-douitashimashite',
    replyJp: 'どういたしまして。',
    replyRomaji: 'Dou itashimashite.',
    replyVi: 'Không có gì ạ.',
  },
  {
    id: 'r-okuni',
    replyJp: 'ベトナムです。',
    replyRomaji: 'Betonamu desu.',
    replyVi: 'Tôi đến từ Việt Nam.',
  },
  {
    id: 'r-kyoushi',
    replyJp: 'いいえ、がくせいじゃありません。きょうしです。',
    replyRomaji: 'Iie, gakusei ja arimasen. Kyoushi desu.',
    replyVi: 'Không, tôi không phải sinh viên. Tôi là giáo viên.',
  },
];

export const DIALOGUE_MATCH_ITEMS: DialogueMatchItem[] = [
  {
    id: 'dm1',
    promptJp: 'はじめまして。どうぞ よろしく おねがいします。',
    promptRomaji: 'Hajimemashite. Douzo yoroshiku onegaishimasu.',
    promptVi: 'Rất vui được gặp bạn. Rất mong được giúp đỡ.',
    correctReplyId: 'r-kochirakoso',
    explanation: 'Đáp lại lời chào làm quen bằng こちらこそ よろしく おねがいします。',
  },
  {
    id: 'dm2',
    promptJp: 'ありがとうございます。',
    promptRomaji: 'Arigatou gozaimasu.',
    promptVi: 'Cảm ơn bạn rất nhiều.',
    correctReplyId: 'r-douitashimashite',
    explanation: 'Đáp lại lời cảm ơn bằng どういたしまして。 (xuất hiện ở Câu 10 Workbook).',
  },
  {
    id: 'dm3',
    promptJp: 'おくには どちらですか。',
    promptRomaji: 'O-kuni wa dochira desu ka?',
    promptVi: 'Quê hương / Quốc gia của bạn ở đâu ạ?',
    correctReplyId: 'r-okuni',
    explanation: 'おくには どちらですか hỏi đất nước/quê quán → trả lời tên quốc gia.',
  },
  {
    id: 'dm4',
    promptJp: 'あなたは がくせいですか。(Bạn là giáo viên tự giới thiệu lại)',
    promptRomaji: 'Anata wa gakusei desu ka?',
    promptVi: 'Bạn có phải là sinh viên không?',
    correctReplyId: 'r-kyoushi',
    explanation: 'Tự giới thiệu bản thân là giáo viên phải dùng きょうし, tuyệt đối không dùng せんせい.',
  },
];

export const TRAP_CHOICE_DRILLS: TrapChoiceItem[] = [
  {
    id: 'tc1',
    label: '一歳 (1 tuổi)',
    questionHint: 'Chú ý biến âm ngắt (っ) ở 1 tuổi',
    optionA: 'いちさい (ichisai)',
    optionB: 'いっさい (issai)',
    correct: 'B',
    explanation: '1 tuổi đọc biến âm thành いっさい (issai).',
  },
  {
    id: 'tc2',
    label: '八歳 & 二十歳 (8 tuổi & 20 tuổi)',
    questionHint: 'Hai mốc tuổi hay bị gài đề nhất',
    optionA: 'はっさい ・ はたち',
    optionB: 'はちさい ・ にじゅうさい',
    correct: 'A',
    explanation: '8 tuổi biến âm thành はっさい; 20 tuổi đọc đặc biệt là はたち (không có さい).',
  },
  {
    id: 'tc3',
    label: '四日 (ngày 4) vs 八日 (ngày 8)',
    questionHint: 'Âm ngắt ngắn gọn vs trường âm kéo dài',
    optionA: '4: ようか ・ 8: よっか',
    optionB: '4: よっか ・ 8: ようか',
    correct: 'B',
    explanation: 'Ngày 4 là よっか (yokka - âm ngắt); ngày 8 là ようか (youka - trường âm).',
  },
  {
    id: 'tc4',
    label: '十四日 (ngày 14) & 二十四日 (ngày 24)',
    questionHint: 'Ngày đuôi 4 đặc biệt',
    optionA: 'じゅうよっか ・ にじゅうよっか',
    optionB: 'じゅうよんにち ・ にじゅうよんにち',
    correct: 'A',
    explanation: 'Ngày 14 và 24 giữ nguyên đuôi よっか của ngày 4.',
  },
  {
    id: 'tc5',
    label: '十七日 (ngày 17) & 十九日 (ngày 19)',
    questionHint: 'Hai cặp đọc số 7 (しち) và 9 (く) bị sót trong bảng PDF Trang 9',
    optionA: 'じゅうしちにち ・ じゅうくにち',
    optionB: 'じゅうななにち ・ じゅうきゅうにち',
    correct: 'A',
    explanation: 'Ngày 17, 27 đọc しち (じゅうしちにち); ngày 19, 29 bắt buộc đọc く (じゅうくにち).',
  },
  {
    id: 'tc6',
    label: '四月 (Tháng 4) ・ 七月 (Tháng 7) ・ 九月 (Tháng 9)',
    questionHint: 'Bộ 3 tháng đặc biệt bắt buộc thuộc lòng',
    optionA: 'よんがつ ・ なながつ ・ きゅうがつ',
    optionB: 'しがつ ・ しちがつ ・ くがつ',
    correct: 'B',
    explanation: 'Tháng 4 đọc しがつ, tháng 7 đọc しちがつ, tháng 9 đọc くがつ.',
  },
];

export const JIKOSHOUKAI_BUG_SEGMENTS: BugSegment[] = [
  { id: 'b1', text: 'はじめまして。', isBug: false },
  { id: 'b2', text: 'わたしは ミンです。', isBug: false },
  {
    id: 'b3',
    text: 'ベトナムの じんです。',
    isBug: true,
    fixedText: 'ベトナムじんです。',
    explanation: 'Quốc tịch ghép trực tiếp [Quốc gia] + じん, KHÔNG dùng trợ từ の ở giữa (bẫy Câu 19).',
  },
  {
    id: 'b4',
    text: 'わたしは せんせいです。',
    isBug: true,
    fixedText: 'わたしは きょうしです。',
    explanation: 'Khi tự giới thiệu nghề nghiệp bản thân là giáo viên phải dùng きょうし, không dùng せんせい (bẫy Trang 4).',
  },
  {
    id: 'b5',
    text: 'はたち さいです。',
    isBug: true,
    fixedText: 'はたちです。',
    explanation: 'Riêng 20 tuổi đọc là はたち và KHÔNG thêm đuôi さい (vá lỗi khung điền Trang 13 & 15).',
  },
  {
    id: 'b6',
    text: 'わたしの たんじょうびは じゅうにがつ ようかにちです。',
    isBug: true,
    fixedText: 'わたしの たんじょうびは じゅうにがつ ようかです。',
    explanation: 'Ngày 8 đọc đặc biệt là ようか, KHÔNG gắn thêm にち ở cuối (vá lỗi công thức Trang 8/15, khớp Câu 18).',
  },
  { id: 'b7', text: 'どうぞ よろしく おねがいします。', isBug: false },
];
