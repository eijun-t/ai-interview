'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StaticAvatar from './StaticAvatar';
import CompanyResearchProgress from './CompanyResearchProgress';
import { SpeechManager } from '@/lib/speech';
import { Mic, MicOff, Play, Pause, RotateCcw, User, UserCheck } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer: string;
}

interface InterviewSessionProps {
  companyId: string;
  companyName: string;
  category: string;
  duration: number;
}

export default function InterviewSession({
  companyId,
  companyName,
  category,
  duration
}: InterviewSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speechManager] = useState(() => new SpeechManager());
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [sessionState, setSessionState] = useState<'research' | 'loading' | 'ready' | 'in-progress' | 'completed'>('research');
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const [companyResearchData, setCompanyResearchData] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<{
    totalScore: number;
    scores: {
      companyUnderstanding: number;
      logic: number;
      enthusiasm: number;
      communication: number;
    };
    detailedFeedback: {
      companyUnderstanding: string;
      logic: string;
      enthusiasm: string;
      communication: string;
    };
    overallFeedback: string;
    recommendations: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const generateQuestions = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト
      
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          category,
          duration,
          companyResearchData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }
      
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      setSessionState('ready');
    } catch (error) {
      console.error('Error generating questions:', error);
      // エラーの場合もフォールバック質問を表示
      const fallbackQuestions = [
        {
          id: 1,
          question: "まず、簡単に自己紹介をお願いします。お名前、学部、そして志望動機を聞かせてください。",
          category: category,
          difficulty: "easy" as const,
          expectedAnswer: "自己紹介、学歴、志望動機を明確に述べる"
        },
        {
          id: 2,
          question: "なぜこの業界に興味を持ったのですか？そして弊社を選んだ理由を具体的に教えてください。",
          category: category,
          difficulty: "medium" as const,
          expectedAnswer: "業界への理解と企業選択の理由を論理的に説明"
        },
        {
          id: 3,
          question: "学生時代に最も力を入れて取り組んだことは何ですか？その経験から何を学びましたか？",
          category: category,
          difficulty: "medium" as const,
          expectedAnswer: "具体的な経験と学びを述べる"
        }
      ];
      setQuestions(fallbackQuestions);
      setAnswers(new Array(fallbackQuestions.length).fill(''));
      setSessionState('ready');
    }
  }, [companyId, category, duration, companyResearchData]);

  useEffect(() => {
    if (sessionState === 'loading') {
      generateQuestions();
    }
  }, [sessionState, generateQuestions]);

  const speakQuestion = async (questionText: string) => {
    try {
      setIsAudioPlaying(true);
      const audioBuffer = await speechManager.textToSpeech(questionText, avatarGender);
      
      // 空のバッファの場合は音声再生をスキップ
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.log('TTS unavailable, skipping audio playback');
        return;
      }
      
      await speechManager.playAudio(audioBuffer);
    } catch (error) {
      console.error('Error speaking question:', error);
      // エラーの場合は音声なしで継続
    } finally {
      setIsAudioPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      await speechManager.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await speechManager.stopRecording();
      setIsRecording(false);
      
      const transcribedText = await speechManager.transcribeAudio(audioBlob);
      
      // エラーメッセージの場合は音声入力が失敗したことを示す
      if (transcribedText.includes('音声認識ができませんでした')) {
        console.log('Speech recognition failed, user should type manually');
        setCurrentAnswer('');
        // ユーザーに手動入力を促すメッセージを表示
        return;
      }
      
      setCurrentAnswer(transcribedText);
      
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = transcribedText;
      setAnswers(newAnswers);
      
      // 音声録音が成功した場合、カウントダウンして自動で次の質問に進む
      setAutoAdvanceTimer(3);
      const countdownInterval = setInterval(() => {
        setAutoAdvanceTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            nextQuestion();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  const nextQuestion = () => {
    setAutoAdvanceTimer(null); // タイマーをクリア
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      completeInterview();
    }
  };

  const completeInterview = async () => {
    try {
      setIsEvaluating(true);
      
      const questionsWithAnswers = questions.map((q, index) => ({
        question: q.question,
        answer: answers[index] || '',
        category: q.category
      }));

      const response = await fetch('/api/interview/evaluate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          questions: questionsWithAnswers
        })
      });

      if (response.ok) {
        const evaluationData = await response.json();
        setEvaluation(evaluationData);
      }
      
      setSessionState('completed');
    } catch (error) {
      console.error('Error completing interview:', error);
      setSessionState('completed');
    } finally {
      setIsEvaluating(false);
    }
  };

  const startInterview = async () => {
    setSessionState('in-progress');
    await speakQuestion(questions[0].question);
  };

  const restartInterview = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(''));
    setCurrentAnswer('');
    setEvaluation(null);
    setIsEvaluating(false);
    setSessionState('research');
    setCompanyResearchData(null);
  };

  const handleResearchComplete = (researchData: any) => {
    setCompanyResearchData(researchData);
    setSessionState('loading');
  };

  const handleResearchError = (error: string) => {
    console.error('Research error:', error);
    // エラーが発生しても面接を続行
    setSessionState('loading');
  };

  if (sessionState === 'research') {
    return (
      <CompanyResearchProgress
        companyName={companyName}
        onComplete={handleResearchComplete}
        onError={handleResearchError}
      />
    );
  }

  if (sessionState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-gray-700">AI面接官が準備中</div>
        <div className="text-sm text-gray-500">企業データを分析して質問を生成しています...</div>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-gray-700">AI面接官があなたへのフィードバックを作成中</div>
        <div className="text-sm text-gray-500">面接内容を分析して詳細な評価を準備しています...</div>
      </div>
    );
  }

  if (sessionState === 'completed' && evaluation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>面接結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {evaluation.totalScore}/100点
                </div>
                <div className="text-sm text-gray-600 mt-1">総合スコア</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {evaluation.scores.companyUnderstanding}/25
                    </div>
                    <div className="text-sm font-medium text-gray-800">企業理解度</div>
                    <div className="text-xs text-gray-600 mt-2">
                      {evaluation.detailedFeedback.companyUnderstanding}
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {evaluation.scores.logic}/25
                    </div>
                    <div className="text-sm font-medium text-gray-800">論理性</div>
                    <div className="text-xs text-gray-600 mt-2">
                      {evaluation.detailedFeedback.logic}
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {evaluation.scores.enthusiasm}/25
                    </div>
                    <div className="text-sm font-medium text-gray-800">熱意</div>
                    <div className="text-xs text-gray-600 mt-2">
                      {evaluation.detailedFeedback.enthusiasm}
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {evaluation.scores.communication}/25
                    </div>
                    <div className="text-sm font-medium text-gray-800">コミュニケーション力</div>
                    <div className="text-xs text-gray-600 mt-2">
                      {evaluation.detailedFeedback.communication}
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="font-medium mb-2 text-blue-900">総合評価</div>
                <div className="text-sm text-blue-800">
                  {evaluation.overallFeedback}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="font-medium mb-2 text-green-900">改善アドバイス</div>
                <div className="text-sm text-green-800">
                  {evaluation.recommendations}
                </div>
              </div>
              
              <Button onClick={restartInterview} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                もう一度受ける
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{companyName} 面接</span>
            <div className="flex items-center gap-2">
              <Button
                variant={avatarGender === 'female' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvatarGender('female')}
                className="flex flex-col h-auto py-2"
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  女性
                </div>
                <div className="text-xs opacity-75">Nova音声</div>
              </Button>
              <Button
                variant={avatarGender === 'male' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvatarGender('male')}
                className="flex flex-col h-auto py-2"
              >
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-1" />
                  男性
                </div>
                <div className="text-xs opacity-75">Onyx音声</div>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaticAvatar
            gender={avatarGender}
            isAudioPlaying={isAudioPlaying}
          />
        </CardContent>
      </Card>

      {sessionState === 'ready' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">面接を開始しますか？</h2>
              <p className="text-gray-600">
                {questions.length}問の質問が準備されています（約{duration}分）
              </p>
              <Button onClick={startInterview} size="lg">
                <Play className="mr-2 h-4 w-4" />
                面接開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sessionState === 'in-progress' && currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>質問 {currentQuestionIndex + 1}/{questions.length}</span>
              <div className="flex gap-2">
                <Badge variant="outline">{currentQuestion.category}</Badge>
                <Badge 
                  variant={
                    currentQuestion.difficulty === 'easy' ? 'default' :
                    currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">質問</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakQuestion(currentQuestion.question)}
                    disabled={isAudioPlaying}
                  >
                    {isAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-gray-800">{currentQuestion.question}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    variant={isRecording ? 'destructive' : 'default'}
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isAudioPlaying}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        録音停止
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        回答録音
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  または
                </div>
                
                <div>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => {
                      setCurrentAnswer(e.target.value);
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    placeholder="こちらに直接回答を入力することもできます..."
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>

                {currentAnswer && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2">あなたの回答</h4>
                    <p className="text-gray-800">{currentAnswer}</p>
                    {autoAdvanceTimer && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-md text-center">
                        <div className="text-sm text-blue-800">
                          {autoAdvanceTimer}秒後に自動で次の質問に進みます
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAutoAdvanceTimer(null); // タイマーをキャンセル
                      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                      setCurrentAnswer('');
                    }}
                    disabled={currentQuestionIndex === 0}
                  >
                    前の質問
                  </Button>
                  <div className="flex gap-2">
                    {autoAdvanceTimer && (
                      <Button
                        variant="outline"
                        onClick={() => setAutoAdvanceTimer(null)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        自動進行停止
                      </Button>
                    )}
                    <Button
                      onClick={nextQuestion}
                      disabled={!currentAnswer}
                    >
                      {currentQuestionIndex === questions.length - 1 ? '面接終了' : '次の質問'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}