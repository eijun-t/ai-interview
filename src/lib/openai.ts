import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuestions = async (
  companyData: {
    name: string;
    industry: string;
    description?: string;
    values?: string;
    researchData?: any;
  },
  category: string,
  duration: number
) => {
  const questionCount = Math.max(3, Math.floor(duration / 3));
  
  // 企業研究データから追加情報を抽出
  let additionalInfo = '';
  if (companyData.researchData) {
    const { recruitment, ir, business, summary } = companyData.researchData;
    
    if (summary) {
      additionalInfo += `\n\n最新の企業情報:\n${summary.substring(0, 500)}`;
    }
    
    if (recruitment && recruitment.length > 0) {
      additionalInfo += `\n\n新卒採用情報:\n${recruitment.map((r: any) => r.content.substring(0, 200)).join('\n')}`;
    }
  }
  
  const prompt = `あなたは${category}に精通した経験豊富な面接官です。以下の企業情報を基に、学生の人となりと企業研究の深さを探る面接質問を${questionCount}個生成してください。

企業情報:
- 企業名: ${companyData.name}
- 業界: ${companyData.industry}
- 事業内容: ${companyData.description || '不明'}
- 企業理念・価値観: ${companyData.values || '不明'}${additionalInfo}

必須要素:
1. 「学生時代に最も力を入れたこと」は必ず含める
2. その回答に基づく深掘り質問（人柄、強み、弱み、困難への対処法など）
3. 志望動機とその深掘り（企業研究の深さ、競合他社との比較、具体的な貢献方法など）

質問構成の方針:
- 面接時間: ${duration}分
- カテゴリー: ${category}
- 学生の経験や人となりを中心に質問を構成
- 企業への志望度と理解度を段階的に深掘り
- 実際の新卒面接で聞かれる典型的な質問にする
- 一つの質問から派生する深掘り質問も含める

以下のJSON形式で回答してください:
{
  "questions": [
    {
      "id": 1,
      "question": "質問文",
      "category": "${category}",
      "difficulty": "easy|medium|hard",
      "expectedAnswer": "期待される回答のポイント"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたは日本企業の新卒採用面接に精通したベテラン面接官です。学生の人となり、経験、志望度を深く理解するための質問を生成し、一つの回答から自然に派生する深掘り質問も含めてください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate questions');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse generated questions');
  }
};

export const evaluateAnswers = async (
  questions: Array<{
    question: string;
    answer: string;
    category: string;
  }>,
  companyData: {
    name: string;
    industry: string;
    description?: string;
    values?: string;
  }
) => {
  const prompt = `以下の面接での質問と回答を評価してください。

企業情報:
- 企業名: ${companyData.name}
- 業界: ${companyData.industry}
- 事業内容: ${companyData.description || '不明'}
- 企業理念・価値観: ${companyData.values || '不明'}

質問と回答:
${questions.map((q, i) => `
質問${i + 1}: ${q.question}
回答: ${q.answer}
カテゴリー: ${q.category}
`).join('\n')}

全ての回答を総合的に評価し、以下の4つの観点で採点してください（各25点満点、合計100点満点）:

1. 企業理解度（25点満点）: 企業の事業内容、業界、価値観への理解度
2. 論理性（25点満点）: 回答全体の筋道立て、説得力、一貫性
3. 熱意（25点満点）: 企業や職種への意欲、情熱、成長意欲
4. コミュニケーション力（25点満点）: 分かりやすさ、表現力、的確な回答

以下のJSON形式で回答してください:
{
  "totalScore": 総合点数(100点満点),
  "scores": {
    "companyUnderstanding": 企業理解度の点数(25点満点),
    "logic": 論理性の点数(25点満点),
    "enthusiasm": 熱意の点数(25点満点),
    "communication": コミュニケーション力の点数(25点満点)
  },
  "detailedFeedback": {
    "companyUnderstanding": "企業理解度についての具体的なフィードバック",
    "logic": "論理性についての具体的なフィードバック", 
    "enthusiasm": "熱意についての具体的なフィードバック",
    "communication": "コミュニケーション力についての具体的なフィードバック"
  },
  "overallFeedback": "全体的な総評と改善点",
  "recommendations": "今後の面接に向けた具体的なアドバイス"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたは日本企業の採用面接官として、応募者の回答を公正かつ建設的に評価してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to evaluate answers');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse evaluation results');
  }
};