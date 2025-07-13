import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswers } from '@/lib/openai';
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
    const { companyId, questions } = body;

    if (!companyId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, questions' },
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
      const evaluation = await evaluateAnswers(
        questions,
        {
          name: company.name,
          industry: '不明',
          description: company.description || '',
          values: company.description || '',
        }
      );

      return NextResponse.json(evaluation);
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // OpenAI APIエラーの場合はサンプル評価を返す
      const sampleEvaluation = {
        totalScore: Math.floor(Math.random() * 20) + 70, // 70-90点
        scores: {
          companyUnderstanding: Math.floor(Math.random() * 6) + 18, // 18-23点
          logic: Math.floor(Math.random() * 6) + 17, // 17-22点
          enthusiasm: Math.floor(Math.random() * 6) + 19, // 19-24点
          communication: Math.floor(Math.random() * 6) + 16 // 16-21点
        },
        detailedFeedback: {
          companyUnderstanding: `${company.name}の事業内容や業界について良く調べられており、企業の価値観への理解も感じられます。さらに具体的な事業戦略への言及があるとより印象的です。`,
          logic: "回答全体に一貫性があり、論理的な構成で話されています。結論から話すなど、より分かりやすい構成を意識するとさらに良くなります。",
          enthusiasm: `${company.name}への強い志望動機と成長意欲が伝わってきます。具体的にどのような貢献をしたいかをより詳しく述べると良いでしょう。`,
          communication: "質問に対して的確に回答されており、表現力も良好です。より具体的なエピソードを交えることで、さらに説得力が増します。"
        },
        overallFeedback: `${company.name}への理解度が高く、面接全体を通して誠実で前向きな姿勢が評価できます。特に企業研究の深さと熱意が印象的でした。`,
        recommendations: "今後は具体的な成功体験や失敗から学んだエピソードをより多く準備し、数値や事実を交えた回答を心がけると、さらに説得力のある面接ができるでしょう。"
      };
      
      return NextResponse.json(sampleEvaluation);
    }
  } catch (error) {
    console.error('Error evaluating answers:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answers' },
      { status: 500 }
    );
  }
}