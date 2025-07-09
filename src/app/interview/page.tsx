'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff,
  User,
  Bot,
  Settings,
  RefreshCw,
  CheckCircle,
  Clock,
  Star,
  Sparkles,
  Brain,
  Target,
  Award
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    "まず、簡単に自己紹介をお願いします。お名前、学歴、そして今回の面接への意気込みを聞かせてください。",
    "なぜ弊社に興味を持ったのですか？他の企業ではなく、弊社を選んだ理由を具体的に教えてください。",
    "あなたの最大の強みと、改善したいと思っている弱みを教えてください。それぞれ具体的なエピソードも交えてお話しください。",
    "これまでの経験で最も困難だった状況と、それをどのように乗り越えたかを教えてください。",
    "5年後、10年後のキャリアビジョンについて聞かせてください。弊社でどのような成長を遂げたいですか？",
    "最後に、弊社や今回の面接について何か質問はありますか？"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = () => {
    setInterviewStarted(true);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "AI面接官の田中です。本日はお忙しい中、面接にお越しいただきありがとうございます。私は最新のGPT-4技術を搭載したAI面接官として、あなたの面接練習をサポートいたします。リラックスして、自然体でお答えください。それでは始めさせていただきます。",
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // 最初の質問を少し遅らせて表示
    setTimeout(() => {
      askQuestion(0);
    }, 3000);
  };

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= questions.length) {
      // 面接終了
      const endMessage: Message = {
        id: Date.now().toString(),
        content: "面接は以上になります。お疲れ様でした。あなたの回答は非常に印象的で、特に具体的なエピソードを交えた説明が素晴らしかったです。後日、詳細なフィードバックレポートをお送りいたします。本日はありがとうございました。",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const questionMessage: Message = {
        id: Date.now().toString(),
        content: questions[questionIndex],
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, questionMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // AI応答のシミュレーション
    setTimeout(() => {
      const responses = [
        "ありがとうございます。とても具体的で印象的なお話でした。あなたの経験から学んだことがよく伝わってきます。",
        "なるほど、よく理解できました。特に○○の部分について、もう少し詳しく聞かせていただけますでしょうか。",
        "素晴らしい回答ですね。具体的な例を交えてお話いただき、あなたの人柄がよく分かりました。",
        "とても興味深いエピソードでした。そこから得た学びを今後どのように活かしていきたいとお考えですか？",
        "印象的なお話でした。あなたの成長意欲と前向きな姿勢がよく伝わってきます。"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // 次の質問を表示
      setTimeout(() => {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        askQuestion(nextQuestion);
      }, 3000);
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* 浮遊する幾何学的シェイプ */}
        <div className="floating-shapes"></div>
        
        {/* ナビゲーション */}
        <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">ホームに戻る</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AI面接官</span>
                  <div className="text-xs text-gray-500 font-medium">Powered by GPT-4</div>
                </div>
              </div>
              <div className="w-32"></div>
            </div>
          </div>
        </nav>

        {/* 面接セットアップ */}
        <div className="relative max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI面接練習システム
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              面接練習を始める
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI面接官との模擬面接で自信をつけましょう。<br />
              実際の面接に近い環境で、あなたのスキルを磨きます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 card-hover">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">新卒面接</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-800 mb-4">就職活動向けの基本的な面接練習</p>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">推奨</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 card-hover">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-green-900">中途面接</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-800 mb-4">転職活動向けの実践的な面接練習</p>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">人気</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 card-hover">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-purple-900">業界特化</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-800 mb-4">特定業界に特化した面接練習</p>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">プロ</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              面接の流れ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">自己紹介</h3>
                <p className="text-gray-600">簡潔で印象的な自己紹介を準備</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">志望動機・経験</h3>
                <p className="text-gray-600">具体的な経験を交えて回答</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">質疑応答</h3>
                <p className="text-gray-600">積極的な質問で意欲をアピール</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={startInterview}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-16 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              面接を開始する
            </Button>
            <p className="text-gray-500 mt-4">所要時間: 約15-20分</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ナビゲーション */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">面接を終了する</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                面接中
              </Badge>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AI面接官</span>
                  <div className="text-xs text-gray-500 font-medium">田中 (GPT-4)</div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-2 hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </div>
      </nav>

      {/* チャットインターフェース */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* チャットメッセージ */}
          <div className="h-[500px] overflow-y-auto p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
                    message.isBot
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {message.isBot ? (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="bg-white/20 p-2 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-sm font-semibold">
                      {message.isBot ? 'AI面接官 田中' : 'あなた'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-white/70'}`}>
                    {message.timestamp.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-2xl px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold">AI面接官 田中</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t border-gray-200 p-6 bg-white/50">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleListening}
                className={`border-2 ${isListening ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50'}`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="回答を入力してください..."
                className="flex-1 min-h-[60px] max-h-[150px] resize-none border-2 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Enter で送信、Shift + Enter で改行</span>
              <span className="font-medium">質問 {currentQuestion + 1} / {questions.length}</span>
            </div>
          </div>
        </div>

        {/* 進捗インジケーター */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-700">面接進捗</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% 完了
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
} 