import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase

def check_progress():
    """Check the current progress of company scraping"""
    
    try:
        # Get total count of companies
        result = supabase.table('companies').select('*', count='exact').execute()
        total_companies = len(result.data)
        
        print(f"Total companies in database: {total_companies}")
        
        # Get companies with industry data (stored in description)
        result_with_industry = supabase.table('companies').select('*').not_.is_('description', None).execute()
        companies_with_industry = len(result_with_industry.data)
        
        print(f"Companies with industry data: {companies_with_industry}")
        
        # Get companies with location data
        result_with_location = supabase.table('companies').select('*').not_.is_('location', None).execute()
        companies_with_location = len(result_with_location.data)
        
        print(f"Companies with location data: {companies_with_location}")
        
        # Show some sample data
        print("\n=== Sample Companies ===")
        sample_result = supabase.table('companies').select('name, description, location').limit(10).execute()
        for company in sample_result.data:
            print(f"- {company['name']}")
            if company.get('description'):
                print(f"  Description: {company['description']}")
            if company.get('location'):
                print(f"  Location: {company['location']}")
            print()
        
        # Calculate progress percentage
        progress = (total_companies / 11976) * 100
        print(f"Progress: {progress:.1f}% ({total_companies}/11,976)")
        
    except Exception as e:
        print(f"Error checking progress: {e}")

if __name__ == "__main__":
    check_progress()