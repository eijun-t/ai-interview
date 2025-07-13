import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase

def add_industry_text_column():
    """Manually add industry_text column using SQL"""
    
    try:
        # Try to add the column directly
        result = supabase.table('companies').select('*').limit(1).execute()
        
        # Check if industry_text column exists
        if result.data:
            first_row = result.data[0]
            if 'industry_text' not in first_row:
                print("industry_text column doesn't exist - need to add it via SQL")
            else:
                print("industry_text column already exists")
        
        # Try to insert a test row to see current schema
        test_company = {
            'name': 'Test Company Schema Check',
            'industry_text': 'Test Industry',
            'location': 'Test Location'
        }
        
        try:
            result = supabase.table('companies').insert(test_company).execute()
            print("Successfully inserted test row with industry_text")
            
            # Clean up test row
            supabase.table('companies').delete().eq('name', 'Test Company Schema Check').execute()
            print("Cleaned up test row")
            
        except Exception as e:
            print(f"Schema test failed: {e}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_industry_text_column()