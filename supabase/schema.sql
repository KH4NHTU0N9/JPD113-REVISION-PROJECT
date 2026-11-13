-- JPD113 Bai 1 Revision & Live Scoreboard Schema
-- Run this entire script once in Supabase SQL Editor.

-- 1. Answer key table: completely hidden from anon/authenticated clients
create table if not exists public.quiz_answer_key (
  question_id integer primary key check (question_id between 1 and 20),
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D')),
  explanation text not null
);

alter table public.quiz_answer_key enable row level security;
revoke all on public.quiz_answer_key from public, anon, authenticated;

insert into public.quiz_answer_key (question_id, correct_choice, explanation)
values
  (1, 'B', 'Trợ từ chủ đề は (đọc là wa) đứng sau chủ ngữ わたし để giới thiệu quốc tịch: わたしは ベトナムじんです。'),
  (2, 'C', 'Trợ từ sở hữu の nối đại từ わたし với danh từ なまえ: わたしの なまえ (Tên của tôi).'),
  (3, 'C', 'Trợ từ も (cũng) thay thế hoàn toàn trợ từ は khi đối tượng thứ hai có cùng thuộc tính với đối tượng trước đó.'),
  (4, 'C', 'Mẫu phủ định lịch sự trong giao tiếp hàng ngày là じゃありません (Tôi không phải là giáo viên).'),
  (5, 'B', 'Thêm trợ từ nghi vấn か vào cuối câu khẳng định です để tạo câu hỏi Có/Không: ですか。'),
  (6, 'B', 'Khi đối phương nói はじめまして。どうぞよろしくおねがいします, câu đáp lại chuẩn là こちらこそ、よろしくおねがいします。'),
  (7, 'A', 'おくには どちらですか hỏi quê hương/quốc gia → trả lời bằng tên nước: ベトナムです。'),
  (8, 'B', 'おなまえは なんですか hỏi tên → trả lời trực tiếp tên + です: アンです。'),
  (9, 'C', '20 tuổi đọc đặc biệt là はたち (không đọc là にじゅうさい và không thêm đuôi さい).'),
  (10, 'A', 'Câu đáp lại lịch sự cho ありがとうございます (Cảm ơn) là どういたしまして (Không có gì).'),
  (11, 'D', '1 tuổi có biến âm ngắt (っ): いち + さい → いっさい.'),
  (12, 'A', '8 tuổi biến âm thành はっさい; 20 tuổi là ngoại lệ đặc biệt はたち.'),
  (13, 'D', 'Ngày 4 đọc là よっか (âm ngắt, tránh nhầm với ngày 8 ようか); ngày 14 đọc là じゅうよっか.'),
  (14, 'C', 'Ngày 20 đọc đặc biệt là はつか; ngày 24 đọc là にじゅうよっか.'),
  (15, 'A', '3 tháng đọc đặc biệt bắt buộc học thuộc: Tháng 4 しがつ, Tháng 7 しちがつ, Tháng 9 くがつ.'),
  (16, 'D', 'Trật tự chuẩn [Chủ ngữ] は [Vị ngữ] です → わたしは ベトナムじんです。'),
  (17, 'A', 'Trật tự sở hữu + chủ đề + vị ngữ → わたしの なまえは アンです。'),
  (18, 'B', 'Tiếng Nhật đặt Tháng trước – Ngày sau, và ngày đặc biệt ようか KHÔNG thêm にち ở cuối → わたしの たんじょうびは じゅうにがつ ようかです。'),
  (19, 'C', 'Cấu trúc quốc tịch ghép trực tiếp [Tên nước] + じん (ベトナムじん), KHÔNG dùng trợ từ の ở giữa.'),
  (20, 'A', 'Đánh dấu chủ đề câu dùng trợ từ は (わたしの がくせいです mang nghĩa sai là "học sinh của tôi").')
on conflict (question_id) do update
set
  correct_choice = excluded.correct_choice,
  explanation = excluded.explanation;

-- 2. Private quiz attempts table (server-side timer & anti-tamper state)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(trim(student_name)) between 2 and 60),
  student_code text not null check (char_length(trim(student_code)) between 2 and 24),
  attempt_number integer not null check (attempt_number >= 1),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  started_at timestamptz not null default clock_timestamp(),
  submitted_at timestamptz,
  duration_ms integer,
  score integer,
  total_questions integer not null default 20,
  answers jsonb,
  unique (student_code, attempt_number)
);

