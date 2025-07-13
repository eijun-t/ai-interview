import { NextRequest, NextResponse } from 'next/server';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic: SerperResult[];
}

interface CompanySearchResult {
  recruitment: SerperResult[];
  ir: SerperResult[];
  business: SerperResult[];
}

// メモリキャッシュ（Redisの代替）
const cache = new Map<string, { data: CompanySearchResult; timestamp: number }>();
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

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // キャッシュをチェック
    const cacheKey = companyName.toLowerCase();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // 30秒タイムアウト
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // 3つの検索クエリを並列実行
      const queries = [
        `${companyName} 新卒採用`,
        `${companyName} IR`,
        `${companyName} 事業概要`
      ];

      const searchPromises = queries.map(query => 
        searchWithSerper(query).catch(error => {
          console.error(`Search failed for query "${query}":`, error);
          return [];
        })
      );

      const [recruitment, ir, business] = await Promise.all(searchPromises);

      const result: CompanySearchResult = {
        recruitment,
        ir,
        business
      };

      // キャッシュに保存
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      clearTimeout(timeoutId);
      return NextResponse.json(result);

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        // タイムアウトの場合は空の結果を返す
        const emptyResult: CompanySearchResult = {
          recruitment: [],
          ir: [],
          business: []
        };
        return NextResponse.json(emptyResult);
      }
      throw error;
    }

  } catch (error) {
    console.error('Company search error:', error);
    
    // エラーが発生しても空の結果を返して面接を継続
    const emptyResult: CompanySearchResult = {
      recruitment: [],
      ir: [],
      business: []
    };
    
    return NextResponse.json(emptyResult);
  }
}