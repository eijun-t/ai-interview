'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Search, FileText, TrendingUp, Building } from 'lucide-react';

interface ResearchProgressProps {
  companyName: string;
  onComplete: (researchData: any) => void;
  onError: (error: string) => void;
}

interface ProgressEvent {
  type: 'start' | 'search' | 'search_complete' | 'fetch' | 'parse' | 'complete' | 'result' | 'error';
  message?: string;
  progress?: number;
  data?: any;
}

export default function CompanyResearchProgress({ 
  companyName, 
  onComplete, 
  onError 
}: ResearchProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/company-research', {
      // POST data needs to be sent via query params for SSE
    });

    // Instead, we'll use fetch with ReadableStream
    const startResearch = async () => {
      try {
        const response = await fetch('/api/company-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName })
        });

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: ProgressEvent = JSON.parse(line.slice(6));
                
                if (data.type === 'result') {
                  setIsComplete(true);
                  onComplete(data.data);
                } else if (data.type === 'error') {
                  onError(data.message || 'エラーが発生しました');
                } else if (data.progress !== undefined) {
                  setProgress(data.progress);
                  setCurrentMessage(data.message || '');
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Research failed:', error);
        onError('企業研究中にエラーが発生しました');
      }
    };

    startResearch();

    // Cleanup function
    return () => {
      // No cleanup needed for fetch
    };
  }, [companyName, onComplete, onError]);

  const getIcon = () => {
    if (progress < 30) return <Search className="h-8 w-8 text-blue-600" />;
    if (progress < 60) return <FileText className="h-8 w-8 text-green-600" />;
    if (progress < 90) return <TrendingUp className="h-8 w-8 text-purple-600" />;
    return <Building className="h-8 w-8 text-orange-600" />;
  };

  const getStepDescription = () => {
    if (progress < 30) return '検索エンジンからの情報収集';
    if (progress < 60) return 'Webページのコンテンツ取得';
    if (progress < 90) return 'データの解析と整理';
    return '企業研究データの準備完了';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-2">
            {companyName} の企業研究中
          </CardTitle>
          <div className="text-gray-600">
            AI面接官が最新の企業情報を収集しています
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin absolute"></div>
              <div className="w-16 h-16 flex items-center justify-center">
                {getIcon()}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-gray-800">
                {currentMessage || '準備中...'}
              </div>
              <div className="text-sm text-gray-600">
                {getStepDescription()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>進捗</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-2">収集している情報：</div>
              <ul className="space-y-1">
                <li>• 新卒採用に関する最新情報</li>
                <li>• 企業のIR・業績情報</li>
                <li>• 事業概要・サービス内容</li>
              </ul>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            この処理は最大30秒で完了します
          </div>
        </CardContent>
      </Card>
    </div>
  );
}