create unique index if not exists idx_quiz_attempts_active_code
  on public.quiz_attempts (student_code)
  where status = 'in_progress';

alter table public.quiz_attempts enable row level security;
revoke all on public.quiz_attempts from public, anon, authenticated;

-- 3. Public read-only scoreboard table populated only by submit_quiz_attempt RPC
create table if not exists public.scoreboard_entries (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.quiz_attempts(id) on delete cascade,
  student_name text not null,
  student_code text not null,
  attempt_number integer not null,
  score integer not null,
  total_questions integer not null,
  duration_ms integer not null,
  submitted_at timestamptz not null
);

create index if not exists idx_scoreboard_ranking
  on public.scoreboard_entries (attempt_number asc, score desc, duration_ms asc, submitted_at asc);

alter table public.scoreboard_entries enable row level security;
revoke all on public.scoreboard_entries from public, anon, authenticated;
grant select on public.scoreboard_entries to anon, authenticated;

drop policy if exists "Allow public read scoreboard" on public.scoreboard_entries;
create policy "Allow public read scoreboard"
  on public.scoreboard_entries
  for select
  to anon, authenticated
  using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'scoreboard_entries'
  ) then
    alter publication supabase_realtime add table public.scoreboard_entries;
  end if;
end $$;

-- 4. RPC: Start attempt (records authoritative server started_at)
create or replace function public.start_quiz_attempt(
  p_student_name text,
  p_student_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := normalize(
    regexp_replace(
      regexp_replace(coalesce(p_student_name, ''), E'[\\u200B-\\u200D\\uFEFF\\u0000-\\u001F\\u007F]', '', 'g'),
      '\s+',
      ' ',
      'g'
    ),
    NFC
  );
  v_code text := upper(
    regexp_replace(
      regexp_replace(coalesce(p_student_code, ''), E'[\\u200B-\\u200D\\uFEFF\\u0000-\\u001F\\u007F]', '', 'g'),
      '\s+',
      '',
      'g'
    )
  );
  v_next_attempt integer;
  v_attempt public.quiz_attempts%rowtype;
begin
  v_name := trim(v_name);

  if char_length(v_name) < 2 or char_length(v_name) > 60 then
    raise exception 'Tên phải từ 2 đến 60 ký tự.';
  end if;

  if v_code !~ '^[A-Z0-9_-]{2,24}$' then
    raise exception 'MSSV hoặc mã định danh phải từ 2 đến 24 ký tự (chữ không dấu, số, - hoặc _).';
  end if;

  -- Serialize concurrent starts for the same student_code
  perform pg_advisory_xact_lock(hashtext('jpd113_attempt_' || v_code));

  -- Prevent opening a 2nd attempt while attempt #1 (or any prior attempt) is still in progress:
  -- resumes the active attempt smoothly instead of allowing answer-key peeking via attempt #2.
  select *
  into v_attempt
  from public.quiz_attempts
  where student_code = v_code
    and status = 'in_progress'
  order by attempt_number asc
  limit 1;

  if found then
    if lower(normalize(v_attempt.student_name, NFC)) <> lower(v_name) then
      raise exception 'MSSV % đang có một lượt làm bài chưa nộp dưới tên khác. Hãy nhập đúng họ tên ban đầu đã đăng ký để tiếp tục.', v_code;
    end if;

    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'attempt_number', v_attempt.attempt_number,
      'student_name', v_attempt.student_name,
      'student_code', v_attempt.student_code,
      'started_at', v_attempt.started_at,
      'server_now', clock_timestamp()
    );
  end if;

  select coalesce(max(attempt_number), 0) + 1
  into v_next_attempt
  from public.quiz_attempts
  where student_code = v_code;

  insert into public.quiz_attempts (
    student_name,
    student_code,
    attempt_number,
    total_questions
  )
  values (
    v_name,
    v_code,
    v_next_attempt,
    20
  )
  returning * into v_attempt;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'attempt_number', v_attempt.attempt_number,
    'student_name', v_attempt.student_name,
    'student_code', v_attempt.student_code,
    'started_at', v_attempt.started_at,
    'server_now', clock_timestamp()
  );
