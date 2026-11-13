import type { QuizAnswerEntry } from '../types/lesson';

/**
 * Fallback answer key used ONLY when Supabase env vars are not configured (Local Demo Mode).
 * In Live Mode (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY), grading executes exclusively
 * inside Postgres SECURITY DEFINER RPC `submit_quiz_attempt`.
 */
export const LOCAL_DEMO_ANSWER_KEY: QuizAnswerEntry[] = [
  { questionId: 1, correctChoice: 'B', explanation: 'Trợ từ chủ đề は (đọc là wa) đứng sau chủ ngữ わたし để giới thiệu quốc tịch: わたしは ベトナムじんです。' },
  { questionId: 2, correctChoice: 'C', explanation: 'Trợ từ sở hữu の nối đại từ わたし với danh từ なまえ: わたしの なまえ (Tên của tôi).' },
  { questionId: 3, correctChoice: 'C', explanation: 'Trợ từ も (cũng) thay thế hoàn toàn trợ từ は khi đối tượng thứ hai có cùng thuộc tính với đối tượng trước đó.' },
  { questionId: 4, correctChoice: 'C', explanation: 'Mẫu phủ định lịch sự trong giao tiếp hàng ngày là じゃありません (Tôi không phải là giáo viên).' },
  { questionId: 5, correctChoice: 'B', explanation: 'Thêm trợ từ nghi vấn か vào cuối câu khẳng định です để tạo câu hỏi Có/Không: ですか。' },
  { questionId: 6, correctChoice: 'B', explanation: 'Khi đối phương nói はじめまして。どうぞよろしくおねがいします, câu đáp lại chuẩn là こちらこそ、よろしくおねがいします。' },
  { questionId: 7, correctChoice: 'A', explanation: 'おくには どちらですか hỏi quê hương/quốc gia → trả lời bằng tên nước: ベトナムです。' },
  { questionId: 8, correctChoice: 'B', explanation: 'おなまえは なんですか hỏi tên → trả lời trực tiếp tên + です: アンです。' },
  { questionId: 9, correctChoice: 'C', explanation: '20 tuổi đọc đặc biệt là はたち (không đọc là にじゅうさい và không thêm đuôi さい).' },
  { questionId: 10, correctChoice: 'A', explanation: 'Câu đáp lại lịch sự cho ありがとうございます (Cảm ơn) là どういたしまして (Không có gì).' },
  { questionId: 11, correctChoice: 'D', explanation: '1 tuổi có biến âm ngắt (っ): いち + さい → いっさい.' },
  { questionId: 12, correctChoice: 'A', explanation: '8 tuổi biến âm thành はっさい; 20 tuổi là ngoại lệ đặc biệt はたち.' },
  { questionId: 13, correctChoice: 'D', explanation: 'Ngày 4 đọc là よっか (âm ngắt, tránh nhầm với ngày 8 ようか); ngày 14 đọc là じゅうよっか.' },
  { questionId: 14, correctChoice: 'C', explanation: 'Ngày 20 đọc đặc biệt là はつか; ngày 24 đọc là にじゅうよっか.' },
  { questionId: 15, correctChoice: 'A', explanation: '3 tháng đọc đặc biệt bắt buộc học thuộc: Tháng 4 しがつ, Tháng 7 しちがつ, Tháng 9 くがつ.' },
  { questionId: 16, correctChoice: 'D', explanation: 'Trật tự chuẩn [Chủ ngữ] は [Vị ngữ] です → わたしは ベトナムじんです。' },
  { questionId: 17, correctChoice: 'A', explanation: 'Trật tự sở hữu + chủ đề + vị ngữ → わたしの なまえは アンです。' },
  { questionId: 18, correctChoice: 'B', explanation: 'Tiếng Nhật đặt Tháng trước – Ngày sau, và ngày đặc biệt ようか KHÔNG thêm にち ở cuối → わたしの たんじょうびは じゅうにがつ ようかです。' },
  { questionId: 19, correctChoice: 'C', explanation: 'Cấu trúc quốc tịch ghép trực tiếp [Tên nước] + じん (ベトナムじん), KHÔNG dùng trợ từ の ở giữa.' },
  { questionId: 20, correctChoice: 'A', explanation: 'Đánh dấu chủ đề câu dùng trợ từ は (わたしの がくせいです mang nghĩa sai là "học sinh của tôi").' },
];
