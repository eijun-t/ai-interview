import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 開発環境では認証をスキップ
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { companyId, category, duration, companyResearchData } = body;

    if (!companyId || !category || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, category, duration' },
        { status: 400 }
      );
    }

    // Supabaseから企業データを取得
    const supabase = createRouteHandlerClient({ cookies });
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    try {
      // 企業研究データがある場合は活用
      const companyData = {
        name: company.name,
        industry: '不明',
        description: company.description || '',
        values: company.description || '',
        researchData: companyResearchData || null
      };

      const questions = await generateQuestions(
        companyData,
        category,
        duration
      );

      return NextResponse.json(questions);
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // OpenAI APIエラーの場合はサンプル質問を返す
      const questionCount = Math.max(3, Math.floor(duration / 3));
      const sampleQuestions = [
        {
          id: 1,
          question: `まず、簡単に自己紹介をお願いします。お名前、学部、そして${company.name}への志望動機を聞かせてください。`,
          category: category,
          difficulty: "easy",
          expectedAnswer: "自己紹介、学歴、志望動機を明確に述べる"
        },
        {
          id: 2,
          question: `なぜ${company.industry}業界に興味を持ったのですか？そして${company.name}を選んだ理由を具体的に教えてください。`,
          category: category,
          difficulty: "medium",
          expectedAnswer: "業界への理解と企業選択の理由を論理的に説明"
        },
        {
          id: 3,
          question: `学生時代に最も力を入れて取り組んだことは何ですか？その経験から何を学び、${company.name}でどう活かしたいですか？`,
          category: category,
          difficulty: "medium",
          expectedAnswer: "具体的な経験と学び、それを仕事に活かす方法"
        },
        {
          id: 4,
          question: `${company.name}で働く上で、あなたの強みをどのように活かしたいですか？また、改善したい弱みはありますか？`,
          category: category,
          difficulty: "medium",
          expectedAnswer: "自己分析と成長意欲を示す"
        },
        {
          id: 5,
          question: `5年後、10年後のキャリアビジョンについて聞かせてください。${company.name}でどのような成長を遂げたいですか？`,
          category: category,
          difficulty: "hard",
          expectedAnswer: "長期的なキャリアプランと企業での成長イメージ"
        },
        {
          id: 6,
          question: `最後に、${company.name}や今回の面接について何か質問はありますか？`,
          category: category,
          difficulty: "easy",
          expectedAnswer: "企業への関心と積極性を示す質問"
        }
      ];
      
      return NextResponse.json({
        questions: sampleQuestions.slice(0, questionCount)
      });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}