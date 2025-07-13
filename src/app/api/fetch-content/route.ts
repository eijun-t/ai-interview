import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

interface ContentResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
}

function extractTextContent(html: string, url: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 不要な要素を削除
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.advertisement', '.ads', '.sidebar', '.menu'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // メインコンテンツエリアを探す
    const mainSelectors = [
      'main', '[role="main"]', '.main-content', 
      '.content', '.post-content', '.article-content',
      'article', '.article'
    ];

    let mainContent = '';
    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element.textContent || '';
        break;
      }
    }

    // メインコンテンツが見つからない場合はbodyを使用
    if (!mainContent) {
      mainContent = document.body?.textContent || '';
    }

    // テキストを整理
    return mainContent
      .replace(/\s+/g, ' ') // 連続する空白を一つに
      .replace(/\n\s*\n/g, '\n') // 連続する改行を一つに
      .trim()
      .substring(0, 3000); // 3000文字に制限

  } catch (error) {
    console.error(`Content extraction failed for ${url}:`, error);
    return '';
  }
}

async function fetchPageContent(url: string): Promise<ContentResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const content = extractTextContent(html, url);
    
    // タイトルを抽出
    let title = '';
    try {
      const dom = new JSDOM(html);
      title = dom.window.document.title || '';
    } catch (e) {
      title = url;
    }

    return {
      url,
      title,
      content,
      success: true
    };

  } catch (error) {
    console.error(`Failed to fetch content from ${url}:`, error);
    return {
      url,
      title: url,
      content: '',
      success: false
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // 全URLのコンテンツを並列取得（失敗したものはスキップ）
    const contentPromises = urls.map(url => fetchPageContent(url));
    const results = await Promise.all(contentPromises);

    // 成功したもののみフィルタ
    const successfulResults = results.filter(result => result.success && result.content);

    return NextResponse.json({ contents: successfulResults });

  } catch (error) {
    console.error('Content fetching error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}