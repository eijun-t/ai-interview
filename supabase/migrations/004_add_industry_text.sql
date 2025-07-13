-- Add industry_text column to companies table to store scraped industry data
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry_text TEXT;