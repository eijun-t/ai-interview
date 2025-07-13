// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 業界カテゴリマッピング（マイナビ→既存industries）
const INDUSTRY_MAPPING = {
  'メーカー': 'メーカー・製造業',
  '商社': '商社・貿易', 
  '金融': '金融',
  'サービス・インフラ': 'IT・ソフトウェア',
  'マスコミ': '広告・マーケティング',
  'ソフトウェア・通信': 'IT・ソフトウェア',
  'コンサルティング・専門事務所': 'コンサルティング',
  '小売': '商社・貿易',
  '官公庁・公社・団体': 'その他'
};

async function getIndustryId(industryName) {
  const mappedName = INDUSTRY_MAPPING[industryName] || industryName;
  
  const { data, error } = await supabase
    .from('industries')
    .select('id')
    .eq('name', mappedName)
    .single();
    
  if (error) {
    console.log(`Industry not found: ${mappedName}`);
    return null;
  }
  
  return data.id;
}

async function scrapeMynaviCompanies() {
  console.log('Starting Mynavi scraping...');
  
  const browser = await chromium.launch({ 
    headless: false, // デバッグ用
    slowMo: 1000 // 1秒間隔
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // マイナビ企業検索ページにアクセス
    await page.goto('https://job.mynavi.jp/26/pc/corpinfo/displayCorpSearch/index?tab=corp');
    await page.waitForTimeout(3000);
    
    const companies = [];
    
    // 各業界カテゴリで検索
    const categories = ['メーカー', '商社', '金融', 'サービス・インフラ', 'ソフトウェア・通信'];
    
    for (const category of categories) {
      console.log(`Scraping category: ${category}`);
      
      try {
        // ページをリフレッシュ
        await page.goto('https://job.mynavi.jp/26/pc/corpinfo/displayCorpSearch/index?tab=corp');
        await page.waitForTimeout(3000);
        
        // カテゴリボタンをクリック
        console.log(`Clicking ${category} category...`);
        const categoryButton = await page.locator(`text=${category}`).first();
        await categoryButton.click();
        await page.waitForTimeout(3000);
        
        // 「すべて選択」ボタンを探してクリック
        console.log('Looking for すべて選択 button...');
        
        // まずページの全体構造を確認
        await page.waitForTimeout(2000);
        
        // 業界内の詳細カテゴリをすべて選択する新しいアプローチ
        const selectionResult = await page.evaluate((currentCategory) => {
          // まず現在選択されている業界配下のチェックボックスを探す
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          let relevantCheckboxes = [];
          
          // 業界カテゴリに関連するチェックボックスを特定
          checkboxes.forEach(checkbox => {
            const label = checkbox.parentNode?.textContent || '';
            const containerText = checkbox.closest('li')?.textContent || '';
            
            // このチェックボックスが現在の業界カテゴリに属するかチェック
            if (label || containerText) {
              relevantCheckboxes.push({
                element: checkbox,
                label: label.trim(),
                container: containerText.trim(),
                checked: checkbox.checked,
                name: checkbox.name,
                value: checkbox.value
              });
            }
          });
          
          console.log(`Found ${relevantCheckboxes.length} checkboxes for ${currentCategory}`);
          
          // すべてのチェックボックスを選択
          let checkedCount = 0;
          relevantCheckboxes.forEach((item, index) => {
            if (!item.element.checked) {
              item.element.checked = true;
              
              // 変更イベントを発火
              ['change', 'click', 'input'].forEach(eventType => {
                item.element.dispatchEvent(new Event(eventType, { 
                  bubbles: true, 
                  cancelable: true 
                }));
              });
              
              checkedCount++;
              console.log(`Checked box ${index + 1}: ${item.label || item.value}`);
            }
          });
          
          // さらに「すべて選択」ボタンも試す
          const selectAllButton = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent && el.textContent.includes('すべて選択') && 
            (el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick)
          );
          
          if (selectAllButton) {
            console.log('Found すべて選択 button, clicking...');
            try {
              if (selectAllButton.onclick) {
                selectAllButton.onclick();
              } else {
                selectAllButton.click();
              }
            } catch (e) {
              console.log('Error clicking すべて選択:', e.message);
            }
          }
          
          return {
            totalCheckboxes: relevantCheckboxes.length,
            checkedCount: checkedCount,
            selectAllButtonFound: !!selectAllButton
          };
        }, category);
        
        console.log('Selection result:', selectionResult);
        
        // DOM更新を待つ
        await page.waitForTimeout(2000);
        
        await page.waitForTimeout(3000);
        
        // 検索ボタンの状態を確認（複数のセレクターを試す）
        const searchButtonState = await page.evaluate(() => {
          const selectors = ['button#doSearch', '.btnSearch01', 'button:has-text("検索")', 'input[type="submit"]'];
          let btn = null;
          
          for (const selector of selectors) {
            btn = document.querySelector(selector);
            if (btn) break;
          }
          
          return {
            exists: !!btn,
            disabled: btn ? btn.disabled : null,
            text: btn ? btn.textContent.trim() : null,
            selector: btn ? btn.id || btn.className : null
          };
        });
        console.log('Search button state:', searchButtonState);
        
        // 検索ボタンをクリック
        if (!searchButtonState.disabled && searchButtonState.exists) {
          console.log('Clicking search button...');
          // 複数のセレクターを試す
          const searchSelectors = ['button#doSearch', '.btnSearch01', 'button:has-text("検索")'];
          
          for (const selector of searchSelectors) {
            try {
              await page.click(selector);
              console.log(`Successfully clicked search button with selector: ${selector}`);
              break;
            } catch (e) {
              console.log(`Failed to click with selector ${selector}, trying next...`);
            }
          }
        } else {
          console.log('Search button is disabled or not found, trying alternative method...');
          // JavaScriptで直接フォームを送信
          await page.evaluate(() => {
            const form = document.querySelector('form[name="doSearchForm"]') || document.querySelector('form');
            if (form) {
              form.action = '/26/pc/corpinfo/displayCorpSearch/doSearch';
              form.submit();
            }
          });
        }
        
        // 結果ページの読み込みを待機
        await page.waitForTimeout(5000);
        
        // 結果ページにいるかどうかを確認
        const resultPageInfo = await page.evaluate(() => {
          return {
            url: window.location.href,
            hasResults: !!document.querySelector('.js-add-entry-log') || 
                       !!document.querySelector('.corpInfoList') ||
                       !!document.querySelector('.resultList'),
            resultCount: document.querySelector('.resultNum')?.textContent?.trim() || 
                        document.querySelector('.hit')?.textContent?.trim() ||
                        'No count found'
          };
        });
        
        console.log('Result page info:', resultPageInfo);
        
        if (!resultPageInfo.hasResults && !resultPageInfo.url.includes('doSearch')) {
          console.log('No results found, skipping this category');
          continue;
        }
        
        // ページネーション処理
        let currentPage = 1;
        
        while (true) {
          console.log(`Processing page ${currentPage} for ${category}`);
          
          // 企業情報を取得 - より汎用的なセレクターを試す
          const pageCompanies = await page.evaluate((currentCategory) => {
            const companies = [];
            
            // 複数の可能性のあるセレクターを試す
            const selectors = [
              '.js-add-entry-log',
              '.corpName',
              '.corpInfo',
              '.companyName',
              'a[href*="/corpinfo/"]',
              '.resultList .item',
              '[data-company-name]'
            ];
            
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                console.log(`Found ${elements.length} elements with selector: ${selector}`);
                
                elements.forEach(element => {
                  try {
                    let nameText = '';
                    
                    // 企業名の取得方法を複数試す
                    if (element.dataset && element.dataset.companyName) {
                      nameText = element.dataset.companyName;
                    } else if (element.querySelector('a')) {
                      nameText = element.querySelector('a').textContent.trim();
                    } else {
                      nameText = element.textContent.trim();
                    }
                    
                    // フィルタリング
                    if (nameText && 
                        nameText.length > 3 && 
                        nameText.length < 100 &&
                        !nameText.includes('気になる') &&
                        !nameText.includes('すべて選択') &&
                        !nameText.includes('解除') &&
                        !nameText.includes('検索') &&
                        !nameText.match(/^\s*$/) &&
                        !nameText.match(/^[\t\n\s]+$/)) {
                      
                      companies.push({
                        name: nameText,
                        industry: currentCategory,
                        location: '',
                        description: '',
                        sourceUrl: element.href || '',
                        selector: selector
                      });
                    }
                  } catch (err) {
                    console.error('Error parsing element:', err);
                  }
                });
                
                if (companies.length > 0) break; // 成功したセレクターで停止
              }
            }
            
            return companies;
          }, category);
          
          companies.push(...pageCompanies);
          console.log(`Found ${pageCompanies.length} companies on page ${currentPage}`);
          
          // 次のページボタンを探す
          const nextButton = await page.$('text=次の100社');
          if (!nextButton) {
            console.log(`No more pages for ${category}`);
            break;
          }
          
          await nextButton.click();
          await page.waitForTimeout(3000);
          currentPage++;
          
          // 安全のため10ページまでに制限
          if (currentPage > 10) {
            console.log('Reached page limit');
            break;
          }
        }
        
        // 次のカテゴリのため検索条件をクリア
        await page.goto('https://job.mynavi.jp/26/pc/corpinfo/displayCorpSearch/index?tab=corp');
        await page.waitForTimeout(2000);
        
      } catch (err) {
        console.error(`Error processing category ${category}:`, err);
        continue;
      }
    }
    
    console.log(`Total companies found: ${companies.length}`);
    
    // データベースに保存
    await saveCompaniesToDatabase(companies);
    
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
}

async function saveCompaniesToDatabase(companies) {
  console.log('Saving companies to database...');
  
  const uniqueCompanies = [];
  const seenNames = new Set();
  
  for (const company of companies) {
    if (!seenNames.has(company.name)) {
      seenNames.add(company.name);
      
      const industryId = await getIndustryId(company.industry);
      
      uniqueCompanies.push({
        name: company.name,
        industry_id: industryId,
        location: company.location || null,
        description: company.description || null,
        source_url: company.sourceUrl || null
      });
    }
  }
  
  console.log(`Inserting ${uniqueCompanies.length} unique companies...`);
  
  // バッチ挿入（100件ずつ）
  const batchSize = 100;
  for (let i = 0; i < uniqueCompanies.length; i += batchSize) {
    const batch = uniqueCompanies.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('companies')
      .upsert(batch, { 
        onConflict: 'name',
        ignoreDuplicates: true 
      });
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(uniqueCompanies.length / batchSize)}`);
    }
    
    // レート制限回避
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Database save completed!');
}

// メイン実行
if (require.main === module) {
  scrapeMynaviCompanies()
    .then(() => {
      console.log('Scraping completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}