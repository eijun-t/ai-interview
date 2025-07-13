import requests
from bs4 import BeautifulSoup

def analyze_page_structure():
    """Analyze the HTML structure of Rikunabi page"""
    url = "https://job.rikunabi.com/2026/s/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Look for company listings
    print("=== Page Title ===")
    print(soup.title.get_text() if soup.title else "No title")
    
    print("\n=== Potential Company Container Classes ===")
    # Look for common container patterns
    for class_name in ['company', 'corp', 'item', 'list', 'card', 'box']:
        elements = soup.find_all(attrs={'class': lambda x: x and class_name in ' '.join(x).lower()})
        if elements:
            print(f"Found {len(elements)} elements with '{class_name}' in class")
            if elements:
                print(f"  Example: {elements[0].get('class')}")
    
    print("\n=== Links ===")
    links = soup.find_all('a', href=True)
    company_links = [link for link in links if '/2026/company/' in link['href'] and link['href'] != 'https://job.rikunabi.com/2026/company/']
    print(f"Found {len(company_links)} company profile links")
    if company_links:
        for i, link in enumerate(company_links[:5]):
            print(f"  {i+1}: {link['href']}")
            print(f"     Text: {link.get_text(strip=True)}")
    
    print("\n=== Divs with data attributes ===")
    divs_with_data = soup.find_all('div', attrs={'data-': True})
    for div in divs_with_data[:5]:
        print(f"  Attributes: {div.attrs}")
    
    print("\n=== Script tags (for JSON data) ===")
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string and ('company' in script.string.lower() or 'corp' in script.string.lower()):
            print(f"  Found potential data in script: {script.string[:200]}...")
            break

if __name__ == "__main__":
    analyze_page_structure()