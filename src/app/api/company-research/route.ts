import { NextRequest } from 'next/server';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic: SerperResult[];
}

interface ContentResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
}

interface CompanyResearchResult {
  companyName: string;
  recruitment: ContentResult[];
  ir: ContentResult[];
  business: ContentResult[];
  summary: string;
}

// メモリキャッシュ
const cache = new Map<string, { data: CompanyResearchResult; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

async function searchWithSerper(query: string): Promise<SerperResult[]> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      gl: 'jp',
      hl: 'ja',
      num: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data: SerperResponse = await response.json();
  return data.organic || [];
}

async function fetchPageContent(url: string): Promise<ContentResult> {
  try {
    const response = await fetch('/api/fetch-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [url] })
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const contents = data.contents || [];
    
    if (contents.length > 0) {
      return contents[0];
    }

    return {
      url,
      title: url,
      content: '',
      success: false
    };

  } catch (error) {
    return {
      url,
      title: url,
      content: '',
      success: false
    };
  }
}

function createProgressMessage(type: string, message: string, progress: number) {
  return `data: ${JSON.stringify({ type, message, progress })}\n\n`;
}

export async function POST(request: NextRequest) {
  const { companyName } = await request.json();

  if (!companyName) {
    return new Response('Company name is required', { status: 400 });
  }

  // キャッシュをチェック
  const cacheKey = companyName.toLowerCase();
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return new Response(
      createProgressMessage('complete', '完了', 100) + 
      `data: ${JSON.stringify({ type: 'result', data: cached.data })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder();
        
        // 進捗の送信
        const sendProgress = (type: string, message: string, progress: number) => {
          controller.enqueue(encoder.encode(createProgressMessage(type, message, progress)));
        };

        sendProgress('start', '企業情報の検索を開始しています...', 10);

        // 30秒タイムアウト
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 30000);
        });

        const researchPromise = (async () => {
          const queries = [
            `${companyName} 新卒採用`,
            `${companyName} IR`,
            `${companyName} 事業概要`
          ];

          sendProgress('search', '検索クエリを実行中...', 20);

          // 並列検索
          const searchResults = await Promise.allSettled(
            queries.map(query => searchWithSerper(query))
          );

          sendProgress('search_complete', '検索結果を取得しました', 40);

          const [recruitmentResults, irResults, businessResults] = searchResults.map(
            result => result.status === 'fulfilled' ? result.value : []
          );

          // URLを収集
          const allUrls = [
            ...recruitmentResults.slice(0, 3).map(r => r.link),
            ...irResults.slice(0, 3).map(r => r.link),
            ...businessResults.slice(0, 3).map(r => r.link)
          ].filter(Boolean);

          sendProgress('fetch', 'Webページのコンテンツを取得中...', 60);

          // コンテンツを並列取得
          const contentPromises = allUrls.map(url => fetchPageContent(url));
          const contents = await Promise.allSettled(contentPromises);

          sendProgress('parse', 'コンテンツを解析中...', 80);

          const successfulContents = contents
            .map(result => result.status === 'fulfilled' ? result.value : null)
            .filter((content): content is ContentResult => content !== null && content.success);

          // カテゴリ別に分類
          const recruitment = successfulContents.slice(0, 3);
          const ir = successfulContents.slice(3, 6);
          const business = successfulContents.slice(6, 9);

          // サマリー作成
          const allContent = successfulContents.map(c => c.content).join('\n\n');
          const summary = allContent.substring(0, 1000);

          const result: CompanyResearchResult = {
            companyName,
            recruitment,
            ir,
            business,
            summary
          };

          // キャッシュに保存
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          return result;
        })();

        // タイムアウトと処理の競争
        const result = await Promise.race([researchPromise, timeoutPromise])
          .catch(() => {
            // エラーまたはタイムアウトの場合は空の結果を返す
            return {
              companyName,
              recruitment: [],
              ir: [],
              business: [],
              summary: ''
            } as CompanyResearchResult;
          });

        sendProgress('complete', '企業研究が完了しました', 100);
        
        // 最終結果を送信
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', data: result })}\n\n`));
        
      } catch (error) {
        console.error('Research error:', error);
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ 
            type: 'error', 
            message: 'エラーが発生しましたが、面接を続行します' 
          })}\n\n`
        ));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}