end;
$$;

-- 5. RPC: Grade and submit attempt atomically (idempotent on network retries)
create or replace function public.submit_quiz_attempt(
  p_attempt_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.quiz_attempts%rowtype;
  v_raw_answers jsonb := case
    when p_answers is not null and jsonb_typeof(p_answers) = 'object' then p_answers
    else '{}'::jsonb
  end;
  v_clean_answers jsonb := '{}'::jsonb;
  v_now timestamptz := clock_timestamp();
  v_raw_duration_ms bigint;
  v_duration_ms integer;
  v_score integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_key record;
  v_selected text;
  v_is_correct boolean;
begin
  if p_attempt_id is null then
    raise exception 'Thiếu attempt_id hợp lệ.';
  end if;

  select *
  into v_attempt
  from public.quiz_attempts
  where id = p_attempt_id
  for update;

  if not found then
    raise exception 'Không tìm thấy lượt làm bài.';
  end if;

  if v_attempt.status = 'submitted' then
    -- Idempotent replay for mobile network retries
    v_clean_answers := coalesce(v_attempt.answers, '{}'::jsonb);
    for v_key in
      select question_id, correct_choice, explanation
      from public.quiz_answer_key
      order by question_id asc
    loop
      v_selected := v_clean_answers ->> (v_key.question_id::text);
      v_is_correct := (v_selected is not null and v_selected = v_key.correct_choice);
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'question_id', v_key.question_id,
          'selected_choice', v_selected,
          'correct_choice', v_key.correct_choice,
          'is_correct', v_is_correct,
          'explanation', v_key.explanation
        )
      );
    end loop;

    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'attempt_number', v_attempt.attempt_number,
      'student_name', v_attempt.student_name,
      'student_code', v_attempt.student_code,
      'score', v_attempt.score,
      'total_questions', v_attempt.total_questions,
      'duration_ms', v_attempt.duration_ms,
      'submitted_at', v_attempt.submitted_at,
      'already_submitted', true,
      'results', v_results
    );
  end if;

  v_raw_duration_ms := greatest(
    0::bigint,
    floor(extract(epoch from (v_now - v_attempt.started_at)) * 1000)::bigint
  );
  v_duration_ms := least(2147483647::bigint, v_raw_duration_ms)::integer;

  for v_key in
    select question_id, correct_choice, explanation
    from public.quiz_answer_key
    order by question_id asc
  loop
    v_selected := v_raw_answers ->> (v_key.question_id::text);
    if v_selected is null or v_selected not in ('A', 'B', 'C', 'D') then
      v_selected := null;
    else
      v_clean_answers := v_clean_answers || jsonb_build_object(v_key.question_id::text, v_selected);
    end if;

    v_is_correct := (v_selected is not null and v_selected = v_key.correct_choice);
    if v_is_correct then
      v_score := v_score + 1;
    end if;

    v_results := v_results || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_key.question_id,
        'selected_choice', v_selected,
        'correct_choice', v_key.correct_choice,
        'is_correct', v_is_correct,
        'explanation', v_key.explanation
      )
    );
  end loop;

  update public.quiz_attempts
  set
    status = 'submitted',
    submitted_at = v_now,
    duration_ms = v_duration_ms,
    score = v_score,
    answers = v_clean_answers
  where id = v_attempt.id;

  insert into public.scoreboard_entries (
    attempt_id,
    student_name,
    student_code,
    attempt_number,
    score,
    total_questions,
    duration_ms,
    submitted_at
  )
  values (
    v_attempt.id,
    v_attempt.student_name,
    v_attempt.student_code,
    v_attempt.attempt_number,
    v_score,
    v_attempt.total_questions,
    v_duration_ms,
    v_now
  )
  on conflict (attempt_id) do nothing;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'attempt_number', v_attempt.attempt_number,
    'student_name', v_attempt.student_name,
    'student_code', v_attempt.student_code,
    'score', v_score,
    'total_questions', v_attempt.total_questions,
    'duration_ms', v_duration_ms,
    'submitted_at', v_now,
    'already_submitted', false,
    'results', v_results
  );
end;
$$;

revoke all on function public.start_quiz_attempt(text, text) from public;
grant execute on function public.start_quiz_attempt(text, text) to anon, authenticated;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to anon, authenticated;
