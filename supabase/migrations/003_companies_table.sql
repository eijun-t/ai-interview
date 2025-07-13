-- Enable trigram extension for fuzzy search (must be first)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    name_kana TEXT,
    industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
    description TEXT,
    employee_count TEXT,
    location TEXT,
    website_url TEXT,
    source_url TEXT,
    UNIQUE(name)
);

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_name_kana ON public.companies(name_kana);
CREATE INDEX IF NOT EXISTS idx_companies_industry_id ON public.companies(industry_id);

-- Create GIN index for full-text search (supporting partial matches)
CREATE INDEX IF NOT EXISTS idx_companies_name_gin ON public.companies USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_name_kana_gin ON public.companies USING gin(name_kana gin_trgm_ops);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - companies are public read-only data
CREATE POLICY "Anyone can view companies" ON public.companies
    FOR SELECT USING (true);

-- Create policy for inserting companies (admin/system only)
-- This will be used by scraping scripts with service role key
CREATE POLICY "Service role can manage companies" ON public.companies
    FOR ALL USING (true);