import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase

def add_industry_text_column():
    """Add a temporary industry_text column to store scraped industry data"""
    
    try:
        # Add industry_text column to companies table
        supabase.rpc('raw_sql', {
            'query': 'ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry_text TEXT;'
        }).execute()
        
        print("Added industry_text column to companies table")
        
    except Exception as e:
        print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_industry_text_column()