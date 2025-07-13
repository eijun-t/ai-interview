import requests
from bs4 import BeautifulSoup
import time
import json
import os
import sys
from typing import List, Dict
import re

# Add parent directory to path to import from src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase_client import supabase

def scrape_company_page(page_num: int = 1) -> List[Dict]:
    """Scrape companies from a specific page"""
    url = f"https://job.rikunabi.com/2026/s/"
    params = {
        'pn': page_num
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        companies = []
        
        # Find company profile links
        links = soup.find_all('a', href=True)
        company_links = [link for link in links if '/2026/company/r' in link['href'] and '/seminars/' not in link['href'] and '/entries/' not in link['href']]
        
        for link in company_links:
            company_data = {}
            
            # Extract company name from link text
            company_name = link.get_text(strip=True)
            if company_name and company_name != '企業検索':
                company_data['name'] = company_name
                rikunabi_id = link['href'].split('/')[3]  # Extract company ID
                company_data['source_url'] = f"https://job.rikunabi.com{link['href']}"
                
                companies.append(company_data)
        
        return companies
        
    except requests.RequestException as e:
        print(f"Error fetching page {page_num}: {e}")
        return []

def scrape_company_details(company_url: str) -> Dict:
    """Scrape detailed information from a company's profile page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(company_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        details = {}
        
        # Look for industry and location information in divs containing specific text
        all_text = soup.get_text()
        all_divs = soup.find_all('div')
        
        # Extract industry from divs containing '業種'
        for div in all_divs:
            if '業種' in div.get_text():
                # Look for the next sibling or parent div that contains actual industry names
                parent = div.parent
                if parent:
                    industry_text = parent.get_text(strip=True)
                    # Extract just the industry part (after '業種')
                    if '業種' in industry_text:
                        industry_part = industry_text.split('業種')[1].split('本社')[0]
                        industry_part = re.sub(r'\s+', ' ', industry_part).strip()
                        if industry_part and len(industry_part) > 5:
                            details['description'] = f"業種: {industry_part}"
                            break
        
        # Extract location from divs containing '本社'
        for div in all_divs:
            if '本社' in div.get_text():
                parent = div.parent
                if parent:
                    location_text = parent.get_text(strip=True)
                    # Extract just the location part (after '本社')
                    if '本社' in location_text:
                        location_part = location_text.split('本社')[1].split('残り採用')[0].split('直近の')[0]
                        location_part = re.sub(r'\s+', ' ', location_part).strip()
                        if location_part and len(location_part) < 50:
                            details['location'] = location_part
                            break
        
        return details
        
    except requests.RequestException as e:
        print(f"Error fetching company details from {company_url}: {e}")
        return {}

def save_companies_to_supabase(companies: List[Dict]):
    """Save companies to Supabase with duplicate handling"""
    if not companies:
        return
    
    saved_count = 0
    for company in companies:
        try:
            # Check if company already exists
            existing = supabase.table('companies').select('id').eq('name', company['name']).execute()
            
            if not existing.data:
                # Company doesn't exist, insert it
                result = supabase.table('companies').insert(company).execute()
                saved_count += 1
            else:
                print(f"Company '{company['name']}' already exists, skipping")
                
        except Exception as e:
            print(f"Error saving company '{company.get('name', 'Unknown')}': {e}")
    
    if saved_count > 0:
        print(f"Saved {saved_count} new companies to database")

def main():
    """Main scraping function"""
    total_companies = 11976
    companies_per_page = 100
    total_pages = (total_companies + companies_per_page - 1) // companies_per_page
    start_page = 46  # Resume from page 46 (around 4500 companies)
    
    print(f"Resuming scraping from page {start_page}/{total_pages}")
    
    all_companies = []
    
    for page in range(start_page, total_pages + 1):
        print(f"Scraping page {page}/{total_pages}...")
        
        companies = scrape_company_page(page)
        
        if companies:
            # Enhance companies with detailed information
            enhanced_companies = []
            for company in companies:
                print(f"  Getting details for {company['name']}...")
                
                # Get detailed information
                details = scrape_company_details(company['source_url'])
                
                # Merge basic info with details
                enhanced_company = {**company, **details}
                enhanced_companies.append(enhanced_company)
                
                # Small delay between detail requests
                time.sleep(0.5)
            
            all_companies.extend(enhanced_companies)
            
            # Save in batches of 20 companies (smaller batches due to detailed scraping)
            if len(all_companies) >= 20:
                save_companies_to_supabase(all_companies)
                all_companies = []
        
        # Be respectful with delays
        time.sleep(1)
        
        # Full scraping enabled
    
    # Save remaining companies
    if all_companies:
        save_companies_to_supabase(all_companies)
    
    print("Scraping completed!")

if __name__ == "__main__":
    main()