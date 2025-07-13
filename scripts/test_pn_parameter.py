import requests
from bs4 import BeautifulSoup

def test_pn_parameter():
    """Test the pn parameter for pagination"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Test pn parameter
    for page in range(1, 6):
        url = f"https://job.rikunabi.com/2026/s/?pn={page}"
        print(f"\n=== Testing pn={page}: {url} ===")
        
        try:
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for company links
            links = soup.find_all('a', href=True)
            company_links = [link for link in links if '/2026/company/r' in link['href'] and '/seminars/' not in link['href'] and '/entries/' not in link['href']]
            
            company_names = [link.get_text(strip=True) for link in company_links[:3]]
            print(f"Found {len(company_links)} company links")
            print(f"First 3 companies: {company_names}")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_pn_parameter()