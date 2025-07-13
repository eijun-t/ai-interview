// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { chromium } = require('playwright');

async function testMynaviStructure() {
  console.log('Testing Mynavi structure...');
  
  const browser = await chromium.launch({ 
    headless: false, // ヘッドフルモードで確認
    slowMo: 2000 // 2秒間隔
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // マイナビ企業検索ページにアクセス
    await page.goto('https://job.mynavi.jp/26/pc/corpinfo/displayCorpSearch/index?tab=corp');
    await page.waitForTimeout(5000);
    
    console.log('Page loaded, checking elements...');
    
    // 利用可能な業界カテゴリを確認
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        categoryElements: Array.from(document.querySelectorAll('.searchCondition .searchItem')).map(el => ({
          text: el.textContent.trim(),
          tag: el.tagName,
          className: el.className
        })),
        makerButtons: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.includes('メーカー')
        ).map(el => ({
          text: el.textContent.trim(),
          tag: el.tagName,
          className: el.className,
          id: el.id
        }))
      };
    });
    
    console.log('Page info:', pageInfo);
    
    // 既に検索結果が表示されているか確認
    const hasResults = await page.evaluate(() => {
      return {
        resultCount: document.querySelector('.resultNum')?.textContent || 'No result count found',
        hasCompanyList: !!document.querySelector('.js-add-entry-log'),
        companyElements: document.querySelectorAll('.js-add-entry-log').length,
        firstCompanyName: document.querySelector('.js-add-entry-log')?.textContent?.trim() || 'No company found'
      };
    });
    
    console.log('Current page results:', hasResults);
    
    // 既に結果がある場合は企業名を取得してみる
    if (hasResults.companyElements > 0) {
      const companies = await page.evaluate(() => {
        const companyElements = document.querySelectorAll('.js-add-entry-log');
        return Array.from(companyElements).slice(0, 5).map(el => el.textContent.trim());
      });
      
      console.log('Sample companies found:', companies);
    }
    
    // 検索条件をリセットして特定カテゴリで再検索
    console.log('Attempting to reset and search by category...');
    
    // 条件をクリア
    try {
      const clearButton = await page.locator('text=条件をクリア').first();
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('No clear button found, proceeding...');
    }
    
    // メーカーカテゴリを選択
    console.log('Clicking メーカー category...');
    await page.click('text=メーカー');
    await page.waitForTimeout(2000);
    
    // 検索ボタンの状態を確認
    const searchButton = await page.evaluate(() => {
      const btn = document.querySelector('button#doSearch');
      return {
        exists: !!btn,
        disabled: btn ? btn.disabled : null,
        text: btn ? btn.textContent.trim() : null,
        className: btn ? btn.className : null
      };
    });
    
    console.log('Search button state after selecting all:', searchButton);
    
    // 検索を実行してみる
    if (!searchButton.disabled) {
      await page.click('button#doSearch');
      await page.waitForTimeout(5000);
      
      // 結果ページの構造を確認
      const resultStructure = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          companyListExists: !!document.querySelector('.corpInfoList'),
          availableSelectors: [
            '.corpInfoList',
            '.js-add-entry-log',
            '.corpName',
            '.corpInfo'
          ].map(selector => ({
            selector,
            count: document.querySelectorAll(selector).length
          }))
        };
      });
      
      console.log('Result page structure:', resultStructure);
    }
    
    // 30秒待機（手動で確認するため）
    console.log('Waiting 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

// テスト実行
testMynaviStructure()
  .then(() => {
    console.log('Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });