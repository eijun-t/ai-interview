# Database Schema Documentation

新卒就活生向けAI面接アプリのデータベーススキーマ設計です。

## テーブル構成

### 1. users
新卒就活生のプロフィール情報を管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | Supabase auth.users.id との外部キー |
| email | TEXT | メールアドレス |
| full_name | TEXT | フルネーム |
| avatar_url | TEXT | プロフィール画像URL |
| university | TEXT | 大学名 |
| faculty | TEXT | 学部名 |
| major | TEXT | 専攻・学科 |
| graduation_year | INTEGER | 卒業予定年 |
| club_activities | TEXT | 部活・サークル活動 |
| part_time_jobs | TEXT | アルバイト経験 |
| study_abroad_experience | TEXT | 留学経験 |
| language_skills | TEXT | 語学スキル |
| certifications | TEXT | 資格・検定 |
| interests | TEXT | 趣味・興味 |

### 2. industries
業界情報を管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | 主キー |
| name | TEXT | 業界名 |
| description | TEXT | 業界説明 |
| keywords | TEXT | キーワード（カンマ区切り） |

### 3. questions
面接質問プールを管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | 主キー |
| question_text | TEXT | 質問文 |
| category | TEXT | カテゴリ（自己紹介、志望動機など） |
| difficulty_level | INTEGER | 難易度（1-5） |
| tags | TEXT | タグ（カンマ区切り） |
| industry_id | UUID | 業界ID（外部キー） |

### 4. question_templates
業界別質問テンプレートを管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | 主キー |
| template_name | TEXT | テンプレート名 |
| industry_id | UUID | 業界ID（外部キー） |
| question_ids | UUID[] | 質問IDの配列 |
| description | TEXT | テンプレート説明 |

### 5. interview_sessions
面接セッション情報を管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（外部キー） |
| session_name | TEXT | セッション名 |
| status | session_status | ステータス（pending/in_progress/completed/cancelled） |
| started_at | TIMESTAMP | 開始日時 |
| ended_at | TIMESTAMP | 終了日時 |
| industry_id | UUID | 業界ID（外部キー） |
| template_id | UUID | テンプレートID（外部キー） |
| overall_score | DECIMAL(3,2) | 総合スコア（0-10） |
| feedback | TEXT | 総合フィードバック |

### 6. session_qa_histories
面接中のQ&A履歴を管理

| カラム名 | 型 | 説明 |
|---------|---------|---------|
| id | UUID | 主キー |
| session_id | UUID | セッションID（外部キー） |
| question_id | UUID | 質問ID（外部キー） |
| question_text | TEXT | 質問文（履歴保存用） |
| user_answer | TEXT | ユーザー回答 |
| ai_feedback | TEXT | AIフィードバック |
| score | DECIMAL(3,2) | 回答スコア（0-10） |
| response_time | INTEGER | 回答時間（秒） |
| order_index | INTEGER | 質問順序 |

## Row Level Security (RLS) ポリシー

### ユーザーデータ保護
- `users`: ユーザーは自分のプロフィールのみアクセス可能
- `interview_sessions`: ユーザーは自分のセッションのみアクセス可能
- `session_qa_histories`: ユーザーは自分のセッション履歴のみアクセス可能

### 公開データ
- `industries`: 全ユーザーが読み取り可能
- `questions`: 全ユーザーが読み取り可能
- `question_templates`: 全ユーザーが読み取り可能

## マイグレーション実行方法

1. Supabase CLIを使用する場合：
```bash
supabase db push
```

2. Supabase Dashboardで直接実行する場合：
   - SQL Editorで `001_initial_schema.sql` の内容を実行
   - 続いて `002_seed_data.sql` の内容を実行

## インデックス

パフォーマンス最適化のため、以下のインデックスが作成されます：
- `users.email`
- `questions.category`
- `questions.industry_id`
- `interview_sessions.user_id`
- `interview_sessions.status`
- `session_qa_histories.session_id`
- `session_qa_histories(session_id, order_index)`

## サンプルデータ

初期セットアップ時に以下のサンプルデータが挿入されます：
- 6つの主要業界（IT、金融、商社、メーカー、コンサル、広告）
- 基本的な面接質問セット
- 業界別質問テンプレート

## 今後の拡張予定

- 質問の多言語対応
- AI面接官の個性設定
- 面接録画機能
- 詳細な分析・レポート機能