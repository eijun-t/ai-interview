-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE session_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    university TEXT,
    faculty TEXT,
    major TEXT,
    graduation_year INTEGER,
    club_activities TEXT,
    part_time_jobs TEXT,
    study_abroad_experience TEXT,
    language_skills TEXT,
    certifications TEXT,
    interests TEXT,
    PRIMARY KEY (id)
);

-- Create industries table
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    keywords TEXT
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    tags TEXT,
    industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL
);

-- Create question_templates table
CREATE TABLE IF NOT EXISTS public.question_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    template_name TEXT NOT NULL,
    industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
    question_ids UUID[] NOT NULL,
    description TEXT
);

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_name TEXT,
    status session_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.question_templates(id) ON DELETE SET NULL,
    overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
    feedback TEXT
);

-- Create session_qa_histories table
CREATE TABLE IF NOT EXISTS public.session_qa_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    ai_feedback TEXT,
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
    response_time INTEGER, -- in seconds
    order_index INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_industry_id ON public.questions(industry_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_qa_histories_session_id ON public.session_qa_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_histories_order_index ON public.session_qa_histories(session_id, order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_interview_sessions
    BEFORE UPDATE ON public.interview_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_qa_histories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Industries: Public read access
CREATE POLICY "Anyone can view industries" ON public.industries
    FOR SELECT USING (true);

-- Questions: Public read access
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

-- Question Templates: Public read access
CREATE POLICY "Anyone can view question templates" ON public.question_templates
    FOR SELECT USING (true);

-- Interview Sessions: Users can only access their own sessions
CREATE POLICY "Users can view own interview sessions" ON public.interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions" ON public.interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions" ON public.interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Session QA Histories: Users can only access their own session histories
CREATE POLICY "Users can view own session qa histories" ON public.session_qa_histories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE id = session_qa_histories.session_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own session qa histories" ON public.session_qa_histories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE id = session_qa_histories.session_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own session qa histories" ON public.session_qa_histories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE id = session_qa_histories.session_id 
            AND user_id = auth.uid()
        )
    );