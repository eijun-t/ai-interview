import requests
from bs4 import BeautifulSoup
import re

def investigate_pagination():
    """Investigate Rikunabi pagination mechanism"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Test different page parameters
    test_urls = [
        "https://job.rikunabi.com/2026/s/",
        "https://job.rikunabi.com/2026/s/?page=2",
        "https://job.rikunabi.com/2026/s/?p=2", 
        "https://job.rikunabi.com/2026/s/?offset=100",
        "https://job.rikunabi.com/2026/s/?start=100",
        "https://job.rikunabi.com/2026/s/?pageNo=2"
    ]
    
    for url in test_urls:
        print(f"\n=== Testing URL: {url} ===")
        try:
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for company links
            links = soup.find_all('a', href=True)
            company_links = [link for link in links if '/2026/company/r' in link['href'] and '/seminars/' not in link['href'] and '/entries/' not in link['href']]
            
            company_names = [link.get_text(strip=True) for link in company_links[:5]]
            print(f"Found {len(company_links)} company links")
            print(f"First 5 companies: {company_names}")
            
            # Look for pagination elements
            pagination_elements = soup.find_all(['a', 'span', 'div'], string=re.compile(r'次|page|ページ|→'))
            print(f"Pagination elements: {len(pagination_elements)}")
            for elem in pagination_elements[:3]:
                if elem.get('href'):
                    print(f"  Link: {elem['href']}")
                else:
                    print(f"  Text: {elem.get_text(strip=True)}")
            
            # Look for JavaScript with pagination info
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and ('page' in script.string.lower() or 'offset' in script.string.lower()):
                    # Extract relevant parts
                    script_text = script.string
                    if 'page' in script_text:
                        print(f"Found pagination in script: {script_text[:200]}...")
                        break
                        
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    investigate_pagination()