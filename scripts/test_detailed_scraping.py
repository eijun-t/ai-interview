import requests
from bs4 import BeautifulSoup
import time
import sys
import os

# Add parent directory to path to import from src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase

def test_detailed_scraping():
    """Test detailed scraping on a few companies"""
    
    # Get a few companies from page 1
    url = "https://job.rikunabi.com/2026/s/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find company profile links
    links = soup.find_all('a', href=True)
    company_links = [link for link in links if '/2026/company/r' in link['href'] and '/seminars/' not in link['href'] and '/entries/' not in link['href']]
    
    # Test first 3 companies
    for i, link in enumerate(company_links[:3]):
        company_name = link.get_text(strip=True)
        company_url = f"https://job.rikunabi.com{link['href']}"
        
        print(f"\n=== Testing {i+1}: {company_name} ===")
        print(f"URL: {company_url}")
        
        # Get detailed information
        try:
            detail_response = requests.get(company_url, headers=headers)
            detail_soup = BeautifulSoup(detail_response.content, 'html.parser')
            
            # Debug: Check page structure
            print("=== Page Analysis ===")
            
            # Look for various patterns
            all_text = detail_soup.get_text()
            if '業種' in all_text:
                print("Found '業種' in page")
            if '本社所在地' in all_text:
                print("Found '本社所在地' in page")
            
            # Try different selectors
            dt_elements = detail_soup.find_all('dt')
            print(f"Found {len(dt_elements)} dt elements")
            
            # Look for tables or other structures
            tables = detail_soup.find_all('table')
            print(f"Found {len(tables)} tables")
            
            # Look for divs with specific classes
            divs = detail_soup.find_all('div', class_=True)
            industry_divs = [div for div in divs if '業種' in div.get_text()]
            print(f"Found {len(industry_divs)} divs containing '業種'")
            
            if industry_divs:
                print(f"Industry div text: {industry_divs[0].get_text()}")
            
            # Save a sample page for analysis
            if i == 0:
                with open('sample_company_page.html', 'w', encoding='utf-8') as f:
                    f.write(str(detail_soup))
            
            time.sleep(1)  # Be respectful
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_detailed_scraping()