import type { VocabItem } from '../types/lesson';

export const HOBBIES: VocabItem[] = [
  { id: 'h1', kanji: '趣味', kana: 'しゅみ', romaji: 'shumi', meaning: 'Sở thích' },
  { id: 'h2', kanji: '読書', kana: 'どくしょ', romaji: 'dokusho', meaning: 'Đọc sách' },
  { id: 'h3', kanji: '旅行', kana: 'りょこう', romaji: 'ryokou', meaning: 'Du lịch' },
  { id: 'h4', kanji: '映画', kana: 'えいが', romaji: 'eiga', meaning: 'Phim ảnh' },
  { id: 'h5', kanji: '音楽', kana: 'おんがく', romaji: 'ongaku', meaning: 'Âm nhạc' },
  { id: 'h6', kanji: 'スポーツ', kana: 'スポーツ', romaji: 'supootsu', meaning: 'Thể thao' },
  { id: 'h7', kanji: 'サッカー', kana: 'サッカー', romaji: 'sakkaa', meaning: 'Bóng đá' },
  { id: 'h8', kanji: 'テニス', kana: 'テニス', romaji: 'tenisu', meaning: 'Quần vợt' },
  { id: 'h9', kanji: '料理', kana: 'りょうり', romaji: 'ryouri', meaning: 'Nấu ăn' },
  { id: 'h10', kanji: '水泳', kana: 'すいえい', romaji: 'suiei', meaning: 'Bơi lội' },
  { id: 'h11', kanji: '野球', kana: 'やきゅう', romaji: 'yakyuu', meaning: 'Bóng chày' },
  { id: 'h12', kanji: 'スキー', kana: 'スキー', romaji: 'sukii', meaning: 'Trượt tuyết' },
  { id: 'h13', kanji: 'スケート', kana: 'スケート', romaji: 'sukeeto', meaning: 'Trượt băng' },
  {
    id: 'h14',
    kanji: 'ピンポン',
    kana: 'ピンポン',
    romaji: 'pinpon',
    meaning: 'Bóng bàn',
    note: 'Cách viết theo slide bài giảng JPD113 trang 63.',
  },
];

export const HOBBY_STRUCTURES = [
  {
    title: 'Hỏi sở thích',
    jp: 'しゅみは なんですか。',
    romaji: 'Shumi wa nan desu ka?',
    vi: 'Sở thích của bạn là gì?',
  },
  {
    title: 'Trả lời 1 sở thích',
    jp: 'わたしの しゅみは ～です。',
    romaji: 'Watashi no shumi wa ~ desu.',
    vi: 'Sở thích của tôi là ~.',
  },
  {
    title: 'Nối 2 sở thích bằng trợ từ と',
    jp: 'わたしの しゅみは りょこうと えいがです。',
    romaji: 'Watashi no shumi wa ryokou to eiga desu.',
    vi: 'Sở thích của tôi là du lịch và phim ảnh.',
  },
];

export const JIKOSHOUKAI_SUMMARY_ROWS = [
  { label: 'Chào hỏi lần đầu', pattern: 'はじめまして。' },
  { label: 'Giới thiệu tên', pattern: 'わたしは [Tên] です。' },
  { label: 'Giới thiệu quốc tịch', pattern: '[Quốc gia] じんです。(không chèn の)' },
  { label: 'Giới thiệu trường học', pattern: '[Trường] の がくせいです。' },
  { label: 'Giới thiệu tuổi', pattern: '[Tuổi] さいです。(Riêng 20 tuổi: はたちです)' },
  { label: 'Giới thiệu sinh nhật', pattern: 'わたしの たんじょうびは [Tháng] [Ngày] です。(Tháng trước – Ngày sau)' },
  { label: 'Hỏi sinh nhật người khác', pattern: 'おたんじょうびは いつですか。' },
  { label: 'Hỏi sở thích', pattern: 'しゅみは なんですか。' },
  { label: 'Trả lời & nối 2 sở thích', pattern: 'わたしの しゅみは [A] と [B] です。' },
  { label: 'Kết thúc', pattern: 'どうぞ よろしく おねがいします。' },
  { label: 'Đáp lại lời đối phương', pattern: 'こちらこそ よろしく おねがいします。' },
];

export const PAKKU_SAMPLE = {
  title: 'Bài mẫu Jikoshoukai (Slide trang 68)',
  lines: [
    { jp: 'はじめまして。', romaji: 'Hajimemashite.', vi: 'Rất vui được gặp bạn.' },
    { jp: 'わたしは パックです。', romaji: 'Watashi wa Pakku desu.', vi: 'Tôi là Pak.' },
    { jp: 'かんこくじんです。', romaji: 'Kankokujin desu.', vi: 'Tôi là người Hàn Quốc.' },
    { jp: 'あおぞら にほんごがっこうの がくせいです。', romaji: 'Aozora nihongo gakkou no gakusei desu.', vi: 'Tôi là học viên trường tiếng Nhật Aozora.' },
    { jp: '２６さいです。', romaji: 'Nijuu-roku sai desu.', vi: 'Tôi 26 tuổi.' },
    { jp: 'しゅみは りょこうと えいがです。', romaji: 'Shumi wa ryokou to eiga desu.', vi: 'Sở thích của tôi là du lịch và phim ảnh.' },
    { jp: 'どうぞ よろしく おねがいします。', romaji: 'Douzo yoroshiku onegaishimasu.', vi: 'Rất mong được làm quen với bạn.' },
  ],
};
