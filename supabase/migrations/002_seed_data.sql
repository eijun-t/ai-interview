-- Insert sample industries
INSERT INTO public.industries (id, name, description, keywords) VALUES
(gen_random_uuid(), 'IT・ソフトウェア', '情報技術、ソフトウェア開発、システム開発に関する業界', 'プログラミング,システム開発,AI,機械学習,クラウド,データベース'),
(gen_random_uuid(), '金融', '銀行、証券、保険などの金融サービス業界', '銀行,証券,保険,投資,資産運用,フィンテック'),
(gen_random_uuid(), '商社・貿易', '総合商社、専門商社、国際貿易に関する業界', '貿易,輸出入,グローバル,資源,エネルギー,流通'),
(gen_random_uuid(), 'メーカー・製造業', '自動車、電機、化学、食品などの製造業界', '製造,生産,品質管理,研究開発,工場,技術'),
(gen_random_uuid(), 'コンサルティング', '経営コンサル、ITコンサル、戦略コンサルティング業界', '戦略,経営,問題解決,分析,提案,改善'),
(gen_random_uuid(), '広告・マーケティング', '広告代理店、デジタルマーケティング、PR業界', 'マーケティング,広告,ブランディング,PR,デジタル,SNS');

-- Insert sample questions
INSERT INTO public.questions (question_text, category, difficulty_level, tags) VALUES
-- 自己紹介・自己PR系
('自己紹介をお願いします。', '自己紹介', 1, '基本,導入'),
('あなたの強みを教えてください。', '自己PR', 2, '強み,アピール'),
('あなたの弱みを教えてください。', '自己PR', 2, '弱み,改善'),
('学生時代に最も力を入れたことを教えてください。', '学生時代', 3, '経験,成果,学び'),
('チームで取り組んだ経験について教えてください。', '学生時代', 3, 'チームワーク,協力,リーダーシップ'),

-- 志望動機・企業研究系
('なぜ弊社を志望するのですか？', '志望動機', 3, '志望理由,企業研究'),
('この業界を選んだ理由は何ですか？', '志望動機', 3, '業界研究,動機'),
('入社後にやりたいことを教えてください。', '将来像', 3, 'キャリア,目標,成長'),
('5年後の自分はどうなっていたいですか？', '将来像', 3, 'キャリアビジョン,長期目標'),

-- 価値観・人物像系
('困難に直面した時、どのように乗り越えますか？', '価値観', 4, '困難,解決,メンタル'),
('周りの人からどのような人だと言われますか？', '人物像', 2, '客観視,人間関係'),
('リーダーシップを発揮した経験はありますか？', '経験', 4, 'リーダーシップ,責任,成果'),

-- 業界別専門質問
('プログラミング経験について教えてください。', 'IT専門', 3, 'プログラミング,技術,開発'),
('金融業界についてどのような印象を持っていますか？', '金融専門', 3, '金融,業界理解,市場'),
('グローバルな環境での経験はありますか？', '商社専門', 3, 'グローバル,語学,文化'),
('品質管理についてどう考えますか？', 'メーカー専門', 4, '品質,管理,改善'),
('論理的思考力をアピールしてください。', 'コンサル専門', 4, '論理思考,分析,問題解決'),
('クリエイティブな発想力について教えてください。', '広告専門', 3, 'クリエイティブ,発想,企画');

-- Insert sample question templates
INSERT INTO public.question_templates (template_name, industry_id, question_ids, description)
SELECT 
    'IT・ソフトウェア基本面接',
    i.id,
    ARRAY(
        SELECT q.id FROM public.questions q 
        WHERE q.category IN ('自己紹介', '自己PR', '志望動機') OR q.tags LIKE '%プログラミング%'
        ORDER BY q.difficulty_level
        LIMIT 8
    ),
    'IT・ソフトウェア業界向けの基本的な面接質問セット'
FROM public.industries i WHERE i.name = 'IT・ソフトウェア';

INSERT INTO public.question_templates (template_name, industry_id, question_ids, description)
SELECT 
    '金融業界基本面接',
    i.id,
    ARRAY(
        SELECT q.id FROM public.questions q 
        WHERE q.category IN ('自己紹介', '自己PR', '志望動機') OR q.tags LIKE '%金融%'
        ORDER BY q.difficulty_level
        LIMIT 8
    ),
    '金融業界向けの基本的な面接質問セット'
FROM public.industries i WHERE i.name = '金融';

INSERT INTO public.question_templates (template_name, industry_id, question_ids, description)
SELECT 
    'コンサルティング業界基本面接',
    i.id,
    ARRAY(
        SELECT q.id FROM public.questions q 
        WHERE q.category IN ('自己紹介', '自己PR', '志望動機') OR q.tags LIKE '%論理思考%'
        ORDER BY q.difficulty_level
        LIMIT 8
    ),
    'コンサルティング業界向けの基本的な面接質問セット'
FROM public.industries i WHERE i.name = 'コンサルティング';